import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { getRedirectUrl } from '@/lib/url-helper';
import { logger, metrics } from '@/lib/monitoring';

/**
 * Verifica se um email está autorizado a aceder ao dashboard
 * Consulta a tabela allowed_users no Supabase
 */
export const checkEmailAllowed = async (email: string | null | undefined): Promise<boolean> => {
  if (!email) {
    console.log('[checkEmailAllowed] Email is null or undefined');
    return false;
  }

  console.log('[checkEmailAllowed] Checking email:', email);

  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    console.log('[checkEmailAllowed] Query result:', { data, error });

    if (error || !data) {
      console.log('[checkEmailAllowed] Email not allowed or error:', error);
      return false;
    }
    
    console.log('[checkEmailAllowed] Email allowed:', email);
    return true;
  } catch (err) {
    console.error('[checkEmailAllowed] Exception:', err);
    return false;
  }
};

/**
 * Versão síncrona para checks rápidos (usa cache local)
 * Nota: Esta função deve ser usada após verificação inicial
 */
let cachedAllowedEmails: Set<string> | null = null;

export const isAllowedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  // Se temos cache, usar
  if (cachedAllowedEmails) {
    return cachedAllowedEmails.has(email.toLowerCase());
  }
  // Fallback: verificar async (não bloqueia mas pode retornar false inicialmente)
  return false;
};

// Carregar emails autorizados em cache
const loadAllowedEmails = async () => {
  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('email')
      .eq('is_active', true);

    if (!error && data) {
      cachedAllowedEmails = new Set(data.map(u => u.email.toLowerCase()));
    }
  } catch {
    // Silently fail, will check on each auth event
  }
};

// Cache será carregado sob demanda quando necessário
// loadAllowedEmails(); - Removido para evitar fetch no carregamento do módulo

/**
 * Hook de autenticação com validação de email
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);
  const [isEmailAllowed, setIsEmailAllowed] = useState<boolean | null>(null);

  // Query otimizada para obter sessão com fallback para localStorage
  const { data: session, isLoading, error: sessionError } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      // Iniciar tracking de performance
      metrics.start('auth_session_fetch', { timeout: 10000 });
      logger.auth('session_fetch_start', { timeout: 10000 });

      // Estratégia: tentar localStorage primeiro (mais rápido), depois getSession()
      try {
        // 1. Tentar ler do localStorage diretamente (fallback rápido)
        // O Supabase armazena a sessão em uma chave específica
        let storedSession = null;
        
        // Procurar pela chave do Supabase no localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-') && key.includes('auth-token')) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.currentSession && parsed.currentSession.expires_at) {
                  const expiresAt = parsed.currentSession.expires_at * 1000;
                  const now = Date.now();
                  
                  // Se sessão ainda válida (com margem de 5 min), usar diretamente
                  if (expiresAt > now + 5 * 60 * 1000) {
                    storedSession = parsed.currentSession;
                    logger.auth('session_from_storage', { email: storedSession.user?.email });
                    const duration = metrics.end('auth_session_fetch', { success: true, source: 'localStorage' });
                    return storedSession;
                  }
                }
              }
            } catch {
              // Continuar procurando
            }
          }
        }

        // 2. Se não encontrou no localStorage ou expirou, usar getSession() com timeout maior
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => {
            logger.warn('session_fetch_timeout', { duration: 10000 });
            reject(new Error('Session fetch timeout'));
          }, 10000) // Aumentado para 10s
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        // Finalizar tracking
        const duration = metrics.end('auth_session_fetch', { success: !error, source: 'getSession' });
        
        if (error) {
          logger.error('session_fetch_error', error.message, { duration });
          return null;
        }
        
        logger.auth('session_fetch_success', { 
          duration, 
          hasSession: !!session,
          email: session?.user?.email 
        });
        
        return session;
      } catch (err) {
        const duration = metrics.end('auth_session_fetch', { success: false });
        logger.error('session_fetch_failed', err instanceof Error ? err.message : 'Unknown error', { duration });
        
        // Último fallback: tentar localStorage novamente mesmo após erro
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-') && key.includes('auth-token')) {
              try {
                const stored = localStorage.getItem(key);
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (parsed?.currentSession) {
                    logger.auth('session_fallback_storage', { email: parsed.currentSession.user?.email });
                    return parsed.currentSession;
                  }
                }
              } catch {
                // Continuar procurando
              }
            }
          }
        } catch {
          // Ignorar erros do fallback
        }
        
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    retryDelay: 500,
    gcTime: 10 * 60 * 1000, // 10 minutos - manter sessão em cache
    refetchOnMount: false, // Não refetch ao montar se já temos dados em cache
    refetchOnWindowFocus: false, // Não refetch ao focar janela
  });

  // Query para obter utilizador atual (executa apenas se houver sessão)
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Validar email quando sessão muda (otimizado sem retry desnecessário)
  useEffect(() => {
    const validateEmail = async () => {
      if (session?.user?.email) {
        const email = session.user.email;
        setIsValidating(true);

        // Tracking de validação de email
        metrics.start('auth_email_validation', { email });
        logger.auth('email_validation_start', { email });

        // Verificação única - se RLS falhar, será tratado no próximo mount/refresh
        const allowed = await checkEmailAllowed(email);
        const duration = metrics.end('auth_email_validation', { allowed });
        
        setIsEmailAllowed(allowed);

        if (!allowed) {
          // Email não autorizado - navegar para /unauthorized SEM fazer logout
          // Manter sessão ativa evita loops de re-autenticação
          logger.warn('email_not_authorized', { email, duration });
          navigate('/unauthorized');
        } else {
          logger.auth('email_validation_success', { email, duration });
        }
        
        setIsValidating(false);
      } else {
        setIsEmailAllowed(null);
        setIsValidating(false);
      }
    };

    validateEmail();
  }, [session, navigate]);

  // Listener de mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.auth('auth_state_change', { event, hasSession: !!session });
      
      if (event === 'SIGNED_IN' && session?.user?.email) {
        // Atualizar cache e invalidar queries
        // A validação de email é feita pelo useEffect acima
        await loadAllowedEmails();
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else if (event === 'SIGNED_OUT') {
        queryClient.clear();
        setIsEmailAllowed(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token foi atualizado - apenas atualizar queries, não limpar
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else if (event === 'INITIAL_SESSION' && session) {
        // Sessão recuperada do localStorage após refresh
        // Não invalidar queries para evitar refetch desnecessário
        // Apenas atualizar o cache se necessário
        logger.auth('initial_session_recovered', { email: session.user?.email });
        // Não fazer nada - a query já vai buscar a sessão
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  /**
   * Fazer login com Google OAuth
   */
  const signInWithGoogle = async () => {
    // Armazenar a rota atual para redirecionar após login
    const currentPath = window.location.pathname;
    const redirectPath = currentPath.startsWith('/dashboard') 
      ? currentPath 
      : '/dashboard';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(redirectPath),
      },
    });

    if (error) {
      console.error('Erro ao fazer login com Google:', error);
      throw error;
    }
  };

  /**
   * Fazer logout
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
    queryClient.clear();
    navigate('/login');
  };

  return {
    user: user as User | null,
    session: session as Session | null,
    isLoading: isLoading || isValidating,
    // isEmailAllowed: null = verificando, true = autorizado, false = não autorizado
    // Permitir acesso durante verificação (null), bloquear apenas se explicitamente false
    isAuthenticated: !!session && !!user && isEmailAllowed !== false,
    signInWithGoogle,
    signOut,
    isAllowedEmail: (email: string | null | undefined) => isAllowedEmail(email),
  };
};

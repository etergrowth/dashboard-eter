import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { getRedirectUrl } from '@/lib/url-helper';

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

// Carregar cache ao inicializar
loadAllowedEmails();

/**
 * Hook de autenticação com validação de email
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);
  const [isEmailAllowed, setIsEmailAllowed] = useState<boolean | null>(null);

  // Query para obter sessão atual com timeout
  const { data: session, isLoading, error: sessionError } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      // Criar uma promise com timeout de 10 segundos
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      
      try {
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        if (error) {
          console.error('[useAuth] Session error:', error);
          return null;
        }
        
        return session;
      } catch (err) {
        console.error('[useAuth] Session fetch failed:', err);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2, // Tentar 2 vezes em caso de falha
    retryDelay: 1000, // 1 segundo entre tentativas
    gcTime: 0, // Não manter em cache queries falhadas
  });

  // Query para obter utilizador atual
  const { data: user } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  // Validar email quando sessão muda (usa verificação async na DB)
  useEffect(() => {
    const validateEmail = async () => {
      if (session?.user?.email) {
        const email = session.user.email;
        setIsValidating(true);

        const allowed = await checkEmailAllowed(email);
        setIsEmailAllowed(allowed);

        if (!allowed) {
          // Tentar novamente após 1 segundo (timing/RLS pode falhar inicialmente)
          console.warn('[useAuth] Email validation failed, retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryAllowed = await checkEmailAllowed(email);
          setIsEmailAllowed(retryAllowed);

          if (!retryAllowed) {
            // Email não autorizado - navegar para /unauthorized SEM fazer logout
            // Manter sessão ativa evita loops de re-autenticação
            console.warn('[useAuth] Email not authorized, redirecting to /unauthorized');
            navigate('/unauthorized');
          }
        }
        setIsValidating(false);
      } else {
        setIsEmailAllowed(null);
      }
    };

    validateEmail();
  }, [session, navigate]);

  // Listener de mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        // Atualizar cache e invalidar queries
        // A validação de email é feita pelo useEffect acima
        await loadAllowedEmails();
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else if (event === 'SIGNED_OUT') {
        queryClient.clear();
        setIsEmailAllowed(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
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

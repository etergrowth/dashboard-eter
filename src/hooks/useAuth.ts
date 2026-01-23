import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Lista de emails autorizados (equipa interna Eter)
const ALLOWED_EMAILS = [
  'geral@etergrowth.com',
  'rivdrgc@gmail.com',
  'luisvaldorio@gmail.com',
];

/**
 * Valida se um email está na lista de autorizados
 */
export const isAllowedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};

/**
 * Hook de autenticação com validação de email
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isValidating, setIsValidating] = useState(false);

  // Query para obter sessão atual
  const { data: session, isLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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

  // Validar email quando sessão muda
  useEffect(() => {
    if (session?.user?.email) {
      const email = session.user.email;
      
      if (!isAllowedEmail(email)) {
        setIsValidating(true);
        // Logout imediato se email não autorizado
        supabase.auth.signOut().then(() => {
          queryClient.clear();
          navigate('/unauthorized');
          setIsValidating(false);
        });
      }
    }
  }, [session, navigate, queryClient]);

  // Listener de mudanças de autenticação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const email = session.user.email;
        
        if (!isAllowedEmail(email)) {
          // Email não autorizado - fazer logout
          await supabase.auth.signOut();
          queryClient.clear();
          navigate('/unauthorized');
        } else {
          // Email autorizado - invalidar queries para atualizar dados
          queryClient.invalidateQueries({ queryKey: ['auth'] });
        }
      } else if (event === 'SIGNED_OUT') {
        queryClient.clear();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient]);

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
        redirectTo: `${window.location.origin}${redirectPath}`,
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
    isAuthenticated: !!session && !!user && isAllowedEmail(user.email),
    signInWithGoogle,
    signOut,
    isAllowedEmail: (email: string | null | undefined) => isAllowedEmail(email),
  };
};

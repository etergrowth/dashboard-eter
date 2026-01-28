import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

/**
 * Componente que protege rotas, exigindo autenticação e email autorizado
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, session } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Verificar sessão do localStorage diretamente no mount (após refresh)
  useEffect(() => {
    let mounted = true;
    
    // Dar um pequeno delay para permitir que o useAuth recupere a sessão
    const checkSession = async () => {
      try {
        // Pequeno delay para permitir que o useAuth processe
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (mounted) {
          // Se ainda não temos sessão após delay, aguardar mais um pouco
          // O useAuth já tenta localStorage primeiro, então isto é apenas backup
          if (!session) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error checking session:', error);
      } finally {
        if (mounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [session]);

  // Mostrar mensagem de timeout após 5 segundos de loading
  useEffect(() => {
    if ((isLoading || isCheckingSession) && !session) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
    setShowTimeout(false);
  }, [isLoading, isCheckingSession, session]);

  // Durante loading inicial ou verificação de sessão, mostrar indicador visual
  if ((isLoading || isCheckingSession) && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
          {showTimeout && (
            <div className="mt-4 text-sm">
              <p className="text-yellow-500">A demorar mais do que esperado...</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary underline mt-2 hover:opacity-80 transition-opacity"
              >
                Recarregar página
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Após loading e verificação, se não há sessão, redirecionar para login
  if (!isLoading && !isCheckingSession && !session) {
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath.startsWith('/dashboard')) {
      sessionStorage.setItem('returnTo', currentPath);
    }
    return <Navigate to="/login" replace />;
  }

  // Se há sessão, mostrar conteúdo
  // A validação de email é feita pelo useAuth e redireciona para /unauthorized se necessário
  // isAuthenticated permite acesso durante verificação (isEmailAllowed === null)
  if (session) {
    return <Outlet />;
  }

  // Fallback: redirecionar para login
  return <Navigate to="/login" replace />;
};

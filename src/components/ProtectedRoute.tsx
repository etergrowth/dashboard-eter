import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente que protege rotas, exigindo autenticação e email autorizado
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, session } = useAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Mostrar mensagem de timeout após 5 segundos de loading
  useEffect(() => {
    if (isLoading && !session) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
    setShowTimeout(false);
  }, [isLoading, session]);

  // Durante loading inicial, mostrar indicador visual em vez de tela branca
  if (isLoading && !session) {
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

  // Após loading, se não há sessão, redirecionar para login
  if (!isLoading && !session) {
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

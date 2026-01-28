import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente que protege rotas, exigindo autenticação e email autorizado
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, session } = useAuth();

  // Durante loading inicial (sem sessão conhecida), não redirecionar imediatamente
  // Isso evita flash de redirect enquanto React Query ainda está a carregar
  if (isLoading && !session) {
    // Retornar null para evitar flash - o layout pode mostrar skeleton se necessário
    return null;
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

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuth } from './dashboard/hooks/useAuth';

// Dashboard Components
import { Login } from './dashboard/pages/Auth/Login';
import { Register } from './dashboard/pages/Auth/Register';
import { DashboardLayout } from './dashboard/layouts/DashboardLayout';
import { PrivateRoute } from './dashboard/components/PrivateRoute';
import { Overview } from './dashboard/pages/Overview';
import { CRM } from './dashboard/pages/CRM';
import { Projects } from './dashboard/pages/Projects';
import { Map as MapPage } from './dashboard/pages/Map';
import { CMS } from './dashboard/pages/CMS';

// Root redirect component
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7BA8F9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">A carregar...</p>
        </div>
      </div>
    );
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Root redirects to dashboard if logged in, login otherwise */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard Routes (Protected) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="crm" element={<CRM />} />
            <Route path="projects" element={<Projects />} />
            <Route path="map" element={<MapPage />} />
            <Route path="cms" element={<CMS />} />
          </Route>

          {/* Catch all - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

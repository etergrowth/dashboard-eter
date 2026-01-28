import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persistOptions } from './lib/queryClient';

// Auth Components (carregados imediatamente - são pequenos e críticos)
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Unauthorized } from './pages/Unauthorized';
import { ProtectedRoute } from './components/ProtectedRoute';

// Dashboard Layout (carregado imediatamente - necessário para todas as rotas protegidas)
import { DashboardLayout } from './dashboard/layouts/DashboardLayout';

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Dashboard Pages (lazy loaded - apenas carregados quando necessário)
const Overview = lazy(() => import('./dashboard/pages/Overview'));
const CRM = lazy(() => import('./dashboard/pages/CRM'));
const LeadDetails = lazy(() => import('./dashboard/pages/CRM/LeadDetails'));
const Projects = lazy(() => import('./dashboard/pages/Projects'));
const CMS = lazy(() => import('./dashboard/pages/CMS'));
const Proposals = lazy(() => import('./dashboard/pages/Proposals'));
const ProposalDetails = lazy(() => import('./dashboard/pages/Proposals/ProposalDetails'));
const FormTest = lazy(() => import('./dashboard/pages/FormTest'));
const Finance = lazy(() => import('./dashboard/pages/Finance'));
const FinanceStatistics = lazy(() => import('./dashboard/pages/Finance/Statistics'));
const MapaKms = lazy(() => import('./dashboard/pages/MapaKms'));
const MapaKmsStatistics = lazy(() => import('./dashboard/pages/MapaKms/Statistics'));
const NewTrip = lazy(() => import('./dashboard/pages/MapaKms/NewTrip'));

// Sandbox pages
const LeadsQueue = lazy(() => import('./dashboard/pages/Sandbox').then(m => ({ default: m.LeadsQueue })));
const LeadDetail = lazy(() => import('./dashboard/pages/Sandbox').then(m => ({ default: m.LeadDetail })));
const MetricsDashboard = lazy(() => import('./dashboard/pages/Sandbox').then(m => ({ default: m.MetricsDashboard })));
const LeadsPendentes = lazy(() => import('./dashboard/pages/Sandbox').then(m => ({ default: m.LeadsPendentes })));

function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Require Authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard Routes - Todas as páginas wrapped com Suspense */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Suspense fallback={<PageLoader />}><Overview /></Suspense>} />
              <Route path="crm" element={<Suspense fallback={<PageLoader />}><CRM /></Suspense>} />
              <Route path="crm/:id" element={<Suspense fallback={<PageLoader />}><LeadDetails /></Suspense>} />
              <Route path="projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
              <Route path="proposals" element={<Suspense fallback={<PageLoader />}><Proposals /></Suspense>} />
              <Route path="proposals/:id" element={<Suspense fallback={<PageLoader />}><ProposalDetails /></Suspense>} />
              <Route path="cms" element={<Suspense fallback={<PageLoader />}><CMS /></Suspense>} />
              <Route path="formulario" element={<Suspense fallback={<PageLoader />}><FormTest /></Suspense>} />
              <Route path="finance" element={<Suspense fallback={<PageLoader />}><Finance /></Suspense>} />
              <Route path="finance/estatisticas" element={<Suspense fallback={<PageLoader />}><FinanceStatistics /></Suspense>} />
              <Route path="sandbox" element={<Suspense fallback={<PageLoader />}><LeadsQueue /></Suspense>} />
              <Route path="sandbox/:id" element={<Suspense fallback={<PageLoader />}><LeadDetail /></Suspense>} />
              <Route path="sandbox/metrics" element={<Suspense fallback={<PageLoader />}><MetricsDashboard /></Suspense>} />
              <Route path="sandbox/pendentes" element={<Suspense fallback={<PageLoader />}><LeadsPendentes /></Suspense>} />
              <Route path="mapa-kms" element={<Suspense fallback={<PageLoader />}><MapaKms /></Suspense>} />
              <Route path="mapa-kms/estatisticas" element={<Suspense fallback={<PageLoader />}><MapaKmsStatistics /></Suspense>} />
              <Route path="mapa-kms/nova" element={<Suspense fallback={<PageLoader />}><NewTrip /></Suspense>} />
            </Route>
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </PersistQueryClientProvider>
  );
}

export default App;

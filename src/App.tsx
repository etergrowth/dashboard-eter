import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Auth Components
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Unauthorized } from './pages/Unauthorized';
import { ProtectedRoute } from './components/ProtectedRoute';

// Dashboard Components
import { DashboardLayout } from './dashboard/layouts/DashboardLayout';
import { Overview } from './dashboard/pages/Overview';
import { CRM } from './dashboard/pages/CRM';
import { Projects } from './dashboard/pages/Projects';
import { CMS } from './dashboard/pages/CMS';
import { Proposals } from './dashboard/pages/Proposals';
import { FormTest } from './dashboard/pages/FormTest';
import { LeadDetails } from './dashboard/pages/CRM/LeadDetails';
import { ProposalDetails } from './dashboard/pages/Proposals/ProposalDetails';
import { LeadsQueue, LeadDetail, MetricsDashboard } from './dashboard/pages/Sandbox';
import { Finance } from './dashboard/pages/Finance';
import { FinanceStatistics } from './dashboard/pages/Finance/Statistics';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes - Require Authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="crm" element={<CRM />} />
              <Route path="crm/:id" element={<LeadDetails />} />
              <Route path="projects" element={<Projects />} />
              <Route path="proposals" element={<Proposals />} />
              <Route path="proposals/:id" element={<ProposalDetails />} />
              <Route path="cms" element={<CMS />} />
              <Route path="formulario" element={<FormTest />} />
              <Route path="finance" element={<Finance />} />
              <Route path="finance/estatisticas" element={<FinanceStatistics />} />
              <Route path="sandbox" element={<LeadsQueue />} />
              <Route path="sandbox/:id" element={<LeadDetail />} />
              <Route path="sandbox/metrics" element={<MetricsDashboard />} />
            </Route>
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

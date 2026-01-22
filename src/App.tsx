import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Root redirects to dashboard */}
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
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

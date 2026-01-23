import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useStore } from '../../lib/store';

export function DashboardLayout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        } ml-0`}
      >
        <Header />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

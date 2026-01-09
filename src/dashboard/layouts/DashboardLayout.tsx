import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useStore } from '../../lib/store';

export function DashboardLayout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

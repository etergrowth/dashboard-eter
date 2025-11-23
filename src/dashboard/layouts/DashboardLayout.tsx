import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useStore } from '../../lib/store';

export function DashboardLayout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen bg-[#030712]">
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

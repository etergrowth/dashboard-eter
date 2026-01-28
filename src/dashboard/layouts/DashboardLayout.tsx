import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { PageTransition } from '../components/PageTransition';
import { useStore } from '../../lib/store';
import { useIsMobile } from '../../hooks/use-mobile';

export function DashboardLayout() {
  const { sidebarOpen } = useStore();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}

      <div
        className={`transition-all duration-300 ${
          !isMobile ? (sidebarOpen ? 'md:ml-64' : 'md:ml-20') : 'ml-0'
        }`}
      >
        <Header />
        <main className={`p-4 md:p-6 ${isMobile ? 'pb-28' : ''}`}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Bottom Navigation - only on mobile */}
      {isMobile && <BottomNavigation />}

      <Toaster position="top-right" richColors />
    </div>
  );
}

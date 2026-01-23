import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Image,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useIsMobile } from '../../hooks/use-mobile';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', to: '/dashboard/crm', icon: Users },
  { name: 'Projetos', to: '/dashboard/projects', icon: Briefcase },
  { name: 'Propostas', to: '/dashboard/proposals', icon: FileText },
  { name: 'CMS', to: '/dashboard/cms', icon: Image },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useStore();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Fechar sidebar no mobile quando a rota mudar
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevenir scroll do body quando sidebar mobile está aberta
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <aside
        className={`fixed left-0 top-0 h-screen backdrop-blur-xl border-r transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
        style={{
          backgroundColor: 'hsl(var(--card) / 0.95)',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div 
            className="h-16 flex items-center justify-between px-4 border-b"
            style={{ borderColor: 'hsl(var(--border))' }}
          >
            <div className="flex items-center gap-3">
              {sidebarOpen && (
                <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  Eter Growth
                </h1>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-accent rounded-lg transition"
              style={{ 
                color: 'hsl(var(--muted-foreground))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'hsl(var(--foreground))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              }}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  // Mobile Sidebar com comportamento nativo
  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Overlay com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={toggleSidebar}
          />

          {/* Drawer Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info: PanInfo) => {
              // Fechar se arrastar mais de 50% para a esquerda
              if (info.offset.x < -100 || info.velocity.x < -500) {
                setSidebarOpen(false);
              }
            }}
            className="fixed left-0 top-0 h-screen w-72 z-50 md:hidden"
            style={{
              backgroundColor: 'hsl(var(--card))',
              borderRight: '1px solid hsl(var(--border))',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header com logo e botão fechar */}
              <div 
                className="h-16 flex items-center justify-between px-4 border-b"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                <h1 
                  className="text-xl font-bold" 
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  Eter Growth
                </h1>
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-accent rounded-lg transition active:scale-95"
                  style={{ 
                    color: 'hsl(var(--muted-foreground))',
                  }}
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/dashboard'}
                      onClick={toggleSidebar}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all active:scale-[0.98] ${
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground active:bg-accent'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-base">{item.name}</span>
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

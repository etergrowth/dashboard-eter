import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Image,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../lib/store';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', to: '/dashboard/crm', icon: Users },
  { name: 'Projetos', to: '/dashboard/projects', icon: Briefcase },
  { name: 'Propostas', to: '/dashboard/proposals', icon: FileText },
  { name: 'CMS', to: '/dashboard/cms', icon: Image },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      {/* Sidebar */}
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ backgroundColor: 'hsl(var(--background) / 0.5)' }}
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

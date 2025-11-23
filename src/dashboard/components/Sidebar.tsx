import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Map,
  Image,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'CRM', to: '/dashboard/crm', icon: Users },
  { name: 'Projetos', to: '/dashboard/projects', icon: Briefcase },
  { name: 'Mapa', to: '/dashboard/map', icon: Map },
  { name: 'CMS', to: '/dashboard/cms', icon: Image },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useStore();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#030712]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-white">
                  Eter Growth
                </h1>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
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
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                    isActive
                      ? 'bg-[#7BA8F9]/20 text-[#7BA8F9]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
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

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

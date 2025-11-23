import { useState } from 'react';
import { Bell, Search, User, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../../lib/store';

export function Header() {
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="h-16 bg-[#030712]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      {/* Left: Mobile menu button + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full pl-11 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7BA8F9] focus:border-transparent transition text-sm"
          />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#7BA8F9] to-[#9333EA] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">
                {user?.email?.split('@')[0] || 'Utilizador'}
              </p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <p className="text-sm font-medium text-white">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Conta Ativa</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Definições</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

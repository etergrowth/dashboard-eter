import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Target, LayoutDashboard, Wallet, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  id: string;
  name: string;
  to: string;
  icon: typeof Users;
}

const navItems: NavItem[] = [
  { id: 'crm', name: 'CRM', to: '/dashboard/crm', icon: Users },
  { id: 'sandbox', name: 'Sandbox', to: '/dashboard/sandbox', icon: Target },
  { id: 'overview', name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { id: 'finance', name: 'Finanças', to: '/dashboard/finance', icon: Wallet },
  { id: 'kms-stats', name: 'Kms', to: '/dashboard/mapa-kms/estatisticas', icon: BarChart3 },
];

export function BottomNavigation() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detectar tema do sistema
    const checkTheme = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => mediaQuery.removeEventListener('change', checkTheme);
  }, []);

  const isActive = (to: string) => {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(to);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Container com cantos arredondados e elevação */}
      <div
        className="mx-3 mb-3 rounded-[24px]"
        style={{
          backgroundColor: isDarkMode 
            ? 'rgba(0, 0, 0, 0.85)' 
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDarkMode
            ? '0 -4px 24px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(0, 0, 0, 0.3)'
            : '0 -4px 24px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.to === '/dashboard'}
                className="flex items-center justify-center flex-1 h-full"
              >
                <motion.div
                  animate={{
                    scale: active ? 1 : 0.95,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative flex items-center justify-center w-12 h-12"
                >
                  {/* Círculo de fundo para item ativo */}
                  {active && (
                    <motion.div
                      layoutId="bottomNavActiveBg"
                      className="absolute inset-0 flex items-center justify-center"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{
                          backgroundColor: isDarkMode
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 127, 0, 0.15)', // Laranja suave
                        }}
                      />
                    </motion.div>
                  )}
                  
                  {/* Ícone */}
                  <div className="relative z-10 flex items-center justify-center">
                    <Icon
                      className="w-6 h-6 transition-all duration-200"
                      style={{
                        color: active
                          ? (isDarkMode ? '#ffffff' : '#ff7f00') // Branco (dark) ou Laranja (light)
                          : (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'),
                      }}
                    />
                  </div>
                </motion.div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

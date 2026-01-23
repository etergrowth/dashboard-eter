import { X, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../lib/store';
import { useIsMobile } from '../../hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Header() {
  const { toggleSidebar, sidebarOpen } = useStore();
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header 
      className="sticky top-0 z-30 h-16 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6"
      style={{
        backgroundColor: 'hsl(var(--card) / 0.95)',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Mobile menu button - sempre visível no mobile */}
      {isMobile && (
        <motion.button
          onClick={toggleSidebar}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-lg transition-all"
          style={{ 
            color: sidebarOpen ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
          }}
          aria-label={sidebarOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
          aria-expanded={sidebarOpen}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <svg
                aria-hidden="true"
                role="graphics-symbol"
                viewBox="0 0 20 20"
                className="w-6 h-6 sidebarLeft directional-icon block flex-shrink-0"
                style={{ fill: 'currentColor' }}
              >
                <path
                  transform="translate(20, 0) scale(-1, 1)"
                  d="M16.25 3.625c1.174 0 2.125.951 2.125 2.125v8.5a2.125 2.125 0 0 1-2.125 2.125H3.75a2.125 2.125 0 0 1-2.125-2.125v-8.5c0-1.174.951-2.125 2.125-2.125zm-12.5 1.25a.875.875 0 0 0-.875.875v8.5c0 .483.392.875.875.875h8.7V4.875zm9.8 10.25h2.7a.875.875 0 0 0 .875-.875v-8.5a.875.875 0 0 0-.875-.875h-2.7z"
                />
              </svg>
            )}
          </motion.div>
        </motion.button>
      )}

      {/* Spacer para empurrar conteúdo à direita */}
      <div className="flex-1" />

      {/* User info e logout - à direita */}
      <div className="flex items-center gap-2">
        {user?.email && (
          <span className="hidden md:block text-sm text-muted-foreground">
            {user.email}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Fazer logout"
          className="h-9 w-9"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

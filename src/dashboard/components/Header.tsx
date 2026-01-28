import { LogOut } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Header() {
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
      className={`sticky top-0 z-30 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 ${
        isMobile ? 'h-14' : 'h-16'
      }`}
      style={{
        backgroundColor: 'hsl(var(--card) / 0.95)',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Logo on mobile */}
      {isMobile && (
        <h1
          className="text-base font-bold"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Eter Growth
        </h1>
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
          className={isMobile ? 'h-8 w-8' : 'h-9 w-9'}
        >
          <LogOut className={isMobile ? 'h-4 w-4' : 'h-4 w-4'} />
        </Button>
      </div>
    </header>
  );
}

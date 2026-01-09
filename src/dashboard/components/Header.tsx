import { Menu } from 'lucide-react';
import { useStore } from '../../lib/store';

export function Header() {
  const { toggleSidebar } = useStore();

  return (
    <header 
      className="h-16 backdrop-blur-xl border-b flex items-center justify-end px-6"
      style={{
        backgroundColor: 'hsl(var(--card) / 0.95)',
        borderColor: 'hsl(var(--border))',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 hover:bg-accent rounded-lg transition"
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
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
}

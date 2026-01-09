import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({ 
  label, 
  onClick, 
  icon: Icon,
  variant = 'primary'
}: ActionButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold';
  
  const variantStyles = {
    primary: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
    },
    secondary: {
      backgroundColor: 'hsl(var(--secondary))',
      color: 'hsl(var(--secondary-foreground))',
    },
  };

  return (
    <button
      onClick={onClick}
      className={baseStyles}
      style={variantStyles[variant]}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}
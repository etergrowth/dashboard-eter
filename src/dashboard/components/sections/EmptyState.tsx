import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div 
      className="text-center py-12"
      style={{ color: 'hsl(var(--muted-foreground))' }}
    >
      {Icon && <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />}
      <p className="text-lg font-medium mb-2">{title}</p>
      {description && <p className="text-sm mb-4">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
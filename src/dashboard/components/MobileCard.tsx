import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface MobileCardField {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  fields: MobileCardField[];
  status?: {
    label: string;
    color: string;
  };
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  subtitle,
  fields,
  status,
  actions,
  onClick,
  className = '',
}: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 shadow-sm ${
        onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm truncate">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {status && (
            <span
              className={`px-2 py-1 text-[10px] font-semibold rounded-full ${status.color}`}
            >
              {status.label}
            </span>
          )}
          {onClick && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">{field.label}</span>
            <span
              className={`font-medium ${
                field.highlight ? 'text-primary' : 'text-foreground'
              }`}
            >
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      {actions && (
        <div className="mt-3 pt-3 border-t border-border flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Quick action button for mobile cards
interface MobileCardActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'default' | 'danger' | 'primary';
}

export function MobileCardAction({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: MobileCardActionProps) {
  const variantClasses = {
    default: 'bg-secondary text-foreground hover:bg-accent',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${variantClasses[variant]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

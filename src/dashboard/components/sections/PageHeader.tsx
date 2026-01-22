import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}
import { ReactNode } from 'react';
import { useIsMobile } from '../../hooks/use-mobile';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  mobileCardRender: (item: T, onRowClick?: (item: T) => void) => ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  mobileCardRender,
  emptyState,
  className = '',
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  // Mobile: render cards
  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item) => (
          <div key={keyExtractor(item)}>
            {mobileCardRender(item, onRowClick)}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: render table
  return (
    <div className={`glass-panel rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b bg-secondary/50"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {column.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`transition-colors hover:bg-accent/30 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${
                        column.align === 'right'
                          ? 'text-right'
                          : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key]}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

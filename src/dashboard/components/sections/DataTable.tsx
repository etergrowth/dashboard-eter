import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ 
  columns, 
  data, 
  keyExtractor,
  onRowClick 
}: DataTableProps<T>) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr 
              className="border-b"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-sm font-semibold ${
                    column.align === 'right' ? 'text-right' :
                    column.align === 'center' ? 'text-center' :
                    'text-left'
                  }`}
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`border-b transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-accent/30' : ''
                }`}
                style={{ borderColor: 'hsl(var(--border) / 0.5)' }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 ${
                      column.align === 'right' ? 'text-right' :
                      column.align === 'center' ? 'text-center' :
                      'text-left'
                    }`}
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
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
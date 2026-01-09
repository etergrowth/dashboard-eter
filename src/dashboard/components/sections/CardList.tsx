import { ReactNode } from 'react';

interface CardListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  columns?: 1 | 2 | 3 | 4;
  emptyState?: ReactNode;
}

export function CardList<T>({ 
  items, 
  renderItem, 
  keyExtractor,
  columns = 3,
  emptyState
}: CardListProps<T>) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
      {items.map((item) => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
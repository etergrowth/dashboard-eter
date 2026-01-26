import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavLink } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { ICON_MAP, type NavigationItemConfig } from './constants';

interface SortableNavItemProps {
  item: NavigationItemConfig;
  sidebarOpen: boolean;
  onContextMenu: (event: React.MouseEvent, item: NavigationItemConfig) => void;
}

export function SortableNavItem({
  item,
  sidebarOpen,
  onContextMenu,
}: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = ICON_MAP[item.iconKey];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative mb-1"
      onContextMenu={(e) => onContextMenu(e, item)}
    >
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        className={({ isActive }) =>
          `flex items-center ${sidebarOpen ? 'gap-3 pl-8 pr-4' : 'justify-center px-2'} py-3 rounded-lg transition ${
            isActive
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`
        }
      >
        {sidebarOpen && (
          <button
            {...attributes}
            {...listeners}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none z-10"
            style={{ color: 'hsl(var(--muted-foreground))' }}
            onClick={(e) => e.preventDefault()}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}
        <Icon className="w-5 h-5 flex-shrink-0" />
        {sidebarOpen && <span className="font-medium">{item.name}</span>}
      </NavLink>
    </div>
  );
}

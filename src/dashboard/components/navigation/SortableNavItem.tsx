import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavLink, useLocation } from 'react-router-dom';
import { GripVertical, ChevronRight } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const visibleSubItems = hasSubItems ? item.subItems.filter(subItem => subItem.visible) : [];
  const showSubmenu = hasSubItems && visibleSubItems.length > 0 && sidebarOpen && isHovered;
  
  // Verificar se algum subitem está ativo
  const isSubItemActive = hasSubItems && item.subItems?.some(
    subItem => location.pathname === subItem.to
  );
  
  // Verificar se o item principal está ativo (incluindo subitens)
  const isItemActive = location.pathname === item.to || isSubItemActive;

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NavLink
        to={item.to}
        end={item.to === '/dashboard'}
        className={({ isActive }) =>
          `flex items-center ${sidebarOpen ? 'gap-3 pl-8 pr-4' : 'justify-center px-2'} py-3 rounded-lg transition ${
            isActive || isItemActive
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
        {sidebarOpen && (
          <>
            <span className="font-medium flex-1">{item.name}</span>
            {hasSubItems && visibleSubItems.length > 0 && (
              <ChevronRight className="w-4 h-4 opacity-50" />
            )}
          </>
        )}
      </NavLink>
      
      {/* Submenu no hover (apenas desktop e quando sidebar está aberta) */}
      {showSubmenu && (
        <div className="absolute left-full top-0 ml-2 min-w-[200px] bg-card border border-border rounded-lg shadow-lg py-1 z-50">
          {visibleSubItems.map((subItem) => {
            const SubIcon = ICON_MAP[subItem.iconKey];
            const isSubActive = location.pathname === subItem.to;
            
            return (
              <NavLink
                key={subItem.id}
                to={subItem.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-md mx-1 transition ${
                    isActive || isSubActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <SubIcon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{subItem.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronLeft, ChevronRight, X, GripVertical } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useIsMobile } from '../../hooks/use-mobile';
import { ICON_MAP, DEFAULT_NAVIGATION, type NavigationItemConfig } from './navigation/constants';
import { SortableNavItem } from './navigation/SortableNavItem';
import { ContextMenu } from './navigation/ContextMenu';

export function Sidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    navigationItems,
    reorderNavigation,
    toggleNavigationVisibility,
    resetNavigation,
  } = useStore();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Migrar navigationItems: adicionar novos itens do DEFAULT_NAVIGATION que não existem
  useEffect(() => {
    const defaultIds = new Set(DEFAULT_NAVIGATION.map(item => item.id));
    const currentIds = new Set(navigationItems.map(item => item.id));
    
    // IDs que devem ser removidos (agora são subitens)
    const idsToRemove = new Set(['estatisticas-kms', 'leads-website']);
    
    // Verificar se há itens faltando ou se precisa remover/atualizar
    const missingIds = Array.from(defaultIds).filter(id => !currentIds.has(id));
    const hasItemsToRemove = navigationItems.some(item => idsToRemove.has(item.id));
    const needsUpdate = missingIds.length > 0 || hasItemsToRemove;
    
    if (needsUpdate) {
      // Adicionar itens faltantes
      const existingItemsMap = new Map(navigationItems.map(item => [item.id, item]));
      const newItems: NavigationItemConfig[] = [];
      
      DEFAULT_NAVIGATION.forEach(defaultItem => {
        const existing = existingItemsMap.get(defaultItem.id);
        if (existing) {
          // Se o item tem subitens no DEFAULT_NAVIGATION, mesclar com os existentes
          if (defaultItem.subItems && defaultItem.subItems.length > 0) {
            newItems.push({ ...existing, subItems: defaultItem.subItems });
          } else {
            newItems.push(existing);
          }
        } else {
          newItems.push(defaultItem);
        }
      });
      
      // Adicionar itens antigos que não estão mais no DEFAULT_NAVIGATION e não devem ser removidos
      navigationItems.forEach(item => {
        if (!defaultIds.has(item.id) && !idsToRemove.has(item.id)) {
          newItems.push(item);
        }
      });
      
      // Reordenar e atualizar
      const sorted = newItems.sort((a, b) => a.order - b.order);
      useStore.setState({ navigationItems: sorted });
    }
  }, [navigationItems]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    item: NavigationItemConfig | null;
    position: { x: number; y: number };
  }>({ item: null, position: { x: 0, y: 0 } });

  // Long press state for mobile
  const longPressTimerRef = useRef<number | null>(null);
  const longPressItemRef = useRef<NavigationItemConfig | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter visible items
  const visibleItems = navigationItems.filter((item) => item.visible);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        reorderNavigation(active.id as string, over.id as string);
      }
    },
    [reorderNavigation]
  );

  // Handle context menu
  const handleContextMenu = useCallback(
    (event: React.MouseEvent, item: NavigationItemConfig) => {
      event.preventDefault();
      setContextMenu({
        item,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  // Handle long press start for mobile
  const handleTouchStart = useCallback(
    (item: NavigationItemConfig, event: React.TouchEvent) => {
      longPressItemRef.current = item;
      longPressTimerRef.current = window.setTimeout(() => {
        const touch = event.touches[0];
        setContextMenu({
          item,
          position: { x: touch.clientX, y: touch.clientY },
        });
      }, 500);
    },
    []
  );

  // Handle long press end
  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressItemRef.current = null;
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu({ item: null, position: { x: 0, y: 0 } });
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <>
        <aside
          className={`fixed left-0 top-0 h-screen backdrop-blur-xl border-r transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
          style={{
            backgroundColor: 'hsl(var(--card) / 0.95)',
            borderColor: 'hsl(var(--border))',
          }}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div
              className={`h-16 flex items-center border-b ${
                sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'
              }`}
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              {sidebarOpen && (
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                    Eter Growth
                  </h1>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-accent rounded-lg transition"
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
                {sidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${sidebarOpen ? 'p-4 space-y-2' : 'p-2 space-y-1'}`}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={visibleItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {visibleItems.map((item) => (
                    <SortableNavItem
                      key={item.id}
                      item={item}
                      sidebarOpen={sidebarOpen}
                      onContextMenu={handleContextMenu}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </nav>
          </div>
        </aside>

        {/* Context Menu Portal */}
        {createPortal(
          <ContextMenu
            item={contextMenu.item}
            position={contextMenu.position}
            onClose={closeContextMenu}
            onToggleVisibility={toggleNavigationVisibility}
            onResetNavigation={resetNavigation}
          />,
          document.body
        )}
      </>
    );
  }

  // Mobile Sidebar
  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={toggleSidebar}
            />

            {/* Drawer Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info: PanInfo) => {
                if (info.offset.x < -100 || info.velocity.x < -500) {
                  setSidebarOpen(false);
                }
              }}
              className="fixed left-0 top-0 h-screen w-72 z-50 md:hidden"
              style={{
                backgroundColor: 'hsl(var(--card))',
                borderRight: '1px solid hsl(var(--border))',
                boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div
                  className="h-16 flex items-center justify-between px-4 border-b"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                    Eter Growth
                  </h1>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-accent rounded-lg transition active:scale-95"
                    style={{
                      color: 'hsl(var(--muted-foreground))',
                    }}
                    aria-label="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={visibleItems.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {visibleItems.map((item, index) => {
                        const Icon = ICON_MAP[item.iconKey];
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onTouchStart={(e) => handleTouchStart(item, e)}
                            onTouchEnd={handleTouchEnd}
                            onTouchMove={handleTouchEnd}
                            onContextMenu={(e) => handleContextMenu(e, item)}
                            className="group relative"
                          >
                            <NavLink
                              to={item.to}
                              end={item.to === '/dashboard'}
                              onClick={toggleSidebar}
                              className={({ isActive }) =>
                                `flex items-center gap-3 pl-8 pr-4 py-3.5 rounded-lg transition-all active:scale-[0.98] ${
                                  isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted-foreground active:bg-accent'
                                }`
                              }
                            >
                              <GripVertical
                                className="w-4 h-4 opacity-50 absolute left-2"
                                style={{ color: 'hsl(var(--muted-foreground))' }}
                              />
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="font-medium text-base">{item.name}</span>
                            </NavLink>
                          </motion.div>
                        );
                      })}
                    </SortableContext>
                  </DndContext>
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Context Menu Portal */}
      {createPortal(
        <ContextMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onToggleVisibility={toggleNavigationVisibility}
          onResetNavigation={resetNavigation}
        />,
        document.body
      )}
    </>
  );
}

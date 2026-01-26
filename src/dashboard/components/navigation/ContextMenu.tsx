import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import type { NavigationItemConfig } from './constants';

interface ContextMenuProps {
  item: NavigationItemConfig | null;
  position: { x: number; y: number };
  onClose: () => void;
  onToggleVisibility: (id: string) => void;
  onResetNavigation: () => void;
}

export function ContextMenu({
  item,
  position,
  onClose,
  onToggleVisibility,
  onResetNavigation,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  // Adjust position to stay within viewport
  const getAdjustedPosition = () => {
    const menuWidth = 200;
    const menuHeight = 100;
    const padding = 8;

    let x = position.x;
    let y = position.y;

    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    return { x: Math.max(padding, x), y: Math.max(padding, y) };
  };

  const adjustedPosition = getAdjustedPosition();

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-[100] min-w-[180px] rounded-lg border shadow-lg py-1"
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            backgroundColor: 'hsl(var(--popover))',
            borderColor: 'hsl(var(--border))',
          }}
        >
          <button
            onClick={() => {
              onToggleVisibility(item.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {item.visible ? (
              <>
                <EyeOff className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                Ocultar "{item.name}"
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                Mostrar "{item.name}"
              </>
            )}
          </button>

          <div
            className="my-1 h-px"
            style={{ backgroundColor: 'hsl(var(--border))' }}
          />

          <button
            onClick={() => {
              onResetNavigation();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-accent"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            <RotateCcw className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            Restaurar Padrao
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

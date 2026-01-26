import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { DEFAULT_NAVIGATION, type NavigationItemConfig } from '../dashboard/components/navigation/constants';

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Navigation
  navigationItems: NavigationItemConfig[];
  reorderNavigation: (activeId: string, overId: string) => void;
  toggleNavigationVisibility: (id: string) => void;
  resetNavigation: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Navigation state
      navigationItems: DEFAULT_NAVIGATION,

      reorderNavigation: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.navigationItems.findIndex((item) => item.id === activeId);
          const newIndex = state.navigationItems.findIndex((item) => item.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const newItems = arrayMove(state.navigationItems, oldIndex, newIndex).map(
            (item, index) => ({ ...item, order: index })
          );

          return { navigationItems: newItems };
        }),

      toggleNavigationVisibility: (id) =>
        set((state) => ({
          navigationItems: state.navigationItems.map((item) =>
            item.id === id ? { ...item, visible: !item.visible } : item
          ),
        })),

      resetNavigation: () => set({ navigationItems: DEFAULT_NAVIGATION }),
    }),
    {
      name: 'eter-dashboard-storage',
      partialize: (state) => ({
        navigationItems: state.navigationItems,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/config';

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      devOpen: true,
      searchQuery: '',
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      setDevOpen: (open) => set({ devOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      resetUI: () => set({
        sidebarCollapsed: false,
        sidebarMobileOpen: false,
        devOpen: true,
        searchQuery: '',
      }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        devOpen: state.devOpen,
      }),
    }
  )
);

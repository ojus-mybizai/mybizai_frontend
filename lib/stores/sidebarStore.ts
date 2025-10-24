import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      isOpen: true, // Default to open on desktop

      toggleSidebar: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ isOpen: open })
      }
    })),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isOpen: state.isOpen,
      }),
    }
  )
)

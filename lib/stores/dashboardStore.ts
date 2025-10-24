import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

interface DashboardStats {
  conversations_this_week: number
  leads_this_week: number
  orders_created: number
  active_chat_agents: number
  recent_conversations?: any[]
}

interface DashboardState {
  stats: DashboardStats | null

  // Actions
  setStats: (stats: DashboardStats) => void
  updateStats: (updates: Partial<DashboardStats>) => void
  clearStats: () => void
  refreshStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      stats: null,

      setStats: (stats: DashboardStats) => {
        set({ stats })
      },

      updateStats: (updates: Partial<DashboardStats>) => {
        set((state) => ({
          stats: state.stats ? { ...state.stats, ...updates } : null
        }))
      },

      clearStats: () => {
        set({ stats: null })
      },

      refreshStats: async () => {
        // This would typically make an API call to refresh stats
        // For now, we'll leave it as a placeholder
        console.log('Refreshing dashboard stats...')
      }
    })),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        stats: state.stats,
      }),
    }
  )
)

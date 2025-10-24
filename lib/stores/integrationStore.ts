import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { Integration } from '../api'

interface IntegrationState {
  integrations: Integration[]
  isLoading: boolean
  error: string | null

  // Actions
  setIntegrations: (integrations: Integration[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addIntegration: (integration: Integration) => void
  updateIntegration: (id: number, updates: Partial<Integration>) => void
  removeIntegration: (id: number) => void
  clearIntegrations: () => void
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      integrations: [],
      isLoading: false,
      error: null,

      setIntegrations: (integrations: Integration[]) => {
        set({ integrations })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      addIntegration: (integration: Integration) => {
        set((state) => ({
          integrations: [...state.integrations, integration]
        }))
      },

      updateIntegration: (id: number, updates: Partial<Integration>) => {
        set((state) => ({
          integrations: state.integrations.map(integration =>
            integration.id === id ? { ...integration, ...updates } : integration
          )
        }))
      },

      removeIntegration: (id: number) => {
        set((state) => ({
          integrations: state.integrations.filter(integration => integration.id !== id)
        }))
      },

      clearIntegrations: () => {
        set({
          integrations: [],
          isLoading: false,
          error: null
        })
      }
    })),
    {
      name: 'integration-storage',
      partialize: (state) => ({
        integrations: state.integrations,
      }),
    }
  )
)

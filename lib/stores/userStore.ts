import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { UserMe } from '../api'

interface UserState {
  user: UserMe | null

  // Actions
  setUser: (user: UserMe) => void
  clearUser: () => void
  updateUser: (updates: Partial<UserMe>) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      user: null,

      setUser: (user: UserMe) => {
        set({ user })
      },

      clearUser: () => {
        set({ user: null })
      },

      updateUser: (updates: Partial<UserMe>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }))
      },

      reset: () => {
        set({ user: null })
      }
    })),
    {
      name: 'user-storage',
      // Persist user data for quick access
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  tokenType: string | null
  isAuthenticated: boolean | undefined // undefined = initializing

  // Actions
  login: (token: string, tokenType?: string) => void
  logout: () => void
  initAuth: () => Promise<boolean>
  setAuthenticated: (authenticated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      accessToken: null,
      tokenType: null,
      isAuthenticated: undefined, // Start as undefined during initialization

      login: (token: string, tokenType: string = 'bearer') => {
        set({
          accessToken: token,
          tokenType,
          isAuthenticated: true
        })
      },

      logout: () => {
        // Clear localStorage token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('token_type')
        }

        set({
          accessToken: null,
          tokenType: null,
          isAuthenticated: false
        })
      },

      initAuth: async (): Promise<boolean> => {
        try {
          // Check if we have a token in localStorage
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token')
            if (token) {
              set({
                accessToken: token,
                tokenType: 'bearer',
                isAuthenticated: true
              })
              return true
            }
          }

          // No token found
          set({ isAuthenticated: false })
          return false
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ isAuthenticated: false })
          return false
        }
      },

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated })
      }
    })),
    {
      name: 'auth-storage',
      // Only persist token and tokenType, not isAuthenticated state
      partialize: (state) => ({
        accessToken: state.accessToken,
        tokenType: state.tokenType,
      }),
    }
  )
)

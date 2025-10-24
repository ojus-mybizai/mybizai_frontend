import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme

  // Actions
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      theme: (typeof window !== 'undefined' && localStorage.getItem('theme') as Theme) || 'light',

      setTheme: (theme: Theme) => {
        // Apply theme to document
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
          localStorage.setItem('theme', theme)
        }

        set({ theme })
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light'

        get().setTheme(newTheme)
      }
    })),
    {
      name: 'theme-storage',
    }
  )
)

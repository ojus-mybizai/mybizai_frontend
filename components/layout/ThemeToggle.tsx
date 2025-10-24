'use client'

import { useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useThemeStore } from '@/lib/stores/themeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme on client side
    const savedTheme = localStorage.getItem('theme-storage')
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme)
      if (parsed.state?.theme) {
        setTheme(parsed.state.theme)
      }
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [setTheme])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

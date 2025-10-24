'use client'

import { LogOut, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ThemeToggle from './ThemeToggle'
import { useAuthStore } from '@/lib/stores/authStore'
import { useBusinessStore } from '@/lib/stores/businessStore'
import { useUserStore } from '@/lib/stores/userStore'
import { useSidebarStore } from '@/lib/stores/sidebarStore'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { logout } = useAuthStore()
  const { user } = useUserStore()
  const { businessData } = useBusinessStore()
  const { toggleSidebar } = useSidebarStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-gray-200 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleSidebar}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MyBizAI
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
          <User className="h-4 w-4" />
          <span>{user?.full_name || user?.email}</span>
        </div>
        
        <ThemeToggle />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  )
}

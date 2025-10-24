'use client'

import { Home, Bot, Settings, Package, UserCheck, Target, Brain, Zap, CreditCard, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebarStore'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Catalog', href: '/catalog', icon: Package },
  { name: 'Contacts', href: '/contacts', icon: UserCheck },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Chats', href: '/chats', icon: MessageCircle },
  { name: 'Chat Agents', href: '/chatagent', icon: Bot },
  { name: 'Knowledge Base', href: '/knowledgebase', icon: Brain },
  { name: 'Integrations', href: '/integrations', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/billing', icon: CreditCard },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { isOpen } = useSidebarStore()
  const isClosed = !isOpen

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900/50 border-r border-gray-200 dark:border-slate-800/50 h-full transition-all duration-300 ease-in-out backdrop-blur-sm",
      isClosed ? "w-16" : "w-64"
    )}>
      <nav className={cn("p-4 space-y-2", isClosed && "px-2")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg text-sm font-medium transition-colors',
                isClosed ? 'justify-center px-3 py-3' : 'space-x-3 px-3 py-2',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/50'
              )}
              title={isClosed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isClosed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

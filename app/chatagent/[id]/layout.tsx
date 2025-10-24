'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
import { ArrowLeft, Bot, Edit, Brain, TestTube, Settings, BarChart3, Zap, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi, isDemoMode } from '@/lib/apiWrapper'

interface AgentEditLayoutProps {
  children: React.ReactNode
}

export default function AgentEditLayout({ children }: AgentEditLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const agentId = parseInt(params.id as string)
  const { accessToken: token } = useAuthStore()
  const { chatAgents: agents } = useChatAgentStore()

  const [agent, setAgent] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  const loadAgent = async () => {
    try {
      setIsLoading(true)

      if (isDemoMode()) {
        const foundAgent = agents.find((a: any) => a.id === agentId)
        if (foundAgent) {
          setAgent(foundAgent)
        } else {
          router.push('/chatagent')
          return
        }
      } else {
        const response = await chatAgentApi.getChatAgent(agentId, token!)
        setAgent(response)
      }
    } catch (error) {
      console.error('Failed to load agent:', error)
      router.push('/chatagent')
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentSection = () => {
    const pathSegments = pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    return lastSegment || 'profile'
  }

  const getNavigationItems = () => [
    {
      id: 'profile',
      label: 'Profile',
      icon: Edit,
      href: `/chatagent/${agentId}/profile`,
      description: 'Basic agent information'
    },
    {
      id: 'knowledgebase',
      label: 'Knowledge Base',
      icon: Brain,
      href: `/chatagent/${agentId}/knowledgebase`,
      description: 'Training data and documents'
    },
    {
      id: 'channels',
      label: 'Channels',
      icon: Wifi,
      href: `/chatagent/${agentId}/channels`,
      description: 'Communication platforms'
    },
    {
      id: 'tools',
      label: 'Tools & Integrations',
      icon: Zap,
      href: `/chatagent/${agentId}/tools`,
      description: 'Capabilities and external services'
    },
    {
      id: 'test',
      label: 'Test & Deploy',
      icon: TestTube,
      href: `/chatagent/${agentId}/test`,
      description: 'Testing and deployment'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: `/chatagent/${agentId}/analytics`,
      description: 'Performance and insights'
    }
  ]

  const currentSection = getCurrentSection()
  const navigationItems = getNavigationItems()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading agent...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Agent not found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The requested agent could not be found.</p>
        <Button onClick={() => router.push('/chatagent')}>
          Back to Agents
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                {agent.avatar_url ? (
                  <img src={agent.avatar_url} alt="Agent" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">{agent.name}</h2>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    agent.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/chatagent')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = currentSection === item.id
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                  {sidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden p-4 border-b border-gray-200 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {sidebarOpen ? 'Hide' : 'Show'} Menu
          </Button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-2">
          {children}
        </div>
      </div>
    </div>
  )
}

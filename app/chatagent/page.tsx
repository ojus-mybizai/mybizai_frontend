'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Bot, Settings, MessageSquare, Zap, Calendar, Package, Trash2, Edit, TestTube, MoreHorizontal, Power, PowerOff, BookOpen, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { chatAgentApi, isDemoMode } from '@/lib/apiWrapper'
import {FaWhatsapp} from 'react-icons/fa'
import {FaTelegramPlane} from 'react-icons/fa'
import {FaFacebookMessenger} from 'react-icons/fa'
import {FaEnvelope} from 'react-icons/fa'
import {FaPhone} from 'react-icons/fa'

import { ChatAgent } from '@/lib/api'

export default function ChatAgentPage() {
  const router = useRouter()
  const { accessToken: token } = useAuthStore()
  const [agents, setAgents] = useState<ChatAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Check if user is authenticated before loading agents
    if (!token) {
      router.push('/login')
      return
    }
    loadAgents()
  }, [token, router])

  const loadAgents = async () => {
    try {
      setIsLoading(true)
        if (!token) {
          throw new Error('No authentication token available')
        }
        const agents = await chatAgentApi.getChatAgents(token)
        setAgents(agents || [])

    } catch (error) {
      console.error('Failed to load agents:', error)
      if (error instanceof Error) {
        alert(`Failed to load agents: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAgent = async (agentId: number) => {
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return
    }

    try {

        if (!token) {
          throw new Error('No authentication token available')
        }
        await chatAgentApi.deleteChatAgent(agentId, token)
        await loadAgents()
    } catch (error) {
      console.error('Failed to delete agent:', error)
      if (error instanceof Error) {
        alert(`Failed to delete agent: ${error.message}`)
      }
    }
  }

  const handleToggleAgent = async (agentId: number, isActive: boolean) => {
    try {
      if (isDemoMode()) {
        // Update mock data
        setAgents(agents.map((agent: any) =>
          agent.id === agentId ? { ...agent, is_active: !isActive } : agent
        ))
      } else {
        // Only make API call if we have a valid token
        if (!token) {
          throw new Error('No authentication token available')
        }
        await chatAgentApi.updateChatAgent(agentId, { active: !isActive } as any, token)
        await loadAgents()
      }
    } catch (error) {
      console.error('Failed to toggle agent:', error)
      if (error instanceof Error) {
        alert(`Failed to update agent: ${error.message}`)
      }
    }
  }

  const getCapabilitySummary = (capabilities: Record<string, boolean>) => {
    const enabledCapabilities = Object.entries(capabilities)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)

    if (enabledCapabilities.length === 0) return 'No capabilities enabled'
    if (enabledCapabilities.length === 1) return `${enabledCapabilities[0]} enabled`
    if (enabledCapabilities.length <= 3) return `${enabledCapabilities.length} capabilities enabled`
    return `${enabledCapabilities.length} capabilities enabled`
  }

  const getPrimaryCapability = (capabilities: Record<string, boolean>) => {
    const priorityCapabilities = ['knowledge_base_lookup', 'orders', 'appointments', 'catalog_lookup']
    for (const cap of priorityCapabilities) {
      if (capabilities[cap]) return cap
    }
    return Object.keys(capabilities).find(key => capabilities[key]) || null
  }

  const getCapabilityIcon = (capability: string) => {
    switch (capability) {
      case 'knowledge_base_lookup': return BookOpen
      case 'orders': return Package
      case 'appointments': return Calendar
      case 'catalog_lookup': return Package
      case 'lead_scoring': return Activity
      case 'summarization': return MessageSquare
      default: return Settings
    }
  }

  const getEnabledChannels = (channels: Record<string, boolean>) => {
    return Object.entries(channels)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)
  } 

  const getEnabledChannelsIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <FaWhatsapp/>
      case 'telegram': return <FaTelegramPlane/>
      case 'messenger': return <FaFacebookMessenger/>
      case 'email': return <FaEnvelope/>
      case 'sms': return <FaPhone/>
      default: return null
    }
  }

  const getStatusColor = (status: string, deployed: boolean, isActive: boolean) => {
    if (deployed && isActive) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    if (isActive) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-4 h-full">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Agents</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI assistants</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <Package className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          
          {/* Create Agent Button */}
          <Button onClick={() => router.push('/chatagent/new')} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Agent</span>
          </Button>
        </div>
      </div>

      {/* Agents List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chat agents...</div>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No agents yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first AI chat agent to get started</p>
          <Button onClick={() => router.push('/chatagent/new')} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Your First Agent</span>
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {agents.map((agent: any) => {
            const enabledChannels = getEnabledChannels(agent.channels)
            const primaryCapability = getPrimaryCapability(agent.capabilities || {})
            const PrimaryIcon = primaryCapability ? getCapabilityIcon(primaryCapability) : Bot

            return (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        agent.is_active
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <PrimaryIcon className={`w-6 h-6 ${agent.is_active ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{agent.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agent.status, agent.deployed, agent.is_active)}`}>
                            {agent.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{agent.description || 'No description'}</p>
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative group">
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div className="py-1">
                          <button
                            onClick={() => router.push(`/chatagent/${agent.id}`)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Overview
                          </button>
                          <button
                            onClick={() => router.push(`/chatagent/${agent.id}/profile`)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Configure
                          </button>
                          <button
                            onClick={() => router.push(`/chatagent/${agent.id}/test`)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <TestTube className="w-4 h-4" />
                            Test
                          </button>
                          <hr className="my-1 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primary Capability */}
                  {primaryCapability && (
                    <div className="flex items-center gap-2 text-sm">
                      <PrimaryIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {primaryCapability.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Capabilities Summary */}
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getCapabilitySummary(agent.capabilities || {})}
                  </div>

                  {/* Channels */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Connected Channels</p>
                    <div className="flex flex-wrap gap-1">
                      {enabledChannels.length > 0 ? (
                        enabledChannels.slice(0, 3).map(channel => (
                          <span
                            key={channel}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                          >
                            <span>{getEnabledChannelsIcon(channel)}</span>
                            <span className="capitalize">{channel}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No channels</span>
                      )}
                      {enabledChannels.length > 3 && (
                        <span className="text-xs text-gray-400">+{enabledChannels.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span>{agent.knowledge_bases?.length || 0} KB</span>
                    <span>{agent.integrations?.length || 0} Integrations</span>
                    <span>Last active: {formatLastActive(agent.last_active || agent.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

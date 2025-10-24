'use client'

import { Bot, Power, PowerOff, Edit, TestTube, Zap, Trash2, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ChatAgent } from '@/lib/api'

interface AgentCardProps {
  agent: ChatAgent
  onEdit: (agentId: number) => void
  onTest: (agentId: number) => void
  onAnalytics: (agentId: number) => void
  onDelete: (agentId: number) => void
  onToggleActive: (agentId: number, isActive: boolean) => void
  viewMode?: 'grid' | 'list'
}

export default function AgentCard({ 
  agent, 
  onEdit, 
  onTest, 
  onAnalytics, 
  onDelete, 
  onToggleActive,
  viewMode = 'grid'
}: AgentCardProps) {
  const getEnabledChannels = (channels: Array<{
    id: number
    type: string
    name: string
    config: Record<string, any>
    is_connected: boolean
    business_id: number
    created_at: string
    updated_at: string
  }> | undefined) => {
    if (!channels || !Array.isArray(channels)) return []
    return channels
      .filter(channel => channel.is_connected)
      .map(channel => channel.type)
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp': return '💬'
      case 'instagram': return '📷'
      case 'messenger': return '💬'
      case 'email': return '📧'
      case 'webchat': return '🌐'
      case 'telegram': return '✈️'
      case 'sms': return '📱'
      default: return '💬'
    }
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
  const enabledChannels = getEnabledChannels(agent.channels)

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              
              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{agent.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    agent.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {agent.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{agent.role_type}</p>
                {agent.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{agent.description}</p>
                )}
              </div>
              
              {/* Channels */}
              <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                {enabledChannels.slice(0, 3).map(channel => (
                  <span
                    key={channel}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    <span>{getChannelIcon(channel)}</span>
                    <span className="capitalize">{channel}</span>
                  </span>
                ))}
                {enabledChannels.length > 3 && (
                  <span className="text-xs text-gray-400">+{enabledChannels.length - 3}</span>
                )}
              </div>
              
              {/* Last Active */}
              <div className="hidden lg:block text-xs text-gray-500 dark:text-gray-400 min-w-0">
                {formatLastActive(agent.last_active || agent.updated_at)}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleActive(agent.id, agent.is_active)}
                className={`p-2 rounded ${
                  agent.is_active 
                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                    : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                title={agent.is_active ? 'Deactivate' : 'Activate'}
              >
                {agent.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
              </button>
              
              <div className="relative group">
                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="py-1">
                    <button
                      onClick={() => onEdit(agent.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onTest(agent.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Test
                    </button>
                    <button
                      onClick={() => onAnalytics(agent.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Analytics
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => onDelete(agent.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{agent.name}</h3>
                <button
                  onClick={() => onToggleActive(agent.id, agent.is_active)}
                  className={`p-1 rounded ${
                    agent.is_active 
                      ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' 
                      : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  title={agent.is_active ? 'Active' : 'Inactive'}
                >
                  {agent.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{agent.role_type}</p>
            </div>
          </div>
          
          {/* Actions Dropdown */}
          <div className="relative group">
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <div className="py-1">
                <button
                  onClick={() => onEdit(agent.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onTest(agent.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Test
                </button>
                <button
                  onClick={() => onAnalytics(agent.id)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Analytics
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => onDelete(agent.id)}
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
        {/* Description */}
        {agent.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {agent.description}
          </p>
        )}

        {/* Channels */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Connected Channels</p>
          <div className="flex flex-wrap gap-1">
            {enabledChannels.length > 0 ? (
              enabledChannels.map(channel => (
                <span
                  key={channel}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  <span>{getChannelIcon(channel)}</span>
                  <span className="capitalize">{channel}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No channels connected</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Last active: {formatLastActive(agent.last_active || agent.updated_at)}</span>
          <span className={`px-2 py-1 rounded-full ${
            agent.is_active 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {agent.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

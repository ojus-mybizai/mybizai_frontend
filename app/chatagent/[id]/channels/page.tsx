'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, RefreshCw, Wifi, MessageCircle, Send, Globe, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi , channelsApi } from '@/lib/apiWrapper'
import ConnectMeta from '@/components/facebook/connectmeta'
import FacebookSDKLoader from '@/components/facebook/facebooksdkloader'
import type { ExtendedChatAgent, Channel } from '@/lib/stores/chatAgentStore'

interface LinkedChannel {
  id: number
  name: string
  type: string
  status: string
}

export default function AgentChannelsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken: token } = useAuthStore()
  const { currentChatAgent, setChatAgentChannels } = useChatAgentStore()

  const agentId = parseInt(params.id as string)
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannelIds, setSelectedChannelIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddChannelModal, setShowAddChannelModal] = useState(false)
  const [deletingChannelId, setDeletingChannelId] = useState<number | null>(null)

  useEffect(() => {
    if (token && agentId) {
      loadChannelsAndAgentChannels()
    }
  }, [agentId, token])

  const loadChannelsAndAgentChannels = async () => {
    if (!token) return

    try {
      setLoading(true)

      // Fetch all available channels
      const allChannelsResponse = await channelsApi.getChannels(token)

      // Fetch agent's linked channels
      const agentChannelsResponse = await chatAgentApi.getChatAgentChannels(agentId, token)

      // Set available channels
      setChannels(allChannelsResponse)

      // Set selected channel IDs from agent's linked channels
      const linkedChannelIds = agentChannelsResponse.channels.map(channel => channel.id)
      setSelectedChannelIds(linkedChannelIds)

      console.log('📡 CHANNELS LOADED:')
      console.log('📋 Available channels:', allChannelsResponse.length)
      console.log('🔗 Agent linked channels:', linkedChannelIds.length)
      console.log('✅ Selected channel IDs:', linkedChannelIds)
    } catch (error) {
      console.error('Failed to fetch channels data:', error)
      alert('Failed to load channels data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadChannelsAndAgentChannels().finally(() => setRefreshing(false))
  }

  const handleChannelToggle = (channelId: number) => {
    // Only allow toggling if channel is not already linked to another agent
    const channel = channels.find(c => c.id === channelId)
    if (channel && channel.is_connected && !selectedChannelIds.includes(channelId)) {
      // Don't allow selection of connected channels that aren't linked to this agent
      return
    }

    setSelectedChannelIds(prev => {
      if (prev.includes(channelId)) {
        return prev.filter(id => id !== channelId)
      } else {
        return [...prev, channelId]
      }
    })
  }

  const handleSave = async () => {
    if (!token || !currentChatAgent) return

    try {
      setIsSaving(true)

      const response = await chatAgentApi.updateChatAgentChannels(agentId, {
        channel_ids: selectedChannelIds
      }, token)

      if (response.success) {
        // Refresh the agent's linked channels to get updated state
        const updatedAgentChannels = await chatAgentApi.getChatAgentChannels(agentId, token)
        const updatedLinkedChannelIds = updatedAgentChannels.channels.map(channel => channel.id)
        setSelectedChannelIds(updatedLinkedChannelIds)

        console.log('✅ CHANNELS UPDATED:')
        console.log('🔗 New linked channels:', updatedLinkedChannelIds)
        console.log('📊 Response:', response)

        alert(`Successfully updated channels for agent. ${response.linked_channels.length} channels linked.`)
      }
    } catch (error) {
      console.error('Failed to save channel configuration:', error)
      alert('Failed to save configuration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteChannel = async (channelId: number) => {
    if (!token) return

    try {
      setDeletingChannelId(channelId)

      await channelsApi.deleteChannel(channelId, token)

      // Remove the channel from the local state
      setChannels(prev => prev.filter(channel => channel.id !== channelId))
      // Remove from selected channels if it was selected
      setSelectedChannelIds(prev => prev.filter(id => id !== channelId))
      alert('Channel deleted successfully!')
    } catch (error) {
      console.error('Failed to delete channel:', error)
      alert('Failed to delete channel. Please try again.')
    } finally {
      setDeletingChannelId(null)
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-600" />
      case 'instagram':
        return <Send className="w-4 h-4 text-pink-600" />
      case 'facebook':
        return <MessageCircle className="w-4 h-4 text-blue-600" />
      case 'telegram':
        return <Send className="w-4 h-4 text-blue-500" />
      case 'website':
        return <Globe className="w-4 h-4 text-gray-600" />
      case 'email':
        return <Send className="w-4 h-4 text-purple-600" />
      default:
        return <Wifi className="w-4 h-4 text-gray-600" />
    }
  }

  const getChannelStatus = (channel: Channel) => {
    if (channel.is_connected && selectedChannelIds.includes(channel.id)) {
      return { status: 'Connected', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
    } else if (channel.is_connected) {
      return { status: 'Connected (Other Agent)', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
    } else {
      return { status: 'Disconnected', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentChatAgent) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Chat agent not found
        </h3>
        <Button onClick={() => router.push('/chatagent')}>
          Back to Chat Agents
        </Button>
      </div>
    )
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2">
      {/* Header */}
      <FacebookSDKLoader />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Communication Channels
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure channels where {currentChatAgent.name} will be available
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>

          <Button
            onClick={() => setShowAddChannelModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Channel</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channels Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Channels</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select channels to link to this agent
              </p>
            </div>

            {channels.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {channels.length} channel{channels.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedChannelIds.length} selected
                  </p>
                </div>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {channels.map((channel) => {
                    const channelStatus = getChannelStatus(channel)
                    const isDisabled = channel.is_connected && !selectedChannelIds.includes(channel.id)

                    return (
                      <div
                        key={channel.id}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedChannelIds.includes(channel.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : isDisabled
                            ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => !isDisabled && handleChannelToggle(channel.id)}
                      >
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(`Are you sure you want to delete "${channel.name}"?`)) {
                              handleDeleteChannel(channel.id)
                            }
                          }}
                          disabled={deletingChannelId === channel.id}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete channel"
                        >
                          <Trash2 className={`w-4 h-4 ${deletingChannelId === channel.id ? 'animate-pulse' : ''}`} />
                        </button>

                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-4 h-4 rounded border-2 mt-1 ${
                            selectedChannelIds.includes(channel.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedChannelIds.includes(channel.id) && (
                              <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getChannelIcon(channel.type)}
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {channel.name}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${channelStatus.color}`}>
                                {channelStatus.status}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} channel for customer interactions.
                            </p>

                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              Created: {new Date(channel.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Wifi className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No Channels Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Connect your first communication channel to help your chat agent reach customers across different platforms.
                </p>
                <Button
                  onClick={() => setShowAddChannelModal(true)}
                  size="lg"
                  className="flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Channel</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Current Configuration */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Selected Channels:</p>
                {selectedChannelIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedChannelIds.map((id) => {
                      const channel = channels.find(c => c.id === id)
                      return (
                        <div key={id} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-lg text-sm">
                          {channel?.name || `Channel-${id}`}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No channels selected</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Channel Modal */}
      {showAddChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Communication Channel</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Connect your business accounts to reach customers
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddChannelModal(false)}
                className="hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                ✕
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Active Meta Platforms */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">META</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Platforms</h3>
                </div>

                {[
                  {
                    name: 'WhatsApp Business',
                    channel: 'whatsapp',
                    icon: MessageCircle,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100 dark:bg-green-900/50',
                    description: 'Connect your WhatsApp Business account to send and receive messages directly through your chat agent.',
                    features: ['Real-time messaging', 'Message templates', 'Auto-replies'],
                    isActive: true
                  },
                  {
                    name: 'Instagram Direct',
                    channel: 'instagram',
                    icon: Send,
                    color: 'text-pink-600',
                    bgColor: 'bg-pink-100 dark:bg-pink-900/50',
                    description: 'Connect your Instagram business account for direct messaging and story interactions.',
                    features: ['Direct messages', 'Story mentions', 'Quick replies'],
                    isActive: true
                  },
                  {
                    name: 'Facebook Messenger',
                    channel: 'messenger',
                    icon: MessageCircle,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
                    description: 'Integrate Facebook Messenger to handle customer inquiries from your business page.',
                    features: ['Page messages', 'Automated responses', 'Customer insights'],
                    isActive: true
                  }
                ].map((platform) => (
                  <div key={platform.name} className={`border rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                    platform.isActive
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 opacity-75'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                          <platform.icon className={`w-4 h-4 ${platform.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{platform.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${platform.isActive ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
                            <span className={`text-xs font-medium ${
                              platform.isActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {platform.isActive ? 'Available Now' : 'Coming Soon'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {platform.description}
                    </p>

                    <div className="bg-white dark:bg-slate-800 rounded-lg p-2 mb-3">
                      <div className="flex flex-wrap gap-2">
                        {platform.features.map((feature, index) => (
                          <span key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {platform.isActive ? (
                      <ConnectMeta channel={platform.channel} />
                    ) : (
                      <Button
                        disabled
                        className="w-full opacity-50 cursor-not-allowed"
                        variant="outline"
                      >
                        Connect {platform.name}
                      </Button>
                    )}
                  </div>
                ))}

                </div>

                {/* Coming Soon Platforms */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">SOON</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Other Platforms</h3>
                  </div>

                  {[
                    {
                      name: 'Telegram Bot',
                      icon: Send,
                      color: 'text-blue-500',
                      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
                      description: 'Create a Telegram bot to interact with customers on one of the fastest-growing platforms.',
                      features: ['Bot commands', 'Inline keyboards', 'Group management']
                    },
                    {
                      name: 'Website Chat Widget',
                      icon: Globe,
                      color: 'text-gray-600',
                      bgColor: 'bg-gray-100 dark:bg-gray-900/50',
                      description: 'Embed a chat widget on your website for instant customer support and lead generation.',
                      features: ['Live chat', 'Lead capture', 'Custom branding']
                    },
                    {
                      name: 'Email Integration',
                      icon: Send,
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
                      description: 'Connect your email accounts to manage customer communications and support tickets.',
                      features: ['Email routing', 'Auto-replies', 'Ticket management']
                    }
                  ].map((platform) => (
                    <div key={platform.name} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 opacity-75 hover:opacity-90 transition-opacity">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                            <platform.icon className={`w-4 h-4 ${platform.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{platform.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Coming Soon</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {platform.description}
                      </p>

                      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-2 mb-3">
                        <div className="flex flex-wrap gap-2">
                          {platform.features.map((feature, index) => (
                            <span key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        disabled
                        className="w-full opacity-50 cursor-not-allowed"
                        variant="outline"
                      >
                        Connect {platform.name}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  More platforms will be available in future updates. Stay tuned!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
  }

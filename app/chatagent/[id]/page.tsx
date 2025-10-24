'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Bot, Settings, MessageSquare, BookOpen, Zap, Calendar, Package, Activity, Clock, User, Hash, Info, AlertCircle, Edit } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi, channelsApi, knowledgeBaseApi, toolsApi, ChatAgent } from '@/lib/apiWrapper'
import type { ExtendedChatAgent } from '@/lib/stores/chatAgentStore'
import { ApiError } from '@/lib/api'
export default function ChatAgentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuthStore()
  const { currentChatAgent, setCurrentChatAgent, setChatAgentChannels, setChatAgentKnowledgeBases, setChatAgentTools } = useChatAgentStore()

  const [isLoading, setIsLoading] = useState(true)
  const [agent, setAgent] = useState<ChatAgent | null>(null)

  useEffect(() => {
    if (params.id) {
      const agentId = Number(params.id)

      // Check if we already have the agent data in store
      if (currentChatAgent?.id === agentId && currentChatAgent.channels && currentChatAgent.knowledge_bases && currentChatAgent.tools) {
        setAgent(currentChatAgent)
        setIsLoading(false)
      } else {
        fetchAgentAndRelatedData(agentId)
      }
    }
  }, [params.id, accessToken, currentChatAgent])

  const fetchAgentAndRelatedData = async (id: number) => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      // Fetch agent data
      const agentData = await chatAgentApi.getChatAgent(id, accessToken)

      // Fetch related data in parallel for better performance
      const [channelsResponse, knowledgeBasesResponse, toolsResponse] = await Promise.all([
        channelsApi.getChannels(accessToken).catch(() => []),
        knowledgeBaseApi.getKnowledgeBases(accessToken).catch(() => []),
        toolsApi.getTools(accessToken).catch(() => [])
      ])

      // Create extended agent with all related data
      const extendedAgent: ExtendedChatAgent = {
        ...agentData,
        channels: channelsResponse,
        knowledge_bases: knowledgeBasesResponse,
        tools: toolsResponse
      }

      // Update local state
      setAgent(agentData)

      // Cache in store for other pages to use
      setCurrentChatAgent(extendedAgent)
      setChatAgentChannels(id, channelsResponse)
      setChatAgentKnowledgeBases(id, knowledgeBasesResponse)
      setChatAgentTools(id, toolsResponse)

    } catch (error) {
      console.error('Failed to fetch chat agent:', error)
      if (error instanceof ApiError && error.status === 404) {
        alert('Chat agent not found')
        router.push('/chatagent')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chat agent...</div>
      </div>
    )
  }

  if (!agent) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading chat agent...</div>
      </div>
    )
  }

  if (!agent) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string, deployed: boolean, isActive: boolean) => {
    if (deployed && isActive) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active & Deployed</Badge>
    } else if (isActive) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Inactive</Badge>
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {agent.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Chat Agent Overview
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/chatagent/${agent.id}/profile`)}
          className="flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Agent</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                {agent.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{agent.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Role Type</p>
                  <p className="font-medium capitalize">{agent.role_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tone</p>
                  <p className="font-medium capitalize">{agent.tone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="font-medium">{agent.model_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(agent.status, agent.deployed, agent.is_active)}</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instructions</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {agent.instructions || 'No instructions provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/chatagent/${agent.id}/profile`)}
                  className="flex items-center space-x-2 justify-start"
                >
                  <Settings className="w-4 h-4" />
                  <span>Profile</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/chatagent/${agent.id}/knowledgebase`)}
                  className="flex items-center space-x-2 justify-start"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Knowledge Base</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/chatagent/${agent.id}/tools`)}
                  className="flex items-center space-x-2 justify-start"
                >
                  <Package className="w-4 h-4" />
                  <span>Tools</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/chatagent/${agent.id}/testing`)}
                  className="flex items-center space-x-2 justify-start"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Testing</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/chatagent/${agent.id}/deployment`)}
                  className="flex items-center space-x-2 justify-start"
                >
                  <Zap className="w-4 h-4" />
                  <span>Deployment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Status */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <Badge className={agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {agent.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Deployed</span>
                <Badge className={agent.deployed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {agent.deployed ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active</span>
                <Badge className={agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {agent.is_active ? 'Yes' : 'No'}
                </Badge>
              </div>
              {agent.last_active && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Last Active</p>
                  <p className="text-sm font-medium">{formatDate(agent.last_active)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Knowledge Bases</span>
                <span className="font-medium">{currentChatAgent?.knowledge_bases?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Integrations</span>
                <span className="font-medium">{currentChatAgent?.integrations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tools</span>
                <span className="font-medium">{currentChatAgent?.tools?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Channels</span>
                <span className="font-medium">{currentChatAgent?.channels?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

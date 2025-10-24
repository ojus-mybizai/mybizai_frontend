'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, RefreshCw, Wrench, Zap, Settings, Database, Bot } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi, toolsApi } from '@/lib/apiWrapper'
import type { ExtendedChatAgent, Tool } from '@/lib/stores/chatAgentStore'

interface LinkedTool {
  id: number
  name: string
  type: string
  enabled: boolean
}

export default function AgentToolsPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken: token } = useAuthStore()
  const { currentChatAgent, setChatAgentTools } = useChatAgentStore()

  const agentId = parseInt(params.id as string)
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedToolIds, setSelectedToolIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (token && agentId) {
      loadToolsAndAgentTools()
    }
  }, [agentId, token])

  const loadToolsAndAgentTools = async () => {
    if (!token) return

    try {
      setLoading(true)

      // Fetch all available tools
      const allToolsResponse = await toolsApi.getTools(token)

      // Fetch agent's linked tools
      const agentToolsResponse = await chatAgentApi.getChatAgentTools(agentId, token)

      // Set available tools
      setTools(allToolsResponse)

      // Set selected tool IDs from agent's linked tools
      const linkedToolIds = agentToolsResponse.tools.map(tool => tool.id)
      setSelectedToolIds(linkedToolIds)

      console.log('🔧 TOOLS LOADED:')
      console.log('📋 Available tools:', allToolsResponse.length)
      console.log('🔗 Agent linked tools:', linkedToolIds.length)
      console.log('✅ Selected tool IDs:', linkedToolIds)
    } catch (error) {
      console.error('Failed to fetch tools data:', error)
      alert('Failed to load tools data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadToolsAndAgentTools().finally(() => setRefreshing(false))
  }

  const handleToolToggle = (toolId: number) => {
    setSelectedToolIds(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId)
      } else {
        return [...prev, toolId]
      }
    })
  }

  const handleSave = async () => {
    if (!token || !currentChatAgent) return

    try {
      setIsSaving(true)

      const response = await chatAgentApi.updateChatAgentTools(agentId, {
        tool_ids: selectedToolIds
      }, token)

      if (response.success) {
        // Refresh the agent's linked tools to get updated state
        const updatedAgentTools = await chatAgentApi.getChatAgentTools(agentId, token)
        const updatedLinkedToolIds = updatedAgentTools.tools.map(tool => tool.id)
        setSelectedToolIds(updatedLinkedToolIds)

        console.log('✅ TOOLS UPDATED:')
        console.log('🔗 New linked tools:', updatedLinkedToolIds)
        console.log('📊 Response:', response)

        alert(`Successfully updated tools for agent. ${response.linked_tools.length} tools linked.`)
      }
    } catch (error) {
      console.error('Failed to save tool configuration:', error)
      alert('Failed to save configuration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getToolIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Settings className="w-4 h-4 text-blue-600" />
      case 'custom':
        return <Wrench className="w-4 h-4 text-green-600" />
      case 'integration':
        return <Database className="w-4 h-4 text-purple-600" />
      default:
        return <Bot className="w-4 h-4 text-gray-600" />
    }
  }

  const getToolStatus = (tool: Tool) => {
    if (selectedToolIds.includes(tool.id)) {
      return { status: 'Linked', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
    } else if (!tool.enabled) {
      return { status: 'Disabled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
    } else {
      return { status: 'Available', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
    }
  }

  const getExecutionModeIcon = (mode: string) => {
    switch (mode) {
      case 'realtime':
        return <Zap className="w-3 h-3 text-yellow-500" />
      case 'background':
        return <Settings className="w-3 h-3 text-blue-500" />
      case 'scheduled':
        return <Database className="w-3 h-3 text-purple-500" />
      default:
        return <Bot className="w-3 h-3 text-gray-500" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Tools & Capabilities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure tools and integrations for {currentChatAgent.name}
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
            onClick={() => router.push(`/chatagent/${agentId}/tools/new`)}
            disabled={tools.length === 0}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tool</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Tools</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select tools to enable for this agent
              </p>
            </div>

            {tools.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tools.length} tool{tools.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedToolIds.length} selected
                  </p>
                </div>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {tools.map((tool) => {
                    const toolStatus = getToolStatus(tool)
                    const isDisabled = !tool.enabled && !selectedToolIds.includes(tool.id)

                    return (
                      <div
                        key={tool.id}
                        className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedToolIds.includes(tool.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : isDisabled
                            ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => !isDisabled && handleToolToggle(tool.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-4 h-4 rounded border-2 mt-1 ${
                            selectedToolIds.includes(tool.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedToolIds.includes(tool.id) && (
                              <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getToolIcon(tool.type)}
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {tool.name}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${toolStatus.color}`}>
                                {toolStatus.status}
                              </span>
                              {getExecutionModeIcon(tool.execution_mode)}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {tool.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                              <span className="flex items-center space-x-1">
                                <span>Type: {tool.type}</span>
                              </span>
                              <span>
                                Created: {new Date(tool.created_at).toLocaleDateString()}
                              </span>
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
                <Wrench className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No Tools Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  No tools are currently available. Tools provide additional capabilities for your chat agent.
                </p>
                <Button
                  disabled
                  size="lg"
                  className="opacity-50 cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Tool (No tools available)
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Selected Tools:</p>
                {selectedToolIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedToolIds.map((id) => {
                      const tool = tools.find(t => t.id === id)
                      return (
                        <div key={id} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-lg text-sm">
                          {tool?.name || `Tool-${id}`}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No tools selected</p>
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
    </div>
  )
}

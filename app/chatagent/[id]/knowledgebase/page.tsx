'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, RefreshCw, Brain, FileText, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi, knowledgeBaseApi } from '@/lib/apiWrapper'
import type { ExtendedChatAgent } from '@/lib/stores/chatAgentStore'

interface KnowledgeBase {
  id: number
  business_id: number
  title: string
  type: 'text' | 'file'
  category?: string | null
  content?: string | null
  file_url?: string | null
  file_name?: string | null
  created_at: string
  updated_at: string
}

export default function AgentKnowledgeBasePage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { accessToken: token } = useAuthStore()
  const { currentChatAgent, setChatAgentKnowledgeBases } = useChatAgentStore()

  const agentId = parseInt(params.id as string)
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (token && agentId) {
      loadKnowledgeBasesAndAgentKnowledgeBases()
    }
  }, [agentId, token])

  const loadKnowledgeBasesAndAgentKnowledgeBases = async () => {
    if (!token) return

    try {
      setLoading(true)

      // Fetch all available knowledge bases
      const allKnowledgeBasesResponse = await knowledgeBaseApi.getKnowledgeBases(token)

      // Fetch agent's linked knowledge bases
      const agentKnowledgeBasesResponse = await chatAgentApi.getChatAgentKnowledgeBases(agentId, token)

      // Set available knowledge bases
      setKnowledgeBases(allKnowledgeBasesResponse)

      // Set selected knowledge base IDs from agent's linked knowledge bases
      const linkedKBIds = agentKnowledgeBasesResponse.knowledge_bases.map(kb => kb.id)
      setSelectedKnowledgeBaseIds(linkedKBIds)

      console.log('🧠 KNOWLEDGE BASES LOADED:')
      console.log('📋 Available knowledge bases:', allKnowledgeBasesResponse.length)
      console.log('🔗 Agent linked knowledge bases:', linkedKBIds.length)
      console.log('✅ Selected knowledge base IDs:', linkedKBIds)
    } catch (error) {
      console.error('Failed to fetch knowledge bases data:', error)
      alert('Failed to load knowledge bases data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadKnowledgeBasesAndAgentKnowledgeBases().finally(() => setRefreshing(false))
  }

  const handleKnowledgeBaseToggle = (kbId: number) => {
    setSelectedKnowledgeBaseIds(prev => {
      if (prev.includes(kbId)) {
        return prev.filter(id => id !== kbId)
      } else {
        return [...prev, kbId]
      }
    })
  }

  const handleSave = async () => {
    if (!token || !currentChatAgent) return

    try {
      setIsSaving(true)

      const response = await chatAgentApi.updateChatAgentKnowledgeBases(agentId, {
        knowledge_base_ids: selectedKnowledgeBaseIds
      }, token)

      if (response.success) {
        // Refresh the agent's linked knowledge bases to get updated state
        const updatedAgentKnowledgeBases = await chatAgentApi.getChatAgentKnowledgeBases(agentId, token)
        const updatedLinkedKBIds = updatedAgentKnowledgeBases.knowledge_bases.map(kb => kb.id)
        setSelectedKnowledgeBaseIds(updatedLinkedKBIds)

        console.log('✅ KNOWLEDGE BASES UPDATED:')
        console.log('🔗 New linked knowledge bases:', updatedLinkedKBIds)
        console.log('📊 Response:', response)

        alert(`Successfully updated knowledge bases for agent. ${response.linked_knowledge_bases.length} knowledge bases linked.`)
      }
    } catch (error) {
      console.error('Failed to save knowledge base configuration:', error)
      alert('Failed to save configuration. Please try again.')
    } finally {
      setIsSaving(false)
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
    <div className="max-w-6xl mx-auto space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Knowledge Base Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure knowledge bases for {currentChatAgent.name}
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
            onClick={() => window.open('/knowledgebase/new', '_blank')}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Knowledge Base</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Base Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Knowledge Bases</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select knowledge bases to link to this agent
              </p>
            </div>

            {knowledgeBases.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {knowledgeBases.length} knowledge base{knowledgeBases.length !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedKnowledgeBaseIds.length} selected
                  </p>
                </div>

                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {knowledgeBases.map((kb) => (
                    <div
                      key={kb.id}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedKnowledgeBaseIds.includes(kb.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleKnowledgeBaseToggle(kb.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-4 h-4 rounded border-2 mt-1 ${
                          selectedKnowledgeBaseIds.includes(kb.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedKnowledgeBaseIds.includes(kb.id) && (
                            <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {kb.title}
                            </h3>
                          </div>

                          {kb.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                              {kb.content}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{kb.category || 'Uncategorized'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(kb.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Brain className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  No Knowledge Bases Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Create your first knowledge base to help your chat agent provide better, more accurate responses to customer questions.
                </p>
                <Button
                  onClick={() => window.open('/knowledgebase/new', '_blank')}
                  size="lg"
                  className="flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Knowledge Base</span>
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Selected Knowledge Bases:</p>
                {selectedKnowledgeBaseIds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedKnowledgeBaseIds.map((id) => {
                      const kb = knowledgeBases.find(k => k.id === id)
                      return (
                        <div key={id} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-lg text-sm">
                          {kb?.title || `KB-${id}`}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No knowledge bases selected</p>
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

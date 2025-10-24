'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Brain, RefreshCw, FileText, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/stores/authStore'
import { knowledgeBaseApi, KnowledgeBase } from '@/lib/api'

interface KnowledgeTrainingStepProps {
  knowledgeBaseIds: number[]
  onChange: (knowledgeBaseIds: number[]) => void
}

export default function KnowledgeTrainingStep({ knowledgeBaseIds, onChange }: KnowledgeTrainingStepProps) {
  const { accessToken: token } = useAuthStore()
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Fetch knowledge bases function
  const fetchKnowledgeBases = async () => {
    if (!token) return

    try {
      if (refreshing) return // Prevent multiple simultaneous requests

      setRefreshing(true)
      const response = await knowledgeBaseApi.getKnowledgeBases(token)
      setKnowledgeBases(response)
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  // Fetch knowledge bases on component mount
  useEffect(() => {
    fetchKnowledgeBases()
  }, [token])

  const handleCreateKnowledgeBase = () => {
    window.open('/knowledgebase/new', '_blank')
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchKnowledgeBases()
  }

  const handleKnowledgeBaseToggle = (kbId: number) => {
    const isSelected = knowledgeBaseIds.includes(kbId)
    if (isSelected) {
      // Remove from selection
      onChange(knowledgeBaseIds.filter(id => id !== kbId))
    } else {
      // Add to selection
      onChange([...knowledgeBaseIds, kbId])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base Training</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select knowledge bases to train your chat agent
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleCreateKnowledgeBase}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Knowledge Base</span>
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {knowledgeBases.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {knowledgeBases.length} knowledge base{knowledgeBases.length !== 1 ? 's' : ''} available
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {knowledgeBaseIds.length} selected for training
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                  knowledgeBaseIds.includes(kb.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleKnowledgeBaseToggle(kb.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-4 h-4 rounded border-2 mt-1 ${
                    knowledgeBaseIds.includes(kb.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {knowledgeBaseIds.includes(kb.id) && (
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
                        <span>{kb.category}</span>
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
            onClick={handleCreateKnowledgeBase}
            size="lg"
            className="flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Knowledge Base</span>
          </Button>
        </div>
      )}
    </div>
  )}

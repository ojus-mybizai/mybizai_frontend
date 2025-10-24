'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import AgentProfileStep from '@/components/chatagent/steps/AgentProfileStep'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi, isDemoMode } from '@/lib/apiWrapper'

export default function AgentEditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const agentId = parseInt(params.id as string)
  const { accessToken: token } = useAuthStore()
  const { chatAgents: agents, updateChatAgent } = useChatAgentStore()

  const [agent, setAgent] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role_type: 'customer_service',
    tone: 'professional',
    instructions: ''
  })

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
          // Populate form with existing data
          setFormData({
            name: foundAgent.name || '',
            description: foundAgent.description || '',
            role_type: foundAgent.role_type || 'general',
            tone: foundAgent.tone || 'friendly',
            instructions: foundAgent.instructions || ''
          })
        } else {
          router.push('/chatagent')
          return
        }
      } else {
        const response = await chatAgentApi.getChatAgent(agentId, token!)
        setAgent(response)
        // Populate form with existing data
        setFormData({
          name: response.name || '',
          description: response.description || '',
          role_type: response.role_type || 'general',
          tone: response.tone || 'friendly',
          instructions: response.instructions || ''
        })
      }
    } catch (error) {
      console.error('Failed to load agent:', error)
      router.push('/chatagent')
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSave = async () => {
    if (!agentId || !token) return

    try {
      setIsSaving(true)

      const updateData = {
        name: formData.name,
        description: formData.description,
        role: formData.role_type,
        instructions: formData.instructions,
        ai_config: {
          ...agent?.ai_config,
          tone: formData.tone
        }
      }

      if (isDemoMode()) {
        // Mock update for demo mode
        const updatedAgent = { ...agent, ...updateData }
        updateChatAgent(agentId, updatedAgent)
        alert('Agent updated successfully!')
      } else {
        // Real API call to update agent
        await chatAgentApi.updateChatAgent(agentId, updateData, token)
        alert('Agent updated successfully!')
      }

      // Refresh agent data
      await loadAgent()
    } catch (error) {
      console.error('Failed to update agent:', error)
      alert('Failed to update agent. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

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
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Agent Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update basic information and AI configuration for {agent.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/chatagent/${agentId}`)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
        <AgentProfileStep
          data={formData}
          onChange={(data) => updateFormData(data as any)}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Next Steps After Editing
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/chatagent/${agentId}/knowledgebase`)}
            className="flex items-center space-x-2"
          >
            <span>📚</span>
            <span>Update Knowledge Base</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/chatagent/${agentId}/test`)}
            className="flex items-center space-x-2"
          >
            <span>🧪</span>
            <span>Test Agent</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/chatagent/${agentId}`)}
            className="flex items-center space-x-2"
          >
            <span>👁️</span>
            <span>View Agent Details</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

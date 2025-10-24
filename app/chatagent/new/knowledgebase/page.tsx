'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import NewAgentLayout from '@/components/chatagent/NewAgentLayout'
import KnowledgeTrainingStep from '@/components/chatagent/steps/KnowledgeTrainingStep'
import { useAuthStore } from '@/lib/stores'
import { chatAgentApi } from '@/lib/apiWrapper'

export default function NewAgentKnowledgeBasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken: token } = useAuthStore()

  const [selectedKnowledgeBaseIds, setSelectedKnowledgeBaseIds] = useState<number[]>([])
  const [agentId, setAgentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const agentIdParam = searchParams.get('agentId')
    if (agentIdParam) {
      setAgentId(parseInt(agentIdParam))
    }
  }, [searchParams])

  const handleContinue = async () => {
    if (!agentId || !token) {
      alert('Agent ID is missing. Please go back to the profile step.')
      return
    }

    try {
      setIsLoading(true)

      // Update the agent with selected knowledge base IDs
      const updateData = {
        knowledge_base_ids: selectedKnowledgeBaseIds.length > 0 ? selectedKnowledgeBaseIds : null
      }

      await chatAgentApi.updateChatAgent(agentId, updateData, token)

      // Redirect to next step (channels)
      router.push(`/chatagent/new/channels?agentId=${agentId}`)
    } catch (error) {
      console.error('Failed to update agent knowledge bases:', error)
      alert('Failed to save knowledge base selection. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (!agentId) {
      alert('Agent ID is missing. Please go back to the profile step.')
      return
    }

    // Redirect to next step without updating knowledge bases
    router.push(`/chatagent/new/channels?agentId=${agentId}`)
  }

  if (!agentId) {
    return (
      <NewAgentLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Agent not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please go back to the profile step to create an agent first.
          </p>
          <Button onClick={() => router.push('/chatagent/new/profile')}>
            Back to Profile
          </Button>
        </div>
      </NewAgentLayout>
    )
  }

  return (
    <NewAgentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base Training</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select knowledge bases to train your chat agent for better responses
          </p>
        </div>

        <KnowledgeTrainingStep
          knowledgeBaseIds={selectedKnowledgeBaseIds}
          onChange={setSelectedKnowledgeBaseIds}
        />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for now
          </Button>

          <Button
            onClick={handleContinue}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? 'Saving...' : 'Continue to Channels'}
          </Button>
        </div>
      </div>
    </NewAgentLayout>
  )
}

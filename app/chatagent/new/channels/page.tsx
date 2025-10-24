'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import NewAgentLayout from '@/components/chatagent/NewAgentLayout'
import ChannelIntegrationStep from '@/components/chatagent/steps/ChannelIntegrationStep'
import { useAuthStore } from '@/lib/stores'
import { chatAgentApi } from '@/lib/apiWrapper'

export default function NewAgentChannelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken: token } = useAuthStore()

  const [channelsEnabled, setChannelsEnabled] = useState<Record<string, boolean>>({})
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

      // Update the agent with selected channels
      const updateData = {
        channels_enabled: channelsEnabled
      }

      await chatAgentApi.updateChatAgent(agentId, updateData, token)

      // Redirect to next step (tools)
      router.push(`/chatagent/new/tools?agentId=${agentId}`)
    } catch (error) {
      console.error('Failed to update agent channels:', error)
      alert('Failed to save channel configuration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (!agentId) {
      alert('Agent ID is missing. Please go back to the profile step.')
      return
    }

    // Redirect to next step without updating channels
    router.push(`/chatagent/new/tools?agentId=${agentId}`)
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Channel Integration</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect your chat agent to messaging platforms where customers can reach you
          </p>
        </div>

        <ChannelIntegrationStep
          channelsEnabled={channelsEnabled}
          onChange={setChannelsEnabled}
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
            {isLoading ? 'Saving...' : 'Continue to Tools'}
          </Button>
        </div>
      </div>
    </NewAgentLayout>
  )
}

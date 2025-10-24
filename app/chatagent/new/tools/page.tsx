'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bot, Package, Calendar, MessageSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import NewAgentLayout from '@/components/chatagent/NewAgentLayout'
import { useAuthStore } from '@/lib/stores'
import { chatAgentApi } from '@/lib/apiWrapper'

interface Capability {
  key: string
  label: string
  description: string
  icon: any
  enabled: boolean
}

const CAPABILITY_OPTIONS = [
  {
    key: 'orders',
    label: 'Order Management',
    description: 'Handle order creation, tracking, and customer inquiries about orders',
    icon: Package
  },
  {
    key: 'appointments',
    label: 'Appointment Booking',
    description: 'Schedule, reschedule, and manage customer appointments',
    icon: Calendar
  },
  {
    key: 'catalog_lookup',
    label: 'Catalog Lookup',
    description: 'Search and provide information about products/services from your catalog',
    icon: MessageSquare
  }
]

export default function NewAgentToolsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken: token } = useAuthStore()

  const [capabilities, setCapabilities] = useState<Record<string, boolean>>({
    orders: false,
    appointments: false,
    catalog_lookup: false
  })
  const [agentId, setAgentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const agentIdParam = searchParams.get('agentId')
    if (agentIdParam) {
      setAgentId(parseInt(agentIdParam))
    }
  }, [searchParams])

  const handleCapabilityChange = (capabilityKey: string, enabled: boolean) => {
    setCapabilities(prev => ({
      ...prev,
      [capabilityKey]: enabled
    }))
  }

  const handleContinue = async () => {
    if (!agentId || !token) {
      alert('Agent ID is missing. Please go back to the profile step.')
      return
    }

    try {
      setIsLoading(true)

      // Update the agent with selected capabilities
      const updateData = {
        capabilities: capabilities
      }

      await chatAgentApi.updateChatAgent(agentId, updateData, token)

      // Redirect to final step (test & deploy)
      router.push(`/chatagent/${agentId}/test`)
    } catch (error) {
      console.error('Failed to update agent capabilities:', error)
      alert('Failed to save tool configuration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (!agentId) {
      alert('Agent ID is missing. Please go back to the profile step.')
      return
    }

    // Redirect to final step without updating capabilities
    router.push(`/chatagent/new/test?agentId=${agentId}`)
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tools & Capabilities</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure what your chat agent can help customers with
          </p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Available Capabilities
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {CAPABILITY_OPTIONS.map((capability) => {
                const Icon = capability.icon
                return (
                  <div
                    key={capability.key}
                    className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                      capabilities[capability.key]
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleCapabilityChange(capability.key, !capabilities[capability.key])}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-4 h-4 rounded border-2 mt-1 ${
                        capabilities[capability.key]
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {capabilities[capability.key] && (
                          <div className="w-full h-full bg-white rounded-sm flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {capability.label}
                          </h4>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

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
            {isLoading ? 'Saving...' : 'Continue to Test & Deploy'}
          </Button>
        </div>
      </div>
    </NewAgentLayout>
  )
}

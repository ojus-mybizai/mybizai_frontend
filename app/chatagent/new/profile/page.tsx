'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import NewAgentLayout from '@/components/chatagent/NewAgentLayout'
import AgentProfileStep from '@/components/chatagent/steps/AgentProfileStep'
import { useAuthStore, useChatAgentStore, useBusinessStore } from '@/lib/stores'
import { chatAgentApi, isDemoMode } from '@/lib/apiWrapper'

// Form data interface
interface AgentProfileData {
  name: string
  description: string
  role_type: 'sales' | 'support' | 'lead_gen' | 'general'
  tone: 'casual' | 'professional' | 'friendly'
  instructions: string
}

const DEFAULT_FORM_DATA: AgentProfileData = {
  name: '',
  description: '',
  role_type: 'general',
  tone: 'friendly',
  instructions: ''
}

// Set up capabilities based on role_type
const getCapabilitiesForRole = (roleType: string) => {
  switch (roleType) {
    case 'sales':
      return {
        orders: true,
        catalog_lookup: true,
        appointments: true
      }
    case 'support':
      return {
        orders: false,
        catalog_lookup: true,
        appointments: true
      }
    case 'lead_gen':
      return {
        orders: false,
        catalog_lookup: true,
        appointments: true
      }
    default: // general
      return {
        orders: false,
        catalog_lookup: false,
        appointments: false
      }
  }
}

export default function NewAgentProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { accessToken: token } = useAuthStore()
  const { addChatAgent } = useChatAgentStore()

  const [formData, setFormData] = useState<AgentProfileData>(DEFAULT_FORM_DATA)
  const [isLoading, setIsLoading] = useState(false)

  // Get agent ID from URL if it exists (for editing existing agent)
  const agentId = searchParams.get('agentId')

  useEffect(() => {
    // If we have an agentId, this means we're editing an existing agent
    // In that case, we should fetch the agent data and populate the form
    if (agentId && token) {
      fetchAndPopulateAgentData(parseInt(agentId))
    }
  }, [agentId, token])

  const fetchAndPopulateAgentData = async (id: number) => {
    try {
      setIsLoading(true)
      const agent = await chatAgentApi.getChatAgent(id, token!)
      // Populate form with existing agent data
      setFormData({
        name: agent.name,
        description: agent.description || '',
        role_type: 'general', // This would need to be determined from the agent data
        tone: 'friendly', // This would need to be determined from the agent data
        instructions: '' // This would need to be determined from the agent data
      })
    } catch (error) {
      console.error('Failed to fetch agent for editing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsLoading(true)

      // Get business ID from active business
      const businessId = useBusinessStore.getState().activeBusiness?.id
      if (!businessId) {
        alert('No active business found. Please set up your business first.')
        return
      }

      // Prepare agent data
      const agentData = {
        name: formData.name,
        role_type: formData.role_type,
        business_id: businessId,
        description: formData.description,
        capabilities: getCapabilitiesForRole(formData.role_type)
      }

      console.log('🚀 Submitting agent data:', agentData)

      if (isDemoMode()) {
        // Mock create agent for demo mode
        const newAgent: any = {
          id: Date.now(),
          ...agentData,
          status: 'active',
          deployed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
        addChatAgent(newAgent)

        // Redirect to next step with agent ID
        router.push(`/chatagent/new/knowledgebase?agentId=${newAgent.id}`)
      } else {
        // Make API call to create agent
        const response = await chatAgentApi.createChatAgent(agentData as any, token!)
        const createdAgent = response

        console.log('✅ Agent creation response:', createdAgent)

        // Add to store
        addChatAgent(createdAgent)

        // Redirect to next step with agent ID
        router.push(`/chatagent/new/knowledgebase?agentId=${createdAgent.id}`)
      }
    } catch (error) {
      console.error('❌ Failed to create agent:', error)
      console.error('❌ Error details:', error instanceof Error ? error.message : error)
      alert('Failed to create agent. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <NewAgentLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up the basic information and behavior for your chat agent
          </p>
        </div>

        <AgentProfileStep
          data={formData}
          onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || formData.role_type === 'general' || isLoading}
            isLoading={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Creating...' : 'Create Agent & Continue'}
          </Button>
        </div>
      </div>
    </NewAgentLayout>
  )
}

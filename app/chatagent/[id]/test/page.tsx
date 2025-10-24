'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TestTube, RefreshCw, Settings, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ChatWindow, { ChatMessage } from '@/components/chatagent/ChatWindow'
import { useAuthStore, useChatAgentStore } from '@/lib/stores'
import { chatAgentApi, isDemoMode } from '@/lib/apiWrapper'

export default function AgentTestPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = parseInt(params.id as string)
  const { accessToken: token } = useAuthStore()
  const { chatAgents: agents } = useChatAgentStore()

  const [agent, setAgent] = useState<any | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployStatus, setDeployStatus] = useState('')

  useEffect(() => {
    loadAgent()
    resetConversation()
  }, [agentId])

  const loadAgent = async () => {
    try {
      setIsLoading(true)

      if (isDemoMode()) {
        const foundAgent = agents.find((a: any) => a.id === agentId)
        if (foundAgent) {
          setAgent(foundAgent)
        } else {
          router.push('/chatagent')
          return
        }
      } else {
        const response = await chatAgentApi.getChatAgent(agentId, token!)
        setAgent(response)
      }
    } catch (error) {
      console.error('Failed to load agent:', error)
      router.push('/chatagent')
    } finally {
      setIsLoading(false)
    }
  }

  const resetConversation = () => {
    if (agent) {
      const greetingMessage: ChatMessage = {
        id: '1',
        author: 'agent',
        text: agent.ai_config?.greeting_message || 'Hello! How can I help you today?',
        timestamp: new Date().toISOString(),
        status: 'read'
      }
      setMessages([greetingMessage])
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!agent) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      author: 'user',
      text: message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    setMessages(prev => [...prev, userMessage])

    // Send message to backend
    setIsTyping(true)

    try {
      if (isDemoMode()) {
        // Simulate AI response with delay for demo mode
        setTimeout(() => {
          setIsTyping(false)

          let response = generateMockResponse(message, agent)

          const agentMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            author: 'agent',
            text: response,
            timestamp: new Date().toISOString(),
            status: 'read'
          }

          setMessages(prev => [...prev, agentMessage])
        }, agent.ai_config?.typing_delay || 1000)
      } else {
        // Real API call
        const response = await chatAgentApi.testChatAgent(agentId, {
          user_message: message
        }, token!)

        setIsTyping(false)

        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          author: 'agent',
          text: response.response,
          timestamp: new Date().toISOString(),
          status: 'read'
        }

        setMessages(prev => [...prev, agentMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsTyping(false)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        author: 'agent',
        text: agent.ai_config?.fallback_message || "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toISOString(),
        status: 'read'
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleDeploy = async () => {
    if (!token || !agent) return

    try {
      setIsDeploying(true)

      const response = await chatAgentApi.deployChatAgent(agentId, token)

      setDeployStatus(response.message)
      setDeployed(response.deployed)

      if (response.deployed) {
        alert(`Agent deployed successfully! Status: ${response.status}`)
      } else {
        alert(`Deployment failed. Status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to deploy agent:', error)
      alert('Failed to deploy agent. Please try again.')
    } finally {
      setIsDeploying(false)
    }
  }

  const generateMockResponse = (userMessage: string, agent: any): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Check for handover keywords
    if (agent.ai_config?.handover_keywords?.some((keyword: string) => lowerMessage.includes(keyword))) {
      return "I understand you'd like to speak with a human agent. Let me connect you with someone who can better assist you."
    }

    // Generate response based on personality and tone
    let baseResponse = ""

    if (agent.ai_config?.personality === 'sales') {
      if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        baseResponse = "I'd be happy to discuss our pricing options with you. Our products offer great value and we have flexible payment plans available."
      } else if (lowerMessage.includes('product') || lowerMessage.includes('service')) {
        baseResponse = "Our products are designed to meet your specific needs. I can provide detailed information about features, benefits, and how they can help your business grow."
      } else {
        baseResponse = "Thank you for your interest! I'm here to help you find the perfect solution for your needs. What specific information can I provide?"
      }
    } else if (agent.ai_config?.personality === 'support') {
      if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('help')) {
        baseResponse = "I'm sorry to hear you're experiencing an issue. I'm here to help resolve this for you. Can you provide more details about what's happening?"
      } else if (lowerMessage.includes('how') || lowerMessage.includes('tutorial')) {
        baseResponse = "I'd be happy to walk you through that process step by step. Let me provide you with clear instructions to help you get this done."
      } else {
        baseResponse = "I'm here to provide support and assistance. Please let me know what specific help you need and I'll do my best to resolve it quickly."
      }
    } else {
      baseResponse = "Thank you for your message. I'm here to help with any questions or information you need. How can I assist you today?"
    }

    // Adjust tone
    if (agent.ai_config?.tone === 'casual') {
      baseResponse = baseResponse.replace(/I would/g, "I'd").replace(/cannot/g, "can't")
    } else if (agent.ai_config?.tone === 'professional') {
      baseResponse = baseResponse.replace(/I'd/g, "I would").replace(/can't/g, "cannot")
    }

    // Adjust length based on response style
    if (agent.ai_config?.response_style === 'short') {
      return baseResponse.split('.')[0] + '.'
    } else if (agent.ai_config?.response_style === 'detailed') {
      return baseResponse + " Please feel free to ask any follow-up questions you might have, and I'll provide you with comprehensive information to ensure all your needs are met."
    }

    return baseResponse
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

  const getEnabledChannels = (channels: Record<string, boolean> | null | undefined) => {
    if (!channels) return []
    return Object.entries(channels)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const enabledChannels = getEnabledChannels(agent.channels)

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 dark:from-green-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Agent</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Testing: {agent.name}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={resetConversation}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Chat
          </Button>

          <Button
            variant="outline"
            onClick={handleDeploy}
            disabled={isDeploying || deployed}
            className="flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            {isDeploying ? 'Deploying...' : deployed ? 'Deployed' : 'Deploy'}
          </Button>
        </div>
      </div>

      {/* Agent Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              {agent.avatar_url ? (
                <img src={agent.avatar_url} alt="Agent" className="w-full h-full rounded-xl object-cover" />
              ) : (
                <span className="text-white font-medium">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {agent.role?.replace('_', ' ')} • {agent.ai_config?.tone} tone • {agent.ai_config?.response_style} responses
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              deployed
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : agent.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {deployed ? 'Deployed' : agent.is_active ? 'Active' : 'Inactive'}
            </div>
            {deployStatus && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {deployStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Test Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-3">
          <div className="h-[600px]">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              agentName={agent.name}
              agentAvatar={agent.avatar_url}
              testMode={true}
              placeholder="Type a test message..."
            />
          </div>
        </div>

        {/* Test Controls & Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Test Scenarios */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Quick Test Scenarios
            </h4>
            <div className="space-y-2">
              {[
                "Hello, how can you help me?",
                "What are your products?",
                "I need technical support",
                "Can I speak to a human?",
                "What are your prices?"
              ].map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(scenario)}
                  className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  "{scenario}"
                </button>
              ))}
            </div>
          </div>

          {/* Agent Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Current Configuration
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Personality:</span>
                <span className="ml-2 capitalize text-gray-900 dark:text-white">
                  {agent.ai_config?.personality || 'helpful'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Tone:</span>
                <span className="ml-2 capitalize text-gray-900 dark:text-white">
                  {agent.ai_config?.tone || 'professional'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Response Style:</span>
                <span className="ml-2 capitalize text-gray-900 dark:text-white">
                  {agent.ai_config?.response_style || 'balanced'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Typing Delay:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {agent.ai_config?.typing_delay || 1000}ms
                </span>
              </div>
            </div>
          </div>

          {/* Handover Keywords */}
          {agent.ai_config?.handover_keywords?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Handover Keywords
              </h4>
              <div className="flex flex-wrap gap-1">
                {agent.ai_config.handover_keywords.map((keyword: string) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Try using these words to test handover functionality
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Testing Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Testing Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Test different conversation scenarios to ensure appropriate responses</li>
          <li>• Try the handover keywords to verify escalation functionality</li>
          <li>• Check response times and adjust typing delay if needed</li>
          <li>• Verify the agent's tone matches your brand voice</li>
          <li>• Test edge cases and unusual questions to improve robustness</li>
        </ul>
      </div>
    </div>
  )
}

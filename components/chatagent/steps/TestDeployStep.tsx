'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import ChatWindow, { ChatMessage } from '@/components/chatagent/ChatWindow'
import { Button } from '@/components/ui/Button'

interface TestDeployStepProps {
  agentData: any
  onPublish: () => void
  isLoading: boolean
}

export default function TestDeployStep({ agentData, onPublish, isLoading }: TestDeployStepProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      author: 'agent',
      text: agentData.ai_config.greeting_message || 'Hello! How can I help you today?',
      timestamp: new Date().toISOString(),
      status: 'read'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      author: 'user',
      text: message,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    setMessages(prev => [...prev, userMessage])

    // Simulate typing
    setIsTyping(true)
    
    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false)
      
      // Generate a mock response based on the agent's configuration
      let response = "Thank you for your message! "
      
      if (agentData.ai_config.personality === 'sales') {
        response += "I'd be happy to help you learn more about our products and services. What specific information are you looking for?"
      } else if (agentData.ai_config.personality === 'support') {
        response += "I'm here to help resolve any issues you might have. Could you please provide more details about what you need assistance with?"
      } else {
        response += "I'm here to assist you with any questions or concerns you might have. How can I help you today?"
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        author: 'agent',
        text: response,
        timestamp: new Date().toISOString(),
        status: 'read'
      }
      
      setMessages(prev => [...prev, agentMessage])
    }, agentData.ai_config.typing_delay || 1000)
  }

  const enabledChannels = Object.entries(agentData.channels)
    .filter(([_, enabled]) => enabled)
    .map(([channel, _]) => channel)

  const validationChecks = [
    {
      label: 'Agent name provided',
      passed: agentData.name.length >= 3,
      required: true
    },
    {
      label: 'At least one channel enabled',
      passed: enabledChannels.length > 0,
      required: true
    },
    {
      label: 'Greeting message configured',
      passed: agentData.ai_config.greeting_message.length > 0,
      required: true
    },
    {
      label: 'Fallback message configured',
      passed: agentData.ai_config.fallback_message.length > 0,
      required: true
    },
    {
      label: 'Knowledge base connected',
      passed: agentData.knowledge_base_ids.length > 0,
      required: false
    }
  ]

  const requiredChecksPassed = validationChecks
    .filter(check => check.required)
    .every(check => check.passed)

  return (
    <div className="space-y-6">
      {/* Validation Checklist */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pre-deployment Checklist
        </h3>
        
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <div className="space-y-3">
            {validationChecks.map((check, index) => (
              <div key={index} className="flex items-center space-x-3">
                {check.passed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${check.required ? 'text-red-600' : 'text-gray-400'}`} />
                )}
                <span className={`text-sm ${
                  check.passed 
                    ? 'text-gray-900 dark:text-white' 
                    : check.required 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {check.label}
                  {!check.required && (
                    <span className="text-gray-400 ml-1">(Optional)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          
          {!requiredChecksPassed && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Please complete all required items before publishing your agent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Chat Interface */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Your Agent
        </h3>
        
        <div className="h-96">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            agentName={agentData.name || 'New Agent'}
            agentAvatar={agentData.avatar_url}
            testMode={true}
            placeholder="Type a test message..."
          />
        </div>
        
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Testing Tips
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Try different types of questions to test the agent's responses</li>
            <li>• Test the greeting message by refreshing the conversation</li>
            <li>• Verify the agent's tone matches your expectations</li>
            <li>• Test handover keywords if you've configured them</li>
          </ul>
        </div>
      </div>

      {/* Agent Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Agent Summary
        </h3>
        
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Name:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{agentData.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Role:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                {agentData.role.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Channels:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {enabledChannels.length} connected
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Status:</span>
              <span className={`ml-2 ${
                agentData.is_active 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {agentData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {agentData.description && (
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Description:</span>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                {agentData.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Publish Button */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={onPublish}
          disabled={!requiredChecksPassed || isLoading}
          className="px-8 py-3 text-lg bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500"
        >
          {isLoading ? 'Publishing...' : '🚀 Publish Agent'}
        </Button>
      </div>
      
      {requiredChecksPassed && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Your agent is ready to be published and will start handling conversations immediately.
        </p>
      )}
    </div>
  )
}

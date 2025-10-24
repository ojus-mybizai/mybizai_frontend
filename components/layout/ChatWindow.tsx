'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTeamStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const quickChatOptions = [
  "Give me monthly performance report",
  "What's the campaign status?", 
  "Show current task progress",
  "Analyze competitor activity",
  "Generate content calendar",
  "Create social media strategy"
]

interface ChatWindowProps {
  teamId: string
}

export default function ChatWindow({ teamId }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, addMessage, currentTeam } = useTeamStore()
  
  const teamMessages = messages.filter(msg => msg.teamId === teamId)
  const hasMessages = teamMessages.length > 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [teamMessages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    addMessage({
      content: inputValue,
      sender: 'user',
      teamId
    })

    const userMessage = inputValue
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      addMessage({
        content: `I understand you want to ${userMessage.toLowerCase()}. Let me help you with that. I'm analyzing your team's current status and will provide you with relevant insights.`,
        sender: 'ai',
        teamId
      })
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickChat = (option: string) => {
    setInputValue(option)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!hasMessages ? (
          // Welcome screen with quick options
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                What can I help you with today?
              </h1>
            </div>
            
            {/* Quick Chat Options Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {quickChatOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickChat(option)}
                  className="p-4 text-left bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {option}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {index < 2 ? 'Analytics & Reports' : 
                         index < 4 ? 'Task Management' : 'Content Strategy'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat messages
          <>
            {teamMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start space-x-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={cn(
                    'text-xs mt-1',
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
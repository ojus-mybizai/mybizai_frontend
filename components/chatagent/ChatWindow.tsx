'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Smile, Paperclip, Check, CheckCheck } from 'lucide-react'

export interface ChatMessage {
  id: string
  author: 'user' | 'agent'
  text: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
  isTyping?: boolean
}

interface ChatWindowProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  isTyping?: boolean
  placeholder?: string
  agentName?: string
  agentAvatar?: string
  className?: string
  testMode?: boolean
  disabled?: boolean
}

export default function ChatWindow({
  messages,
  onSendMessage,
  isTyping = false,
  placeholder = "Type a message...",
  agentName = "Agent",
  agentAvatar,
  className = "",
  testMode = false,
  disabled = false
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const [enterToSend, setEnterToSend] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3" />
      case 'delivered':
      case 'read':
        return <CheckCheck className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {agentAvatar ? (
              <img src={agentAvatar} alt={agentName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-medium text-sm">
                {agentName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{agentName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {testMode ? 'Test Mode' : 'Online'}
            </p>
          </div>
        </div>
        
        {testMode && (
          <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full">
            Testing
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-sm">Start a conversation</p>
              {testMode && (
                <p className="text-xs mt-1">Send a test message to see how your agent responds</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[80%] sm:max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-3xl ${
                      message.author === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-1 ${
                    message.author === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.author === 'user' && (
                      <span className="text-gray-400 dark:text-gray-500">
                        {getStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] sm:max-w-[70%]">
                  <div className="px-4 py-2 rounded-3xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-start mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {agentName} is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl">
        {/* Enter to Send Toggle */}
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={enterToSend}
              onChange={(e) => setEnterToSend(e.target.checked)}
              className="rounded"
            />
            <span>Press Enter to send</span>
          </label>
        </div>

        {/* Input Row */}
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            
            {/* Input Actions */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                disabled={disabled}
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                disabled={disabled}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-2xl transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

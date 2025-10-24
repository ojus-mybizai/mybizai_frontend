'use client'

import { Bot, Power, PowerOff } from 'lucide-react'
import { ChannelType } from './ChannelCard'

interface AgentPreviewProps {
  name: string
  description?: string
  role: string
  avatar_url?: string | null
  is_active: boolean
  channels: Record<ChannelType, boolean>
  ai_config: {
    tone: string
    personality: string
    response_style: string
    greeting_message: string
  }
}

export default function AgentPreview({
  name,
  description,
  role,
  avatar_url,
  is_active,
  channels,
  ai_config
}: AgentPreviewProps) {
  const getEnabledChannels = () => {
    return Object.entries(channels)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key)
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'whatsapp': return '💬'
      case 'instagram': return '📷'
      case 'messenger': return '💬'
      case 'email': return '📧'
      case 'webchat': return '🌐'
      case 'telegram': return '✈️'
      case 'sms': return '📱'
      default: return '💬'
    }
  }

  const enabledChannels = getEnabledChannels()

  return (
    <div className="space-y-4">
      {/* Agent Card Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden">
            {avatar_url ? (
              <img src={avatar_url} alt="Agent avatar" className="w-full h-full object-cover" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {name || 'New Agent'}
              </h3>
              {is_active ? (
                <Power className="w-4 h-4 text-green-600" />
              ) : (
                <PowerOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
              {role.replace('_', ' ')}
            </p>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Channels */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Connected Channels</p>
          <div className="flex flex-wrap gap-1">
            {enabledChannels.length > 0 ? (
              enabledChannels.map(channel => (
                <span
                  key={channel}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  <span>{getChannelIcon(channel)}</span>
                  <span className="capitalize">{channel}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">No channels selected</span>
            )}
          </div>
        </div>

        {/* AI Configuration Preview */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">AI Configuration</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Tone:</span>
              <span className="ml-1 capitalize text-gray-900 dark:text-white">
                {ai_config.tone}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Style:</span>
              <span className="ml-1 capitalize text-gray-900 dark:text-white">
                {ai_config.response_style}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Preview */}
      <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-white dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              {avatar_url ? (
                <img src={avatar_url} alt="Agent" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {name || 'New Agent'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Preview Mode</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Sample greeting message */}
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-2">
                <p className="text-sm text-gray-900 dark:text-white">
                  {ai_config.greeting_message || 'Hello! How can I help you today?'}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                Just now
              </p>
            </div>
          </div>

          {/* Sample user message */}
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="bg-blue-500 rounded-2xl px-4 py-2">
                <p className="text-sm text-white">
                  Hi there! I have a question about your services.
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2 text-right">
                Just now
              </p>
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex justify-start">
            <div className="max-w-[80%]">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                {name || 'Agent'} is typing...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
          Configuration Summary
        </h4>
        <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
          <div>
            <span className="font-medium">Personality:</span> {ai_config.personality} • {ai_config.tone}
          </div>
          <div>
            <span className="font-medium">Response Style:</span> {ai_config.response_style}
          </div>
          <div>
            <span className="font-medium">Channels:</span> {enabledChannels.length} connected
          </div>
        </div>
      </div>
    </div>
  )
}

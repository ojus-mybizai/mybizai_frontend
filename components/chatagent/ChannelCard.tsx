'use client'

import { Check, Settings, AlertCircle } from 'lucide-react'

export type ChannelType = 'whatsapp' | 'instagram' | 'messenger' | 'email' | 'webchat' | 'telegram' | 'sms'

interface ChannelCardProps {
  channel: ChannelType
  isConnected: boolean
  isEnabled: boolean
  onToggle: (channel: ChannelType) => void
  onConfigure?: (channel: ChannelType) => void
  className?: string
}

export default function ChannelCard({ 
  channel, 
  isConnected, 
  isEnabled, 
  onToggle, 
  onConfigure,
  className = ""
}: ChannelCardProps) {
  const getChannelInfo = (channel: ChannelType) => {
    switch (channel) {
      case 'whatsapp':
        return {
          name: 'WhatsApp',
          icon: '💬',
          color: 'from-green-500 to-green-600',
          description: 'Connect via WhatsApp Business API'
        }
      case 'instagram':
        return {
          name: 'Instagram',
          icon: '📷',
          color: 'from-pink-500 to-purple-600',
          description: 'Instagram Direct Messages'
        }
      case 'messenger':
        return {
          name: 'Messenger',
          icon: '💬',
          color: 'from-blue-500 to-blue-600',
          description: 'Facebook Messenger integration'
        }
      case 'email':
        return {
          name: 'Email',
          icon: '📧',
          color: 'from-gray-500 to-gray-600',
          description: 'Email support integration'
        }
      case 'webchat':
        return {
          name: 'Web Chat',
          icon: '🌐',
          color: 'from-indigo-500 to-indigo-600',
          description: 'Website chat widget'
        }
      case 'telegram':
        return {
          name: 'Telegram',
          icon: '✈️',
          color: 'from-sky-500 to-sky-600',
          description: 'Telegram bot integration'
        }
      case 'sms':
        return {
          name: 'SMS',
          icon: '📱',
          color: 'from-orange-500 to-orange-600',
          description: 'SMS text messaging'
        }
      default:
        return {
          name: 'Unknown',
          icon: '💬',
          color: 'from-gray-500 to-gray-600',
          description: 'Unknown channel'
        }
    }
  }

  const channelInfo = getChannelInfo(channel)
  const isActive = isConnected && isEnabled

  return (
    <div 
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
          : isConnected
          ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${className}
      `}
      onClick={() => onToggle(channel)}
    >
      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        {isActive ? (
          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
        ) : isConnected ? (
          <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-2 h-2 text-white" />
          </div>
        ) : (
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
        )}
      </div>

      <div className="flex flex-col items-center text-center space-y-3">
        {/* Channel Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channelInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
          {channelInfo.icon}
        </div>

        {/* Channel Name */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {channelInfo.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {channelInfo.description}
          </p>
        </div>

        {/* Status */}
        <div className="flex flex-col items-center space-y-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : isConnected
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {isActive ? 'Active' : isConnected ? 'Connected' : 'Not Connected'}
          </span>

          {/* Configure Button */}
          {onConfigure && isConnected && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onConfigure(channel)
              }}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Configure
            </button>
          )}
        </div>
      </div>

      {/* Selection Overlay */}
      {isEnabled && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-xl pointer-events-none" />
      )}
    </div>
  )
}

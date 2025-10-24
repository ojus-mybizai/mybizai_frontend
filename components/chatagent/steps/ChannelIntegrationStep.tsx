'use client'

import { MessageSquare, Smartphone, Instagram, Facebook, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ConnectMeta from '@/components/facebook/connectmeta'
import FacebookSDKLoader from '@/components/facebook/facebooksdkloader'

interface ChannelIntegrationStepProps {
  channelsEnabled?: Record<string, boolean>
  onChange: (channelsEnabled: Record<string, boolean>) => void
}

type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'messenger' | 'telegram'

interface Channel {
  id: ChannelType
  name: string
  icon: React.ReactNode
  description: string
  status: 'available' | 'coming_soon'
}

const CHANNELS: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Connect your WhatsApp Business account',
    status: 'available'
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    icon: <Instagram className="w-5 h-5" />,
    description: 'Connect your Instagram Business account',
    status: 'available'
  },
  {
    id: 'messenger',
    name: 'Facebook Messenger',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Connect your Facebook Page',
    status: 'available'
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    icon: <Send className="w-5 h-5" />,
    description: 'Connect your Telegram bot',
    status: 'coming_soon'
  }
]

export default function ChannelIntegrationStep({ channelsEnabled = {}, onChange }: ChannelIntegrationStepProps) {
  const renderChannel = (channel: Channel) => {
    const isEnabled = channelsEnabled[channel.id] || false

    return (
      <div
        key={channel.id}
        className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
          channel.status === 'coming_soon' ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            channel.status === 'available' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400'
          }`}>
            {channel.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 dark:text-white">{channel.name}</h3>
              {channel.status === 'coming_soon' && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {channel.description}
            </p>
            {channel.status === 'available' && (
              <div className="flex items-center mt-2">
                <span className={`text-xs ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                  {isEnabled ? '● Active' : '○ Inactive'}
                </span>
              </div>
            )}
          </div>
        </div>

        {channel.status === 'available' && (
          <div className="flex items-center space-x-3">
            {(channel.id === 'whatsapp' || channel.id === 'instagram' || channel.id === 'messenger') ? (
              <ConnectMeta channel={channel.id} />
            ) : (
              <Button
                size="sm"
                disabled={true}
              >
                Coming Soon
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Channel Integration</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Connect your chat agent to messaging platforms
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Available Channels
        </h3>
        <div className="space-y-3">
          {CHANNELS.map(renderChannel)}
        </div>
      </div>
    </div>
  )
}

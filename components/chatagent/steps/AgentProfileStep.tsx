'use client'

import { Bot } from 'lucide-react'

interface AgentProfileData {
  name: string
  description: string
  role_type: 'sales' | 'support' | 'lead_gen' | 'general' | string
  tone: 'casual' | 'professional' | 'friendly' | string
  instructions: string
}

interface AgentProfileStepProps {
  data: AgentProfileData
  onChange: (data: Partial<AgentProfileData>) => void
}

const ROLE_OPTIONS = [
  { value: 'sales', label: 'Sales Assistant', description: 'Helps with product inquiries and sales' },
  { value: 'support', label: 'Customer Support', description: 'Handles customer service and technical issues' },
  { value: 'lead_gen', label: 'Lead Generation', description: 'Qualifies leads and gathers contact information' },
  { value: 'general', label: 'General Assistant', description: 'Multi-purpose AI assistant' }
]

const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable tone' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like tone' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational tone' }
]

export default function AgentProfileStep({ data, onChange }: AgentProfileStepProps) {
  return (
    <div className="space-y-6">
      {/* Agent Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Agent Name *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Sales Assistant, Support Bot"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {data.name.length > 0 && data.name.length < 3 && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Agent name must be at least 3 characters long
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Brief description of what this agent does..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {data.description.length}/200 characters
        </p>
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Agent Role *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ role_type: option.value as any })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                data.role_type === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {option.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Communication Tone
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ tone: option.value as any })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                data.tone === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              }`}
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                {option.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Instructions
        </label>
        <textarea
          value={data.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
          placeholder="Provide specific instructions or personality traits for your agent..."
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {data.instructions.length}/500 characters
        </p>
      </div>

      {/* Agent Preview */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {data.name || 'New Agent'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.role_type} • {data.tone} tone
          </p>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Tips for creating a great agent
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Choose a clear, descriptive name that reflects the agent's purpose</li>
          <li>• Write a concise description explaining what the agent helps with</li>
          <li>• Select the role that best matches your intended use case</li>
          <li>• Choose a tone that matches your brand and target audience</li>
          <li>• Add custom instructions for specific behaviors or knowledge</li>
        </ul>
      </div>
    </div>
  )
}

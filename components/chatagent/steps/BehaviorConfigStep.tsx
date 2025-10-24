'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, MessageSquare } from 'lucide-react'

interface AIConfig {
  role: string
  description: string
  system_prompt: string
  tone: 'casual' | 'professional' | 'friendly'
  personality: 'helpful' | 'sales' | 'support' | 'friendly'
  response_style: 'short' | 'balanced' | 'detailed'
  greeting_message: string
  fallback_message: string
  max_response_length: number
  typing_delay: number
  business_hours: {
    enabled: boolean
    timezone: string
    schedule: Record<string, any>
    out_of_hours_message: string
  }
  handover_keywords: string[]
}

interface BehaviorConfigStepProps {
  config: AIConfig
  onChange: (config: AIConfig) => void
}

const TONE_OPTIONS = [
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' }
]

const PERSONALITY_OPTIONS = [
  { value: 'helpful', label: 'Helpful', description: 'Focuses on solving problems' },
  { value: 'sales', label: 'Sales-driven', description: 'Emphasizes products and conversions' },
  { value: 'support', label: 'Support-focused', description: 'Prioritizes customer satisfaction' },
  { value: 'friendly', label: 'Friendly', description: 'Emphasizes relationship building' }
]

const RESPONSE_STYLE_OPTIONS = [
  { value: 'short', label: 'Concise', description: '1-2 sentences, brief responses' },
  { value: 'balanced', label: 'Balanced', description: '2-4 sentences, moderate detail' },
  { value: 'detailed', label: 'Detailed', description: '4+ sentences, comprehensive answers' }
]

export default function BehaviorConfigStep({ config, onChange }: BehaviorConfigStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

  const updateConfig = (updates: Partial<AIConfig>) => {
    onChange({ ...config, ...updates })
  }

  const updateBusinessHours = (updates: Partial<AIConfig['business_hours']>) => {
    onChange({
      ...config,
      business_hours: { ...config.business_hours, ...updates }
    })
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !config.handover_keywords.includes(keywordInput.trim().toLowerCase())) {
      onChange({
        ...config,
        handover_keywords: [...config.handover_keywords, keywordInput.trim().toLowerCase()]
      })
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    onChange({
      ...config,
      handover_keywords: config.handover_keywords.filter(k => k !== keyword)
    })
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Agent Tone
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateConfig({ tone: option.value as any })}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                config.tone === option.value
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

      {/* Personality Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Personality Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PERSONALITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateConfig({ personality: option.value as any })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                config.personality === option.value
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

      {/* Response Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Response Style
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RESPONSE_STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateConfig({ response_style: option.value as any })}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                config.response_style === option.value
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

      {/* Greeting Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Greeting Message *
        </label>
        <textarea
          value={config.greeting_message}
          onChange={(e) => updateConfig({ greeting_message: e.target.value })}
          placeholder="Hello! How can I help you today?"
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          First message users see when starting a conversation
        </p>
      </div>

      {/* Fallback Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Fallback Message *
        </label>
        <textarea
          value={config.fallback_message}
          onChange={(e) => updateConfig({ fallback_message: e.target.value })}
          placeholder="I'm sorry, I didn't understand that. Could you please rephrase?"
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Message shown when the agent doesn't understand the user's input
        </p>
      </div>

      {/* Advanced Settings */}
      <div className="border border-gray-200 dark:border-slate-600 rounded-lg">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Advanced Configuration
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fine-tune response behavior and business hours
            </p>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-600 space-y-6">
            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Prompt
              </label>
              <textarea
                value={config.system_prompt}
                onChange={(e) => updateConfig({ system_prompt: e.target.value })}
                placeholder="You are a helpful AI assistant..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Core instructions that define how the agent should behave
              </p>
            </div>

            {/* Response Length Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Response Length: {config.max_response_length} characters
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={config.max_response_length}
                onChange={(e) => updateConfig({ max_response_length: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Brief (50)</span>
                <span>Moderate (275)</span>
                <span>Detailed (500)</span>
              </div>
            </div>

            {/* Typing Delay */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Typing Delay: {config.typing_delay}ms
              </label>
              <input
                type="range"
                min="0"
                max="3000"
                step="100"
                value={config.typing_delay}
                onChange={(e) => updateConfig({ typing_delay: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Instant (0ms)</span>
                <span>Natural (1500ms)</span>
                <span>Slow (3000ms)</span>
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Business Hours
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.business_hours.enabled}
                    onChange={(e) => updateBusinessHours({ enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {config.business_hours.enabled && (
                <div className="space-y-3">
                  <textarea
                    value={config.business_hours.out_of_hours_message}
                    onChange={(e) => updateBusinessHours({ out_of_hours_message: e.target.value })}
                    placeholder="We're currently closed. We'll get back to you during business hours!"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Message shown outside business hours
                  </p>
                </div>
              )}
            </div>

            {/* Handover Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Human Handover Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {config.handover_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  placeholder="Add keyword..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Keywords that trigger transfer to human agent
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Behavior Configuration Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Choose tone and personality that matches your brand voice</li>
          <li>• Test different response styles to find what works best for your audience</li>
          <li>• Use clear, welcoming greeting messages to set expectations</li>
          <li>• Add handover keywords for complex issues that need human attention</li>
        </ul>
      </div>
    </div>
  )
}

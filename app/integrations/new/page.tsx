'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Key, Globe, Database, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useIntegrationStore } from '@/lib/stores'
import { integrationApi, ApiError, IntegrationCreate } from '@/lib/api'

const integrationTypes = [
  { value: '', label: 'Select Integration Type' },
  { value: 'shopify', label: 'Shopify', icon: '🛍️', description: 'E-commerce platform integration' },
  { value: 'woocommerce', label: 'WooCommerce', icon: '🛒', description: 'WordPress e-commerce plugin' },
  { value: 'zoho', label: 'Zoho CRM', icon: '📊', description: 'Customer relationship management' },
  { value: 'hubspot', label: 'HubSpot', icon: '🎯', description: 'Marketing and sales platform' },
  { value: 'custom_api', label: 'Custom API', icon: '⚡', description: 'Custom REST API integration' },
]

const getConfigFields = (type: string) => {
  switch (type) {
    case 'shopify':
      return [
        { key: 'shop_domain', label: 'Shop Domain', type: 'text', placeholder: 'your-shop.myshopify.com', required: true },
        { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'shpat_...', required: true },
        { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', placeholder: 'Optional webhook secret', required: false },
      ]
    case 'woocommerce':
      return [
        { key: 'site_url', label: 'Site URL', type: 'text', placeholder: 'https://your-site.com', required: true },
        { key: 'consumer_key', label: 'Consumer Key', type: 'text', placeholder: 'ck_...', required: true },
        { key: 'consumer_secret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_...', required: true },
      ]
    case 'zoho':
      return [
        { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Zoho OAuth Client ID', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Zoho OAuth Client Secret', required: true },
        { key: 'refresh_token', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token', required: true },
        { key: 'domain', label: 'Domain', type: 'select', options: ['com', 'eu', 'in', 'com.au'], required: true },
      ]
    case 'hubspot':
      return [
        { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'HubSpot Private App Token', required: true },
        { key: 'portal_id', label: 'Portal ID', type: 'text', placeholder: 'Your HubSpot Portal ID', required: true },
      ]
    case 'custom_api':
      return [
        { key: 'base_url', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com', required: true },
        { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your API key', required: false },
        { key: 'auth_header', label: 'Auth Header', type: 'text', placeholder: 'Authorization header name', required: false },
        { key: 'auth_value', label: 'Auth Value', type: 'password', placeholder: 'Bearer token or API key', required: false },
      ]
    default:
      return []
  }
}

export default function NewIntegrationPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { addIntegration } = useIntegrationStore()

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    config: {} as Record<string, any>,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleConfigChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }))
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Integration name is required'
    }

    if (!formData.type) {
      newErrors.type = 'Integration type is required'
    }

    // Validate required config fields
    const configFields = getConfigFields(formData.type)
    configFields.forEach(field => {
      if (field.required && !formData.config[field.key]) {
        newErrors[field.key] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !accessToken) return

    setIsLoading(true)
    try {
      const createData: IntegrationCreate = {
        name: formData.name,
        type: formData.type as any,
        config: formData.config,
      }

      const newIntegration = await integrationApi.createIntegration(createData, accessToken)
      addIntegration(newIntegration)
      router.push('/integrations')
    } catch (error) {
      console.error('Failed to create integration:', error)
      if (error instanceof ApiError) {
        setErrors({ submit: error.message })
      } else {
        setErrors({ submit: 'Failed to create integration' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedIntegrationType = integrationTypes.find(t => t.value === formData.type)
  const configFields = getConfigFields(formData.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Integration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect a new business tool or service
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Integration Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter a name for this integration"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Integration Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrationTypes.slice(1).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      handleInputChange('type', type.value)
                      setFormData(prev => ({ ...prev, config: {} })) // Reset config when type changes
                    }}
                    className={`p-4 border rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">{type.icon}</div>
                    <div className="text-center">
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </button>
                ))}
              </div>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        {formData.type && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>{selectedIntegrationType?.icon}</span>
                <span>{selectedIntegrationType?.label} Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {configFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <Select
                      options={[
                        { value: '', label: `Select ${field.label}` },
                        ...(field.options?.map(opt => ({ value: opt, label: opt })) || [])
                      ]}
                      value={formData.config[field.key] || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      className={errors[field.key] ? 'border-red-500' : ''}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData.config[field.key] || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={errors[field.key] ? 'border-red-500' : ''}
                    />
                  )}
                  {errors[field.key] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field.key]}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !formData.type}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Creating...' : 'Create Integration'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

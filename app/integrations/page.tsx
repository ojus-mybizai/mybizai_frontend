'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Zap, Settings, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { integrationApi, ApiError, Integration } from '@/lib/api'

const integrationIcons = {
  shopify: '🛍️',
  woocommerce: '🛒',
  zoho: '📊',
  hubspot: '🎯',
  custom_api: '⚡',
}

const integrationLabels = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  zoho: 'Zoho CRM',
  hubspot: 'HubSpot',
  custom_api: 'Custom API',
}

export default function IntegrationsPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [accessToken])

  const fetchIntegrations = async () => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const integrationList = await integrationApi.getIntegrations(accessToken)
      setIntegrations(integrationList)
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!accessToken) return

    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }

    try {
      await integrationApi.deleteIntegration(id, accessToken)
      setIntegrations(prev => prev.filter(integration => integration.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete integration:', error)
      if (error instanceof ApiError) {
        alert(`Failed to delete integration: ${error.message}`)
      }
    }
  }

  const handleToggleStatus = async (integration: Integration) => {
    if (!accessToken) return

    try {
      const updated = await integrationApi.updateIntegration(
        integration.id,
        { is_active: !integration.is_active },
        accessToken
      )
      setIntegrations(prev => prev.map(i => i.id === integration.id ? updated : i))
    } catch (error) {
      console.error('Failed to toggle integration status:', error)
      if (error instanceof ApiError) {
        alert(`Failed to update integration: ${error.message}`)
      }
    }
  }

  const filteredIntegrations = integrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your business tools and services with your AI agents
          </p>
        </div>
        <Button onClick={() => router.push('/integrations/new')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading integrations...</div>
        </div>
      ) : filteredIntegrations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {integrations.length === 0 ? 'No integrations configured' : 'No integrations match your search'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {integrations.length === 0 
                ? 'Connect your business tools to enhance your AI agents\' capabilities.'
                : 'Try adjusting your search criteria to find what you\'re looking for.'
              }
            </p>
            {integrations.length === 0 && (
              <Button onClick={() => router.push('/integrations/new')}>
                Add Your First Integration
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg">
                      {integrationIcons[integration.type]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integrationLabels[integration.type]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/integrations/${integration.id}`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(integration.id)}
                      className={deleteConfirm === integration.id ? 'bg-red-50 text-red-600 border-red-200' : ''}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <div className="flex items-center space-x-2">
                    {integration.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${integration.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Configuration Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Configuration
                  </h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    {Object.keys(integration.config).length > 0 ? (
                      Object.keys(integration.config).slice(0, 3).map((key) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-mono">
                            {typeof integration.config[key] === 'string' && integration.config[key].length > 20
                              ? `${integration.config[key].substring(0, 20)}...`
                              : String(integration.config[key])
                            }
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="italic">No configuration data</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Created {new Date(integration.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(integration)}
                    >
                      {integration.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/integrations/${integration.id}`)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredIntegrations.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredIntegrations.length} of {integrations.length} integrations
        </div>
      )}
    </div>
  )
}

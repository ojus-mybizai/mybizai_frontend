'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import TemplateForm from '@/components/catalog/TemplateForm'
import { useAuthStore, useCatalogStore } from '@/lib/stores'
import { authApi, ApiError, CatalogTemplate, CatalogTemplateRequest, CatalogTemplateOut, CatalogTemplateCreate } from '@/lib/api'

// Toggle mock mode
const USE_MOCK = false

// Mock templates
const MOCK_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Service Basic',
    description: 'Basic service fields',
    fields: [
      { id: 'f1', label: 'Duration', type: 'text', required: true },
      { id: 'f2', label: 'Notes', type: 'textarea', required: false },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl-2',
    name: 'Product Basic',
    description: 'Basic product fields',
    fields: [
      { id: 'f3', label: 'SKU', type: 'text', required: true },
      { id: 'f4', label: 'Warranty (months)', type: 'number', required: false },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function CatalogTemplatesPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { templates, setTemplates, addTemplate, updateTemplate, removeTemplate } = useCatalogStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CatalogTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      if (USE_MOCK) {
        setTemplates(MOCK_TEMPLATES)
        setIsLoading(false)
        return
      }
      if (!accessToken) return

      setIsLoading(true)
      try {
        const catalogTemplates: CatalogTemplateOut[] = await authApi.getCatalogTemplates(accessToken)
        // Convert backend templates to frontend format
        const frontendTemplates: CatalogTemplate[] = catalogtemplates?.map(t => ({
          id: String(t.id),
          name: t.name,
          description: '',
          fields: t.extra_metadata.map((field, idx) => ({
            id: `field-${idx}`,
            label: field,
            type: 'text' as const,
            required: false,
          })),
          created_at: t.created_at,
          updated_at: t.updated_at,
        }))
        setTemplates(frontendTemplates)
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [accessToken, setTemplates])

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleEdit = (template: CatalogTemplate) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (USE_MOCK) {
      removeTemplate(id)
      return
    }
    if (!accessToken) return

    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
      return
    }

    try {
      await authApi.deleteCatalogTemplate(Number(id), accessToken)
      removeTemplate(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete template:', error)
      if (error instanceof ApiError) {
        alert(`Failed to delete template: ${error.message}`)
      }
    }
  }

  const handleSubmit = async (data: CatalogTemplateRequest) => {
    if (USE_MOCK) {
      setIsSubmitting(true)
      try {
        if (editingTemplate) {
          const updated: CatalogTemplate = {
            ...editingTemplate,
            ...data,
            fields: data.fields.map((f, idx) => ({ id: editingtemplate?.fields[idx]?.id || `mock-${idx}`, ...f })),
            updated_at: new Date().toISOString(),
          }
          updateTemplate(editingtemplate?.id, updated)
        } else {
          const now = new Date().toISOString()
          const created: CatalogTemplate = {
            id: `tpl-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
            name: data.name,
            description: data.description,
            fields: data.fields.map((f, idx) => ({ id: `mock-${idx}`, ...f })),
            created_at: now,
            updated_at: now,
          }
          addTemplate(created)
        }
        setShowForm(false)
        setEditingTemplate(null)
      } finally {
        setIsSubmitting(false)
      }
      return
    }
    if (!accessToken) return

    setIsSubmitting(true)
    try {
      if (editingTemplate) {
        // Convert frontend template request to backend format
        const backendRequest: CatalogTemplateCreate = {
          name: data.name,
          extra_metadata: data.fields.map(f => f.label),
        }
        const updatedTemplate = await authApi.updateCatalogTemplate(Number(editingtemplate?.id), backendRequest, accessToken)
        // Convert back to frontend format
        const frontendTemplate: CatalogTemplate = {
          id: String(updatedtemplate?.id),
          name: updatedtemplate?.name,
          description: data.description || '',
          fields: updatedtemplate?.extra_metadata.map((field, idx) => ({
            id: `field-${idx}`,
            label: field,
            type: 'text' as const,
            required: false,
          })),
          created_at: updatedtemplate?.created_at,
          updated_at: updatedtemplate?.updated_at,
        }
        updateTemplate(editingtemplate?.id, frontendTemplate)
      } else {
        const backendRequest: CatalogTemplateCreate = {
          name: data.name,
          extra_metadata: data.fields.map(f => f.label),
        }
        const newTemplate = await authApi.createCatalogTemplate(backendRequest, accessToken)
        const frontendTemplate: CatalogTemplate = {
          id: String(newtemplate?.id),
          name: newtemplate?.name,
          description: data.description || '',
          fields: newtemplate?.extra_metadata.map((field, idx) => ({
            id: `field-${idx}`,
            label: field,
            type: 'text' as const,
            required: false,
          })),
          created_at: newtemplate?.created_at,
          updated_at: newtemplate?.updated_at,
        }
        addTemplate(frontendTemplate)
      }
      setShowForm(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Failed to save template:', error)
      if (error instanceof ApiError) {
        alert(`Failed to save template: ${error.message}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTemplate(null)
  }

  if (!USE_MOCK && !accessToken) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to manage templates?.</p>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {editingTemplate 
                ? `Update "${editingtemplate?.name}" template`
                : 'Create a new catalog template with custom fields'
              }
            </p>
          </div>
        </div>

        <TemplateForm
          initialData={editingTemplate || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Catalog Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage reusable field templates for your catalog items
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/catalog')}
          >
            Back to Catalog
          </Button>
          
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No templates yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first template to add custom fields to your catalog items.
                Templates help you maintain consistency across similar products or services.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template?.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template?.name}</CardTitle>
                    {template?.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template?.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template?.id)}
                      className={deleteConfirm === template?.id ? 'bg-red-50 text-red-600' : ''}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Fields:</span>
                    <span className="font-medium">{template?.fields.length}</span>
                  </div>
                  
                  {template?.fields.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Field Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {[...new Set(template?.fields.map(f => f.type))].map(type => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(template?.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <p className="text-sm mb-2">Click delete again to confirm</p>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="bg-white text-red-600 border-white hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleDelete(deleteConfirm)}
              className="bg-red-700 hover:bg-red-800"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

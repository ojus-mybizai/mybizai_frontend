'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CatalogForm from '@/components/catalog/CatalogForm'
import { useAuthStore, useCatalogStore } from '@/lib/stores'
import { authApi, ApiError, CatalogItemRequest, CatalogTemplate, CatalogItem, CatalogItemCreateRequest, CatalogTemplateOut } from '@/lib/api'

// Toggle mock mode
const USE_MOCK = false

// Mock templates for form
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
]

export default function NewCatalogItemPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { addItem } = useCatalogStore()
  
  const [templates, setTemplates] = useState<CatalogTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchTemplates = async () => {
      if (USE_MOCK) {
        setTemplates(MOCK_TEMPLATES)
        return
      }
      if (!accessToken) return

      setIsLoading(true)
      try {
        const catalogTemplates: CatalogTemplateOut[] = await authApi.getCatalogTemplates(accessToken)
        // Convert backend templates to frontend format
        const frontendTemplates: CatalogTemplate[] = catalogTemplates.map(t => ({
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
        // Continue without templates
        setTemplates([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [accessToken])

  const handleSubmit = async (data: CatalogItemRequest, files: File[]) => {
    if (USE_MOCK) {
      setIsSubmitting(true)
      try {
        const now = new Date().toISOString()
        const newItem: CatalogItem = {
          id: `item-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          currency: data.currency,
          availability: data.availability,
          type: data.type,
          images: data.images || [],
          template_fields: data.template_fields || {},
          created_at: now,
          updated_at: now,
        }
        addItem(newItem)
        router.push('/catalog')
      } finally {
        setIsSubmitting(false)
      }
      return
    }
    if (!accessToken) return

    setIsSubmitting(true)
    try {
      // Upload images first if any files are provided
      let imageUrls: string[] = []
      if (files.length > 0) {
        const uploadPromises = files.map(file => authApi.uploadCatalogImage(file, accessToken))
        const uploadResults = await Promise.all(uploadPromises)
        imageUrls = uploadResults.map(result => result.url)
      }

      // Convert frontend request to backend format
      const createRequest: CatalogItemCreateRequest = {
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        price: data.price,
        currency: data.currency,
        availability: data.availability,
        type: data.type,
        images: imageUrls,
        extra_data: data.template_fields || {},
        template_id: null, // Could be derived from form if needed
      }
      const backendItem = await authApi.createCatalogItem(createRequest, accessToken)
      // Convert back to frontend format for store
      const frontendItem: CatalogItem = {
        id: String(backendItem.id),
        name: backendItem.name,
        description: backendItem.description || '',
        category: backendItem.category || '',
        price: backendItem.price,
        currency: backendItem.currency,
        availability: backendItem.availability,
        type: backendItem.type,
        images: backendItem.images,
        template_fields: backendItem.extra_data,
        created_at: backendItem.created_at,
        updated_at: backendItem.updated_at,
      }
      addItem(frontendItem)
      router.push('/catalog')
    } catch (error) {
      console.error('Failed to create item:', error)
      if (error instanceof ApiError) {
        alert(`Failed to create item: ${error.message}`)
      } else {
        alert('Failed to create item. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/catalog')
  }

  if (!USE_MOCK && !accessToken) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to create catalog items.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add New Item</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Create a new product or service for your catalog
        </p>
      </div>

      <CatalogForm
        templates={templates}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}

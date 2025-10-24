'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import CatalogForm from '@/components/catalog/CatalogForm'
import { useAuthStore, useCatalogStore } from '@/lib/stores'
import { authApi, ApiError, CatalogItemRequest, CatalogTemplate, CatalogItem, CatalogItemOut, CatalogItemUpdateRequest, CatalogTemplateOut } from '@/lib/api'

// Toggle mock mode
const USE_MOCK = false

// Mock templates
const MOCK_TEMPLATES: CatalogTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Service Basic',
    fields: [
      { id: 'f1', label: 'Duration', type: 'text', required: true },
      { id: 'f2', label: 'Notes', type: 'textarea', required: false },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function EditCatalogItemPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuthStore()
  const { updateItem, items } = useCatalogStore()
  
  const [item, setItem] = useState<CatalogItem | null>(null)
  const [templates, setTemplates] = useState<CatalogTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return

      if (USE_MOCK) {
        const local = items.find((i) => i.id === (params.id as string)) || null
        setItem(local)
        setTemplates(MOCK_TEMPLATES)
        setIsLoading(false)
        return
      }
      if (!accessToken) return

      setIsLoading(true)
      try {
        const [catalogItem, catalogTemplates] = await Promise.all([
          authApi.getCatalogItem(params.id as string, accessToken),
          authApi.getCatalogTemplates(accessToken)
        ])
        
        // Convert backend item to frontend format
        const frontendItem: CatalogItem = {
          id: String(catalogItem.id),
          name: catalogItem.name,
          description: catalogItem.description || '',
          category: catalogItem.category || '',
          price: catalogItem.price,
          currency: catalogItem.currency,
          availability: catalogItem.availability,
          type: catalogItem.type,
          images: catalogItem.images,
          template_fields: catalogItem.metadata,
          created_at: catalogItem.created_at,
          updated_at: catalogItem.updated_at,
        }
        setItem(frontendItem)
        
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
        console.error('Failed to fetch data:', error)
        if (error instanceof ApiError && error.status === 404) {
          alert('Item not found')
          router.push('/catalog')
        } else {
          alert('Failed to load item data')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [accessToken, params.id, router, items])

  const handleSubmit = async (data: CatalogItemRequest, files: File[]) => {
    if (!params.id) return

    if (USE_MOCK) {
      setIsSubmitting(true)
      try {
        const updated: CatalogItem = {
          ...(item as CatalogItem),
          ...data,
          updated_at: new Date().toISOString(),
        }
        updateItem(params.id as string, updated)
        router.push('/catalog')
      } finally {
        setIsSubmitting(false)
      }
      return
    }
    if (!accessToken) return

    setIsSubmitting(true)
    try {
      // Upload new images first if any files are provided
      let newImageUrls: string[] = []
      if (files.length > 0) {
        const uploadPromises = files.map(file => authApi.uploadCatalogImage(file, accessToken))
        const uploadResults = await Promise.all(uploadPromises)
        newImageUrls = uploadResults.map(result => result.url)
      }

      // Combine existing images with new uploaded images
      const allImages = [...(item?.images || []), ...newImageUrls]

      // Convert frontend request to backend format
      const updateRequest: CatalogItemUpdateRequest = {
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        price: data.price,
        currency: data.currency,
        availability: data.availability,
        type: data.type,
        images: allImages,
        metadata: data.template_fields || {},
        template_id: null,
      }
      const backendItem = await authApi.updateCatalogItem(params.id as string, updateRequest, accessToken)
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
        template_fields: backendItem.metadata,
        created_at: backendItem.created_at,
        updated_at: backendItem.updated_at,
      }
      updateItem(params.id as string, frontendItem)
      router.push('/catalog')
    } catch (error) {
      console.error('Failed to update item:', error)
      if (error instanceof ApiError) {
        alert(`Failed to update item: ${error.message}`)
      } else {
        alert('Failed to update item. Please try again.')
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
        <p className="text-gray-500">Please log in to edit catalog items.</p>
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

  if (!item) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Item not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Item</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update details for "{item.name}"
        </p>
      </div>

      <CatalogForm
        initialData={item}
        templates={templates}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}

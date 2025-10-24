'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BulkUploadForm from '@/components/catalog/BulkUploadForm'
import { useAuthStore, useCatalogStore } from '@/lib/stores'
import { authApi, ApiError, BulkUploadResponse } from '@/lib/api'

// Toggle mock mode
const USE_MOCK = false

export default function BulkUploadPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { setItems } = useCatalogStore()
  
  const [isLoading, setIsLoading] = useState(false)

  const handleUpload = async (file: File, fieldMapping: Record<string, string>): Promise<BulkUploadResponse> => {
    if (!accessToken) throw new Error('Authentication required')

    setIsLoading(true)
    try {
      const result = await authApi.bulkUploadCatalog(file, fieldMapping, accessToken)
      
      // Refresh catalog items after successful upload
      if (result.success_count > 0) {
        const catalogItems = await authApi.getCatalogItems(accessToken)
        setItems(catalogItems)
      }
      
      return result
    } catch (error) {
      console.error('Bulk upload failed:', error)
      if (error instanceof ApiError) {
        throw new Error(`Upload failed: ${error.message}`)
      }
      throw new Error('Upload failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/catalog')
  }

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to upload catalog items.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bulk Upload</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Import multiple catalog items from a CSV file
        </p>
      </div>

      <BulkUploadForm
        onUpload={handleUpload}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  )
}

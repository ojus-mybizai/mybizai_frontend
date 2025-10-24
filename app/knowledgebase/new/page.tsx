'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Upload, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useKnowledgeBaseStore } from '@/lib/stores'
import { knowledgeBaseApi, ApiError, KnowledgeBaseCreate } from '@/lib/api'

const categoryOptions = [
  { value: '', label: 'Select Category' },
  { value: 'FAQ', label: 'FAQ' },
  { value: 'Product', label: 'Product Information' },
  { value: 'Policy', label: 'Policies & Procedures' },
  { value: 'Support', label: 'Support Documentation' },
  { value: 'Training', label: 'Training Material' },
  { value: 'Other', label: 'Other' },
]

export default function NewKnowledgeBasePage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { addKnowledgeBase } = useKnowledgeBaseStore()

  const [formData, setFormData] = useState({
    title: '',
    type: 'text' as 'text' | 'file',
    category: '',
    content: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.type === 'text' && !formData.content.trim()) {
      newErrors.content = 'Content is required for text entries'
    }

    if (formData.type === 'file' && !selectedFile) {
      newErrors.file = 'File is required for file entries'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !accessToken) return

    setIsLoading(true)
    try {
      const createData: KnowledgeBaseCreate = {
        title: formData.title,
        type: formData.type,
        category: formData.category || undefined,
        content: formData.type === 'text' ? formData.content : undefined,
        file: formData.type === 'file' ? selectedFile! : undefined,
      }

      const newKB = await knowledgeBaseApi.createKnowledgeBase(createData, accessToken)
      addKnowledgeBase(newKB)
      router.push('/knowledgebase')
    } catch (error) {
      console.error('Failed to create knowledge base entry:', error)
      if (error instanceof ApiError) {
        setErrors({ submit: error.message })
      } else {
        setErrors({ submit: 'Failed to create knowledge base entry' })
      }
    } finally {
      setIsLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Knowledge Base Entry</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new entry to train your AI agents
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'text')}
                  className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                    formData.type === 'text'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Text Entry</div>
                    <div className="text-sm text-gray-500">Direct text content</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'file')}
                  className={`p-4 border rounded-lg flex items-center space-x-3 transition-colors ${
                    formData.type === 'file'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">File Upload</div>
                    <div className="text-sm text-gray-500">Upload document</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <Select
                options={categoryOptions}
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {formData.type === 'text' ? 'Text Content' : 'File Upload'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.type === 'text' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter the knowledge base content that will be used to train your AI agents..."
                  rows={10}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT up to 10MB
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Creating...' : 'Create Entry'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

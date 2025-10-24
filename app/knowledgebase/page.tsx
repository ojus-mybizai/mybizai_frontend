'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileText, File, Brain, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/lib/stores/authStore'
import { knowledgeBaseApi, isDemoMode } from '@/lib/apiWrapper'
import { KnowledgeBase } from '@/lib/api'

export default function KnowledgeBasePage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchKnowledgeBases()
  }, [accessToken])

  const fetchKnowledgeBases = async () => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const kbs = await knowledgeBaseApi.getKnowledgeBases(accessToken)
      console.log('Fetched knowledge bases:', kbs)
      setKnowledgeBases(kbs)
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error)
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
      await knowledgeBaseApi.deleteKnowledgeBase(id, accessToken)
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== id))
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete knowledge base:', error)
      if (error instanceof Error) {
        alert(`Failed to delete knowledge base: ${error.message}`)
      }
    }
  }

  const filteredKnowledgeBases = knowledgeBases.filter(kb =>
    kb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (kb.category && kb.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getTypeIcon = (type: 'text' | 'file') => {
    return type === 'text' ? FileText : File
  }

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    
    const colors = {
      'FAQ': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Product': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Policy': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Support': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Knowledge Base</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI knowledge base entries and training data
          </p>
        </div>
        <Button onClick={() => router.push('/knowledgebase/new')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search knowledge base entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading knowledge base...</div>
        </div>
      ) : filteredKnowledgeBases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {knowledgeBases.length === 0 ? 'No knowledge base entries yet' : 'No entries match your search'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {knowledgeBases.length === 0 
                ? 'Get started by adding your first knowledge base entry to train your AI agents.'
                : 'Try adjusting your search criteria to find what you\'re looking for.'
              }
            </p>
            {knowledgeBases.length === 0 && (
              <Button onClick={() => router.push('/knowledgebase/new')}>
                Add Your First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKnowledgeBases.map((kb) => {
            const TypeIcon = getTypeIcon(kb.type)
            return (
              <Card key={kb.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{kb.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {kb.type === 'file' ? 'File' : 'Text'} Entry
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(kb.id)}
                        className={deleteConfirm === kb.id ? 'bg-red-50 text-red-600 border-red-200' : ''}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category */}
                  {kb.category && (
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(kb.category)}`}>
                        {kb.category}
                      </span>
                    </div>
                  )}

                  {/* Content Preview */}
                  {kb.type === 'text' && kb.content && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {kb.content}
                      </p>
                    </div>
                  )}

                  {/* File Info */}
                  {kb.type === 'file' && kb.file_name && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <File className="w-4 h-4" />
                      <span className="truncate">{kb.file_name}</span>
                      {kb.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(kb.file_url!, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Created {new Date(kb.created_at).toLocaleDateString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/knowledgebase/${kb.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Results Summary */}
      {!isLoading && filteredKnowledgeBases.length > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredKnowledgeBases.length} of {knowledgeBases.length} knowledge base entries
        </div>
      )}
    </div>
  )
}

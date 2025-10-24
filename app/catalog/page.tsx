'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Upload, Settings, Grid, List, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import CatalogCard from '@/components/catalog/CatalogCard'
import SearchBar from '@/components/catalog/SearchBar'
import FilterControls from '@/components/catalog/FilterControls'
import { useAuthStore, useCatalogStore } from '@/lib/stores'
import { authApi } from '@/lib/api'
// import { MockApiError } from '@/lib/mockData'
import { CatalogItem, CatalogListResponse, Availability } from '@/lib/api'

// Toggle to use raw mock data instead of calling the API
const USE_MOCK = false

// Raw mock data for testing the Catalog page without backend
const MOCK_ITEMS: CatalogItem[] = [
  {
    id: 'item-1',
    name: 'Premium Consulting Package',
    description: 'End-to-end business consulting with dedicated support.',
    category: 'Services',
    price: 4999,
    currency: 'USD',
    availability: 'available',
    type: 'service',
    images: [],
    template_fields: { duration: '3 months', sessions: 12 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    name: 'AI Starter Kit',
    description: 'Bundle of AI-powered tools to kickstart your operations.',
    category: 'Products',
    price: 799,
    currency: 'USD',
    availability: 'available',
    type: 'product',
    images: [],
    template_fields: { license: '1 year', seats: 5 },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    name: 'Website Redesign',
    description: 'Complete revamp of your web presence with modern UI/UX.',
    category: 'Services',
    price: 2999,
    currency: 'USD',
    availability: 'out_of_stock',
    type: 'service',
    images: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function CatalogPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const {
    items,
    isLoading,
    searchQuery,
    filters,
    setItems,
    updateItem,
    removeItem,
    setLoading,
    setSearchQuery,
    setFilters,
    clearFilters
  } = useCatalogStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Initialize catalog items
  useEffect(() => {
    const init = async () => {
      // Use mock data for testing
      if (USE_MOCK) {
        setItems(MOCK_ITEMS)
        return
      }

      if (!accessToken) return
      setLoading(true)
      try {
        const result: CatalogListResponse = await authApi.getCatalogItems(accessToken, {
        page: 1,
        per_page: 50,
        ...(filters.category && { category: filters.category }),
        ...(filters.type && { type: filters.type }),
        ...(filters.availability && { availability: filters.availability }),
        ...(searchQuery && { search: searchQuery })
      })
        // Convert backend CatalogItemOut[] to frontend CatalogItem[] for compatibility
        const catalogItems: CatalogItem[] = result.items.map(item => ({
          id: String(item.id),
          name: item.name,
          description: item.description || '',
          category: item.category || '',
          price: item.price,
          currency: item.currency,
          availability: item.availability,
          type: item.type,
          images: item.images,
          template_fields: {}, // Backend doesn't have metadata field
          created_at: item.created_at,
          updated_at: item.updated_at,
        }))
        setItems(catalogItems)
      } catch (error) {
        console.error('Failed to fetch catalog items:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [accessToken, setItems, setLoading])

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(items.map(item => item.category))]
    return uniqueCategories.filter(Boolean)
  }, [items])

  // Filter and search items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = !filters.category || item.category === filters.category

      // Availability filter
      const matchesAvailability = !filters.availability || item.availability === filters.availability

      // Type filter
      const matchesType = !filters.type || item.type === filters.type

      return matchesSearch && matchesCategory && matchesAvailability && matchesType
    })
  }, [items, searchQuery, filters])

  const handleEdit = (item: CatalogItem) => {
    router.push(`/catalog/${item.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    if (!accessToken) return

    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000) // Auto-cancel after 3 seconds
      return
    }

    try {
      await authApi.deleteCatalogItem(id, accessToken)
      removeItem(id)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleToggleAvailability = async (id: string, availability: string) => {
    if (!accessToken) return

    try {
      const updatedItem = await authApi.updateCatalogItem(id, { availability: availability as Availability }, accessToken)
      // Convert backend item to frontend format for store
      const frontendItem: CatalogItem = {
        id: String(updatedItem.id),
        name: updatedItem.name,
        description: updatedItem.description || '',
        category: updatedItem.category || '',
        price: updatedItem.price,
        currency: updatedItem.currency,
        availability: updatedItem.availability,
        type: updatedItem.type,
        images: updatedItem.images,
        template_fields: updatedItem.extra_data,
        created_at: updatedItem.created_at,
        updated_at: updatedItem.updated_at,
      }
      updateItem(id, frontendItem)
    } catch (error) {
      console.error('Failed to toggle availability:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value })
  }

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your catalog.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Compact Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catalog</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Products & services</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push('/catalog/templates')}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Templates</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/catalog/bulk-upload')}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </Button>
          
          <Button
            onClick={() => router.push('/catalog/new')}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, description, or category..."
            />
            
            <div className="flex items-center space-x-4">
              <FilterControls
                filters={{
                  category: filters.category || '',
                  availability: filters.availability || '',
                  type: filters.type || ''
                }}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                categories={categories}
              />
              
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading ? 'Loading...' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {items.length === 0 ? 'No items yet' : 'No items match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {items.length === 0 
                  ? 'Get started by adding your first product or service to your catalog.'
                  : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                }
              </p>
              {items.length === 0 ? (
                <Button onClick={() => router.push('/catalog/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredItems.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
            />
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

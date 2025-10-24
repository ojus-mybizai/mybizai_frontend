'use client'

import { Filter, X } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

import { ItemType, Availability } from '@/lib/api'

interface FilterControlsProps {
  filters: {
    category: string
    availability: Availability | ''
    type: ItemType | ''
  }
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  categories: string[]
}

export default function FilterControls({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  categories 
}: FilterControlsProps) {
  const availabilityOptions = [
    { value: '', label: 'All Availability' },
    { value: 'available', label: 'Available' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'discontinued', label: 'Discontinued' }
  ]

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'product', label: 'Products' },
    { value: 'service', label: 'Services' }
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ]

  const hasActiveFilters = filters.category || filters.availability || filters.type

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
      </div>

      <Select
        options={categoryOptions}
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        placeholder="Category"
        className="min-w-[140px]"
      />

      <Select
        options={availabilityOptions}
        value={filters.availability}
        onChange={(e) => onFilterChange('availability', e.target.value)}
        placeholder="Availability"
        className="min-w-[140px]"
      />

      <Select
        options={typeOptions}
        value={filters.type}
        onChange={(e) => onFilterChange('type', e.target.value)}
        placeholder="Type"
        className="min-w-[120px]"
      />

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center space-x-1"
        >
          <X className="h-3 w-3" />
          <span>Clear</span>
        </Button>
      )}
    </div>
  )
}

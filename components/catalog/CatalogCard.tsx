'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Trash2, ToggleLeft, ToggleRight, Package, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { CatalogItem } from '@/lib/api'
import { getImageUrl } from '@/lib/imageUtils'

interface CatalogCardProps {
  item: CatalogItem
  onEdit: (item: CatalogItem) => void
  onDelete: (id: string) => void
  onToggleAvailability: (id: string, availability: string) => void
}

export default function CatalogCard({ item, onEdit, onDelete, onToggleAvailability }: CatalogCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)


  const getAvailabilityBadge = () => {
    const badges = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      out_of_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      discontinued: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    
    const labels = {
      available: 'Available',
      out_of_stock: 'Out of Stock',
      discontinued: 'Discontinued'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[item.availability]}`}>
        {labels[item.availability]}
      </span>
    )
  }

  const getTypeBadge = () => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        item.type === 'product' 
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      }`}>
        {item.type === 'product' ? (
          <>
            <Package className="w-3 h-3 mr-1" />
            Product
          </>
        ) : (
          <>
            <Wrench className="w-3 h-3 mr-1" />
            Service
          </>
        )}
      </span>
    )
  }

  const handleToggleAvailability = async () => {
    setIsLoading(true)
    const newAvailability = item.availability === 'available' ? 'out_of_stock' : 'available'
    await onToggleAvailability(item.id, newAvailability)
    setIsLoading(false)
  }

  const formatPrice = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: item.currency || 'USD',
    }).format(item.price)
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Image */}
        <div className="relative aspect-square mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {(() => {
            // Debug logging
            if (item.images && item.images.length > 0) {
              console.log('Image data for', item.name, ':', item.images)
              console.log('Converted URL:', getImageUrl(item.images[0]))
            } else {
              console.log('No image for', item.name, '- images:', item.images, 'imageError:', imageError)
            }
            return null
          })()}
          
          {item.images && item.images.length > 0 && !imageError ? 
            
            (<Image
              src={getImageUrl(item.images[0])}
              alt={item.name}
              fill
              className="object-cover"
              onError={(e) => {
                console.error('Image load error for', item.name, ':', e)
                setImageError(true)
              }}
              onLoad={() => console.log('Image loaded successfully for', item.name)}
              unoptimized
            />) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(item)}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleToggleAvailability}
              disabled={isLoading}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              {item.availability === 'available' ? (
                <ToggleRight className="w-4 h-4 text-green-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDelete(item.id)}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title and Category */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {item.category}
            </p>
          </div>

          {/* Price */}
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice()}
          </div>

          {/* Badges */}
          <div className="flex items-center justify-between">
            {getAvailabilityBadge()}
            {getTypeBadge()}
          </div>

          {/* Description Preview */}
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

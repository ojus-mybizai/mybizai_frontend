// Utility functions for handling image URLs from the backend

/**
 * Convert relative image paths to appropriate URLs based on demo mode
 * Demo mode: Uses Next.js public folder (/images/...)
 * Production: Uses backend static files (http://localhost:8000/uploads/...)
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  
  if (isDemoMode) {
    // In demo mode, use Next.js public folder for static images
    // Paths like "/images/samsung-s24-ultra.jpg" are served from public/images/
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  } else {
    // In production mode, prepend the backend base URL for uploaded files
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const baseUrl = API_BASE_URL.replace('/api/v1', '') // Remove API path for static files
    
    // Ensure the path starts with /
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    
    return `${baseUrl}${cleanPath}`
  }
}

/**
 * Get the first image URL from an array of image paths
 */
export const getFirstImageUrl = (images: string[]): string => {
  if (!images || images.length === 0) return ''
  return getImageUrl(images[0])
}

/**
 * Convert all image paths in an array to full URLs
 */
export const getImageUrls = (images: string[]): string[] => {
  if (!images || images.length === 0) return []
  return images.map(getImageUrl)
}

/**
 * Check if an image URL is valid (not empty and properly formatted)
 */
export const isValidImageUrl = (imageUrl: string): boolean => {
  if (!imageUrl) return false
  
  try {
    new URL(imageUrl)
    return true
  } catch {
    // If it's a relative path, check if it looks like a valid path
    return imageUrl.startsWith('/') && imageUrl.length > 1
  }
}

/**
 * Get a placeholder image URL for fallback cases
 */
export const getPlaceholderImageUrl = (): string => {
  return '/images/placeholder.jpg' // You can add a placeholder image to public/images/
}

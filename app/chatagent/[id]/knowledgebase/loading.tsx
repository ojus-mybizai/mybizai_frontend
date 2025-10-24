import { Brain, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Bases Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Counter */}
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>

              {/* Knowledge Base Grid */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded mt-1"></div>

                      <div className="flex-1 min-w-0">
                        {/* KB Header */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                        </div>

                        {/* Content Preview */}
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>

                        {/* Footer */}
                        <div className="flex items-center space-x-4 mt-3">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

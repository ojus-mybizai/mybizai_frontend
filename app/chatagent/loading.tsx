import { Bot, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Compact Page Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle Skeleton */}
          <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 w-10 h-8"></div>
            <div className="p-2 w-10 h-8 border-l border-gray-200 dark:border-gray-600"></div>
          </div>

          {/* Create Agent Button Skeleton */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
        </div>
      </div>

      {/* Loading State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>

                {/* Actions Dropdown Skeleton */}
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Capability */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>

              {/* Capabilities Summary */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>

              {/* Channels */}
              <div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                <div className="flex flex-wrap gap-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

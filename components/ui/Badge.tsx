import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'success'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

    const variants = {
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      outline: 'border border-gray-300 bg-transparent text-gray-700 dark:border-gray-600 dark:text-gray-300',
      destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }

    return (
      <span
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }

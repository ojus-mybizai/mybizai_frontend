'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = "Search catalog items..." }: SearchBarProps) {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleClear}
          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

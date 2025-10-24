'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit3 } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { Select } from './Select'

export interface KeyValuePair {
  id: string
  key: string
  value: any
  type: 'text' | 'number' | 'boolean' | 'date'
}

interface KeyValueEditorProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  className?: string
  placeholder?: {
    key?: string
    value?: string
  }
}

const typeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
]

export default function KeyValueEditor({ 
  data, 
  onChange, 
  className = '',
  placeholder = { key: 'Enter key', value: 'Enter value' }
}: KeyValueEditorProps) {
  const [pairs, setPairs] = useState<KeyValuePair[]>(() => {
    return Object.entries(data).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value,
      type: inferType(value)
    }))
  })

  const [editingId, setEditingId] = useState<string | null>(null)

  function inferType(value: any): 'text' | 'number' | 'boolean' | 'date' {
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('-')) return 'date'
    return 'text'
  }

  function convertValue(value: string, type: 'text' | 'number' | 'boolean' | 'date'): any {
    switch (type) {
      case 'number':
        return value === '' ? null : Number(value)
      case 'boolean':
        return value === 'true'
      case 'date':
        return value
      default:
        return value
    }
  }

  function formatValueForInput(value: any, type: 'text' | 'number' | 'boolean' | 'date'): string {
    if (value === null || value === undefined) return ''
    if (type === 'boolean') return String(value)
    return String(value)
  }

  const updateData = (newPairs: KeyValuePair[]) => {
    const newData: Record<string, any> = {}
    newPairs.forEach(pair => {
      if (pair.key.trim()) {
        newData[pair.key] = convertValue(String(pair.value), pair.type)
      }
    })
    onChange(newData)
  }

  const addPair = () => {
    const newPair: KeyValuePair = {
      id: crypto.randomUUID(),
      key: '',
      value: '',
      type: 'text'
    }
    const newPairs = [...pairs, newPair]
    setPairs(newPairs)
    setEditingId(newPair.id)
  }

  const removePair = (id: string) => {
    const newPairs = pairs.filter(pair => pair.id !== id)
    setPairs(newPairs)
    updateData(newPairs)
  }

  const updatePair = (id: string, updates: Partial<KeyValuePair>) => {
    const newPairs = pairs.map(pair => 
      pair.id === id ? { ...pair, ...updates } : pair
    )
    setPairs(newPairs)
    updateData(newPairs)
  }

  const handleKeyChange = (id: string, key: string) => {
    updatePair(id, { key })
  }

  const handleValueChange = (id: string, value: string) => {
    updatePair(id, { value })
  }

  const handleTypeChange = (id: string, type: 'text' | 'number' | 'boolean' | 'date') => {
    const pair = pairs.find(p => p.id === id)
    if (pair) {
      let newValue = pair.value
      if (type === 'boolean') {
        newValue = false
      } else if (type === 'number') {
        newValue = 0
      } else if (type === 'date') {
        newValue = new Date().toISOString().split('T')[0]
      } else {
        newValue = String(pair.value || '')
      }
      updatePair(id, { type, value: newValue })
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {pairs.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No custom fields added yet
          </div>
          <Button onClick={addPair} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      ) : (
        <>
          {pairs.map((pair) => (
            <div key={pair.id} className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              {/* Key Input */}
              <div className="flex-1">
                <Input
                  value={pair.key}
                  onChange={(e) => handleKeyChange(pair.id, e.target.value)}
                  placeholder={placeholder.key}
                  className="text-sm"
                />
              </div>

              {/* Type Selector */}
              <div className="w-24">
                <Select
                  options={typeOptions}
                  value={pair.type}
                  onChange={(e) => handleTypeChange(pair.id, e.target.value as any)}
                  className="text-sm"
                />
              </div>

              {/* Value Input */}
              <div className="flex-1">
                {pair.type === 'boolean' ? (
                  <Select
                    options={[
                      { value: 'true', label: 'True' },
                      { value: 'false', label: 'False' }
                    ]}
                    value={String(pair.value)}
                    onChange={(e) => handleValueChange(pair.id, e.target.value)}
                    className="text-sm"
                  />
                ) : (
                  <Input
                    type={pair.type === 'date' ? 'date' : pair.type === 'number' ? 'number' : 'text'}
                    value={formatValueForInput(pair.value, pair.type)}
                    onChange={(e) => handleValueChange(pair.id, e.target.value)}
                    placeholder={placeholder.value}
                    className="text-sm"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(editingId === pair.id ? null : pair.id)}
                  className="p-2"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removePair(pair.id)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addPair} variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </>
      )}
    </div>
  )
}

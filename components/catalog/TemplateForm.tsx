'use client'

import { useState } from 'react'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CatalogTemplate, CatalogTemplateField, CatalogTemplateRequest } from '@/lib/api'

interface TemplateFormProps {
  initialData?: CatalogTemplate
  onSubmit: (data: CatalogTemplateRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface FormField extends Omit<CatalogTemplateField, 'id'> {
  tempId: string
}

export default function TemplateForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  })
  
  const [fields, setFields] = useState<FormField[]>(
    initialData?.fields.map(field => ({
      ...field,
      tempId: crypto.randomUUID()
    })) || []
  )
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'date', label: 'Date' }
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required'
    }

    fields.forEach((field, index) => {
      if (!field.label.trim()) {
        newErrors[`field_${index}_label`] = 'Field label is required'
      }
      
      if (field.type === 'dropdown' && (!field.options || field.options.length === 0)) {
        newErrors[`field_${index}_options`] = 'Dropdown options are required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addField = () => {
    const newField: FormField = {
      tempId: crypto.randomUUID(),
      label: '',
      type: 'text',
      required: false,
      options: []
    }
    setFields(prev => [...prev, newField])
  }

  const removeField = (tempId: string) => {
    setFields(prev => prev.filter(field => field.tempId !== tempId))
  }

  const updateField = (tempId: string, updates: Partial<FormField>) => {
    setFields(prev => prev.map(field => 
      field.tempId === tempId ? { ...field, ...updates } : field
    ))
    
    // Clear related errors
    const fieldIndex = fields.findIndex(f => f.tempId === tempId)
    if (fieldIndex >= 0) {
      const errorKeys = Object.keys(errors).filter(key => key.startsWith(`field_${fieldIndex}_`))
      if (errorKeys.length > 0) {
        setErrors(prev => {
          const newErrors = { ...prev }
          errorKeys.forEach(key => delete newErrors[key])
          return newErrors
        })
      }
    }
  }

  const moveField = (tempId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.tempId === tempId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= fields.length) return

    const newFields = [...fields]
    const [movedField] = newFields.splice(currentIndex, 1)
    newFields.splice(newIndex, 0, movedField)
    setFields(newFields)
  }

  const addOption = (tempId: string) => {
    updateField(tempId, {
      options: [...(fields.find(f => f.tempId === tempId)?.options || []), '']
    })
  }

  const updateOption = (tempId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.tempId === tempId)
    if (!field) return

    const newOptions = [...(field.options || [])]
    newOptions[optionIndex] = value
    updateField(tempId, { options: newOptions })
  }

  const removeOption = (tempId: string, optionIndex: number) => {
    const field = fields.find(f => f.tempId === tempId)
    if (!field) return

    const newOptions = [...(field.options || [])]
    newOptions.splice(optionIndex, 1)
    updateField(tempId, { options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData: CatalogTemplateRequest = {
      name: formData.name,
      description: formData.description || undefined,
      fields: fields.map(({ tempId, ...field }) => field)
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Template Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="e.g., Product Template, Service Template"
          />
          
          <Textarea
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe what this template is used for..."
          />
        </CardContent>
      </Card>

      {/* Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Fields</CardTitle>
          <Button type="button" onClick={addField} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.fields && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.fields}</p>
          )}
          
          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No fields added yet. Click "Add Field" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.tempId} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Field {index + 1}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(field.tempId, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveField(field.tempId, 'down')}
                          disabled={index === fields.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(field.tempId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Field Label"
                        value={field.label}
                        onChange={(e) => updateField(field.tempId, { label: e.target.value })}
                        error={errors[`field_${index}_label`]}
                        placeholder="e.g., Brand, Size, Color"
                      />
                      
                      <Select
                        label="Field Type"
                        options={fieldTypeOptions}
                        value={field.type}
                        onChange={(e) => updateField(field.tempId, { 
                          type: e.target.value as FormField['type'],
                          options: e.target.value === 'dropdown' ? [''] : []
                        })}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.tempId, { required: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Required field
                        </span>
                      </label>
                    </div>
                    
                    {field.type === 'dropdown' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Options
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(field.tempId)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        
                        {errors[`field_${index}_options`] && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            {errors[`field_${index}_options`]}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          {(field.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(field.tempId, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(field.tempId, optionIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          {initialData ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  )
}

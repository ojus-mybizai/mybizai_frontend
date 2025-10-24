'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, Upload, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CatalogItem, CatalogItemRequest, CatalogTemplate, CatalogTemplateField } from '@/lib/api'

interface CatalogFormProps {
  initialData?: CatalogItem
  templates: CatalogTemplate[]
  onSubmit: (data: CatalogItemRequest, files: File[]) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface FormData extends Omit<CatalogItemRequest, 'template_fields'> {
  template_fields: Record<string, any>
}

export default function CatalogForm({ 
  initialData, 
  templates, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: CatalogFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<CatalogTemplate | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    price: initialData?.price || 0,
    currency: initialData?.currency || 'USD',
    availability: initialData?.availability || 'available',
    type: initialData?.type || 'product',
    images: initialData?.images || [],
    template_fields: initialData?.template_fields || {}
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Name, description, and pricing' },
    { number: 2, title: 'Template Fields', description: 'Custom fields from your template' },
    { number: 3, title: 'Review & Submit', description: 'Confirm all details' }
  ]

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'discontinued', label: 'Discontinued' }
  ]

  const typeOptions = [
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' }
  ]

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' }
  ]

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0])
    }
  }, [templates, selectedTemplate])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
      if (!formData.category.trim()) newErrors.category = 'Category is required'
      if (formData.price <= 0) newErrors.price = 'Price must be greater than 0'
    }

    if (step === 2 && selectedTemplate) {
      selectedTemplate.fields.forEach(field => {
        if (field.required && !formData.template_fields[field.id]) {
          newErrors[`template_${field.id}`] = `${field.label} is required`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleTemplateFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      template_fields: { ...prev.template_fields, [fieldId]: value }
    }))
    if (errors[`template_${fieldId}`]) {
      setErrors(prev => ({ ...prev, [`template_${fieldId}`]: '' }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Filter for image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    setSelectedFiles(prev => [...prev, ...imageFiles])
    
    // Create preview URLs
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      const submitData: CatalogItemRequest = {
        ...formData,
        images: [], // Will be populated after file uploads
        template_fields: Object.keys(formData.template_fields).length > 0 ? formData.template_fields : undefined
      }
      await onSubmit(submitData, selectedFiles)
    }
  }

  const renderTemplateField = (field: CatalogTemplateField) => {
    const value = formData.template_fields[field.id] || ''
    const error = errors[`template_${field.id}`]

    switch (field.type) {
      case 'text':
        return (
          <Input
            label={field.label}
            value={value}
            onChange={(e) => handleTemplateFieldChange(field.id, e.target.value)}
            error={error}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            label={field.label}
            value={value}
            onChange={(e) => handleTemplateFieldChange(field.id, parseFloat(e.target.value) || 0)}
            error={error}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            value={value}
            onChange={(e) => handleTemplateFieldChange(field.id, e.target.value)}
            error={error}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      
      case 'dropdown':
        return (
          <Select
            label={field.label}
            options={[
              { value: '', label: `Select ${field.label.toLowerCase()}` },
              ...(field.options || []).map(opt => ({ value: opt, label: opt }))
            ]}
            value={value}
            onChange={(e) => handleTemplateFieldChange(field.id, e.target.value)}
            error={error}
          />
        )
      
      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
            <Select
              options={[
                { value: '', label: 'Select option' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' }
              ]}
              value={value.toString()}
              onChange={(e) => handleTemplateFieldChange(field.id, e.target.value === 'true')}
              error={error}
            />
          </div>
        )
      
      case 'date':
        return (
          <Input
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => handleTemplateFieldChange(field.id, e.target.value)}
            error={error}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}>
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Item Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Enter item name"
                />
                
                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  error={errors.category}
                  placeholder="e.g., Electronics, Clothing, Services"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    error={errors.price}
                    placeholder="0.00"
                  />
                  
                  <Select
                    label="Currency"
                    options={currencyOptions}
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Type"
                    options={typeOptions}
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  />
                  
                  <Select
                    label="Availability"
                    options={availabilityOptions}
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  placeholder="Describe your item..."
                  className="min-h-[120px]"
                />
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Images
                  </label>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upload multiple images for your catalog item
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Images
                      </label>
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                                className="bg-white text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {selectedFiles[index]?.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No template defined. Please create one in Catalog Templates.
                  </p>
                  <Button variant="outline" onClick={() => window.open('/catalog/templates', '_blank')}>
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {templates.length > 1 && (
                    <Select
                      label="Select Template"
                      options={templates.map(t => ({ value: t.id, label: t.name }))}
                      value={selectedTemplate?.id || ''}
                      onChange={(e) => {
                        const template = templates.find(t => t.id === e.target.value)
                        setSelectedTemplate(template || null)
                      }}
                    />
                  )}
                  
                  {selectedTemplate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedTemplate.fields.map((field) => (
                        <div key={field.id}>
                          {renderTemplateField(field)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {formData.name}</div>
                    <div><span className="font-medium">Category:</span> {formData.category}</div>
                    <div><span className="font-medium">Price:</span> {formData.currency} {formData.price}</div>
                    <div><span className="font-medium">Type:</span> {formData.type}</div>
                    <div><span className="font-medium">Availability:</span> {formData.availability}</div>
                    <div><span className="font-medium">Description:</span> {formData.description}</div>
                    {selectedFiles.length > 0 && (
                      <div><span className="font-medium">Images:</span> {selectedFiles.length} file(s) selected</div>
                    )}
                  </div>
                </div>
                
                {selectedTemplate && Object.keys(formData.template_fields).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Template Fields</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTemplate.fields.map((field) => {
                        const value = formData.template_fields[field.id]
                        if (value !== undefined && value !== '') {
                          return (
                            <div key={field.id}>
                              <span className="font-medium">{field.label}:</span> {value.toString()}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
        </Button>
        
        <Button
          onClick={currentStep === 3 ? handleSubmit : handleNext}
          isLoading={isLoading}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <span>{currentStep === 3 ? 'Submit' : 'Next'}</span>
          {currentStep < 3 && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

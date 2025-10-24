'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useContactStore } from '@/lib/stores'
import { crmApi, ApiError, ContactCreate } from '@/lib/api'

export default function NewContactPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { addContact } = useContactStore()

  const [formData, setFormData] = useState<ContactCreate>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    notes: '',
    metadata: {}
  })

  const [metadataEntries, setMetadataEntries] = useState<Array<{ key: string; value: string }>>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be 20 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ContactCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddMetadata = () => {
    setMetadataEntries(prev => [...prev, { key: '', value: '' }])
  }

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    setMetadataEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const handleRemoveMetadata = (index: number) => {
    setMetadataEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !accessToken) return

    setIsSubmitting(true)
    try {
      // Build metadata object from entries
      const metadata: Record<string, any> = {}
      metadataEntries.forEach(entry => {
        if (entry.key.trim() && entry.value.trim()) {
          metadata[entry.key.trim()] = entry.value.trim()
        }
      })

      const submitData: ContactCreate = {
        ...formData,
        metadata
      }

      const newContact = await crmApi.createContact(submitData, accessToken)
      addContact(newContact)
      router.push('/contacts')
    } catch (error) {
      console.error('Failed to create contact:', error)
      if (error instanceof ApiError) {
        alert(`Failed to create contact: ${error.message}`)
      } else {
        alert('Failed to create contact. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.push('/contacts')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contacts</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Contact</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new contact in your CRM
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Full Name *"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  error={errors.full_name}
                  placeholder="Enter full name"
                />
              </div>
              
              <Input
                label="Phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={errors.phone}
                placeholder="+1 (555) 123-4567"
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="contact@example.com"
              />
              
              <Input
                label="Company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company name"
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this contact..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Custom Fields
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMetadata}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Field</span>
                </Button>
              </div>
              
              {metadataEntries.length > 0 && (
                <div className="space-y-3">
                  {metadataEntries.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        placeholder="Field name"
                        value={entry.key}
                        onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Field value"
                        value={entry.value}
                        onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMetadata(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {metadataEntries.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No custom fields added. Click "Add Field" to create custom metadata for this contact.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/contacts')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Create Contact</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Save, Plus, X, Phone, Mail, Building, MapPin, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useContactStore } from '@/lib/stores'
import { crmApi, ApiError, Contact, ContactUpdate } from '@/lib/api'

export default function ContactDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuthStore()
  const { contacts, updateContact } = useContactStore()

  const [contact, setContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ContactUpdate>({})
  const [metadataEntries, setMetadataEntries] = useState<Array<{ key: string; value: string }>>([])

  useEffect(() => {
    if (params.id) {
      fetchContact(Number(params.id))
    }
  }, [params.id, accessToken])

  const fetchContact = async (id: number) => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const contactData = await crmApi.getContact(id, accessToken)
      setContact(contactData)

      // Initialize form data
      setFormData({
        full_name: contactData.full_name,
        phone: contactData.phone,
        email: contactData.email,
        address: contactData.address,
        company: contactData.company,
        notes: contactData.notes,
        metadata: contactData.metadata
      })

      // Initialize metadata entries
      const entries = Object.entries(contactData.metadata || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }))
      setMetadataEntries(entries)
    } catch (error) {
      console.error('Failed to fetch contact:', error)
      if (error instanceof ApiError && error.status === 404) {
        alert('Contact not found')
        router.push('/contacts')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name?.trim()) {
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

  const handleInputChange = (field: keyof ContactUpdate, value: string) => {
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

  const handleSave = async () => {
    if (!validateForm() || !accessToken || !contact) return

    setIsSubmitting(true)
    try {
      // Build metadata object from entries
      const metadata: Record<string, any> = {}
      metadataEntries.forEach(entry => {
        if (entry.key.trim() && entry.value.trim()) {
          metadata[entry.key.trim()] = entry.value.trim()
        }
      })

      const updateData: ContactUpdate = {
        ...formData,
        metadata
      }

      const updatedContact = await crmApi.updateContact(contact.id, updateData, accessToken)
      setContact(updatedContact)
      updateContact(contact.id, updatedContact)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update contact:', error)
      if (error instanceof ApiError) {
        alert(`Failed to update contact: ${error.message}`)
      } else {
        alert('Failed to update contact. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (contact) {
      setFormData({
        full_name: contact.full_name,
        phone: contact.phone,
        email: contact.email,
        address: contact.address,
        company: contact.company,
        notes: contact.notes,
        metadata: contact.metadata
      })

      const entries = Object.entries(contact.metadata || {}).map(([key, value]) => ({
        key,
        value: String(value)
      }))
      setMetadataEntries(entries)
    }
    setIsEditing(false)
    setErrors({})
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading contact...</div>
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Contact not found
        </h3>
        <Button onClick={() => router.push('/contacts')}>
          Back to Contacts
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {contact.full_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Contact Details
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Contact</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Full Name *"
                      value={formData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      error={errors.full_name}
                    />
                  </div>
                  
                  <Input
                    label="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                  />
                  
                  <Input
                    label="Company"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Textarea
                      label="Notes"
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{contact.full_name}</h2>
                      {contact.company && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {contact.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {contact.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {contact.address && (
                      <div className="flex items-center space-x-3 md:col-span-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p>{contact.address}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {contact.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {contact.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Custom Fields</CardTitle>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMetadata}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Field</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
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
                  {metadataEntries.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No custom fields. Click "Add Field" to create custom metadata.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(contact.metadata || {}).length > 0 ? (
                    Object.entries(contact.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No custom fields defined</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm">
                    {new Date(contact.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

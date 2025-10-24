'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Save, Phone, Mail, MapPin, Calendar, Target, DollarSign, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useLeadStore } from '@/lib/store'
import { crmApi, ApiError, Lead, LeadUpdate, LeadStatus, LeadSource, PropertyType, LeadPriority } from '@/lib/api'

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const sourceOptions = [
  { value: 'portal', label: 'Portal' },
  { value: 'website', label: 'Website' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'ad_campaign', label: 'Ad Campaign' },
]

const propertyTypeOptions = [
  { value: '', label: 'Select property type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plot', label: 'Plot' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
]

const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'converted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const getPriorityColor = (priority: LeadPriority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { accessToken } = useAuthStore()
  const { currentLead, setCurrentLead, updateLead } = useLeadStore()

  const [lead, setLead] = useState<Lead | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<LeadUpdate>({})

  useEffect(() => {
    if (params.id) {
      fetchLead(Number(params.id))
    }
  }, [params.id, accessToken])

  const fetchLead = async (id: number) => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const leadData = await crmApi.getLead(id, accessToken)
      setLead(leadData)
      setCurrentLead(leadData)
      
      // Initialize form data
      setFormData({
        full_name: leadData.full_name,
        phone: leadData.phone,
        email: leadData.email,
        source: leadData.source,
        status: leadData.status,
        priority: leadData.priority,
        budget_min: leadData.budget_min,
        budget_max: leadData.budget_max,
        preferred_location: leadData.preferred_location,
        property_type: leadData.property_type,
        notes: leadData.notes,
      })
    } catch (error) {
      console.error('Failed to fetch lead:', error)
      if (error instanceof ApiError && error.status === 404) {
        alert('Lead not found')
        router.push('/leads')
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

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (formData.phone.length < 10 || formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be between 10-20 characters'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.budget_min && formData.budget_max && formData.budget_min > formData.budget_max) {
      newErrors.budget_max = 'Maximum budget must be greater than minimum budget'
    }

    if (formData.budget_min && formData.budget_min < 0) {
      newErrors.budget_min = 'Budget must be a positive number'
    }

    if (formData.budget_max && formData.budget_max < 0) {
      newErrors.budget_max = 'Budget must be a positive number'
    }

    if (formData.preferred_location && formData.preferred_location.length > 200) {
      newErrors.preferred_location = 'Preferred location must be 200 characters or less'
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LeadUpdate, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSave = async () => {
    if (!validateForm() || !accessToken || !lead) return

    setIsSubmitting(true)
    try {
      const updateData: LeadUpdate = {
        ...formData,
        email: formData.email || undefined,
        budget_min: formData.budget_min || undefined,
        budget_max: formData.budget_max || undefined,
        preferred_location: formData.preferred_location || undefined,
        property_type: formData.property_type || undefined,
        notes: formData.notes || undefined,
      }

      const updatedLead = await crmApi.updateLead(lead.id, updateData, accessToken)
      setLead(updatedLead)
      updateLead(lead.id, updatedLead)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update lead:', error)
      if (error instanceof ApiError) {
        alert(`Failed to update lead: ${error.message}`)
      } else {
        alert('Failed to update lead. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (lead) {
      setFormData({
        full_name: lead.full_name,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        status: lead.status,
        priority: lead.priority,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        preferred_location: lead.preferred_location,
        property_type: lead.property_type,
        notes: lead.notes,
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lead...</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Lead not found
        </h3>
        <Button onClick={() => router.push('/leads')}>
          Back to Leads
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/leads')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Leads</span>
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lead.full_name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                {lead.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                {lead.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Lead Details
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Lead</span>
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
              <CardTitle>Lead Information</CardTitle>
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
                    label="Phone *"
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
                  
                  <Select
                    label="Source"
                    options={sourceOptions}
                    value={formData.source || ''}
                    onChange={(e) => handleInputChange('source', e.target.value as LeadSource)}
                    error={errors.source}
                  />
                  
                  <Select
                    label="Property Type"
                    options={propertyTypeOptions}
                    value={formData.property_type || ''}
                    onChange={(e) => handleInputChange('property_type', e.target.value as PropertyType || undefined)}
                    error={errors.property_type}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Preferred Location"
                      value={formData.preferred_location || ''}
                      onChange={(e) => handleInputChange('preferred_location', e.target.value)}
                      error={errors.preferred_location}
                    />
                  </div>
                  
                  <Input
                    label="Minimum Budget (₹)"
                    type="number"
                    value={formData.budget_min || ''}
                    onChange={(e) => handleInputChange('budget_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                    error={errors.budget_min}
                  />
                  
                  <Input
                    label="Maximum Budget (₹)"
                    type="number"
                    value={formData.budget_max || ''}
                    onChange={(e) => handleInputChange('budget_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                    error={errors.budget_max}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">{lead.full_name}</h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Lead from {lead.source.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-medium">
                          {lead.phone}
                        </a>
                      </div>
                    </div>

                    {lead.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                            {lead.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {lead.property_type && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Property Type</p>
                          <p className="font-medium capitalize">{lead.property_type}</p>
                        </div>
                      </div>
                    )}

                    {lead.preferred_location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Preferred Location</p>
                          <p className="font-medium">{lead.preferred_location}</p>
                        </div>
                      </div>
                    )}

                    {(lead.budget_min || lead.budget_max) && (
                      <div className="flex items-center space-x-3 md:col-span-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Budget Range</p>
                          <p className="font-medium">
                            {lead.budget_min && lead.budget_max
                              ? `₹${lead.budget_min.toLocaleString()} - ₹${lead.budget_max.toLocaleString()}`
                              : lead.budget_min
                              ? `₹${lead.budget_min.toLocaleString()}+`
                              : `Up to ₹${lead.budget_max?.toLocaleString()}`
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <Textarea
                    label="Notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    error={errors.notes}
                    className="min-h-[120px]"
                    placeholder="Additional information about this lead..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.notes?.length || 0}/2000 characters
                  </p>
                </div>
              ) : (
                <div>
                  {lead.notes ? (
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {lead.notes}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes added</p>
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
              <CardTitle>Lead Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value as LeadStatus)}
                    error={errors.status}
                  />
                  
                  <Select
                    label="Priority"
                    options={priorityOptions}
                    value={formData.priority || ''}
                    onChange={(e) => handleInputChange('priority', e.target.value as LeadPriority)}
                    error={errors.priority}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                        {lead.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {lead.user_id && (
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium">User ID: {lead.user_id}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

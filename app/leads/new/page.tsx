'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useLeadStore } from '@/lib/stores'
import { crmApi, ApiError, LeadCreate, LeadStatus, LeadSource, LeadPriority } from '@/lib/api'
import KeyValueEditor from '@/components/ui/KeyValueEditor'

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
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


export default function NewLeadPage() {
  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { addLead } = useLeadStore()

  const [formData, setFormData] = useState<LeadCreate>({
    name: '',
    phone: '',
    email: '',
    source: 'website',
    status: 'new',
    priority: 'medium',
    notes: '',
    extra_data: {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (formData.phone.length < 10 || formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be between 10-20 characters'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }


    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof LeadCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !accessToken) return

    setIsSubmitting(true)
    try {
      const submitData: LeadCreate = {
        ...formData,
        email: formData.email || undefined,
        notes: formData.notes || undefined,
        extra_data: formData.extra_data || {},
      }

      const newLead = await crmApi.createLead(submitData, accessToken)
      addLead(newLead)
      router.push('/leads')
    } catch (error) {
      console.error('Failed to create lead:', error)
      if (error instanceof ApiError) {
        alert(`Failed to create lead: ${error.message}`)
      } else {
        alert('Failed to create lead. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Lead</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new sales lead in your CRM
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Full Name *"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={errors.name}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <Input
                    label="Phone *"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    placeholder="+91 9999999999"
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    placeholder="lead@example.com"
                  />
                  
                  <Select
                    label="Source *"
                    options={sourceOptions}
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value as LeadSource)}
                    error={errors.source}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <KeyValueEditor
                  data={formData.extra_data || {}}
                  onChange={(data) => handleInputChange('extra_data', data)}
                  placeholder={{
                    key: 'Field name (e.g., budget, location, interest)',
                    value: 'Field value'
                  }}
                />
                <p className="text-sm text-gray-500">
                  Add custom fields to capture specific information about this lead (budget, preferences, product interest, etc.).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  error={errors.notes}
                  placeholder="Additional information about this lead, requirements, preferences, etc."
                  className="min-h-[120px]"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {formData.notes?.length || 0}/2000 characters
                </p>
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
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status || 'new'}
                  onChange={(e) => handleInputChange('status', e.target.value as LeadStatus)}
                  error={errors.status}
                />
                
                <Select
                  label="Priority"
                  options={priorityOptions}
                  value={formData.priority || 'medium'}
                  onChange={(e) => handleInputChange('priority', e.target.value as LeadPriority)}
                  error={errors.priority}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Required Fields</h4>
                  <p>Full name, phone, and source are required to create a lead.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Custom Fields</h4>
                  <p>Use custom fields to capture specific information like budget, preferences, or product interest.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Lead Status</h4>
                  <p>Track progress from "New" → "Contacted" → "Qualified" → "Won/Lost".</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/leads')}
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
            <span>Create Lead</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

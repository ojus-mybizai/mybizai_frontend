'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, MapPin, Users, Briefcase, Phone, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useBusinessStore, useUserStore } from '@/lib/stores'
import { authApi, ApiError } from '@/lib/api'

const businessTypeOptions = [
  { value: 'service', label: 'Service-based' },
  { value: 'product', label: 'Product-based' },
  { value: 'both', label: 'Both Service & Product' },
]

const employeeCountOptions = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2-5 employees' },
  { value: '6-10', label: '6-10 employees' },
  { value: '11-25', label: '11-25 employees' },
  { value: '26-50', label: '26-50 employees' },
  { value: '51-100', label: '51-100 employees' },
  { value: '100+', label: '100+ employees' },
]

export default function OnboardingForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const { accessToken } = useAuthStore()
  const { setUser } = useUserStore()
  const { businessData, updateBusinessData, setBusinessInfo, completeOnboarding } = useBusinessStore()

  console.log('📋 ONBOARDING FORM INITIAL STATE:')
  console.log('🔑 Access Token:', accessToken ? 'Available' : 'Missing')
  console.log('🏢 Business Data:', businessData)

  const validateForm = () => {
    if (!businessData) {
      console.log('❌ VALIDATION: No business data available')
      return false
    }

    const newErrors: Record<string, string> = {}

    if (!businessData.name.trim()) {
      newErrors.name = 'Business name is required'
    }

    if (!businessData.business_type) {
      newErrors.business_type = 'Please select business type'
    }

    if (!businessData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    }

    console.log('🔍 FORM VALIDATION:')
    console.log('📊 Business Data State:', businessData)
    console.log('❌ Validation Errors:', newErrors)
    console.log('✅ Validation Result:', Object.keys(newErrors).length === 0)

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 ONBOARDING FORM SUBMIT STARTED')
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      console.log('🛑 FORM VALIDATION FAILED - Submission stopped')
      return
    }

    console.log('✅ FORM VALIDATION PASSED - Proceeding with submission')
    setIsLoading(true)

    try {
      // Try to send to backend, but continue even if it fails
      if (accessToken) {
        try {
          const requestPayload = {
            name: businessData?.name || '',
            business_type: businessData?.business_type as 'product' | 'service' | 'both',
            phone_number: businessData?.phone_number || '',
            ...(businessData?.number_of_employees && { number_of_employees: businessData.number_of_employees }),
            ...(businessData?.description && { description: businessData.description }),
            ...(businessData?.address && { address: businessData.address }),
            ...(businessData?.website && { website: businessData.website }),
          }

          console.log('🚀 ONBOARDING REQUEST DEBUG:')
          console.log('📡 Endpoint: POST /api/v1/business/onboarding')
          console.log('🔐 Authorization: Bearer [TOKEN PROVIDED]')
          console.log('📦 Request Payload:', JSON.stringify(requestPayload, null, 2))
          console.log('🏢 Full Business Data State:', JSON.stringify(businessData, null, 2))

          const Business_onboarding_response = await authApi.businessOnboarding(
            requestPayload,
            accessToken
          )

          console.log('✅ ONBOARDING RESPONSE:', JSON.stringify(Business_onboarding_response, null, 2))

          if (Business_onboarding_response.business_onboarded) {
            setBusinessInfo(Business_onboarding_response)
            // Refresh user + businesses from backend to reflect onboarding completion
            try {
              const me = await authApi.getMe(accessToken)
              setUser(me)
            } catch (e) {
              console.warn('Failed to refresh user after onboarding:', e)
            }
            router.push('/dashboard')
            return
          }
        } catch (error) {
          console.warn('❌ ONBOARDING API ERROR:', error)
          // Display specific error message if available
          if (error instanceof Error) {
            console.log('📝 Error message:', error.message)
            setApiError(error.message)
          } else {
            console.log('📝 Unknown error type:', error)
            setApiError('Failed to save business information. Please check your data and try again.')
          }
          return // Don't continue to fallback if backend fails
        }
      }

      // Fallback: Mark onboarding as complete locally
      completeOnboarding()
      // Try to refresh user if we have a token
      if (accessToken) {
        try {
          const me = await authApi.getMe(accessToken)
          setUser(me)
        } catch (e) {
          console.warn('Failed to refresh user after onboarding (fallback):', e)
        }
      }
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message)
      } else {
        setApiError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
      console.log('🏁 ONBOARDING FORM SUBMIT COMPLETED')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    updateBusinessData({ [field]: value })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    if (apiError) setApiError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tell us about your business
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Help us customize your experience by sharing some details about your business
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {apiError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Building2 className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Business Name"
                  placeholder="Enter your business name"
                  value={businessData?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Website (Optional)"
                  placeholder="https://yourwebsite.com"
                  value={businessData?.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative md:col-span-2">
                <MapPin className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Business Address (Optional)"
                  placeholder="Full business address"
                  value={businessData?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-8 h-4 w-4 text-gray-400 z-10" />
                <Select
                  label="Number of Employees (Optional)"
                  placeholder="Select team size"
                  options={employeeCountOptions}
                  value={businessData?.number_of_employees || ''}
                  onChange={(e) => handleInputChange('number_of_employees', e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-3 top-8 h-4 w-4 text-gray-400 z-10" />
                <Select
                  label="Type of Business"
                  placeholder="Select business type"
                  options={businessTypeOptions}
                  value={businessData?.business_type || ''}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  error={errors.business_type}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                <Input
                  label="Phone Number"
                  placeholder="Your business phone"
                  value={businessData?.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  error={errors.phone_number}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="relative">
              <FileText className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
              <Textarea
                label="Business Description (Optional)"
                placeholder="Tell us about your business..."
                value={businessData?.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="pl-10 min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

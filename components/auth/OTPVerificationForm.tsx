'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useUserStore } from '@/lib/stores'
import { authApi } from '@/lib/api'
import { ApiError } from '@/lib/api'

export default function OTPVerificationForm() {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [apiError, setApiError] = useState('')
  const [error, setError] = useState('')
  const [resendMessage, setResendMessage] = useState('')

  const router = useRouter()
  const params = useSearchParams()
  const userId = params.get('user_id') || ''
  const email = params.get('email') || ''
  const reason = params.get('reason') || ''

  console.log('🚀 OTPVerificationForm initialized with URL params:', {
    userId,
    email,
    reason,
    fullURL: window.location.href
  })
  const { login } = useAuthStore()
  const { setUser } = useUserStore()

  // For login_required flow, we might not have user_id but we need email
  if (!email || (!userId && reason !== 'login_required')) {
    router.push('/signup')
    return null
  }

  const validateForm = () => {
    if (!verificationCode.trim()) {
      setError('Verification code is required')
      return false
    }
    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits')
      return false
    }
    setError('')
    return true
  }

  // Validate user_id - handle all edge cases
  const validateAndParseUserId = (userIdParam: string | null): number | null => {
    console.log('🔍 Validating user_id:', {
      userIdParam,
      type: typeof userIdParam,
      length: userIdParam?.length,
      isEmpty: !userIdParam
    })

    if (!userIdParam) {
      console.log('❌ user_id is missing or empty')
      return null // Missing user_id
    }

    const parsed = parseInt(userIdParam)
    console.log('🔢 parseInt result:', {
      parsed,
      isNaN: isNaN(parsed),
      isPositive: parsed > 0
    })

    if (isNaN(parsed) || parsed <= 0) {
      console.log('❌ user_id validation failed:', {
        reason: isNaN(parsed) ? 'not a number' : 'not positive',
        parsed
      })
      return null // Invalid user_id
    }

    console.log('✅ user_id validation passed:', parsed)
    return parsed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Validate and parse user_id for all scenarios
      const parsedUserId = validateAndParseUserId(userId)

      if (parsedUserId === null) {
        if (reason === 'login_required') {
          // For login_required flow with missing/invalid user_id,
          // don't redirect back to login (creates loop)
          // Instead, ask user to try logging in again
          setApiError('Unable to verify your account. Please try logging in again.')
          // Don't redirect automatically - let user manually go back to login
          return
        } else {
          setApiError('Invalid verification link. Please try signing up again.')
          setTimeout(() => router.push('/signup'), 2000)
          return
        }
      }

      console.log('Submitting OTP verification with:', {
        user_id: parsedUserId,
        code: verificationCode,
        reason,
        userIdFromParams: userId
      })

      const response = await authApi.verifyEmail({
        user_id: parsedUserId,
        code: verificationCode,
      })

      console.log('OTP verification successful:', response)

      // Store tokens only
      login(response.access_token, response.token_type)

      // Fetch user profile + businesses
      try {
        const me = await authApi.getMe(response.access_token)
        // Populate user store
        setUser(me)
      } catch (e) {
        console.warn('Failed to fetch user after verification:', e)
      }

      // Redirect based on onboarding requirement
      if (response.onboarding_required) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('OTP verification error:', error)

      if (error instanceof ApiError) {
        console.error('API Error details:', {
          status: error.status,
          message: error.message,
          details: error.details
        })

        // Handle specific backend errors
        if (error.status === 422) {
          if (error.message.toLowerCase().includes('user_id')) {
            setApiError('Invalid verification link. Please try signing up again.')
          } else if (error.message.toLowerCase().includes('code')) {
            setApiError('Invalid verification code. Please check and try again.')
          } else {
            setApiError('Verification failed. Please check your details and try again.')
          }
        } else if (error.status === 404) {
          setApiError('User not found. Please try signing up again.')
        } else if (error.status === 401) {
          setApiError('Verification expired. Please try logging in again.')
        } else {
          setApiError(error.message || 'Verification failed. Please try again.')
        }
      } else {
        console.error('Non-API Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
        setApiError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(numericValue)
    if (error) setError('')
    if (apiError) setApiError('')
  }

  const handleBackToSignup = () => {
    router.push('/signup')
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setApiError('')
    setResendMessage('')

    try {
      // For login_required scenario, we might not have user_id
      if (reason === 'login_required' && !userId) {
        setApiError('Please try logging in again to get a new verification code.')
        // Don't redirect automatically - let user manually go back to login
        return
      }

      // Validate and parse user_id for resend
      const parsedUserId = validateAndParseUserId(userId)

      if (parsedUserId === null) {
        setApiError('Invalid verification link. Please try signing up again.')
        setTimeout(() => router.push('/signup'), 2000)
        return
      }

      console.log('Resending OTP for user_id:', parsedUserId)

      const response = await authApi.resendOTP(parsedUserId)
      console.log('OTP resend successful:', response)
      setResendMessage(response.message || 'Verification code sent successfully!')
    } catch (error) {
      console.error('OTP resend error:', error)

      if (error instanceof ApiError) {
        console.error('API Error details:', {
          status: error.status,
          message: error.message,
          details: error.details
        })

        if (error.status === 404) {
          setApiError('User not found. Please try signing up again.')
        } else if (error.status === 429) {
          setApiError('Too many requests. Please wait a few minutes before trying again.')
        } else {
          setApiError(error.message || 'Failed to resend code. Please try again.')
        }
      } else {
        console.error('Non-API Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to resend code. Please try again.'
        setApiError(errorMessage)
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Verify Your Email
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {email}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {apiError}
              </div>
            )}

            {resendMessage && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                {resendMessage}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => handleInputChange(e.target.value)}
                error={error}
                className="pl-10 text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code? Check your spam folder
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={isResending || isLoading}
                  className="flex items-center space-x-2 mx-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Resending...' : 'Resend Code'}</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackToSignup}
                  className="flex items-center space-x-2 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Signup</span>
                </Button>

                {/* Show Back to Login button for login_required scenario */}
                {reason === 'login_required' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/login')}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

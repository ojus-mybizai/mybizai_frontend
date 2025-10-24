'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore, useUserStore, useBusinessStore } from '@/lib/stores'
import { isValidEmail } from '@/lib/validation'
import { authApi, LoginApiResponse, UnverifiedUserResponse, ApiError } from '@/lib/api'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const setUser = useUserStore((state) => state.setUser)
  const setActiveBusiness = useBusinessStore((state) => state.setActiveBusiness)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    // Basic validation
    const validationErrors: Record<string, string> = {};
    if (!formData.email) {
      validationErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Make the login request using authApi
      const loginResponse = await authApi.login({
        email: formData.email,
        password: formData.password,
      });
      console.log(loginResponse)

      if ('verification_required' in loginResponse && loginResponse.verification_required) {
        const params = new URLSearchParams({
          email: formData.email,
          user_id: String(loginResponse.user_id),
          reason: 'login_required'
        });

        router.push(`/verify-email?${params.toString()}`);
        return;
      }

      // Login successful - store token in localStorage and update auth state
      if (!('access_token' in loginResponse)) {
        throw new Error('Invalid login response - missing access token');
      }

      login(loginResponse.access_token, loginResponse.token_type || 'bearer');

      // Store token in localStorage for API calls
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', loginResponse.access_token);
      }

      // Fetch user data using the token
      const userResponse = await authApi.getMe(loginResponse.access_token);

      console.log('User data fetched successfully:', userResponse)

      if (!userResponse) {
        throw new Error('Failed to load user data');
      }

      // Set user data in the store
      setUser({
        id: userResponse.id,
        email: userResponse.email,
        full_name: userResponse.full_name || '',
        phone_number: userResponse.phone_number || '',
        businesses: userResponse.businesses || []
      });


      // Set businesses if they exist
      if (userResponse.businesses && userResponse.businesses.length > 0) {
        let business_data = {
          id: userResponse.businesses[0].id,
          owner_id: userResponse.businesses[0].owner_id,
          name: userResponse.businesses[0].name,
          website: userResponse.businesses[0].website,
          address: userResponse.businesses[0].address,
          phone_number: userResponse.businesses[0].phone_number,
          number_of_employees: userResponse.businesses[0].number_of_employees,
          type: userResponse.businesses[0].type,
          business_type: userResponse.businesses[0].business_type,
          description: userResponse.businesses[0].description,
          extra_data: userResponse.businesses[0].extra_data,
          onboarding_completed: userResponse.businesses[0].onboarding_completed,
          created_at: userResponse.businesses[0].created_at,
          updated_at: userResponse.businesses[0].updated_at
        }
        setActiveBusiness(business_data);
      }

      // Redirect based on onboarding status
      const hasBusinesses = userResponse.businesses && userResponse.businesses.length > 0;
      router.push(hasBusinesses ? '/dashboard' : '/onboarding');

    } catch (error: any) {
      console.error('Login error:', error);

      // Handle different error types based on backend specification
      if (error instanceof ApiError) {
        if (error.status === 401) {
          // Authentication failure - invalid credentials
          setApiError('Invalid email or password. Please try again.');
        } else {
          // Other API errors
          setApiError(error.message || 'Login failed. Please try again.');
        }
      } else {
        // Network or other errors
        setApiError('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: '' }));
    if (apiError) setApiError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 p-4">
{/* {{ ... }} */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {apiError}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                className="pl-10 text-black"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                className="pl-10 pr-10 text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </div>
    
  )
}

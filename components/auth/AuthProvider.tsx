'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useUserStore } from '@/lib/stores/userStore'
import { useThemeStore } from '@/lib/stores/themeStore'
import { authApi } from '@/lib/api'
import { apiClient } from '@/lib/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
// import { initializeMockData } from '@/lib/initializeMockData'
import { isDemoMode } from '@/lib/apiWrapper'
import { useToast } from '@/components/ui/Toast'

interface AuthProviderProps {
  children: ReactNode
}

const publicRoutes = ['/login', '/signup', '/verify-email']
const protectedRoutes = ['/dashboard', '/onboarding', '/catalog', '/contacts', '/leads', '/chatagent', '/teams', '/campaigns', '/analytics', '/settings', '/knowledge_base', '/integrations', '/billing']

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, logout, initAuth } = useAuthStore()
  const { user, setUser } = useUserStore()
  const { theme } = useThemeStore()
  const { showToast } = useToast()

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initAuth();
      } catch (error) {
        console.error('Error initializing auth:', error);
        showToast({
          type: 'error',
          title: 'Authentication Error',
          message: 'Failed to initialize authentication. Please refresh the page.'
        })
      }
    };

    initializeAuth();
  }, [initAuth, showToast]);

  // Handle route protection and redirections
  useEffect(() => {
    // Don't run on server
    if (typeof window === 'undefined') return;

    const isPublicRoute = publicRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.includes(pathname);
    const isRoot = pathname === '/';

    // If we're still initializing, don't do anything yet
    if (isAuthenticated === undefined) return;

    // Handle root route
    if (isRoot) {
      if (isAuthenticated) {
        if (user?.businesses?.length === 0) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
      return;
    }

    // Handle protected routes
    if (!isAuthenticated && isProtectedRoute) {
      router.push('/login');
      return;
    }

    // Handle authenticated users trying to access public routes
    if (isAuthenticated && isPublicRoute && pathname !== '/verify-email') {
      // Require onboarding if user has no businesses
      if (user?.businesses?.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // If user is authenticated but hasn't completed onboarding (no businesses)
    if (isAuthenticated && pathname !== '/onboarding' && (!user?.businesses || user.businesses.length === 0)) {
      router.push('/onboarding');
      return;
    }

    // If user has businesses and is still on onboarding page
    if (isAuthenticated && pathname === '/onboarding' && user?.businesses && user.businesses.length > 0) {
      router.push('/dashboard');
      return;
    }

    // Redirect root to appropriate page
    if (pathname === '/') {
      if (isAuthenticated) {
        if (!user?.businesses || user.businesses.length === 0) {
          router.push('/onboarding')
        } else {
          router.push('/dashboard')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, user, pathname, router])

  // Fetch user data when authenticated but user data is missing
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated && !user) {
        try {
          // Use apiClient which handles localStorage tokens automatically
          const response = await apiClient.getCurrentUser()
          if (response.data) {
            const userData = response.data;
            setUser({
              id: userData.id,
              email: userData.email,
              full_name: userData.name, // Map 'name' to 'full_name'
              phone_number: userData.phone || '',
              businesses: userData.businesses?.map((business: any) => ({
                id: business.id,
                owner_id: userData.id,
                name: business.name,
                phone_number: '',
                number_of_employees: null,
                type: 'product' as 'product' | 'service' | 'both',
                business_type: business.business_type || null,
                description: null,
                extra_data: {},
                onboarding_completed: true,
                website: null,
                address: null,
                created_at: business.created_at,
                updated_at: business.updated_at || business.created_at
              })) || []
            });
          } else if (response.error) {
            console.warn('Failed to load user profile:', response.error.message);
            showToast({
              type: 'error',
              title: 'Profile Error',
              message: response.error.message
            })
            // If token is invalid/expired, force logout
            logout();
          }
        } catch (error) {
          console.warn('Failed to load user profile, logging out...', error);
          showToast({
            type: 'error',
            title: 'Authentication Error',
            message: 'Session expired. Please log in again.'
          })
          // If token is invalid/expired, force logout
          logout();
        }
      }
    };

    loadUser();
  }, [isAuthenticated, user, setUser, logout, showToast]);

  // Determine if the current route is public
  const isPublicRoute = publicRoutes.includes(pathname)

  // If we're still initializing, show a loading state
  if (isAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If it's a public route, render the children directly
  if (isPublicRoute) {
    return <>{children}</>;
  }
  // Apply dashboard/base layout to all other routes
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}

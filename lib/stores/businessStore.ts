import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { Business, BusinessOnboardingResponse } from '../api'

interface BusinessState {
  businessData: Business | null
  activeBusiness: Business | null

  // Actions
  setBusinessData: (business: Business) => void
  setActiveBusiness: (business: Business) => void
  setBusinessInfo: (response: BusinessOnboardingResponse) => void
  completeOnboarding: () => void
  updateBusinessData: (updates: Partial<Business>) => void
  clearBusinessData: () => void
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      businessData: null,
      activeBusiness: null,

      setBusinessData: (business: Business) => {
        set({ businessData: business })
      },

      setActiveBusiness: (business: Business) => {
        set({ activeBusiness: business })
      },

      setBusinessInfo: (response: BusinessOnboardingResponse) => {
        // Update business data with onboarding completion status
        set((state) => ({
          businessData: state.businessData ? {
            ...state.businessData,
            onboarding_completed: response.business_onboarded
          } : null,
          activeBusiness: state.activeBusiness ? {
            ...state.activeBusiness,
            onboarding_completed: response.business_onboarded
          } : null
        }))
      },

      completeOnboarding: () => {
        set((state) => ({
          businessData: state.businessData ? {
            ...state.businessData,
            onboarding_completed: true
          } : null,
          activeBusiness: state.activeBusiness ? {
            ...state.activeBusiness,
            onboarding_completed: true
          } : null
        }))
      },

      updateBusinessData: (updates: Partial<Business>) => {
        set((state) => ({
          businessData: state.businessData ? { ...state.businessData, ...updates } : {
            id: 0,
            owner_id: 0,
            name: '',
            phone_number: '',
            website: null,
            address: null,
            number_of_employees: null,
            type: 'product',
            business_type: null,
            description: null,
            extra_data: {},
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...updates
          },
          activeBusiness: state.activeBusiness ? { ...state.activeBusiness, ...updates } : null
        }))
      },

      clearBusinessData: () => {
        set({
          businessData: null,
          activeBusiness: null
        })
      }
    })),
    {
      name: 'business-storage',
      partialize: (state) => ({
        businessData: state.businessData,
        activeBusiness: state.activeBusiness,
      }),
    }
  )
)

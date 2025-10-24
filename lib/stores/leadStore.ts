import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { Lead } from '../api'

interface LeadState {
  leads: Lead[]
  isLoading: boolean
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages?: number
  }

  // Actions
  setLeads: (leads: Lead[], pagination?: { total: number; page: number; per_page: number; total_pages?: number }) => void
  addLead: (lead: Lead) => void
  updateLead: (id: number, lead: Lead) => void
  removeLead: (id: number) => void
  setLoading: (loading: boolean) => void
  setPagination: (pagination: { page: number; per_page: number; total: number; total_pages?: number }) => void
  clearLeads: () => void
}

export const useLeadStore = create<LeadState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      leads: [],
      isLoading: false,
      pagination: {
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0
      },

      setLeads: (leads: Lead[], pagination?: { total: number; page: number; per_page: number; total_pages?: number }) => {
        if (pagination) {
          set({ leads, pagination })
        } else {
          set({ leads })
        }
      },

      addLead: (lead: Lead) => {
        set((state) => ({
          leads: [...state.leads, lead]
        }))
      },

      updateLead: (id: number, updatedLead: Lead) => {
        set((state) => ({
          leads: state.leads.map(lead =>
            lead.id === id ? updatedLead : lead
          )
        }))
      },

      removeLead: (id: number) => {
        set((state) => ({
          leads: state.leads.filter(lead => lead.id !== id)
        }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setPagination: (pagination: { page: number; per_page: number; total: number }) => {
        set({ pagination })
      },

      clearLeads: () => {
        set({
          leads: [],
          isLoading: false,
          pagination: {
            page: 1,
            per_page: 20,
            total: 0,
            total_pages: 0
          }
        })
      }
    })),
    {
      name: 'lead-storage',
      partialize: (state) => ({
        leads: state.leads,
        pagination: state.pagination,
      }),
    }
  )
)

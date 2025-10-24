import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { Contact } from '../api'

interface ContactState {
  contacts: Contact[]
  isLoading: boolean
  filters: {
    search: string
    phone: string
    email: string
  }

  // Actions
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  updateContact: (id: number, contact: Contact) => void
  removeContact: (id: number) => void
  setLoading: (loading: boolean) => void
  clearContacts: () => void
  setFilters: (filters: Partial<ContactState['filters']>) => void
  clearFilters: () => void
}

export const useContactStore = create<ContactState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      contacts: [],
      isLoading: false,
      filters: {
        search: '',
        phone: '',
        email: ''
      },

      setContacts: (contacts: Contact[]) => {
        set({ contacts })
      },

      addContact: (contact: Contact) => {
        set((state) => ({
          contacts: [...state.contacts, contact]
        }))
      },

      updateContact: (id: number, updatedContact: Contact) => {
        set((state) => ({
          contacts: state.contacts.map(contact =>
            contact.id === id ? updatedContact : contact
          )
        }))
      },

      removeContact: (id: number) => {
        set((state) => ({
          contacts: state.contacts.filter(contact => contact.id !== id)
        }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      clearContacts: () => {
        set({
          contacts: [],
          isLoading: false
        })
      },

      setFilters: (newFilters: Partial<ContactState['filters']>) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      clearFilters: () => {
        set({
          filters: {
            search: '',
            phone: '',
            email: ''
          }
        })
      }
    })),
    {
      name: 'contact-storage',
      partialize: (state) => ({
        contacts: state.contacts,
      }),
    }
  )
)

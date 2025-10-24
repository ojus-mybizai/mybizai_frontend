import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { CatalogItem, CatalogItemOut, ItemType, Availability, CatalogTemplate } from '../api'

export interface CatalogFilters {
  category?: string
  type?: ItemType
  availability?: Availability
}

interface CatalogState {
  items: CatalogItem[]
  templates: CatalogTemplate[]
  isLoading: boolean
  searchQuery: string
  filters: CatalogFilters

  // Actions
  setItems: (items: CatalogItem[]) => void
  addItem: (item: CatalogItem) => void
  updateItem: (id: string, item: CatalogItem) => void
  removeItem: (id: string) => void
  setLoading: (loading: boolean) => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: CatalogFilters) => void
  clearFilters: () => void
  clearItems: () => void

  // Template actions
  setTemplates: (templates: CatalogTemplate[]) => void
  addTemplate: (template: CatalogTemplate) => void
  updateTemplate: (id: string, template: CatalogTemplate) => void
  removeTemplate: (id: string) => void
  clearTemplates: () => void
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      items: [],
      templates: [],
      isLoading: false,
      searchQuery: '',
      filters: {},

      setItems: (items: CatalogItem[]) => {
        set({ items })
      },

      addItem: (item: CatalogItem) => {
        set((state) => ({
          items: [...state.items, item]
        }))
      },

      updateItem: (id: string, updatedItem: CatalogItem) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? updatedItem : item
          )
        }))
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      setFilters: (filters: CatalogFilters) => {
        set({ filters })
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      clearItems: () => {
        set({
          items: [],
          templates: [],
          isLoading: false,
          searchQuery: '',
          filters: {}
        })
      },

      // Template methods
      setTemplates: (templates: CatalogTemplate[]) => {
        set({ templates })
      },

      addTemplate: (template: CatalogTemplate) => {
        set((state) => ({
          templates: [...state.templates, template]
        }))
      },

      updateTemplate: (id: string, updatedTemplate: CatalogTemplate) => {
        set((state) => ({
          templates: state.templates.map(template =>
            template.id === id ? updatedTemplate : template
          )
        }))
      },

      removeTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter(template => template.id !== id)
        }))
      },

      clearTemplates: () => {
        set({ templates: [] })
      }
    })),
    {
      name: 'catalog-storage',
      partialize: (state) => ({
        items: state.items,
        templates: state.templates,
        searchQuery: state.searchQuery,
        filters: state.filters,
      }),
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { CatalogItem } from '../api'

export interface CatalogFilters {
  category?: string
  type?: string
  availability?: string
}

interface CatalogState {
  items: CatalogItem[]
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
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      items: [],
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
          isLoading: false,
          searchQuery: '',
          filters: {}
        })
      }
    })),
    {
      name: 'catalog-storage',
      partialize: (state) => ({
        items: state.items,
        searchQuery: state.searchQuery,
        filters: state.filters,
      }),
    }
  )
)

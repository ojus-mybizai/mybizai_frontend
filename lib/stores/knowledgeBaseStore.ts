import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { KnowledgeBase } from '../api'

interface KnowledgeBaseState {
  knowledgeBases: KnowledgeBase[]
  isLoading: boolean
  error: string | null

  // Actions
  setKnowledgeBases: (knowledgeBases: KnowledgeBase[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addKnowledgeBase: (knowledgeBase: KnowledgeBase) => void
  updateKnowledgeBase: (id: number, updates: Partial<KnowledgeBase>) => void
  removeKnowledgeBase: (id: number) => void
  clearKnowledgeBases: () => void
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      knowledgeBases: [],
      isLoading: false,
      error: null,

      setKnowledgeBases: (knowledgeBases: KnowledgeBase[]) => {
        set({ knowledgeBases })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      addKnowledgeBase: (knowledgeBase: KnowledgeBase) => {
        set((state) => ({
          knowledgeBases: [...state.knowledgeBases, knowledgeBase]
        }))
      },

      updateKnowledgeBase: (id: number, updates: Partial<KnowledgeBase>) => {
        set((state) => ({
          knowledgeBases: state.knowledgeBases.map(kb =>
            kb.id === id ? { ...kb, ...updates } : kb
          )
        }))
      },

      removeKnowledgeBase: (id: number) => {
        set((state) => ({
          knowledgeBases: state.knowledgeBases.filter(kb => kb.id !== id)
        }))
      },

      clearKnowledgeBases: () => {
        set({
          knowledgeBases: [],
          isLoading: false,
          error: null
        })
      }
    })),
    {
      name: 'knowledgebase-storage',
      partialize: (state) => ({
        knowledgeBases: state.knowledgeBases,
      }),
    }
  )
)

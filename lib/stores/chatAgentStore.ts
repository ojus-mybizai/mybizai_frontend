import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { ChatAgent, KnowledgeBase, Integration } from '../api'

// Define Channel and Tool types since they're not in the API yet
export interface Channel {
  id: number
  type: string
  name: string
  config: Record<string, any>
  is_connected: boolean
  business_id: number
  created_at: string
  updated_at: string
}

export interface Tool {
  id: number
  name: string
  description: string
  type: string
  config: Record<string, any>
  enabled: boolean
  execution_mode: string
  created_at: string
}

// Extended ChatAgent interface with related data
export interface ExtendedChatAgent extends ChatAgent {
  channels?: Channel[]
  knowledge_bases?: KnowledgeBase[]
  tools?: Tool[]
}

interface ChatAgentState {
  chatAgents: ExtendedChatAgent[]
  currentChatAgent: ExtendedChatAgent | null
  isLoading: boolean
  error: string | null

  // Actions
  setChatAgents: (agents: ExtendedChatAgent[]) => void
  setCurrentChatAgent: (agent: ExtendedChatAgent) => void
  addChatAgent: (agent: ExtendedChatAgent) => void
  updateChatAgent: (id: number, updates: Partial<ExtendedChatAgent>) => void
  removeChatAgent: (id: number) => void
  clearChatAgents: () => void

  // Related data actions
  setChatAgentChannels: (agentId: number, channels: Channel[]) => void
  setChatAgentKnowledgeBases: (agentId: number, knowledgeBases: KnowledgeBase[]) => void
  setChatAgentTools: (agentId: number, tools: Tool[]) => void

  // Loading states
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useChatAgentStore = create<ChatAgentState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      chatAgents: [],
      currentChatAgent: null,
      isLoading: false,
      error: null,

      setChatAgents: (agents: ExtendedChatAgent[]) => {
        set({ chatAgents: agents })
      },

      setCurrentChatAgent: (agent: ExtendedChatAgent) => {
        set({ currentChatAgent: agent })
      },

      addChatAgent: (agent: ExtendedChatAgent) => {
        set((state) => ({
          chatAgents: [...state.chatAgents, agent]
        }))
      },

      updateChatAgent: (id: number, updates: Partial<ExtendedChatAgent>) => {
        set((state) => ({
          chatAgents: state.chatAgents.map(agent =>
            agent.id === id ? { ...agent, ...updates } : agent
          ),
          currentChatAgent: state.currentChatAgent?.id === id
            ? { ...state.currentChatAgent, ...updates }
            : state.currentChatAgent
        }))
      },

      removeChatAgent: (id: number) => {
        set((state) => ({
          chatAgents: state.chatAgents.filter(agent => agent.id !== id),
          currentChatAgent: state.currentChatAgent?.id === id ? null : state.currentChatAgent
        }))
      },

      clearChatAgents: () => {
        set({
          chatAgents: [],
          currentChatAgent: null,
          isLoading: false,
          error: null
        })
      },

      setChatAgentChannels: (agentId: number, channels: Channel[]) => {
        set((state) => ({
          chatAgents: state.chatAgents.map(agent =>
            agent.id === agentId ? { ...agent, channels } : agent
          ),
          currentChatAgent: state.currentChatAgent?.id === agentId
            ? { ...state.currentChatAgent, channels }
            : state.currentChatAgent
        }))
      },

      setChatAgentKnowledgeBases: (agentId: number, knowledgeBases: KnowledgeBase[]) => {
        set((state) => ({
          chatAgents: state.chatAgents.map(agent =>
            agent.id === agentId ? { ...agent, knowledge_bases: knowledgeBases } : agent
          ),
          currentChatAgent: state.currentChatAgent?.id === agentId
            ? { ...state.currentChatAgent, knowledge_bases: knowledgeBases }
            : state.currentChatAgent
        }))
      },

      setChatAgentTools: (agentId: number, tools: Tool[]) => {
        set((state) => ({
          chatAgents: state.chatAgents.map(agent =>
            agent.id === agentId ? { ...agent, tools } : agent
          ),
          currentChatAgent: state.currentChatAgent?.id === agentId
            ? { ...state.currentChatAgent, tools }
            : state.currentChatAgent
        }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      }
    })),
    {
      name: 'chatagent-storage',
      partialize: (state) => ({
        chatAgents: state.chatAgents,
        currentChatAgent: state.currentChatAgent,
      }),
    }
  )
)

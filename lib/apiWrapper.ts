// API Wrapper for production mode - only real APIs
import {
  authApi as realAuthApi,
  crmApi as realCrmApi,
  chatAgentApi as realChatAgentApi,
  knowledgeBaseApi as realKnowledgeBaseApi,
  integrationApi as realIntegrationApi,
  aiConfigApi as realAIConfigApi,
  dashboardApi as realDashboardApi,
  channelsApi as realChannelsApi,
  toolsApi as realToolsApi,
  Channel,
  Tool,
  ChatAgent,
  ApiError
} from './api'

// Production mode - only use real APIs
export const authApi = realAuthApi
export const catalogApi = realAuthApi // Catalog endpoints are part of authApi
export const crmApi = realCrmApi
export const chatAgentApi = realChatAgentApi
export const knowledgeBaseApi = realKnowledgeBaseApi
export const channelsApi = realChannelsApi
export const integrationApi = realIntegrationApi
export const aiConfigApi = realAIConfigApi
export const dashboardApi = realDashboardApi
export const toolsApi = realToolsApi
export type { Channel, Tool, ChatAgent, ApiError }

// Demo mode flag for components to use (always false in production)
export const isDemoMode = () => false

// Demo credentials for easy login
export const demoCredentials = {
  email: "demo@techzone.com",
  password: "demo123"
}

console.log(`🚀 MyBizAI running in PRODUCTION mode - using real APIs`)

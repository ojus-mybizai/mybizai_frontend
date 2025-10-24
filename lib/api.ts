import { CloudCog } from "lucide-react"
import { useAuthStore } from './stores/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  username: string // Changed from 'name' to 'username' to match backend
  password: string
}

export interface SignupResponse {
  message: string
  user_id: number
  requires_verification?: boolean
}

export interface OTPVerificationRequest {
  user_id: number
  code: string
}

// New minimal login response per contract
export interface LoginResponse {
  access_token: string
  token_type: 'bearer' | string
  onboarding_required: boolean
}

// Unverified user response when email verification is required
export interface UnverifiedUserResponse {
  verification_required: boolean
  user_id: number
  email: string
  message: string
}

// Union type for login responses
export type LoginApiResponse = LoginResponse | UnverifiedUserResponse

// Auth responses for signup/verify can still return tokens if needed
export interface AuthResponse {
  access_token: string
  token_type: 'bearer' | string
  onboarding_required?: boolean
}

export interface BusinessOnboardingRequest {
  name: string
  website?: string
  address?: string
  phone_number: string
  number_of_employees?: string
  business_type: 'product' | 'service' | 'both'
  description?: string
}


export interface BusinessOnboardingResponse {
  message: string
  business_onboarded: boolean
}

// New types for user + businesses from /auth/users/me
export interface Business {
  id: number
  owner_id: number
  name: string
  website?: string | null
  address?: string | null
  phone_number: string
  number_of_employees?: string | null
  type: 'product' | 'service' | 'both'
  business_type?: string | null // Legacy field for compatibility
  description?: string | null
  extra_data: Record<string, any>
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserMe {
  id: number
  email: string
  full_name?: string
  phone_number?: string
  businesses: Business[]
}

// Catalog Types (Backend contract)
export type Availability = 'available' | 'out_of_stock' | 'discontinued'
export type ItemType = 'product' | 'service'

export interface CatalogItemBase {
  name: string
  description?: string | null
  category?: string | null
  price: number
  currency: string
  availability: Availability
  type: ItemType
  images: string[]
  extra_data: Record<string, any>
  template_id?: number | null
}

export interface CatalogItemOut extends CatalogItemBase {
  id: number
  business_id: number
  created_at: string
  updated_at: string
}

export interface CatalogListResponse {
  items: CatalogItemOut[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Back-compat local type used by current mock-enabled pages
export interface CatalogItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  currency: string
  availability: Availability
  type: ItemType
  images: string[]
  template_fields?: Record<string, any>
  created_at: string
  updated_at: string
}

// Templates (Backend contract)
export interface CatalogTemplateCreate {
  name: string
  extra_metadata: string[]
}

export interface CatalogTemplateOut extends CatalogTemplateCreate {
  id: number
  business_id: number
  created_at: string
  updated_at: string
}

// Frontend template type used by current UI components
export interface CatalogTemplate {
  id: string
  name: string
  description?: string
  fields: CatalogTemplateField[]
  created_at: string
  updated_at: string
}

export interface CatalogTemplateField {
  id: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'dropdown' | 'boolean' | 'date'
  required: boolean
  options?: string[] // for dropdown type
}

// Create/Update request for backend JSON endpoints
export interface CatalogItemCreateRequest extends CatalogItemBase {}
export interface CatalogItemUpdateRequest extends Partial<CatalogItemBase> {}

// Legacy/UI request used by mock-enabled pages (kept to avoid refactor blast radius)
export interface CatalogItemRequest {
  name: string
  description: string
  category: string
  price: number
  currency: string
  availability: Availability
  type: ItemType
  images: string[]
  template_fields?: Record<string, any>
}

export interface CatalogTemplateRequest {
  name: string
  description?: string
  fields: Omit<CatalogTemplateField, 'id'>[]
}

export interface BulkUploadResponse {
  success_count: number
  error_count: number
  errors: Array<{
    row: number
    message: string
  }>
}

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) }

  // Only set JSON content-type if body is not FormData or URLSearchParams
  if (options.body &&
      !(options.body instanceof FormData) &&
      !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json'
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    // Add detailed logging for debugging
    console.log('🔄 API REQUEST:', {
      url,
      method: options.method || 'GET',
      headers: { ...headers, ...((options.headers as any)?.Authorization ? { Authorization: 'Bearer [HIDDEN]' } : {}) },
      body: options.body ? (options.body instanceof FormData ? 'FormData' : options.body) : undefined
    })

    const response = await fetch(url, config)

    // Log response details
    console.log('📥 API RESPONSE:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      // 🚨 CRITICAL: Handle 401 Unauthorized globally
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // Force redirect to login
          window.location.href = '/login';
        }
        throw new ApiError(response.status, 'Session expired. Please log in again.', 'auth_expired');
      }

      let errorMessage = `HTTP error! status: ${response.status}`
      let errorDetails: any = null

      try {
        const errorData = await response.json()
        console.log('❌ API ERROR RESPONSE BODY:', errorData)

        if (errorData.success === false && errorData.error) {
          // Backend error format: { success: false, error: { code, message, details } }
          errorMessage = errorData.error.message
          errorDetails = errorData.error.details
        } else {
          // Fallback for other error formats
          errorMessage = errorData.detail || errorData.message || errorMessage
        }
      } catch (e) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage
      }

      throw new ApiError(response.status, errorMessage, errorDetails)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as unknown as T
    }

    const responseData = await response.json()
    console.log('✅ API SUCCESS RESPONSE:', responseData)
    return responseData
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, 'Network error or server unavailable')
  }
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginApiResponse> => {
    try {
      const response = await apiRequest<LoginApiResponse>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      // Check if this is an UnverifiedUserResponse (no access_token)
      if ('verification_required' in response && response.verification_required) {
        // This is an unverified user response - throw error to be handled by caller
        const unverifiedResponse = response?.data as UnverifiedUserResponse;
        return unverifiedResponse
      }

      // At this point, response must be a LoginResponse (successful login)
      const loginResponse = response?.data as LoginResponse;

      // Ensure we have the required fields in the response (successful login)
      if (!loginResponse.access_token) {
        throw new Error('Invalid response from server: Missing access token');
      }

      return {
        access_token: loginResponse.access_token,
        token_type: loginResponse.token_type || 'bearer',
        onboarding_required: loginResponse.onboarding_required || false,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network errors or other issues
      throw new ApiError(0, 'Login failed. Please check your credentials and try again.');
    }
  },

  signup: async (userData: SignupRequest): Promise<SignupResponse> => {
    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  verifyEmail: async (data: OTPVerificationRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    })
  },

  resendOTP: async (userId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  },

  getMe: async (token: string): Promise<UserMe> => {
    return apiRequest<UserMe>('/auth/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  businessOnboarding: async (
    data: BusinessOnboardingRequest,
    token: string
  ): Promise<BusinessOnboardingResponse> => {
    console.log('🏢 BUSINESS ONBOARDING API CALL:')
    console.log('📤 Sending to:', '/business/onboarding')
    console.log('📋 Data:', data)
    console.log('🔑 Token:', token ? 'Bearer [PROVIDED]' : 'MISSING')

    const result = await apiRequest<BusinessOnboardingResponse>('/business/onboarding', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    console.log('📨 BUSINESS ONBOARDING RESPONSE:', result)
    return result
  },

  // Get current business
  getCurrentBusiness: async (token: string): Promise<Business> => {
    return apiRequest<Business>('/business/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Update current business
  updateCurrentBusiness: async (data: Partial<BusinessOnboardingRequest>, token: string): Promise<Business> => {
    return apiRequest<Business>('/business/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  // Catalog API endpoints
  getCatalogItems: async (
    token: string,
    params?: Partial<{
      category: string
      type: ItemType
      availability: Availability
      search: string
      page: number
      per_page: number
    }>
  ): Promise<CatalogListResponse> => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null && v !== '') acc[k] = String(v)
          return acc
        }, {})).toString()
      : ''
    return apiRequest<CatalogListResponse>(`/catalog/${qs}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  getCatalogItem: async (id: string | number, token: string): Promise<CatalogItemOut> => {
    return apiRequest<CatalogItemOut>(`/catalog/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  createCatalogItem: async (data: CatalogItemCreateRequest, token: string): Promise<CatalogItemOut> => {
    return apiRequest<CatalogItemOut>('/catalog/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  updateCatalogItem: async (id: string | number, data: CatalogItemUpdateRequest, token: string): Promise<CatalogItemOut> => {
    return apiRequest<CatalogItemOut>(`/catalog/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  deleteCatalogItem: async (id: string | number, token: string): Promise<void> => {
    return apiRequest<void>(`/catalog/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  toggleCatalogItemAvailability: async (id: string | number, availability: Availability, token: string): Promise<CatalogItemOut> => {
    return apiRequest<CatalogItemOut>(`/catalog/${id}/availability`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ availability }),
    })
  },

  // Upload image to get URL
  uploadCatalogImage: async (file: File, token: string): Promise<{ url: string; filename: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<{ url: string; filename: string }>(`/catalog/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  },

  // Create item with multipart (extra_data JSON string + optional image)
  createCatalogItemWithImage: async (
    data: Omit<CatalogItemBase, 'metadata' | 'images'> & { extra_data: Record<string, any>; image?: File }
    , token: string
  ): Promise<CatalogItemOut> => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.description) formData.append('description', String(data.description))
    if (data.category) formData.append('category', String(data.category))
    formData.append('price', String(data.price))
    if (data.currency) formData.append('currency', String(data.currency))
    if (data.availability) formData.append('availability', String(data.availability))
    if (data.type) formData.append('type', String(data.type))
    if (data.template_id !== undefined && data.template_id !== null) formData.append('template_id', String(data.template_id))
    formData.append('extra_data', JSON.stringify(data.extra_data))
    if (data.image) formData.append('image', data.image)
    return apiRequest<CatalogItemOut>(`/catalog/with-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  },

  // Categories list
  getCatalogCategories: async (token: string): Promise<{ categories: string[] }> => {
    return apiRequest<{ categories: string[] }>(`/catalog/categories/list`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Stats summary
  getCatalogStatsSummary: async (token: string): Promise<{
    total_items: number
    by_type: Record<string, number>
    by_availability: Record<string, number>
    average_price: number
  }> => {
    return apiRequest(`/catalog/stats/summary`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Catalog Templates API
  getCatalogTemplates: async (token: string): Promise<CatalogTemplateOut[]> => {
    return apiRequest<CatalogTemplateOut[]>('/catalog/templates', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  getCatalogTemplate: async (id: number, token: string): Promise<CatalogTemplateOut> => {
    return apiRequest<CatalogTemplateOut>(`/catalog/templates/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  createCatalogTemplate: async (data: CatalogTemplateCreate, token: string): Promise<CatalogTemplateOut> => {
    return apiRequest<CatalogTemplateOut>('/catalog/templates', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  updateCatalogTemplate: async (id: number, data: CatalogTemplateCreate, token: string): Promise<CatalogTemplateOut> => {
    return apiRequest<CatalogTemplateOut>(`/catalog/templates/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  deleteCatalogTemplate: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/catalog/templates/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Bulk Upload API
  bulkUploadCatalog: async (file: File, fieldMapping: Record<string, string>, token: string): Promise<BulkUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field_mapping', JSON.stringify(fieldMapping))

    return apiRequest<BulkUploadResponse>('/catalog/bulk-upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: formData,
    })
  },
}

// CRM Types - Contacts
export interface Contact {
  id: number
  business_id: number
  full_name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  company?: string | null
  notes?: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ContactCreate {
  full_name: string
  phone?: string
  email?: string
  address?: string
  company?: string
  notes?: string
  metadata?: Record<string, any>
}

export interface ContactUpdate {
  full_name?: string
  phone?: string
  email?: string
  address?: string
  company?: string
  notes?: string
  metadata?: Record<string, any>
}

// CRM Types - Leads (Updated for generic CRM)
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
export type LeadPriority = 'low' | 'medium' | 'high'
export type LeadSource = 'portal' | 'website' | 'whatsapp' | 'referral' | 'walk-in' | 'ad_campaign'

export interface Lead {
  id: number
  business_id: number
  name: string
  phone: string
  email?: string | null
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  notes?: string | null
  extra_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LeadCreate {
  name: string
  phone: string
  email?: string
  source: LeadSource
  status?: LeadStatus
  priority?: LeadPriority
  notes?: string
  extra_data?: Record<string, any>
}

export interface LeadUpdate {
  name?: string
  phone?: string
  email?: string
  source?: LeadSource
  status?: LeadStatus
  priority?: LeadPriority
  notes?: string
  extra_data?: Record<string, any>
}

export interface LeadListResponse {
  leads: Lead[]
  total: number
  page: number
  per_page: number
}

// CRM API Client
export const crmApi = {
  // Contacts API
  getContacts: async (
    token: string,
    params?: {
      search?: string
      phone?: string
      email?: string
    }
  ): Promise<Contact[]> => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null && v !== '') acc[k] = String(v)
          return acc
        }, {})).toString()
      : ''
    return apiRequest<Contact[]>(`/contacts/${qs}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getContact: async (id: number, token: string): Promise<Contact> => {
    return apiRequest<Contact>(`/contacts/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createContact: async (data: ContactCreate, token: string): Promise<Contact> => {
    return apiRequest<Contact>('/contacts/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateContact: async (id: number, data: ContactUpdate, token: string): Promise<Contact> => {
    return apiRequest<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteContact: async (id: number, token: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Leads API
  getLeads: async (
    token: string,
    params?: {
      page?: number
      per_page?: number
      status?: LeadStatus
      source?: LeadSource
      search?: string
    }
  ): Promise<LeadListResponse> => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null && v !== '') acc[k] = String(v)
          return acc
        }, {})).toString()
      : ''
    return apiRequest<LeadListResponse>(`/leads/${qs}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getLead: async (id: number, token: string): Promise<Lead> => {
    return apiRequest<Lead>(`/leads/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createLead: async (data: LeadCreate, token: string): Promise<Lead> => {
    return apiRequest<Lead>('/leads/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateLead: async (id: number, data: LeadUpdate, token: string): Promise<Lead> => {
    return apiRequest<Lead>(`/leads/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteLead: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/leads/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getLeadStats: async (token: string): Promise<{
    total: number
    by_status: Record<string, number>
    conversion_rate: number
  }> => {
    return apiRequest(`/leads/stats/summary`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Knowledge Base Types
export interface KnowledgeBase {
  id: number
  business_id: number
  title: string
  type: 'text' | 'file'
  category?: string | null
  content?: string | null
  file_url?: string | null
  file_name?: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeBaseCreate {
  title: string
  type: 'text' | 'file'
  category?: string
  content?: string
  file?: File
}

export interface KnowledgeBaseUpdate {
  title?: string
  category?: string
  content?: string
}

// Integration Types
export interface Integration {
  id: number
  business_id: number
  name: string
  type: 'shopify' | 'woocommerce' | 'zoho_crm' | 'hubspot' | 'custom_api' | 'other'
  status: 'active' | 'inactive' | 'error'
  created_at: string
  updated_at: string
}

export interface IntegrationCreate {
  name: string
  type: 'shopify' | 'woocommerce' | 'zoho_crm' | 'hubspot' | 'custom_api' | 'other'
  credentials: Record<string, any>
  status?: 'active' | 'inactive' | 'error'
}

export interface IntegrationUpdate {
  name?: string
  credentials?: Record<string, any>
  status?: 'active' | 'inactive' | 'error'
}

// AI Config Types
export interface AIConfig {
  id: number
  business_id: number
  name: string
  role: string
  model: string
  tone: string
  system_prompt: string
  created_at: string
  updated_at: string
}

export interface AIConfigCreate {
  name: string
  role: string
  model?: string
  tone?: string
  system_prompt?: string
}

export interface AIConfigUpdate {
  name?: string
  role?: string
  model?: string
  tone?: string
  system_prompt?: string
}

// ChatAgent Types (Updated)
export type CapabilityKey = 'knowledge_base_lookup' | 'orders' | 'appointments' | 'summarization' | 'catalog' | 'catalog_lookup' | 'lead_scoring'

export interface ChatAgentBase {
  name: string
  description?: string
  role_type: string
  tone: string
  instructions: string
  model_name: string
  capabilities: Record<CapabilityKey, boolean>
  status: 'active' | 'inactive'
  deployed: boolean
  is_active: boolean
  knowledge_bases?: KnowledgeBase[]
  integrations?: Integration[]
  tools?: Array<{
    id: number
    name: string
    description: string
    type: string
    config: Record<string, any>
    enabled: boolean
    execution_mode: string
    created_at: string
  }>
  channels?: Array<{
    id: number
    type: string
    name: string
    config: Record<string, any>
    is_connected: boolean
    business_id: number
    created_at: string
    updated_at: string
  }>
  last_active?: string | null
}

export interface ChatAgentCreate extends ChatAgentBase {
  business_id: number
}

export interface ChatAgentUpdate {
  name?: string
  description?: string
  ai_config_id?: number
  capabilities?: Record<CapabilityKey, boolean>
  knowledge_base_ids?: number[] | null
  integration_ids?: number[] | null
  channels_enabled?: Record<string, boolean> | null
  deployed?: boolean
}

export interface ChatAgent extends ChatAgentBase {
  id: number
  business_id: number
  created_at: string
  updated_at: string
}

// Dashboard Stats Types
export interface DashboardStats {
  conversations_this_week: number
  leads_this_week: number
  orders_created: number
  appointments_booked: number
  active_chat_agents: number
  recent_conversations: RecentConversation[]
}

export interface RecentConversation {
  id: number
  customer_name: string
  agent_name: string
  last_message: string
  timestamp: string
  status: 'active' | 'resolved' | 'pending'
}

// ChatAgent API Client
export const chatAgentApi = {
  getChatAgents: async (token: string): Promise<ChatAgent[]> => {
    return apiRequest<ChatAgent[]>('/chat_agents/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getChatAgent: async (id: number, token: string): Promise<ChatAgent> => {
    return apiRequest<ChatAgent>(`/chat_agents/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createChatAgent: async (data: ChatAgentCreate, token: string): Promise<ChatAgent> => {
    return apiRequest<ChatAgent>('/chat_agents/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateChatAgent: async (id: number, data: ChatAgentUpdate, token: string): Promise<ChatAgent> => {
    return apiRequest<ChatAgent>(`/chat_agents/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteChatAgent: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/chat_agents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Get knowledge bases linked to a chat agent
  getChatAgentKnowledgeBases: async (id: number, token: string): Promise<{ knowledge_bases: KnowledgeBase[] }> => {
    return apiRequest<{ knowledge_bases: KnowledgeBase[] }>(`/chat_agents/${id}/knowledge_bases`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Bulk link/unlink knowledge bases to/from a chat agent
  updateChatAgentKnowledgeBases: async (
    id: number,
    data: { knowledge_base_ids: number[] },
    token: string
  ): Promise<{ success: boolean; linked_knowledge_bases: number[]; message: string }> => {
    return apiRequest<{ success: boolean; linked_knowledge_bases: number[]; message: string }>(`/chat_agents/${id}/knowledge_bases`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Get channels linked to a chat agent
  getChatAgentChannels: async (id: number, token: string): Promise<{ channels: Array<{ id: number; name: string; type: string; status: string }> }> => {
    return apiRequest<{ channels: Array<{ id: number; name: string; type: string; status: string }> }>(`/chat_agents/${id}/channels`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Bulk link/unlink channels to/from a chat agent
  updateChatAgentChannels: async (
    id: number,
    data: { channel_ids: number[] },
    token: string
  ): Promise<{ success: boolean; linked_channels: number[]; message: string }> => {
    return apiRequest<{ success: boolean; linked_channels: number[]; message: string }>(`/chat_agents/${id}/channels`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Get tools linked to a chat agent
  getChatAgentTools: async (id: number, token: string): Promise<{ tools: Array<{ id: number; name: string; type: string; enabled: boolean }> }> => {
    return apiRequest<{ tools: Array<{ id: number; name: string; type: string; enabled: boolean }> }>(`/chat_agents/${id}/tools`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Bulk link/unlink tools to/from a chat agent
  updateChatAgentTools: async (
    id: number,
    data: { tool_ids: number[]; tool_configs?: Record<string, any> },
    token: string
  ): Promise<{ success: boolean; linked_tools: number[]; message: string }> => {
    return apiRequest<{ success: boolean; linked_tools: number[]; message: string }>(`/chat_agents/${id}/tools`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Send test message to chat agent
  testChatAgent: async (
    id: number,
    data: { user_message: string },
    token: string
  ): Promise<{ response: string }> => {
    return apiRequest<{ response: string }>(`/chat_agents/${id}/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Deploy chat agent
  deployChatAgent: async (
    id: number,
    token: string
  ): Promise<{ status: string; deployed: boolean; message: string }> => {
    return apiRequest<{ status: string; deployed: boolean; message: string }>(`/chat_agents/${id}/deploy`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Knowledge Base API Client
export const knowledgeBaseApi = {
  getKnowledgeBases: async (token: string): Promise<KnowledgeBase[]> => {
    const res = await apiRequest<KnowledgeBase[]>('/knowledge_base/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log("response from backendS",res)
    return res
  },

  getKnowledgeBase: async (id: number, token: string): Promise<KnowledgeBase> => {
    return apiRequest<KnowledgeBase>(`/knowledge_base/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createKnowledgeBase: async (data: KnowledgeBaseCreate, token: string): Promise<KnowledgeBase> => {
    if (data.file) {
      const formData = new FormData()
      formData.append('title', data.title)
      if (data.category) formData.append('category', data.category)
      formData.append('file', data.file)

      return apiRequest<KnowledgeBase>('/knowledge_base/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
    } else {
      return apiRequest<KnowledgeBase>('/knowledge_base/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
    }
  },

  updateKnowledgeBase: async (id: number, data: KnowledgeBaseUpdate, token: string): Promise<KnowledgeBase> => {
    return apiRequest<KnowledgeBase>(`/knowledge_base/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteKnowledgeBase: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/knowledge_base/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Channels API Client
export interface Channel {
  id: number
  business_id: number
  type: 'whatsapp' | 'instagram' | 'telegram' | 'facebook' | 'website' | 'email'
  name: string
  config: Record<string, any>
  is_connected: boolean
  created_at: string
  updated_at: string
}

export const channelsApi = {
  getChannels: async (token: string): Promise<Channel[]> => {
    return apiRequest<Channel[]>('/channels/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getChannel: async (id: number, token: string): Promise<Channel> => {
    return apiRequest<Channel>(`/channels/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createChannel: async (data: Omit<Channel, 'id' | 'business_id' | 'created_at' | 'updated_at'>, token: string): Promise<Channel> => {
    return apiRequest<Channel>('/channels/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateChannel: async (id: number, data: Partial<Omit<Channel, 'id' | 'business_id' | 'created_at' | 'updated_at'>>, token: string): Promise<Channel> => {
    return apiRequest<Channel>(`/channels/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteChannel: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/channels/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Integration API Client
export const integrationApi = {
  getIntegrations: async (token: string): Promise<Integration[]> => {
    return apiRequest<Integration[]>('/business_integrations/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getIntegration: async (id: number, token: string): Promise<Integration> => {
    return apiRequest<Integration>(`/business_integrations/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createIntegration: async (data: IntegrationCreate, token: string): Promise<Integration> => {
    return apiRequest<Integration>('/business_integrations/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateIntegration: async (id: number, data: IntegrationUpdate, token: string): Promise<Integration> => {
    return apiRequest<Integration>(`/business_integrations/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteIntegration: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/business_integrations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// AI Config API Client
export const aiConfigApi = {
  getAIConfigs: async (token: string): Promise<AIConfig[]> => {
    return apiRequest<AIConfig[]>('/ai_configs/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getAIConfig: async (id: number, token: string): Promise<AIConfig> => {
    return apiRequest<AIConfig>(`/ai_configs/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createAIConfig: async (data: AIConfigCreate, token: string): Promise<AIConfig> => {
    return apiRequest<AIConfig>('/ai_configs/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateAIConfig: async (id: number, data: AIConfigUpdate, token: string): Promise<AIConfig> => {
    return apiRequest<AIConfig>(`/ai_configs/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteAIConfig: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/ai_configs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Dashboard API Client
export const dashboardApi = {
  getStats: async (token: string): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>('/dashboard/stats', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Tools API Client
export interface Tool {
  id: number
  name: string
  description: string
  type: 'system' | 'custom' | 'integration'
  config: Record<string, any>
  enabled: boolean
  execution_mode: 'realtime' | 'background' | 'scheduled'
  created_at: string
}

export interface ToolCreate {
  name: string
  description: string
  type: 'system' | 'custom' | 'integration'
  config?: Record<string, any>
  enabled?: boolean
  execution_mode?: 'realtime' | 'background' | 'scheduled'
}

export interface ToolUpdate {
  name?: string
  description?: string
  config?: Record<string, any>
  enabled?: boolean
  execution_mode?: 'realtime' | 'background' | 'scheduled'
}

export const toolsApi = {
  getTools: async (token: string): Promise<Tool[]> => {
    return apiRequest<Tool[]>('/tools/', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  getTool: async (id: number, token: string): Promise<Tool> => {
    return apiRequest<Tool>(`/tools/${id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  createTool: async (data: ToolCreate, token: string): Promise<Tool> => {
    return apiRequest<Tool>('/tools/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  updateTool: async (id: number, data: ToolUpdate, token: string): Promise<Tool> => {
    return apiRequest<Tool>(`/tools/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  deleteTool: async (id: number, token: string): Promise<void> => {
    return apiRequest<void>(`/tools/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

// Conversation (Convo) Types
export interface ConvoCreate {
  title: string
  lead_id?: number | null
  initial_message?: string | null
  channel: string
  metadata?: Record<string, any>
}

export interface ConvoUpdate {
  title?: string | null
  status?: string | null
  metadata?: Record<string, any>
}

export interface MessageCreate {
  text: string
  sender: string
  message_type?: string
  metadata?: Record<string, any>
}

export interface SummaryUpdate {
  summary: string
  key_points?: string[]
  action_items?: string[]
}

export interface ConvoOut {
  id: number
  title: string
  business_id: number
  lead_id?: number | null
  status: string
  channel: string
  created_at: string
  updated_at: string
  summary?: string | null
  key_points?: string[] | null
  action_items?: string[] | null
  message_count: number
  last_message_at?: string | null
  metadata: Record<string, any>
}

// Conversation API Client
export const convoApi = {
  // List conversations with pagination
  getConversations: async (token: string, params?: {
    skip?: number
    limit?: number
  }): Promise<ConvoOut[]> => {
    const queryParams = params
      ? '?' + new URLSearchParams(Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v)
          return acc
        }, {})).toString()
      : ''
    return apiRequest<ConvoOut[]>(`/convo/${queryParams}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Create a new conversation
  createConversation: async (data: ConvoCreate, token: string): Promise<ConvoOut> => {
    return apiRequest<ConvoOut>(`/convo/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Get a specific conversation
  getConversation: async (convoId: number, token: string): Promise<ConvoOut> => {
    return apiRequest<ConvoOut>(`/convo/${convoId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Update conversation details
  updateConversation: async (convoId: number, data: ConvoUpdate, token: string): Promise<ConvoOut> => {
    return apiRequest<ConvoOut>(`/convo/${convoId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Delete a conversation
  deleteConversation: async (convoId: number, token: string): Promise<void> => {
    return apiRequest<void>(`/convo/${convoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  // Add a message to conversation
  addMessage: async (convoId: number, data: MessageCreate, token: string): Promise<ConvoOut> => {
    return apiRequest<ConvoOut>(`/convo/${convoId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Update conversation summary
  updateSummary: async (convoId: number, data: SummaryUpdate, token: string): Promise<ConvoOut> => {
    return apiRequest<ConvoOut>(`/convo/${convoId}/summary`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    })
  },

  // Get conversation messages (if endpoint exists)
  getConversationMessages: async (
    convoId: number,
    token: string,
    params?: {
      skip?: number
      limit?: number
    }
  ): Promise<Array<{
    id: number
    convo_id: number
    text: string
    sender: string
    message_type: string
    created_at: string
    metadata: Record<string, any>
  }>> => {
    const queryParams = params
      ? '?' + new URLSearchParams(Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v)
          return acc
        }, {})).toString()
      : ''
    return apiRequest<Array<{
      id: number
      convo_id: number
      text: string
      sender: string
      message_type: string
      created_at: string
      metadata: Record<string, any>
    }>>(`/convo/${convoId}/messages${queryParams}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
  },
}

export { ApiError }

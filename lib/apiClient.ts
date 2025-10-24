const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Backend error response format
interface BackendErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// Unified API response format
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, string>;
  };
}

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public status: number, 
    message: string, 
    public code?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Type definitions for API responses
interface LoginResponse {
  access_token: string;
  token_type: string;
  onboarding_required?: boolean;
}

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
  businesses: Business[];
}

interface Business {
  id: number;
  name: string;
  business_type?: string;
  created_at: string;
}

interface CatalogItem {
  id: number;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency: string;
  availability: string;
  type: string;
  images: string[];
  extra_data: Record<string, any>;
  template_id?: number;
  business_id: number;
  created_at: string;
  updated_at: string;
}

interface KnowledgeBaseItem {
  id: number;
  title: string;
  type: 'text' | 'file';
  category?: string;
  content?: string;
  file_url?: string;
  business_id: number;
  created_at: string;
  updated_at: string;
}

interface ChatAgent {
  id: number;
  name: string;
  description?: string;
  ai_config_id: number;
  capabilities: Record<string, boolean>;
  knowledge_base_ids?: number[];
  integration_ids?: number[];
  channels_enabled?: Record<string, boolean>;
  business_id: number;
  created_at: string;
  updated_at: string;
}

interface Integration {
  id: number;
  name: string;
  type: string;
  status: string;
  business_id: number;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: number;
  business_id: number;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: number;
  business_id: number;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  priority?: string;
  extra_data: Record<string, any>;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  business_id: number;
  customer_id?: number;
  lead_id?: number;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  items: any[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: number;
  business_id: number;
  customer_id?: number;
  lead_id?: number;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  location?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: number;
  lead_id: number;
  business_id: number;
  title?: string;
  status: string;
  mode: 'AI' | 'Manual';
  last_message_at: string;
  unread_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ConversationMessage {
  id: number;
  conversation_id: number;
  lead_id: number;
  author: 'lead' | 'ai' | 'human';
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  metadata: Record<string, any>;
  created_at: string;
}

interface ChatAgentConfig {
  id: number;
  chat_agent_id: number;
  system_prompt?: string;
  tone?: string;
  personality?: string;
  response_style?: string;
  greeting_message?: string;
  fallback_message?: string;
  max_response_length?: number;
  typing_delay?: number;
  business_hours?: {
    enabled: boolean;
    timezone: string;
    schedule: Record<string, any>;
    out_of_hours_message?: string;
  };
  handover_keywords?: string[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

class ApiClient {
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const headers: HeadersInit = {};
    
    if (!isFormData && !(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    } else if (isFormData || data instanceof FormData) {
      // Don't set Content-Type for FormData - browser sets boundary automatically
      // headers['Content-Type'] = 'multipart/form-data'; // Let browser set this
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };

    if (data) {
      if (isFormData || data instanceof FormData) {
        config.body = data instanceof FormData ? data : new FormData(data);
      } else {
        config.body = JSON.stringify(data);
      }
    }

    // Request interceptor - log outgoing request
    console.log('🚀 API Request:', {
      method,
      url,
      headers: Object.fromEntries(Object.entries(headers).filter(([k]) => k !== 'Authorization')),
      body: data ? (isFormData || data instanceof FormData ? '[FormData]' : data) : undefined,
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(url, config);
      const responseData = await this.handleResponse<T>(response);

      // Response interceptor - log successful response
      console.log('✅ API Response:', {
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });

      return { data: responseData };
    } catch (error) {
      if (error instanceof ApiError) {
        return { error: { message: error.message, code: error.code || 'unknown_error', details: error.details } };
      }
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'unknown_error'
        } 
      };
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          // Force redirect to login
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Session expired. Please log in again.', 'auth_expired');
      }

      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorCode = 'unknown_error';
      let errorDetails: Record<string, string> | undefined;

      try {
        if (isJson) {
          const errorData: BackendErrorResponse = await response.json();

          // Special handling for 422 errors - log full response for debugging
          if (response.status === 422) {
            console.error('422 Unprocessable Entity Error Details:', {
              status: response.status,
              statusText: response.statusText,
              url: response.url,
              fullErrorResponse: errorData,
              timestamp: new Date().toISOString()
            });
          }

          if (errorData.success === false && errorData.error) {
            errorMessage = errorData.error.message;
            errorCode = errorData.error.code;
            errorDetails = errorData.error.details;
          } else {
            // Fallback for non-standard error format
            errorMessage = (errorData as any)?.detail || (errorData as any)?.message || errorMessage;
          }
        } else {
          errorMessage = await response.text() || response.statusText || errorMessage;
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(
        response.status,
        errorMessage,
        errorCode,
        errorDetails
      );
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    if (!isJson) {
      return response.text() as unknown as T;
    }

    return response.json();
  }

  // HTTP method helpers
  async get<T = any>(
    endpoint: string, 
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          query.append(key, String(value));
        }
      });
    }
    const queryString = query.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>('GET', url);
  }

  async post<T = any>(
    endpoint: string, 
    data?: any, 
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, isFormData);
  }

  async put<T = any>(
    endpoint: string, 
    data?: any, 
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, isFormData);
  }

  async patch<T = any>(
    endpoint: string, 
    data?: any, 
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, isFormData);
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<LoginResponse>> {
    return this.post<LoginResponse>('/auth/login', credentials);
  }

  async signup(userData: { 
    email: string; 
    password: string; 
    name: string 
  }): Promise<ApiResponse<{ message: string; user_id: number }>> {
    return this.post<{ message: string; user_id: number }>('/auth/signup', userData);
  }

  async verifyEmail(data: { user_id: string; code: string }): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/auth/verify-email', data);
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/users/me');
  }

  // Catalog methods
  async getCatalogItems(params?: {
    page?: number;
    per_page?: number;
    category?: string;
    type?: string;
    search?: string;
  }): Promise<ApiResponse<{ items: CatalogItem[]; total: number }>> {
    return this.get<{ items: CatalogItem[]; total: number }>('/catalog/', params);
  }

  async createCatalogItem(data: any): Promise<ApiResponse<CatalogItem>> {
    return this.post<CatalogItem>('/catalog/', data);
  }

  async getCatalogItem(itemId: string): Promise<ApiResponse<CatalogItem>> {
    return this.get<CatalogItem>(`/catalog/${itemId}`);
  }

  async updateCatalogItem(itemId: string, data: any): Promise<ApiResponse<CatalogItem>> {
    return this.put<CatalogItem>(`/catalog/${itemId}`, data);
  }

  async deleteCatalogItem(itemId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/catalog/${itemId}`);
  }

  // Upload catalog image
  async uploadCatalogImage(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post<{ url: string; filename: string }>('/catalog/upload-image', formData, true);
  }

  // Knowledge Base methods
  async getKnowledgeBaseEntries(params?: { 
    category?: string; 
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{ items: KnowledgeBaseItem[]; total: number }>> {
    return this.get<{ items: KnowledgeBaseItem[]; total: number }>('/knowledge_base/', params);
  }

  async createKnowledgeBaseItem(
    data: { title: string; content: string; category?: string; type: 'text' }
  ): Promise<ApiResponse<KnowledgeBaseItem>> {
    return this.post<KnowledgeBaseItem>('/knowledge_base/', data);
  }

  async uploadKnowledgeBaseFile(data: { title: string; category?: string; file: File }): Promise<ApiResponse<KnowledgeBaseItem>> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.category) formData.append('category', data.category);
    formData.append('file', data.file);
    return this.post<KnowledgeBaseItem>('/knowledge_base/upload', formData, true);
  }

  async getKnowledgeBaseItem(itemId: string): Promise<ApiResponse<KnowledgeBaseItem>> {
    return this.get<KnowledgeBaseItem>(`/knowledge_base/${itemId}`);
  }

  async updateKnowledgeBaseItem(
    itemId: string,
    data: { title?: string; content?: string; category?: string }
  ): Promise<ApiResponse<KnowledgeBaseItem>> {
    return this.put<KnowledgeBaseItem>(`/knowledge_base/${itemId}`, data);
  }

  async deleteKnowledgeBaseItem(itemId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/knowledge_base/${itemId}`);
  }

  // Chat Agents methods
  async getChatAgents(params?: {
    page?: number;
    per_page?: number;
    search?: string;
  }): Promise<ApiResponse<{ items: ChatAgent[]; total: number }>> {
    return this.get<{ items: ChatAgent[]; total: number }>('/chat_agents/', params);
  }

  async createChatAgent(data: any): Promise<ApiResponse<ChatAgent>> {
    // Validate required fields before sending
    const validation = this.validateChatAgentData(data);
    if (!validation.isValid) {
      return {
        error: {
          message: 'Validation failed: ' + validation.errors.join(', '),
          code: 'validation_error',
          details: validation.errors.reduce((acc, error, index) => {
            acc[`field_${index}`] = error;
            return acc;
          }, {} as Record<string, string>)
        }
      };
    }

    return this.post<ChatAgent>('/chat_agents/', data);
  }

  async getChatAgent(agentId: string): Promise<ApiResponse<ChatAgent>> {
    return this.get<ChatAgent>(`/chat_agents/${agentId}`);
  }

  async updateChatAgent(agentId: string, data: any): Promise<ApiResponse<ChatAgent>> {
    return this.put<ChatAgent>(`/chat_agents/${agentId}`, data);
  }

  async deleteChatAgent(agentId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chat_agents/${agentId}`);
  }

  // Business Integrations methods
  async getBusinessIntegrations(): Promise<ApiResponse<Integration[]>> {
    return this.get<Integration[]>('/business_integrations/');
  }

  async createBusinessIntegration(
    data: { name: string; type: string; credentials: Record<string, any>; status?: string }
  ): Promise<ApiResponse<Integration>> {
    return this.post<Integration>('/business_integrations/', data);
  }

  async updateBusinessIntegration(
    integrationId: string,
    data: { name?: string; credentials?: Record<string, any>; status?: string }
  ): Promise<ApiResponse<Integration>> {
    return this.put<Integration>(`/business_integrations/${integrationId}`, data);
  }

  async deleteBusinessIntegration(integrationId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/business_integrations/${integrationId}`);
  }

  // Contacts methods
  async getContacts(params?: {
    search?: string;
    phone?: string;
    email?: string;
  }): Promise<ApiResponse<Contact[]>> {
    return this.get<Contact[]>('/contacts/', params);
  }

  async createContact(data: any): Promise<ApiResponse<Contact>> {
    return this.post<Contact>('/contacts/', data);
  }

  async getContact(contactId: string): Promise<ApiResponse<Contact>> {
    return this.get<Contact>(`/contacts/${contactId}`);
  }

  async updateContact(contactId: string, data: any): Promise<ApiResponse<Contact>> {
    return this.put<Contact>(`/contacts/${contactId}`, data);
  }

  async deleteContact(contactId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/contacts/${contactId}`);
  }

  // Leads methods
  async getLeads(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    source?: string;
    search?: string;
  }): Promise<ApiResponse<{ leads: Lead[]; total: number; page: number; per_page: number }>> {
    return this.get<{ leads: Lead[]; total: number; page: number; per_page: number }>('/leads/', params);
  }

  async createLead(data: any): Promise<ApiResponse<Lead>> {
    return this.post<Lead>('/leads/', data);
  }

  async getLead(leadId: string): Promise<ApiResponse<Lead>> {
    return this.get<Lead>(`/leads/${leadId}`);
  }

  async updateLead(leadId: string, data: any): Promise<ApiResponse<Lead>> {
    return this.put<Lead>(`/leads/${leadId}`, data);
  }

  async deleteLead(leadId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/leads/${leadId}`);
  }

  // Orders methods
  async getOrders(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ orders: Order[]; total: number; page: number; per_page: number }>> {
    return this.get<{ orders: Order[]; total: number; page: number; per_page: number }>('/orders/', params);
  }

  async createOrder(data: any): Promise<ApiResponse<Order>> {
    return this.post<Order>('/orders/', data);
  }

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.get<Order>(`/orders/${orderId}`);
  }

  async updateOrder(orderId: string, data: any): Promise<ApiResponse<Order>> {
    return this.put<Order>(`/orders/${orderId}`, data);
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/orders/${orderId}`);
  }

  // Appointments methods
  async getAppointments(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ appointments: Appointment[]; total: number; page: number; per_page: number }>> {
    return this.get<{ appointments: Appointment[]; total: number; page: number; per_page: number }>('/appointments/', params);
  }

  async createAppointment(data: any): Promise<ApiResponse<Appointment>> {
    return this.post<Appointment>('/appointments/', data);
  }

  async getAppointment(appointmentId: string): Promise<ApiResponse<Appointment>> {
    return this.get<Appointment>(`/appointments/${appointmentId}`);
  }

  async updateAppointment(appointmentId: string, data: any): Promise<ApiResponse<Appointment>> {
    return this.put<Appointment>(`/appointments/${appointmentId}`, data);
  }

  async deleteAppointment(appointmentId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/appointments/${appointmentId}`);
  }

  // Conversations methods
  async getConversations(params?: {
    lead_id?: number;
    page?: number;
    per_page?: number;
    mode?: string;
  }): Promise<ApiResponse<{ conversations: Conversation[]; total: number; page: number; per_page: number }>> {
    return this.get<{ conversations: Conversation[]; total: number; page: number; per_page: number }>('/convos/', params);
  }

  async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return this.get<Conversation>(`/convos/convo/${conversationId}`);
  }

  async getConversationMessages(conversationId: string, params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{ messages: ConversationMessage[]; total: number; page: number; per_page: number }>> {
    return this.get<{ messages: ConversationMessage[]; total: number; page: number; per_page: number }>(`/convos/${conversationId}/messages`, params);
  }

  async sendConversationMessage(conversationId: string, data: {
    content: string;
    message_type?: 'text' | 'image' | 'file' | 'system';
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<ConversationMessage>> {
    return this.post<ConversationMessage>(`/convos/${conversationId}/messages`, data);
  }

  async updateConversationMode(conversationId: string, mode: 'AI' | 'Manual'): Promise<ApiResponse<Conversation>> {
    return this.put<Conversation>(`/convos/${conversationId}/mode`, { mode });
  }

  async updateConversationSummary(conversationId: string, summary: string): Promise<ApiResponse<Conversation>> {
    return this.put<Conversation>(`/convos/${conversationId}/summary`, { summary });
  }

  // Chat Agent Configuration methods
  async getChatAgentConfig(agentId: string): Promise<ApiResponse<ChatAgentConfig>> {
    return this.get<ChatAgentConfig>(`/chat-agents/${agentId}/config`);
  }

  async updateChatAgentConfig(agentId: string, data: Partial<ChatAgentConfig>): Promise<ApiResponse<ChatAgentConfig>> {
    return this.put<ChatAgentConfig>(`/chat-agents/${agentId}/config`, data);
  }

  async validateChatAgentConfig(agentId: string, data: Partial<ChatAgentConfig>): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    return this.post<{ valid: boolean; errors?: string[] }>(`/chat-agents/${agentId}/config/validate`, data);
  }

  // Chat Agent Knowledge Base linking
  async linkKnowledgeBaseToAgent(agentId: string, knowledgeBaseIds: number[]): Promise<ApiResponse<void>> {
    return this.post<void>(`/chat_agent_knowledge_base/`, { chat_agent_id: agentId, knowledge_base_ids: knowledgeBaseIds });
  }

  async unlinkKnowledgeBaseFromAgent(agentId: string, knowledgeBaseId: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chat_agent_knowledge_base/${agentId}/${knowledgeBaseId}`);
  }

  async getAgentKnowledgeBases(agentId: string): Promise<ApiResponse<{ knowledge_bases: KnowledgeBaseItem[] }>> {
    return this.get<{ knowledge_bases: KnowledgeBaseItem[] }>(`/chat_agent_knowledge_base/${agentId}`);
  }

  // Chat Agent testing (for future implementation)
  async testChatAgentMessage(agentId: string, message: string): Promise<ApiResponse<{ response: string; typing_delay: number }>> {
    return this.post<{ response: string; typing_delay: number }>(`/chat-agents/${agentId}/test-message`, { message });
  }

  // WebSocket connection for real-time chat (placeholder for future implementation)
  connectWebSocket(agentId: string, conversationId: string): WebSocket {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    return new WebSocket(`${wsUrl}/chat-agents/${agentId}/conversations/${conversationId}`);
  }

  // Validation methods
  private validateChatAgentData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 3) {
      errors.push('Name is required and must be at least 3 characters');
    }
    if (data.name && data.name.length > 50) {
      errors.push('Name must be no more than 50 characters');
    }

    // Optional but validated fields
    if (data.description && data.description.length > 200) {
      errors.push('Description must be no more than 200 characters');
    }

    if (data.role && typeof data.role !== 'string') {
      errors.push('Role must be a string');
    }

    if (data.active !== undefined && typeof data.active !== 'boolean') {
      errors.push('Active must be a boolean');
    }

    if (data.channels && typeof data.channels !== 'object') {
      errors.push('Channels must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const apiClient = new ApiClient();

// Utility function for consistent error handling across components
export function parseApiError(error: any): { message: string; code?: string; details?: Record<string, string> } {
  // Handle ApiError instances from our API client
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'unknown_error'
    };
  }

  // Handle API response objects with error structure
  if (error && typeof error === 'object' && error.error) {
    return {
      message: error.error.message || 'An error occurred',
      code: error.error.code || 'unknown_error',
      details: error.error.details
    };
  }

  // Handle network or other errors
  if (error && typeof error === 'object') {
    return {
      message: error.message || 'An unknown error occurred',
      code: 'network_error'
    };
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'unknown_error'
  };
}

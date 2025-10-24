import { ApiResponse, ApiError, RequestConfig, RequestOptions, ApiClientConfig } from './types';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export class ApiClient {
  private config: {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
    withCredentials: boolean;
    token: string | (() => string | null) | null;
    onRequest: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
    onResponse: <T>(response: Response) => Promise<T> | T;
    onError: (error: ApiError) => void | Promise<void>;
  };
  private pendingRequests: Map<string, AbortController> = new Map();

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL.replace(/\/+$/, ''), // Remove trailing slashes
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials ?? true,
      token: config.token ?? null,
      onRequest: config.onRequest || (async (cfg) => cfg),
      onResponse: config.onResponse || (async (res) => res.json()),
      onError: config.onError || (() => {}),
    };
  }

  private getToken(): string | null {
    if (typeof this.config.token === 'function') {
      return this.config.token();
    }
    return this.config.token || null;
  }

  private async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const requestId = `${method}:${url}`;
    
    // Cancel previous request with the same ID if exists
    this.cancelRequest(requestId);
    this.pendingRequests.set(requestId, controller);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }, options.timeout || this.config.timeout);

    try {
      // Prepare request config
      const headers = new Headers({
        ...this.config.headers,
        ...(options.headers || {}),
      });

      // Add auth header if needed
      if (!options.skipAuth) {
        const token = this.getToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }

      // Handle FormData
      let body: BodyInit | null = null;
      if (data) {
        if (options.isFormData) {
          body = data;
          // Let the browser set the Content-Type with boundary
          headers.delete('Content-Type');
        } else {
          body = JSON.stringify(data);
        }
      }

      // Build query string for GET/HEAD requests
      let requestUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
      
      if ((method === 'GET' || method === 'HEAD') && options.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, String(v)));
            } else {
              params.append(key, String(value));
            }
          }
        });
        const queryString = params.toString();
        if (queryString) {
          requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
        }
      }

      // Create request config
      const requestConfig: RequestConfig = {
        url: requestUrl,
        method,
        headers: Object.fromEntries(headers.entries()),
        signal: controller.signal,
        body,
        credentials: this.config.withCredentials ? 'include' : 'same-origin',
      };

      // Apply request interceptors
      const finalConfig = await this.config.onRequest(requestConfig);

      // Make the request
      const response = await fetch(finalConfig.url, finalConfig);

      // Clear timeout
      clearTimeout(timeoutId);
      this.pendingRequests.delete(requestId);

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData: any;
        const contentType = response.headers.get('content-type');
        
        try {
          errorData = contentType?.includes('application/json') 
            ? await response.json() 
            : await response.text();
        } catch (e) {
          errorData = { message: response.statusText };
        }

        const error: ApiError = new Error(
          errorData?.message || `Request failed with status ${response.status}`
        ) as ApiError;
        
        error.status = response.status;
        error.code = errorData?.code;
        error.details = errorData?.details;
        error.response = response;
        
        // Handle specific status codes
        if (response.status === 401) {
          // Handle unauthorized
          if (typeof window !== 'undefined') {
            // Clear auth state
            localStorage.removeItem('access_token');
            // Redirect to login
            window.location.href = '/login';
          }
        }
        
        await this.config.onError?.(error);
        throw error;
      }

      // Handle successful response
      try {
        let result: any;
        
        // Handle different response types
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          result = await response.json();
        } else if (contentType.startsWith('text/')) {
          result = await response.text();
        } else {
          result = await response.blob();
        }
        
        // Apply response interceptor
        return await this.config.onResponse<ApiResponse<T>>(response);
      } catch (error) {
        const apiError = new Error('Failed to parse response') as ApiError;
        apiError.status = response.status;
        apiError.response = response;
        throw apiError;
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      this.pendingRequests.delete(requestId);

      if (error instanceof Error && error.name === 'AbortError') {
        const abortError = new Error('Request was aborted') as ApiError;
        abortError.status = 0;
        abortError.code = 'ABORTED';
        throw abortError;
      }

      const apiError = error as ApiError;
      if (!apiError.status) {
        apiError.status = 0;
        apiError.code = 'NETWORK_ERROR';
      }

      await this.config.onError?.(apiError);
      throw apiError;
    }
  }

  private cancelRequest(requestId: string) {
    const controller = this.pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }
  }

  // HTTP Method shortcuts
  get<T = any>(url: string, params?: any, options: RequestOptions = {}) {
    return this.request<T>('GET', url, undefined, { ...options, params });
  }

  post<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('POST', url, data, options);
  }

  put<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('PUT', url, data, options);
  }

  patch<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('PATCH', url, data, options);
  }

  delete<T = any>(url: string, data?: any, options: RequestOptions = {}) {
    return this.request<T>('DELETE', url, data, options);
  }

  // File upload helper
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    fieldName = 'file',
    additionalData: Record<string, any> = {},
    options: Omit<RequestOptions, 'isFormData'> = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data as JSON string if needed
    if (Object.keys(additionalData).length > 0) {
      formData.append('data', JSON.stringify(additionalData));
    }
    
    return this.post<T>(url, formData, { ...options, isFormData: true });
  }

  // Cancel all pending requests
  cancelAllRequests() {
    for (const [requestId, controller] of this.pendingRequests.entries()) {
      controller.abort();
      this.pendingRequests.delete(requestId);
    }
  }

  // Set auth token
  setToken(token: string) {
    this.config.token = token;
  }

  // Clear auth token
  clearToken() {
    this.config.token = '';
  }
}

// Create a default instance
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  token: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  onError: (error) => {
    console.error('API Error:', error);
    // You can add global error handling here (e.g., show toast notification)
    if (error.status === 401) {
      console.log('Unauthorized - redirecting to login');
    }
  },
});

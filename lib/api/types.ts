import { HttpMethod } from './client';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  pagination?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  signal?: AbortSignal;
  skipAuth?: boolean;
  isFormData?: boolean;
  responseType?: 'json' | 'blob' | 'text';
}

export interface ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  response?: Response;
}

export interface RequestConfig extends RequestInit {
  url: string;
  method: HttpMethod;
  data?: any;
  options?: RequestOptions;
}

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  token?: string | (() => string | null);
  onRequest?: (config: RequestConfig) => Promise<RequestConfig> | RequestConfig;
  onResponse?: <T>(response: Response) => Promise<T> | T;
  onError?: (error: ApiError) => void | Promise<void>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SearchParams {
  q: string;
  page?: number;
  per_page?: number;
  [key: string]: any;
}

export interface UploadOptions {
  file: File;
  fieldName?: string;
  onUploadProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient, HttpMethod } from '@/lib/api/client';
import { ApiError, ApiResponse, RequestOptions } from '@/lib/api/types';

export interface UseApiOptions<T = any> {
  /** Callback function that's called when the request completes successfully */
  onSuccess?: (data: T) => void;
  /** Callback function that's called when the request fails */
  onError?: (error: ApiError) => void;
  /** Success message to show using toast notification */
  successMessage?: string;
  /** Whether to show error toasts (default: true) */
  showErrorToast?: boolean;
  /** Whether to throw errors (default: true) */
  throwOnError?: boolean;
  /** Skip authentication for this request */
  skipAuth?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query parameters (for GET requests) */
  params?: Record<string, any>;
  /** Response type (default: 'json') */
  responseType?: 'json' | 'blob' | 'text';
  /** Whether the request body is FormData */
  isFormData?: boolean;
  /** Request body data */
  body?: any;
}

export interface UseApiResult<T = any> {
  /** Response data */
  data: T | null;
  /** Error object if the request failed */
  error: ApiError | null;
  /** Whether the request is in progress */
  loading: boolean;
  /** Whether the request has completed successfully */
  isSuccess: boolean;
  /** Whether the request has failed */
  isError: boolean;
  /** Whether the request is the first request (useful for initial data loading) */
  isInitial: boolean;
  /** Function to manually trigger the request */
  execute: (config?: Partial<UseApiOptions<T>>) => Promise<T>;
  /** Function to reset the hook state */
  reset: () => void;
  /** Abort the current request */
  abort: () => void;
}

/**
 * A hook to make API requests with built-in loading and error states.
 * @param method HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param url API endpoint URL
 * @param options Request options
 * @returns An object containing the request state and controls
 */
export function useApi<T = any>(
  method: HttpMethod = 'GET',
  url: string = '',
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef<boolean>(true);

  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Reset the hook state
  const reset = useCallback(() => {
    if (!isMounted.current) return;
    setData(null);
    setError(null);
    setLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setIsInitial(true);
  }, []);

  // Abort the current request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Execute the API request
  const execute = useCallback(
    async (config: Partial<UseApiOptions<T>> = {}): Promise<T> => {
      // Merge default options with provided options
      const mergedOptions: UseApiOptions<T> = {
        showErrorToast: true,
        throwOnError: true,
        ...options,
        ...config,
      };

      // Extract all options for better type safety
      const {
        onSuccess,
        onError,
        successMessage,
        showErrorToast = true,
        throwOnError = true,
        isFormData,
        body,
        ...requestOptions
      } = mergedOptions;

      // Create new AbortController for this request
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Update state
      if (isMounted.current) {
        setLoading(true);
        setError(null);
        setIsError(false);
        setIsInitial(false);
      }

      try {
        // Make the request using the appropriate HTTP method
        let response: ApiResponse<T>;
        
        const requestConfig = {
          ...requestOptions,
          signal: abortController.signal,
          isFormData,
          headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...requestOptions.headers,
          },
        };

        switch (method) {
          case 'GET':
            response = await apiClient.get<T>(url, requestOptions.params || {}, requestConfig);
            break;
          case 'POST':
            response = await apiClient.post<T>(url, body, requestConfig);
            break;
          case 'PUT':
            response = await apiClient.put<T>(url, body, requestConfig);
            break;
          case 'PATCH':
            response = await apiClient.patch<T>(url, body, requestConfig);
            break;
          case 'DELETE':
            response = await apiClient.delete<T>(url, body, requestConfig);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        // Handle successful response
        if (isMounted.current) {
          // Only update state if data exists in the response
          if (response.data !== undefined) {
            setData(response.data);
            // Call success callback with the response data
            if (onSuccess) {
              onSuccess(response.data);
            }
          }
          
          setIsSuccess(true);
          setLoading(false);
          
          // Show success message if provided
          if (successMessage) {
            console.log(successMessage);
            // toast.success(successMessage);
          }

          // Return the response data
          return response.data as T;
        }

        // If component is unmounted, return a resolved promise with the response data
        return response?.data as T;
      } catch (err) {
        const apiError = err as ApiError;
        
        if (isMounted.current) {
          setError(apiError);
          setIsError(true);
          setLoading(false);
          
          // Call error callback if provided
          if (onError) {
            onError(apiError);
          }
          
          // Show error toast if enabled
          if (showErrorToast) {
            console.error(apiError.message || 'An error occurred');
            // toast.error(apiError.message || 'An error occurred');
          }
        }
        
        // Re-throw the error if throwOnError is true (default)
        if (throwOnError) {
          throw apiError;
        }
        
        // Return a rejected promise to maintain the same behavior as throwing
        return Promise.reject(apiError);
      } finally {
        if (isMounted.current && abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [method, url, options]
  );

  return {
    data,
    error,
    loading,
    isSuccess,
    isError,
    isInitial,
    execute,
    reset,
    abort,
  };
}

// Convenience hooks for common HTTP methods
export function useGet<T = any>(
  url: string,
  options: Omit<UseApiOptions<T>, 'method' | 'body'> = {}
) {
  return useApi<T>('GET', url, options);
}

type UseMutationOptions<T, D = any> = Omit<UseApiOptions<T>, 'method' | 'body'> & {
  /** Request body data */
  body?: D;
};

export function usePost<T = any, D = any>(
  url: string,
  options: UseMutationOptions<T, D> = {}
) {
  const { body, ...restOptions } = options;
  return useApi<T>('POST', url, { ...restOptions, body });
}

export function usePut<T = any, D = any>(
  url: string,
  options: UseMutationOptions<T, D> = {}
) {
  const { body, ...restOptions } = options;
  return useApi<T>('PUT', url, { ...restOptions, body });
}

export function usePatch<T = any, D = any>(
  url: string,
  options: UseMutationOptions<T, D> = {}
) {
  const { body, ...restOptions } = options;
  return useApi<T>('PATCH', url, { ...restOptions, body });
}

export function useDelete<T = any, D = any>(
  url: string,
  options: UseMutationOptions<T, D> = {}
) {
  const { body, ...restOptions } = options;
  return useApi<T>('DELETE', url, { ...restOptions, body });
}

// Example usage:
/*
// Basic usage
function ExampleComponent() {
  const { data, loading, error, execute } = useApi<YourDataType>('GET', '/api/endpoint');
  
  useEffect(() => {
    execute({
      params: { page: 1, limit: 10 },
      onSuccess: (data) => console.log('Data loaded:', data),
      onError: (error) => console.error('Error:', error),
    });
  }, [execute]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data && (
        // Render your data here
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

// Using convenience hooks
function AnotherExample() {
  const { data, loading, error, execute: fetchData } = useGet<User[]>('/api/users');
  const { execute: createUser } = usePost<User>('/api/users');
  
  const handleCreateUser = async (userData: User) => {
    try {
      await createUser({
        body: userData,
        successMessage: 'User created successfully!',
      });
      // Refresh the user list
      fetchData();
    } catch (error) {
      // Error is already handled by the hook
    }
  };
  
  return (
    <div>
      <button onClick={() => handleCreateUser({ name: 'New User' })}>
        Create User
      </button>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div>Error loading users: {error.message}</div>
      ) : (
        <ul>
          {data?.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
*/

import React from 'react';
import { toast } from 'sonner';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public code?: string,
    public details?: any,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // Helper to check error type
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 422;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }

  // Format error for display
  getDisplayMessage(): string {
    if (this.isNetworkError()) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    if (this.isUnauthorized()) {
      return 'Your session has expired. Please log in again.';
    }

    if (this.isForbidden()) {
      return 'You do not have permission to perform this action.';
    }

    if (this.isValidationError() && this.details) {
      // Handle validation errors (422)
      const messages = Object.entries(this.details)
        .map(([field, errors]) => {
          const errorList = Array.isArray(errors) ? errors.join(', ') : String(errors);
          return `${field}: ${errorList}`;
        })
        .join('\n');
      
      return `Validation failed:\n${messages}`;
    }

    // Default to the error message if available, otherwise a generic message
    return this.message || 'An unexpected error occurred. Please try again later.';
  }
}

// Global error handler
export const handleApiError = (error: unknown, defaultMessage = 'An error occurred'): never => {
  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof Error) {
    apiError = new ApiError(error.message || defaultMessage);
  } else if (typeof error === 'string') {
    apiError = new ApiError(error);
  } else {
    apiError = new ApiError(defaultMessage);
  }

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
      details: apiError.details,
      stack: apiError.stack,
    });
  }

  // Show error to user
  toast.error(apiError.getDisplayMessage(), {
    duration: 5000,
    position: 'top-right',
  });

  // Special handling for unauthorized errors
  if (apiError.isUnauthorized() && typeof window !== 'undefined') {
    // Clear auth state
    localStorage.removeItem('access_token');
    // Redirect to login after a short delay to show the error message
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  }

  throw apiError;
};

// Error boundary component for React
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (<div>Something went wrong. Please try again later.</div>);
    }

    return this.props.children;
  }
}

// Higher-order function for error handling
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage?: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      const message = errorMessage || (error instanceof Error ? error.message : 'An error occurred');
      const apiError = error instanceof Error ? error : new Error(message);
      return handleApiError(apiError) as never;
    }
  };
};

// Error codes for common scenarios
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  ABORTED: 'ABORTED',
} as const;

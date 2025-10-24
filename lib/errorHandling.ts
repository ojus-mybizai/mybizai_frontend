import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: number = 0,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: unknown, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  let message = defaultMessage;
  let code = 0;
  
  if (error instanceof AppError) {
    message = error.message;
    code = error.code;
  } else if (error instanceof Error) {
    message = error.message || defaultMessage;
  }
  
  // Show error to user
  toast.error(message);
  
  // You can add more sophisticated error handling here
  // For example, redirect to login on 401
  if (code === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  
  // Return a rejected promise with the error
  return Promise.reject(new AppError(message, code));
};

export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    return handleApiError(error, errorMessage) as Promise<T>;
  }
};

// Frontend validation rules based on API validation guide

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Authentication validation
export const validateSignupData = (data: {
  email: string;
  name: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Email validation - required, valid email format
  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  // Name validation - required, min 2 characters, max 100 characters
  if (!data.name.trim()) {
    errors.push('Name is required');
  } else if (data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must be no more than 100 characters');
  }

  // Password validation - required, min 8 characters
  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Catalog validation
export const validateCatalogItem = (data: {
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  availability?: string;
  type: string;
  extra_data?: Record<string, any>;
  template_id?: number;
}): ValidationResult => {
  const errors: string[] = [];

  // Name validation - required, min 3 characters, max 100 characters
  if (!data.name.trim()) {
    errors.push('Name is required');
  } else if (data.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must be no more than 100 characters');
  }

  // Description validation - optional, max 2000 characters
  if (data.description && data.description.length > 2000) {
    errors.push('Description must be no more than 2000 characters');
  }

  // Category validation - optional, max 100 characters
  if (data.category && data.category.length > 100) {
    errors.push('Category must be no more than 100 characters');
  }

  // Price validation - required, minimum 0
  if (data.price === undefined || data.price === null) {
    errors.push('Price is required');
  } else if (data.price < 0) {
    errors.push('Price must be 0 or greater');
  }

  // Currency validation - optional, enum validation
  const validCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
  if (data.currency && !validCurrencies.includes(data.currency)) {
    errors.push('Currency must be one of: INR, USD, EUR, GBP');
  }

  // Availability validation - optional, enum validation
  const validAvailabilities = ['in_stock', 'out_of_stock', 'pre_order', 'discontinued'];
  if (data.availability && !validAvailabilities.includes(data.availability)) {
    errors.push('Availability must be one of: in_stock, out_of_stock, pre_order, discontinued');
  }

  // Type validation - required, enum validation
  const validTypes = ['product', 'service'];
  if (!data.type) {
    errors.push('Type is required');
  } else if (!validTypes.includes(data.type)) {
    errors.push('Type must be either product or service');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Knowledge Base validation
export const validateKnowledgeBaseItem = (data: {
  title: string;
  content?: string;
  category?: string;
  type: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Title validation - required, min 3 characters, max 200 characters
  if (!data.title.trim()) {
    errors.push('Title is required');
  } else if (data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (data.title.trim().length > 200) {
    errors.push('Title must be no more than 200 characters');
  }

  // Content validation for text type - required, min 10 characters, max 10000 characters
  if (data.type === 'text') {
    if (!data.content || !data.content.trim()) {
      errors.push('Content is required for text entries');
    } else if (data.content.trim().length < 10) {
      errors.push('Content must be at least 10 characters');
    } else if (data.content.trim().length > 10000) {
      errors.push('Content must be no more than 10,000 characters');
    }
  }

  // Category validation - optional, max 100 characters
  if (data.category && data.category.length > 100) {
    errors.push('Category must be no more than 100 characters');
  }

  // Type validation - required, must be 'text'
  if (!data.type) {
    errors.push('Type is required');
  } else if (data.type !== 'text') {
    errors.push('Type must be "text"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File upload validation
export const validateFileUpload = (file: File, type: 'image' | 'document'): ValidationResult => {
  const errors: string[] = [];

  if (type === 'image') {
    // Image validation - max 5MB, supported formats: JPEG, PNG, WEBP
    const maxSize = 5 * 1024 * 1024; // 5MB
    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      errors.push('Image file must be no larger than 5MB');
    }

    if (!supportedFormats.includes(file.type)) {
      errors.push('Image must be in JPEG, PNG, or WEBP format');
    }
  } else if (type === 'document') {
    // Document validation - max 10MB, supported formats: PDF, DOCX, TXT
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedFormats = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      errors.push('Document file must be no larger than 10MB');
    }

    if (!supportedFormats.includes(file.type)) {
      errors.push('Document must be in PDF, DOCX, or TXT format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Business Integration validation
export const validateBusinessIntegration = (data: {
  name: string;
  type: string;
  credentials: Record<string, any>;
  status?: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Name validation - required, min 3 characters, max 100 characters
  if (!data.name.trim()) {
    errors.push('Name is required');
  } else if (data.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must be no more than 100 characters');
  }

  // Type validation - required, enum validation
  const validTypes = ['shopify', 'woocommerce', 'zoho_crm', 'hubspot', 'custom_api', 'other'];
  if (!data.type) {
    errors.push('Type is required');
  } else if (!validTypes.includes(data.type)) {
    errors.push('Type must be one of: shopify, woocommerce, zoho_crm, hubspot, custom_api, other');
  }

  // Credentials validation - required, must be object
  if (!data.credentials || typeof data.credentials !== 'object') {
    errors.push('Credentials are required');
  }

  // Status validation - optional, enum validation
  const validStatuses = ['active', 'inactive', 'error'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Status must be one of: active, inactive, error');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Field-level validation helpers
export const getFieldError = (
  fieldName: string,
  value: any,
  validationErrors: Record<string, string>
): string => {
  return validationErrors[fieldName] || '';
};

export const hasFieldError = (
  fieldName: string,
  validationErrors: Record<string, string>
): boolean => {
  return !!validationErrors[fieldName];
};

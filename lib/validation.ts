/**
 * Comprehensive validation utilities for forms
 * Matches Vercel validation patterns and rules
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  [key: string]: ValidationRule;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+234|234|0)?[789][01]\d{8}$/,
  nin: /^\d{11}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  website: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
  dateOfBirth: /^\d{2}\/\d{2}\/\d{4}$/,
  name: /^[a-zA-Z\s'-]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
};

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  pattern: (field: string) => `Please enter a valid ${field}`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid Nigerian phone number',
  nin: 'NIN must be exactly 11 digits',
  password: 'Password must contain uppercase, lowercase, number, and special character',
  strongPassword: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  website: 'Please enter a valid website URL',
  dateOfBirth: 'Please enter date in DD/MM/YYYY format',
  name: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  alphanumeric: 'Field can only contain letters, numbers, and spaces',
  passwordsMatch: 'Passwords do not match',
  age: 'You must be at least 18 years old to register',
  terms: 'You must agree to the terms and conditions',
};

// Validation rules for different form types
export const VALIDATION_RULES = {
  // Login form validation
  login: {
    emailOrNin: {
      required: true,
      message: 'Email or NIN is required',
    },
    password: {
      required: true,
      minLength: 6,
      message: 'Password is required',
    },
  },

  // Registration form validation
  register: {
    surname: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.name,
      message: VALIDATION_MESSAGES.name,
    },
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.name,
      message: VALIDATION_MESSAGES.name,
    },
    otherName: {
      maxLength: 50,
      pattern: VALIDATION_PATTERNS.name,
      message: VALIDATION_MESSAGES.name,
    },
    dateOfBirth: {
      required: true,
      pattern: VALIDATION_PATTERNS.dateOfBirth,
      custom: (value: string) => {
        if (!value) return VALIDATION_MESSAGES.required('Date of birth');
        
        // Check date format
        if (!VALIDATION_PATTERNS.dateOfBirth.test(value)) {
          return VALIDATION_MESSAGES.dateOfBirth;
        }
        
        // Check age
        const age = calculateAge(value);
        if (age < 18) {
          return VALIDATION_MESSAGES.age;
        }
        
        return null;
      },
    },
    gender: {
      required: true,
      message: 'Gender is required',
    },
    phoneNumber: {
      required: true,
      pattern: VALIDATION_PATTERNS.phone,
      message: VALIDATION_MESSAGES.phone,
    },
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.email,
      message: VALIDATION_MESSAGES.email,
    },
    stateOfOrigin: {
      required: true,
      message: 'State of origin is required',
    },
    lgaOfOrigin: {
      required: true,
      message: 'LGA of origin is required',
    },
    stateOfResidence: {
      required: true,
      message: 'State of residence is required',
    },
    lgaOfResidence: {
      required: true,
      message: 'LGA of residence is required',
    },
    ward: {
      required: true,
      message: 'Ward is required',
    },
    pollingUnit: {
      required: true,
      message: 'Polling unit is required',
    },
    password: {
      required: true,
      minLength: 8,
      pattern: VALIDATION_PATTERNS.strongPassword,
      message: VALIDATION_MESSAGES.strongPassword,
    },
    confirmPassword: {
      required: true,
      custom: (value: string, formData: any) => {
        if (!value) return VALIDATION_MESSAGES.required('Confirm password');
        if (value !== formData.password) return VALIDATION_MESSAGES.passwordsMatch;
        return null;
      },
    },
    terms: {
      required: true,
      message: VALIDATION_MESSAGES.terms,
    },
  },

  // Forgot password form validation
  forgotPassword: {
    email: {
      required: true,
      pattern: VALIDATION_PATTERNS.email,
      message: VALIDATION_MESSAGES.email,
    },
  },

  // NIN verification validation
  nin: {
    nin: {
      required: true,
      pattern: VALIDATION_PATTERNS.nin,
      message: VALIDATION_MESSAGES.nin,
    },
  },
};

// Utility functions
export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  
  // Parse DD/MM/YYYY format
  const parts = dateOfBirth.split('/').map(Number);
  const [day, month, year] = parts;
  if (!day || !month || !year) return 0;
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Convert to standard format
  if (cleanPhone.startsWith('+234')) {
    return cleanPhone;
  } else if (cleanPhone.startsWith('234')) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith('0')) {
    return `+234${cleanPhone.substring(1)}`;
  } else if (cleanPhone.length === 10) {
    return `+234${cleanPhone}`;
  }
  
  return cleanPhone;
};

export const isValidNigerianPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  const patterns = [
    /^\+234[789]\d{9}$/,     // +234 + 9 digits starting with 7, 8, or 9
    /^234[789]\d{9}$/,       // 234 + 9 digits starting with 7, 8, or 9
    /^0[789]\d{9}$/,         // 0 + 9 digits starting with 7, 8, or 9 (11 total)
    /^[789]\d{9}$/           // 9 digits starting with 7, 8, or 9 (10 total)
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

// Main validation function
export const validateField = (
  fieldName: string,
  value: string,
  rules: ValidationRule,
  formData?: any
): string | null => {
  // Required validation
  if (rules.required && (!value || value.trim().length === 0)) {
    return rules.message || VALIDATION_MESSAGES.required(fieldName);
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim().length === 0) {
    return null;
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return rules.message || VALIDATION_MESSAGES.minLength(fieldName, rules.minLength);
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.message || VALIDATION_MESSAGES.maxLength(fieldName, rules.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message || VALIDATION_MESSAGES.pattern(fieldName);
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

// Validate entire form
export const validateForm = (
  formData: Record<string, any>,
  rules: FieldValidation
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldRules = rules[fieldName];
    
    if (fieldRules) {
      const error = validateField(fieldName, fieldValue, fieldRules, formData);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Real-time validation for specific field
export const validateFieldRealTime = (
  fieldName: string,
  value: string,
  rules: FieldValidation,
  formData?: any
): string | null => {
  const fieldRules = rules[fieldName];
  if (!fieldRules) return null;

  return validateField(fieldName, value, fieldRules, formData);
};

// Debounced validation for real-time feedback
export const createDebouncedValidator = (
  delay: number = 500
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (
    fieldName: string,
    value: string,
    rules: FieldValidation,
    callback: (error: string | null) => void,
    formData?: any
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const error = validateFieldRealTime(fieldName, value, rules, formData);
      callback(error);
    }, delay);
  };
};

// Import React hooks
import { useState, useCallback } from 'react';

// Form validation hooks
export const useFormValidation = (rules: FieldValidation) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((
    fieldName: string,
    value: string,
    formData?: any
  ) => {
    const error = validateFieldRealTime(fieldName, value, rules, formData);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error || '',
    }));
    return error;
  }, [rules]);

  const validateFormCallback = useCallback((formData: Record<string, any>) => {
    const result = validateForm(formData, rules);
    setErrors(result.errors);
    return result;
  }, [rules]);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm: validateFormCallback,
    setFieldTouched,
    clearErrors,
    clearFieldError,
  };
};

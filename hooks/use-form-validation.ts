/**
 * Custom hooks for form validation
 * Provides real-time validation and error handling
 */

import { useState, useCallback, useRef } from 'react';
import { validateField as validateFieldUtil, validateForm as validateFormUtil, createDebouncedValidator, VALIDATION_RULES } from '@/lib/validation';

export interface UseFormValidationOptions {
  rules: string; // 'login' | 'register' | 'forgotPassword' | 'nin'
  debounceDelay?: number;
  realTimeValidation?: boolean;
}

export interface FormValidationState {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FormValidationActions {
  validateField: (fieldName: string, value: string, formData?: any) => string | null;
  validateForm: (formData: Record<string, any>) => { isValid: boolean; errors: Record<string, string> };
  setFieldTouched: (fieldName: string) => void;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useFormValidation = (options: UseFormValidationOptions) => {
  const { rules: rulesKey, debounceDelay = 500, realTimeValidation = true } = options;
  const rules = VALIDATION_RULES[rulesKey as keyof typeof VALIDATION_RULES];
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const debouncedValidator = useRef(createDebouncedValidator(debounceDelay));

  const validateField = useCallback((
    fieldName: string,
    value: string,
    formData?: any
  ): string | null => {
    if (!rules[fieldName]) return null;
    
    const error = validateFieldUtil(fieldName, value, rules[fieldName], formData);
    
    if (realTimeValidation) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || '',
      }));
    }
    
    return error;
  }, [rules, realTimeValidation]);

  const validateForm = useCallback((formData: Record<string, any>) => {
    const result = validateFormUtil(formData, rules);
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

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // Debounced validation for real-time feedback
  const validateFieldDebounced = useCallback((
    fieldName: string,
    value: string,
    callback: (error: string | null) => void,
    formData?: any
  ) => {
    if (!realTimeValidation) return;
    
    debouncedValidator.current(
      fieldName,
      value,
      rules,
      callback,
      formData
    );
  }, [rules, realTimeValidation]);

  const isValid = Object.keys(errors).length === 0;

  return {
    // State
    errors,
    touched,
    isValid,
    isSubmitting,
    
    // Actions
    validateField,
    validateForm,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    setSubmitting,
    reset,
    validateFieldDebounced,
  };
};

// Hook for specific form types
export const useLoginValidation = () => {
  return useFormValidation({
    rules: 'login',
    debounceDelay: 300,
    realTimeValidation: true,
  });
};

export const useRegisterValidation = () => {
  return useFormValidation({
    rules: 'register',
    debounceDelay: 500,
    realTimeValidation: true,
  });
};

export const useForgotPasswordValidation = () => {
  return useFormValidation({
    rules: 'forgotPassword',
    debounceDelay: 300,
    realTimeValidation: true,
  });
};

export const useNinValidation = () => {
  return useFormValidation({
    rules: 'nin',
    debounceDelay: 300,
    realTimeValidation: true,
  });
};

// Hook for field-specific validation
export const useFieldValidation = (
  fieldName: string,
  rules: string,
  formData?: any
) => {
  const validationRules = VALIDATION_RULES[rules as keyof typeof VALIDATION_RULES];
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback((value: string) => {
    if (!validationRules[fieldName]) return;
    
    setIsValidating(true);
    
    const fieldError = validateFieldUtil(fieldName, value, validationRules[fieldName], formData);
    setError(fieldError || '');
    setIsValidating(false);
    
    return fieldError;
  }, [fieldName, validationRules, formData]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    error,
    isValidating,
    validate,
    clearError,
  };
};

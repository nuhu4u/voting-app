/**
 * Tests for validation utilities
 */

import {
  validateField,
  validateForm,
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
  calculateAge,
  formatPhoneNumber,
  isValidNigerianPhone,
} from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const rules = { required: true, message: 'Field is required' };
      const result = validateField('test', '', rules);
      expect(result).toBe('Field is required');
    });

    it('should validate minLength', () => {
      const rules = { minLength: 5, message: 'Must be at least 5 characters' };
      const result = validateField('test', 'abc', rules);
      expect(result).toBe('Must be at least 5 characters');
    });

    it('should validate maxLength', () => {
      const rules = { maxLength: 5, message: 'Must be no more than 5 characters' };
      const result = validateField('test', 'abcdef', rules);
      expect(result).toBe('Must be no more than 5 characters');
    });

    it('should validate patterns', () => {
      const rules = { pattern: VALIDATION_PATTERNS.email, message: 'Invalid email' };
      const result = validateField('email', 'invalid-email', rules);
      expect(result).toBe('Invalid email');
    });

    it('should validate custom functions', () => {
      const rules = {
        custom: (value: string) => value === 'valid' ? null : 'Invalid value'
      };
      const result = validateField('test', 'invalid', rules);
      expect(result).toBe('Invalid value');
    });

    it('should return null for valid fields', () => {
      const rules = { required: true, minLength: 3 };
      const result = validateField('test', 'valid', rules);
      expect(result).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const formData = {
        email: 'invalid-email',
        password: '123',
      };
      const rules = {
        email: { pattern: VALIDATION_PATTERNS.email, message: 'Invalid email' },
        password: { minLength: 8, message: 'Password too short' },
      };
      const result = validateForm(formData, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email');
      expect(result.errors.password).toBe('Password too short');
    });

    it('should return valid for correct form', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const rules = {
        email: { pattern: VALIDATION_PATTERNS.email },
        password: { minLength: 8 },
      };
      const result = validateForm(formData, rules);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('VALIDATION_PATTERNS', () => {
    it('should validate email patterns', () => {
      expect(VALIDATION_PATTERNS.email.test('test@example.com')).toBe(true);
      expect(VALIDATION_PATTERNS.email.test('invalid-email')).toBe(false);
    });

    it('should validate phone patterns', () => {
      expect(VALIDATION_PATTERNS.phone.test('+2348012345678')).toBe(true);
      expect(VALIDATION_PATTERNS.phone.test('08012345678')).toBe(true);
      expect(VALIDATION_PATTERNS.phone.test('invalid-phone')).toBe(false);
    });

    it('should validate NIN patterns', () => {
      expect(VALIDATION_PATTERNS.nin.test('12345678901')).toBe(true);
      expect(VALIDATION_PATTERNS.nin.test('1234567890')).toBe(false);
    });

    it('should validate password patterns', () => {
      expect(VALIDATION_PATTERNS.strongPassword.test('Password123!')).toBe(true);
      expect(VALIDATION_PATTERNS.strongPassword.test('password')).toBe(false);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const birthDate = `01/01/${birthYear}`;
      
      const age = calculateAge(birthDate);
      expect(age).toBe(25);
    });

    it('should handle invalid date format', () => {
      const age = calculateAge('invalid-date');
      expect(age).toBe(0);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('08012345678')).toBe('+2348012345678');
      expect(formatPhoneNumber('2348012345678')).toBe('+2348012345678');
      expect(formatPhoneNumber('+2348012345678')).toBe('+2348012345678');
      expect(formatPhoneNumber('8012345678')).toBe('+2348012345678');
    });
  });

  describe('isValidNigerianPhone', () => {
    it('should validate Nigerian phone numbers', () => {
      expect(isValidNigerianPhone('+2348012345678')).toBe(true);
      expect(isValidNigerianPhone('08012345678')).toBe(true);
      expect(isValidNigerianPhone('8012345678')).toBe(true);
      expect(isValidNigerianPhone('invalid-phone')).toBe(false);
    });
  });

  describe('VALIDATION_RULES', () => {
    it('should have login rules', () => {
      expect(VALIDATION_RULES.login).toBeDefined();
      expect(VALIDATION_RULES.login.emailOrNin).toBeDefined();
      expect(VALIDATION_RULES.login.password).toBeDefined();
    });

    it('should have register rules', () => {
      expect(VALIDATION_RULES.register).toBeDefined();
      expect(VALIDATION_RULES.register.surname).toBeDefined();
      expect(VALIDATION_RULES.register.firstName).toBeDefined();
      expect(VALIDATION_RULES.register.email).toBeDefined();
      expect(VALIDATION_RULES.register.password).toBeDefined();
    });

    it('should have forgot password rules', () => {
      expect(VALIDATION_RULES.forgotPassword).toBeDefined();
      expect(VALIDATION_RULES.forgotPassword.email).toBeDefined();
    });

    it('should have NIN rules', () => {
      expect(VALIDATION_RULES.nin).toBeDefined();
      expect(VALIDATION_RULES.nin.nin).toBeDefined();
    });
  });
});

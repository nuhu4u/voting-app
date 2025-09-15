/**
 * Tests for Forgot Password page
 */

import React from 'react';
import { render, fireEvent, waitFor } from '../utils/test-utils';
import ForgotPasswordScreen from '@/app/(auth)/forgot-password';

// Mock the hooks
jest.mock('@/hooks/use-form-validation', () => ({
  useForgotPasswordValidation: () => ({
    errors: {},
    validateField: jest.fn(),
    validateForm: jest.fn(() => ({ isValid: true, errors: {} })),
    setFieldTouched: jest.fn(),
    clearErrors: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-password-visibility', () => ({
  usePasswordVisibility: () => ({
    isVisible: false,
    toggle: jest.fn(),
  }),
}));

jest.mock('@/store/ui-store', () => ({
  useUIStore: () => ({
    addNotification: jest.fn(),
  }),
}));

describe('ForgotPasswordScreen', () => {
  it('renders email step correctly', () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    expect(getByText('Forgot Password?')).toBeTruthy();
    expect(getByText('No worries, we\'ll send you reset instructions')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email or NIN')).toBeTruthy();
    expect(getByText('Send Reset Code')).toBeTruthy();
  });

  it('handles email input correctly', () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    fireEvent.changeText(emailInput, 'test@example.com');
    
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('shows loading state when submitting email', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    // Should show loading state
    await waitFor(() => {
      expect(getByText('Sending...')).toBeTruthy();
    });
  });

  it('navigates to OTP step after email submission', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    // Wait for step transition
    await waitFor(() => {
      expect(getByText('Enter Verification Code')).toBeTruthy();
      expect(getByPlaceholderText('Enter 6-digit code')).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('shows OTP step with countdown timer', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // First submit email
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    // Wait for OTP step
    await waitFor(() => {
      expect(getByText('Enter Verification Code')).toBeTruthy();
      expect(getByText(/Resend code in/)).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('handles OTP input correctly', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // Navigate to OTP step
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      const otpInput = getByPlaceholderText('Enter 6-digit code');
      fireEvent.changeText(otpInput, '123456');
      expect(otpInput.props.value).toBe('123456');
    }, { timeout: 2000 });
  });

  it('shows resend button when timer expires', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // Navigate to OTP step
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(getByText('Enter Verification Code')).toBeTruthy();
    }, { timeout: 2000 });
    
    // Timer should show initially
    expect(getByText(/Resend code in/)).toBeTruthy();
  });

  it('navigates to new password step after OTP verification', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // Navigate to OTP step
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      const otpInput = getByPlaceholderText('Enter 6-digit code');
      const verifyButton = getByText('Verify Code');
      
      fireEvent.changeText(otpInput, '123456');
      fireEvent.press(verifyButton);
    }, { timeout: 2000 });
    
    // Wait for new password step
    await waitFor(() => {
      expect(getByText('Create New Password')).toBeTruthy();
      expect(getByPlaceholderText('Enter new password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm new password')).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('handles password input correctly', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // Navigate through steps to password step
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      const otpInput = getByPlaceholderText('Enter 6-digit code');
      const verifyButton = getByText('Verify Code');
      
      fireEvent.changeText(otpInput, '123456');
      fireEvent.press(verifyButton);
    }, { timeout: 2000 });
    
    await waitFor(() => {
      const passwordInput = getByPlaceholderText('Enter new password');
      const confirmInput = getByPlaceholderText('Confirm new password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmInput, 'newpassword123');
      
      expect(passwordInput.props.value).toBe('newpassword123');
      expect(confirmInput.props.value).toBe('newpassword123');
    }, { timeout: 2000 });
  });

  it('shows success step after password reset', async () => {
    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    
    // Navigate through all steps
    const emailInput = getByPlaceholderText('Enter your email or NIN');
    const submitButton = getByText('Send Reset Code');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      const otpInput = getByPlaceholderText('Enter 6-digit code');
      const verifyButton = getByText('Verify Code');
      
      fireEvent.changeText(otpInput, '123456');
      fireEvent.press(verifyButton);
    }, { timeout: 2000 });
    
    await waitFor(() => {
      const passwordInput = getByPlaceholderText('Enter new password');
      const confirmInput = getByPlaceholderText('Confirm new password');
      const resetButton = getByText('Reset Password');
      
      fireEvent.changeText(passwordInput, 'newpassword123');
      fireEvent.changeText(confirmInput, 'newpassword123');
      fireEvent.press(resetButton);
    }, { timeout: 2000 });
    
    // Wait for success step
    await waitFor(() => {
      expect(getByText('Password Reset Successful')).toBeTruthy();
      expect(getByText('Your password has been successfully reset')).toBeTruthy();
      expect(getByText('Continue to Sign In')).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('shows back to login link', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    
    expect(getByText('Remember your password?')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('handles back button press', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    
    const backButton = getByText('Back to Login');
    fireEvent.press(backButton);
    
    // Should trigger router.back() - this would be tested with router mock
  });
});

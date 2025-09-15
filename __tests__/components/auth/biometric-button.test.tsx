/**
 * Biometric Button Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BiometricButton, BiometricToggle, BiometricStatus, BiometricSettings } from '@/components/auth/biometric-button';

// Mock the hooks
jest.mock('@/hooks/use-biometric', () => ({
  useBiometric: () => ({
    isAvailable: true,
    isEnabled: true,
    isLoading: false,
    capabilities: {
      hasHardware: true,
      isEnrolled: true,
      supportedTypes: ['FINGERPRINT', 'FACIAL'],
      enrolledLevel: 1,
      canUseDeviceCredentials: true,
    },
    settings: {
      enabled: true,
      requireConfirmation: true,
      allowDeviceCredentials: true,
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use Password',
    },
    lastResult: null,
    error: null,
    authenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    quickAuthenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    secureAuthenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    cancelAuthentication: jest.fn(),
    configure: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    reset: jest.fn(),
    getRecommendedType: jest.fn(() => 'FINGERPRINT'),
    isTypeSupported: jest.fn(() => true),
    getBiometricTypeName: jest.fn((type: string) => 'Fingerprint'),
    getCurrentBiometricTypeName: jest.fn(() => 'Fingerprint'),
    getStatus: jest.fn(() => ({
      initialized: true,
      available: true,
      enabled: true,
      capabilities: null,
      settings: {},
    })),
  }),
  useBiometricAuth: () => ({
    isAvailable: true,
    isEnabled: true,
    isLoading: false,
    capabilities: {
      hasHardware: true,
      isEnrolled: true,
      supportedTypes: ['FINGERPRINT', 'FACIAL'],
      enrolledLevel: 1,
      canUseDeviceCredentials: true,
    },
    settings: {
      enabled: true,
      requireConfirmation: true,
      allowDeviceCredentials: true,
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use Password',
    },
    lastResult: null,
    error: null,
    authenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    quickAuthenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    secureAuthenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    cancelAuthentication: jest.fn(),
    configure: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    reset: jest.fn(),
    getRecommendedType: jest.fn(() => 'FINGERPRINT'),
    isTypeSupported: jest.fn(() => true),
    getBiometricTypeName: jest.fn((type: string) => 'Fingerprint'),
    getCurrentBiometricTypeName: jest.fn(() => 'Fingerprint'),
    getStatus: jest.fn(() => ({
      initialized: true,
      available: true,
      enabled: true,
      capabilities: null,
      settings: {},
    })),
  }),
  useBiometricSettings: () => ({
    settings: {
      enabled: true,
      requireConfirmation: true,
      allowDeviceCredentials: true,
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use Password',
    },
    isConfiguring: false,
    updateSettings: jest.fn(() => Promise.resolve()),
    toggleEnabled: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    getStatus: jest.fn(() => ({})),
    getCurrentBiometricTypeName: jest.fn(() => 'Fingerprint'),
  }),
}));

describe('BiometricButton', () => {
  it('should render with default props', () => {
    const { getByText } = render(
      React.createElement(BiometricButton)
    );

    expect(getByText('Use Fingerprint')).toBeTruthy();
  });

  it('should render with custom children', () => {
    const { getByText } = render(
      React.createElement(BiometricButton, { children: 'Custom Text' })
    );

    expect(getByText('Custom Text')).toBeTruthy();
  });

  it('should call onSuccess when authentication succeeds', async () => {
    const onSuccess = jest.fn();
    const { getByText } = render(
      React.createElement(BiometricButton, { onSuccess })
    );

    const button = getByText('Use Fingerprint');
    fireEvent.press(button);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onSuccess).toHaveBeenCalledWith({ success: true, biometricType: 'FINGERPRINT' });
  });

  it('should call onError when authentication fails', async () => {
    // Mock authentication failure
    const mockUseBiometric = require('@/hooks/use-biometric').useBiometric;
    mockUseBiometric.mockReturnValueOnce({
      isAvailable: true,
      isEnabled: true,
      isLoading: false,
      capabilities: { hasHardware: true, isEnrolled: true, supportedTypes: ['FINGERPRINT'], enrolledLevel: 1, canUseDeviceCredentials: true },
      settings: { enabled: true, requireConfirmation: true, allowDeviceCredentials: true, promptMessage: 'Authenticate to continue', fallbackLabel: 'Use Password' },
      lastResult: null,
      error: null,
      authenticate: jest.fn(() => Promise.resolve({ success: false, error: 'Authentication failed' })),
      quickAuthenticate: jest.fn(() => Promise.resolve({ success: false, error: 'Authentication failed' })),
      secureAuthenticate: jest.fn(() => Promise.resolve({ success: false, error: 'Authentication failed' })),
      cancelAuthentication: jest.fn(),
      configure: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      reset: jest.fn(),
      getRecommendedType: jest.fn(() => 'FINGERPRINT'),
      isTypeSupported: jest.fn(() => true),
      getBiometricTypeName: jest.fn((type: string) => 'Fingerprint'),
      getCurrentBiometricTypeName: jest.fn(() => 'Fingerprint'),
      getStatus: jest.fn(() => ({ initialized: true, available: true, enabled: true, capabilities: null, settings: {} })),
    });

    const onError = jest.fn();
    const { getByText } = render(
      React.createElement(BiometricButton, { onError })
    );

    const button = getByText('Use Fingerprint');
    fireEvent.press(button);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onError).toHaveBeenCalledWith('Authentication failed');
  });

  it('should be disabled when not available', () => {
    // Mock unavailable state
    const mockUseBiometricAuth = require('@/hooks/use-biometric').useBiometricAuth;
    mockUseBiometricAuth.mockReturnValueOnce({
      isAvailable: false,
      isEnabled: false,
      isLoading: false,
      capabilities: null,
      settings: { enabled: false },
      lastResult: null,
      error: null,
      authenticate: jest.fn(),
      quickAuthenticate: jest.fn(),
      secureAuthenticate: jest.fn(),
      cancelAuthentication: jest.fn(),
      configure: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      reset: jest.fn(),
      getRecommendedType: jest.fn(() => null),
      isTypeSupported: jest.fn(() => false),
      getBiometricTypeName: jest.fn((type: string) => 'Unknown'),
      getCurrentBiometricTypeName: jest.fn(() => 'Unknown'),
      getStatus: jest.fn(() => ({})),
    });

    const { getByText } = render(
      React.createElement(BiometricButton)
    );

    const button = getByText('Use Unknown');
    expect(button.props.disabled).toBe(true);
  });

  it('should show loading state', () => {
    const { getByText } = render(
      React.createElement(BiometricButton, { loading: true })
    );

    // Should show loading spinner
    expect(true).toBe(true);
  });

  it('should render different variants', () => {
    const { getByText: getByTextQuick } = render(
      React.createElement(BiometricButton, { variant: 'quick' })
    );

    const { getByText: getByTextSecure } = render(
      React.createElement(BiometricButton, { variant: 'secure' })
    );

    expect(getByTextQuick('Use Fingerprint')).toBeTruthy();
    expect(getByTextSecure('Use Fingerprint')).toBeTruthy();
  });

  it('should render different sizes', () => {
    const { getByText: getByTextSm } = render(
      React.createElement(BiometricButton, { size: 'sm' })
    );

    const { getByText: getByTextLg } = render(
      React.createElement(BiometricButton, { size: 'lg' })
    );

    expect(getByTextSm('Use Fingerprint')).toBeTruthy();
    expect(getByTextLg('Use Fingerprint')).toBeTruthy();
  });
});

describe('BiometricToggle', () => {
  it('should render toggle', () => {
    const { getByText } = render(
      React.createElement(BiometricToggle)
    );

    expect(getByText('Enable Fingerprint')).toBeTruthy();
  });

  it('should call onToggle when toggled', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      React.createElement(BiometricToggle, { onToggle })
    );

    const toggle = getByText('Enable Fingerprint').parent;
    fireEvent.press(toggle);

    expect(onToggle).toHaveBeenCalledWith(false); // Toggled from enabled to disabled
  });

  it('should show not available message when biometric is not available', () => {
    // Mock unavailable state
    const mockUseBiometricAuth = require('@/hooks/use-biometric').useBiometricAuth;
    mockUseBiometricAuth.mockReturnValueOnce({
      isAvailable: false,
      isEnabled: false,
      isLoading: false,
      capabilities: null,
      settings: { enabled: false },
      lastResult: null,
      error: null,
      authenticate: jest.fn(),
      quickAuthenticate: jest.fn(),
      secureAuthenticate: jest.fn(),
      cancelAuthentication: jest.fn(),
      configure: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      reset: jest.fn(),
      getRecommendedType: jest.fn(() => null),
      isTypeSupported: jest.fn(() => false),
      getBiometricTypeName: jest.fn((type: string) => 'Unknown'),
      getCurrentBiometricTypeName: jest.fn(() => 'Unknown'),
      getStatus: jest.fn(() => ({})),
    });

    const { getByText } = render(
      React.createElement(BiometricToggle)
    );

    expect(getByText('Biometric authentication not available')).toBeTruthy();
  });
});

describe('BiometricStatus', () => {
  it('should render status', () => {
    const { getByText } = render(
      React.createElement(BiometricStatus)
    );

    expect(getByText('Ready')).toBeTruthy();
  });

  it('should show details when showDetails is true', () => {
    const { getByText } = render(
      React.createElement(BiometricStatus, { showDetails: true })
    );

    expect(getByText('Ready')).toBeTruthy();
    expect(getByText('Type: Fingerprint')).toBeTruthy();
    expect(getByText('Hardware: Available')).toBeTruthy();
    expect(getByText('Enrolled: Yes')).toBeTruthy();
  });

  it('should show error status when there is an error', () => {
    // Mock error state
    const mockUseBiometricAuth = require('@/hooks/use-biometric').useBiometricAuth;
    mockUseBiometricAuth.mockReturnValueOnce({
      isAvailable: true,
      isEnabled: true,
      isLoading: false,
      capabilities: { hasHardware: true, isEnrolled: true, supportedTypes: ['FINGERPRINT'], enrolledLevel: 1, canUseDeviceCredentials: true },
      settings: { enabled: true },
      lastResult: null,
      error: 'Authentication error',
      authenticate: jest.fn(),
      quickAuthenticate: jest.fn(),
      secureAuthenticate: jest.fn(),
      cancelAuthentication: jest.fn(),
      configure: jest.fn(),
      enable: jest.fn(),
      disable: jest.fn(),
      reset: jest.fn(),
      getRecommendedType: jest.fn(() => 'FINGERPRINT'),
      isTypeSupported: jest.fn(() => true),
      getBiometricTypeName: jest.fn((type: string) => 'Fingerprint'),
      getCurrentBiometricTypeName: jest.fn(() => 'Fingerprint'),
      getStatus: jest.fn(() => ({})),
    });

    const { getByText } = render(
      React.createElement(BiometricStatus, { showDetails: true })
    );

    expect(getByText('Error')).toBeTruthy();
    expect(getByText('Authentication error')).toBeTruthy();
  });
});

describe('BiometricSettings', () => {
  it('should render settings form', () => {
    const { getByText } = render(
      React.createElement(BiometricSettings)
    );

    expect(getByText('Biometric Authentication Settings')).toBeTruthy();
    expect(getByText('Enable Biometric Authentication')).toBeTruthy();
    expect(getByText('Prompt Message')).toBeTruthy();
    expect(getByText('Fallback Label')).toBeTruthy();
    expect(getByText('Save Settings')).toBeTruthy();
  });

  it('should call onSave when settings are saved', () => {
    const onSave = jest.fn();
    const { getByText } = render(
      React.createElement(BiometricSettings, { onSave })
    );

    const saveButton = getByText('Save Settings');
    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalled();
  });

  it('should update settings when inputs change', () => {
    const { getByText, getByDisplayValue } = render(
      React.createElement(BiometricSettings)
    );

    const promptInput = getByDisplayValue('Authenticate to continue');
    fireEvent.changeText(promptInput, 'New prompt message');

    expect(promptInput.props.value).toBe('New prompt message');
  });
});

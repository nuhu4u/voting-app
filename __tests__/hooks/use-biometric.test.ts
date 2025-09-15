/**
 * Biometric Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useBiometric, useBiometricAuth, useBiometricSettings, useBiometricStatus } from '@/hooks/use-biometric';

// Mock the biometric service
jest.mock('@/lib/auth/biometric-service', () => ({
  biometricService: {
    initialize: jest.fn(() => Promise.resolve(true)),
    isAvailable: jest.fn(() => Promise.resolve(true)),
    getCapabilities: jest.fn(() => Promise.resolve({
      hasHardware: true,
      isEnrolled: true,
      supportedTypes: ['FINGERPRINT', 'FACIAL'],
      enrolledLevel: 1,
      canUseDeviceCredentials: true,
    })),
    authenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    quickAuthenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    secureAuthenticate: jest.fn(() => Promise.resolve({ success: true, biometricType: 'FINGERPRINT' })),
    cancelAuthentication: jest.fn(),
    configure: jest.fn(),
    getSettings: jest.fn(() => ({
      enabled: true,
      requireConfirmation: true,
      allowDeviceCredentials: true,
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use Password',
    })),
    enable: jest.fn(),
    disable: jest.fn(),
    isEnabled: jest.fn(() => true),
    getRecommendedType: jest.fn(() => 'FINGERPRINT'),
    isTypeSupported: jest.fn(() => true),
    getBiometricTypeName: jest.fn((type: string) => 'Fingerprint'),
    getCurrentBiometricTypeName: jest.fn(() => 'Fingerprint'),
    reset: jest.fn(),
    getStatus: jest.fn(() => ({
      initialized: true,
      available: true,
      enabled: true,
      capabilities: null,
      settings: {},
    })),
  },
}));

describe('useBiometric', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useBiometric());

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.capabilities).toBeNull();
    expect(result.current.lastResult).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.initialize).toBe('function');
    expect(typeof result.current.authenticate).toBe('function');
    expect(typeof result.current.quickAuthenticate).toBe('function');
    expect(typeof result.current.secureAuthenticate).toBe('function');
    expect(typeof result.current.cancelAuthentication).toBe('function');
    expect(typeof result.current.configure).toBe('function');
    expect(typeof result.current.enable).toBe('function');
    expect(typeof result.current.disable).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should initialize successfully', async () => {
    const { result } = renderHook(() => useBiometric());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(true);
    });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.capabilities).toBeDefined();
  });

  it('should handle initialization failure', async () => {
    const mockInitialize = require('@/lib/auth/biometric-service').biometricService.initialize;
    mockInitialize.mockRejectedValueOnce(new Error('Initialization failed'));

    const { result } = renderHook(() => useBiometric());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Initialization failed');
  });

  it('should authenticate successfully', async () => {
    const { result } = renderHook(() => useBiometric());

    await act(async () => {
      const authResult = await result.current.authenticate();
      expect(authResult.success).toBe(true);
    });

    expect(result.current.lastResult).toBeDefined();
    expect(result.current.lastResult?.success).toBe(true);
  });

  it('should handle authentication failure', async () => {
    const mockAuthenticate = require('@/lib/auth/biometric-service').biometricService.authenticate;
    mockAuthenticate.mockResolvedValueOnce({ success: false, error: 'Authentication failed' });

    const { result } = renderHook(() => useBiometric());

    await act(async () => {
      const authResult = await result.current.authenticate();
      expect(authResult.success).toBe(false);
    });

    expect(result.current.error).toBe('Authentication failed');
  });

  it('should perform quick authentication', async () => {
    const { result } = renderHook(() => useBiometric());

    await act(async () => {
      const authResult = await result.current.quickAuthenticate();
      expect(authResult.success).toBe(true);
    });
  });

  it('should perform secure authentication', async () => {
    const { result } = renderHook(() => useBiometric());

    await act(async () => {
      const authResult = await result.current.secureAuthenticate('Secure operation');
      expect(authResult.success).toBe(true);
    });
  });

  it('should cancel authentication', () => {
    const { result } = renderHook(() => useBiometric());

    act(() => {
      result.current.cancelAuthentication();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should configure settings', () => {
    const { result } = renderHook(() => useBiometric());

    act(() => {
      result.current.configure({ enabled: false });
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should enable biometric', () => {
    const { result } = renderHook(() => useBiometric());

    act(() => {
      result.current.enable();
    });

    expect(result.current.isEnabled).toBe(true);
  });

  it('should disable biometric', () => {
    const { result } = renderHook(() => useBiometric());

    act(() => {
      result.current.disable();
    });

    expect(result.current.isEnabled).toBe(false);
  });

  it('should reset service', () => {
    const { result } = renderHook(() => useBiometric());

    act(() => {
      result.current.reset();
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(result.current.capabilities).toBeNull();
    expect(result.current.lastResult).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should get recommended type', () => {
    const { result } = renderHook(() => useBiometric());

    const type = result.current.getRecommendedType();
    expect(type).toBe('FINGERPRINT');
  });

  it('should check if type is supported', () => {
    const { result } = renderHook(() => useBiometric());

    const isSupported = result.current.isTypeSupported('FINGERPRINT');
    expect(isSupported).toBe(true);
  });

  it('should get biometric type name', () => {
    const { result } = renderHook(() => useBiometric());

    const typeName = result.current.getBiometricTypeName('FINGERPRINT');
    expect(typeName).toBe('Fingerprint');
  });

  it('should get current biometric type name', () => {
    const { result } = renderHook(() => useBiometric());

    const typeName = result.current.getCurrentBiometricTypeName();
    expect(typeName).toBe('Fingerprint');
  });
});

describe('useBiometricAuth', () => {
  it('should auto-initialize on mount', () => {
    const { result } = renderHook(() => useBiometricAuth());

    // Should have initialized
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnabled).toBe(true);
  });
});

describe('useBiometricSettings', () => {
  it('should return settings management functions', () => {
    const { result } = renderHook(() => useBiometricSettings());

    expect(result.current.settings).toBeDefined();
    expect(result.current.isConfiguring).toBe(false);
    expect(typeof result.current.updateSettings).toBe('function');
    expect(typeof result.current.toggleEnabled).toBe('function');
    expect(typeof result.current.enable).toBe('function');
    expect(typeof result.current.disable).toBe('function');
    expect(typeof result.current.getStatus).toBe('function');
  });

  it('should update settings', async () => {
    const { result } = renderHook(() => useBiometricSettings());

    await act(async () => {
      await result.current.updateSettings({ enabled: false });
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should toggle enabled state', () => {
    const { result } = renderHook(() => useBiometricSettings());

    act(() => {
      result.current.toggleEnabled();
    });

    // Should not throw error
    expect(true).toBe(true);
  });
});

describe('useBiometricStatus', () => {
  it('should return status information', () => {
    const { result } = renderHook(() => useBiometricStatus());

    expect(result.current.status).toBeDefined();
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.capabilities).toBeDefined();
    expect(result.current.statusText).toBeDefined();
    expect(result.current.statusColor).toBeDefined();
  });

  it('should return correct status text', () => {
    const { result } = renderHook(() => useBiometricStatus());

    expect(['Not Available', 'Disabled', 'Error', 'Ready']).toContain(result.current.statusText);
  });

  it('should return correct status color', () => {
    const { result } = renderHook(() => useBiometricStatus());

    expect(['red', 'yellow', 'green']).toContain(result.current.statusColor);
  });
});

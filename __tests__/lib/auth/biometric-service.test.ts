/**
 * Biometric Service Tests
 */

import { biometricService } from '@/lib/auth/biometric-service';

// Mock dependencies
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2, 3])),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true, error: null })),
  cancelAuthenticate: jest.fn(),
  getEnrolledLevelAsync: jest.fn(() => Promise.resolve(1)),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('BiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    biometricService.reset();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await biometricService.initialize();
      
      expect(result).toBe(true);
      expect(biometricService.getStatus().initialized).toBe(true);
    });

    it('should handle initialization errors', async () => {
      // Mock initialization failure
      const mockHasHardwareAsync = require('expo-local-authentication').hasHardwareAsync;
      mockHasHardwareAsync.mockRejectedValueOnce(new Error('Hardware check failed'));

      const result = await biometricService.initialize();
      
      expect(result).toBe(false);
    });
  });

  describe('Availability Check', () => {
    it('should check if biometric is available', async () => {
      await biometricService.initialize();
      const isAvailable = await biometricService.isAvailable();
      
      expect(isAvailable).toBe(true);
    });

    it('should return false when hardware is not available', async () => {
      const mockHasHardwareAsync = require('expo-local-authentication').hasHardwareAsync;
      mockHasHardwareAsync.mockResolvedValueOnce(false);

      await biometricService.initialize();
      const isAvailable = await biometricService.isAvailable();
      
      expect(isAvailable).toBe(false);
    });

    it('should return false when not enrolled', async () => {
      const mockIsEnrolledAsync = require('expo-local-authentication').isEnrolledAsync;
      mockIsEnrolledAsync.mockResolvedValueOnce(false);

      await biometricService.initialize();
      const isAvailable = await biometricService.isAvailable();
      
      expect(isAvailable).toBe(false);
    });
  });

  describe('Capabilities', () => {
    it('should get biometric capabilities', async () => {
      await biometricService.initialize();
      const capabilities = await biometricService.getCapabilities();
      
      expect(capabilities).toEqual({
        hasHardware: true,
        isEnrolled: true,
        supportedTypes: ['FINGERPRINT', 'FACIAL', 'IRIS'],
        enrolledLevel: 1,
        canUseDeviceCredentials: true,
      });
    });
  });

  describe('Authentication', () => {
    beforeEach(async () => {
      await biometricService.initialize();
    });

    it('should authenticate successfully', async () => {
      const result = await biometricService.authenticate();
      
      expect(result.success).toBe(true);
      expect(result.biometricType).toBeDefined();
    });

    it('should authenticate with custom options', async () => {
      const options = {
        promptMessage: 'Custom prompt',
        cancelLabel: 'Custom cancel',
      };

      const result = await biometricService.authenticate(options);
      
      expect(result.success).toBe(true);
    });

    it('should handle authentication failure', async () => {
      const mockAuthenticateAsync = require('expo-local-authentication').authenticateAsync;
      mockAuthenticateAsync.mockResolvedValueOnce({ success: false, error: 'User cancelled' });

      const result = await biometricService.authenticate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });

    it('should handle authentication errors', async () => {
      const mockAuthenticateAsync = require('expo-local-authentication').authenticateAsync;
      mockAuthenticateAsync.mockRejectedValueOnce(new Error('Authentication error'));

      const result = await biometricService.authenticate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication error');
    });
  });

  describe('Quick Authentication', () => {
    beforeEach(async () => {
      await biometricService.initialize();
    });

    it('should perform quick authentication', async () => {
      const result = await biometricService.quickAuthenticate();
      
      expect(result.success).toBe(true);
    });
  });

  describe('Secure Authentication', () => {
    beforeEach(async () => {
      await biometricService.initialize();
    });

    it('should perform secure authentication', async () => {
      const result = await biometricService.secureAuthenticate('Secure operation');
      
      expect(result.success).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should configure settings', () => {
      const newSettings = {
        enabled: true,
        promptMessage: 'Custom message',
        requireConfirmation: false,
      };

      biometricService.configure(newSettings);
      const settings = biometricService.getSettings();
      
      expect(settings.enabled).toBe(true);
      expect(settings.promptMessage).toBe('Custom message');
      expect(settings.requireConfirmation).toBe(false);
    });

    it('should enable biometric', () => {
      biometricService.enable();
      
      expect(biometricService.isEnabled()).toBe(true);
    });

    it('should disable biometric', () => {
      biometricService.disable();
      
      expect(biometricService.isEnabled()).toBe(false);
    });
  });

  describe('Utilities', () => {
    beforeEach(async () => {
      await biometricService.initialize();
    });

    it('should get recommended type', () => {
      const type = biometricService.getRecommendedType();
      
      expect(type).toBeDefined();
      expect(['FINGERPRINT', 'FACIAL', 'IRIS']).toContain(type);
    });

    it('should check if type is supported', () => {
      expect(biometricService.isTypeSupported('FINGERPRINT')).toBe(true);
      expect(biometricService.isTypeSupported('FACIAL')).toBe(true);
      expect(biometricService.isTypeSupported('IRIS')).toBe(true);
      expect(biometricService.isTypeSupported('UNKNOWN')).toBe(false);
    });

    it('should get biometric type name', () => {
      expect(biometricService.getBiometricTypeName('FINGERPRINT')).toBe('Fingerprint');
      expect(biometricService.getBiometricTypeName('FACIAL')).toBe('Face ID');
      expect(biometricService.getBiometricTypeName('IRIS')).toBe('Iris');
    });

    it('should get current biometric type name', () => {
      const typeName = biometricService.getCurrentBiometricTypeName();
      
      expect(typeName).toBeDefined();
      expect(typeof typeName).toBe('string');
    });
  });

  describe('Service Management', () => {
    it('should reset service state', () => {
      biometricService.enable();
      biometricService.configure({ promptMessage: 'Test' });
      
      biometricService.reset();
      
      const status = biometricService.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.enabled).toBe(false);
      expect(status.capabilities).toBeNull();
    });

    it('should get service status', () => {
      const status = biometricService.getStatus();
      
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('capabilities');
      expect(status).toHaveProperty('settings');
    });

    it('should cancel authentication', () => {
      const mockCancelAuthenticate = require('expo-local-authentication').cancelAuthenticate;
      
      biometricService.cancelAuthentication();
      
      expect(mockCancelAuthenticate).toHaveBeenCalled();
    });
  });
});

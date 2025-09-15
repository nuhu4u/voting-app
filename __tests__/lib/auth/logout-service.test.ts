/**
 * Tests for Logout Service
 */

import { logoutService } from '@/lib/auth/logout-service';

// Mock dependencies
jest.mock('@/lib/auth/token-manager', () => ({
  tokenManager: {
    clearTokens: jest.fn(),
    getAccessToken: jest.fn(),
  },
}));

jest.mock('@/lib/auth/secure-storage', () => ({
  secureStorage: {
    removeItem: jest.fn(),
    clear: jest.fn(),
    getItem: jest.fn(),
  },
}));

jest.mock('@/lib/api/auth-service', () => ({
  authService: {
    logout: jest.fn(),
  },
}));

jest.mock('@/lib/auth/token-refresh-service', () => ({
  tokenRefreshService: {
    clear: jest.fn(),
  },
}));

describe('LogoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should perform complete logout successfully', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;
      const authService = require('@/lib/api/auth-service').authService;
      const tokenRefreshService = require('@/lib/auth/token-refresh-service').tokenRefreshService;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);
      authService.logout.mockResolvedValue({ success: true });
      tokenRefreshService.clear.mockResolvedValue(undefined);

      const result = await logoutService.logout();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
      expect(result.clearedData.cache).toBe(true);
      expect(result.clearedData.serverNotified).toBe(true);
    });

    it('should perform quick logout without server notification', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);

      const result = await logoutService.quickLogout();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
      expect(result.clearedData.serverNotified).toBe(false);
    });

    it('should handle server notification failure gracefully', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;
      const authService = require('@/lib/api/auth-service').authService;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);
      authService.logout.mockRejectedValue(new Error('Server error'));

      const result = await logoutService.logout();

      expect(result.success).toBe(true);
      expect(result.clearedData.serverNotified).toBe(false);
    });

    it('should handle token clearing failure', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockRejectedValue(new Error('Token clear failed'));
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);

      const result = await logoutService.logout();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(false);
    });
  });

  describe('quickLogout', () => {
    it('should perform quick logout with minimal cleanup', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);

      const result = await logoutService.quickLogout();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
      expect(result.clearedData.cache).toBe(false);
      expect(result.clearedData.serverNotified).toBe(false);
    });
  });

  describe('completeLogout', () => {
    it('should perform complete logout with all cleanup', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;
      const authService = require('@/lib/api/auth-service').authService;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);
      authService.logout.mockResolvedValue({ success: true });

      const result = await logoutService.completeLogout();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
      expect(result.clearedData.cache).toBe(true);
      expect(result.clearedData.serverNotified).toBe(true);
    });
  });

  describe('silentLogout', () => {
    it('should perform silent logout without server notification', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);

      const result = await logoutService.silentLogout();

      expect(result.success).toBe(true);
      expect(result.clearedData.serverNotified).toBe(false);
    });
  });

  describe('logoutFromAllDevices', () => {
    it('should logout from all devices', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);

      const result = await logoutService.logoutFromAllDevices();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
      expect(result.clearedData.cache).toBe(true);
    });
  });

  describe('logoutDueToTimeout', () => {
    it('should logout due to timeout', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);

      const result = await logoutService.logoutDueToTimeout();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
    });
  });

  describe('logoutDueToSecurityViolation', () => {
    it('should logout due to security violation', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;
      const authService = require('@/lib/api/auth-service').authService;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      tokenManager.clearTokens.mockResolvedValue(undefined);
      secureStorage.removeItem.mockResolvedValue(undefined);
      secureStorage.clear.mockResolvedValue(undefined);
      authService.logout.mockResolvedValue({ success: true });

      const result = await logoutService.logoutDueToSecurityViolation();

      expect(result.success).toBe(true);
      expect(result.clearedData.tokens).toBe(true);
      expect(result.clearedData.userData).toBe(true);
      expect(result.clearedData.cache).toBe(true);
      expect(result.clearedData.serverNotified).toBe(true);
    });
  });

  describe('isLoggedOut', () => {
    it('should return true when no token exists', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      tokenManager.getAccessToken.mockResolvedValue(null);

      const result = await logoutService.isLoggedOut();

      expect(result).toBe(true);
    });

    it('should return false when token exists', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      tokenManager.getAccessToken.mockResolvedValue('mock-token');

      const result = await logoutService.isLoggedOut();

      expect(result).toBe(false);
    });
  });

  describe('getLogoutConfirmation', () => {
    it('should return default logout confirmation', () => {
      const confirmation = logoutService.getLogoutConfirmation();

      expect(confirmation.title).toBe('Confirm Logout');
      expect(confirmation.message).toContain('Are you sure');
      expect(confirmation.confirmText).toBe('Logout');
      expect(confirmation.cancelText).toBe('Cancel');
    });
  });

  describe('getLogoutFromAllDevicesConfirmation', () => {
    it('should return logout from all devices confirmation', () => {
      const confirmation = logoutService.getLogoutFromAllDevicesConfirmation();

      expect(confirmation.title).toBe('Logout from All Devices');
      expect(confirmation.message).toContain('all devices');
      expect(confirmation.confirmText).toBe('Logout from All');
      expect(confirmation.cancelText).toBe('Cancel');
    });
  });

  describe('getLogoutStatus', () => {
    it('should return logout status', async () => {
      const tokenManager = require('@/lib/auth/token-manager').tokenManager;
      const secureStorage = require('@/lib/auth/secure-storage').secureStorage;

      tokenManager.getAccessToken.mockResolvedValue('mock-token');
      secureStorage.getItem.mockResolvedValue('user-data');
      secureStorage.getItem.mockResolvedValueOnce('1234567890');

      const status = await logoutService.getLogoutStatus();

      expect(status.isLoggedOut).toBe(false);
      expect(status.hasTokens).toBe(true);
      expect(status.hasUserData).toBe(true);
    });
  });
});

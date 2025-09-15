/**
 * Token Expiration Monitor Tests
 */

import { tokenExpirationMonitor } from '@/lib/auth/token-expiration-monitor';

// Mock dependencies
jest.mock('@/lib/auth/token-manager', () => ({
  tokenManager: {
    getAccessToken: jest.fn(),
  },
}));

jest.mock('@/lib/auth/token-refresh-service', () => ({
  tokenRefreshService: {
    refreshToken: jest.fn(),
  },
}));

jest.mock('@/lib/auth/jwt-utils', () => ({
  default: {
    isExpired: jest.fn(),
    isExpiringSoon: jest.fn(),
    getTimeUntilExpiration: jest.fn(),
  },
}));

describe('TokenExpirationMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenExpirationMonitor.reset();
  });

  afterEach(() => {
    tokenExpirationMonitor.stopMonitoring();
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = tokenExpirationMonitor.getConfig();
      
      expect(config).toEqual({
        checkInterval: 30000,
        refreshThreshold: 5,
        maxRefreshAttempts: 3,
        refreshDelay: 1000,
        enableAutoRefresh: true,
        enableNotifications: true,
      });
    });

    it('should update configuration', () => {
      const newConfig = {
        checkInterval: 60000,
        refreshThreshold: 10,
        enableAutoRefresh: false,
      };

      tokenExpirationMonitor.configure(newConfig);
      const config = tokenExpirationMonitor.getConfig();

      expect(config.checkInterval).toBe(60000);
      expect(config.refreshThreshold).toBe(10);
      expect(config.enableAutoRefresh).toBe(false);
    });
  });

  describe('Monitoring', () => {
    it('should start monitoring', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tokenExpirationMonitor.startMonitoring();
      
      expect(tokenExpirationMonitor.isActive()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Token expiration monitor started');
      
      consoleSpy.mockRestore();
    });

    it('should stop monitoring', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tokenExpirationMonitor.startMonitoring();
      tokenExpirationMonitor.stopMonitoring();
      
      expect(tokenExpirationMonitor.isActive()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Token expiration monitor stopped');
      
      consoleSpy.mockRestore();
    });

    it('should not start monitoring if already active', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      tokenExpirationMonitor.startMonitoring();
      tokenExpirationMonitor.startMonitoring();
      
      expect(consoleSpy).toHaveBeenCalledWith('Token expiration monitor is already running');
      
      consoleSpy.mockRestore();
    });

    it('should not stop monitoring if not active', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      tokenExpirationMonitor.stopMonitoring();
      
      expect(consoleSpy).toHaveBeenCalledWith('Token expiration monitor is not running');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const listener = jest.fn();
      
      tokenExpirationMonitor.addEventListener('expired', listener);
      
      const stats = tokenExpirationMonitor.getStats();
      expect(stats.eventListeners).toBe(1);
    });

    it('should remove event listener', () => {
      const listener = jest.fn();
      
      tokenExpirationMonitor.addEventListener('expired', listener);
      tokenExpirationMonitor.removeEventListener('expired', listener);
      
      const stats = tokenExpirationMonitor.getStats();
      expect(stats.eventListeners).toBe(0);
    });

    it('should emit events', () => {
      const listener = jest.fn();
      tokenExpirationMonitor.addEventListener('monitor_started', listener);
      
      tokenExpirationMonitor.startMonitoring();
      
      expect(listener).toHaveBeenCalledWith({
        type: 'monitor_started',
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Statistics', () => {
    it('should return monitoring statistics', () => {
      const stats = tokenExpirationMonitor.getStats();
      
      expect(stats).toEqual({
        isActive: false,
        refreshAttempts: 0,
        lastCheck: 0,
        config: expect.any(Object),
        eventListeners: 0,
      });
    });

    it('should update statistics when monitoring', () => {
      tokenExpirationMonitor.startMonitoring();
      
      const stats = tokenExpirationMonitor.getStats();
      expect(stats.isActive).toBe(true);
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset state', () => {
      tokenExpirationMonitor.startMonitoring();
      tokenExpirationMonitor.addEventListener('expired', jest.fn());
      
      tokenExpirationMonitor.reset();
      
      const stats = tokenExpirationMonitor.getStats();
      expect(stats.isActive).toBe(false);
      expect(stats.refreshAttempts).toBe(0);
      expect(stats.eventListeners).toBe(0);
    });

    it('should cleanup resources', () => {
      tokenExpirationMonitor.startMonitoring();
      tokenExpirationMonitor.addEventListener('expired', jest.fn());
      
      tokenExpirationMonitor.cleanup();
      
      const stats = tokenExpirationMonitor.getStats();
      expect(stats.isActive).toBe(false);
      expect(stats.eventListeners).toBe(0);
    });
  });
});

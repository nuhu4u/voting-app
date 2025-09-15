/**
 * Session Manager Tests
 */

import { sessionManager } from '@/lib/auth/session-manager';

// Mock User type
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  status: string;
  [key: string]: any;
}

describe('SessionManager', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['voter'],
    permissions: ['vote', 'view_elections'],
    status: 'active',
  };

  const mockTokens = {
    accessToken: 'access_token_123',
    refreshToken: 'refresh_token_123',
  };

  beforeEach(() => {
    // Reset session manager state
    sessionManager.cleanup();
  });

  afterEach(() => {
    // Cleanup after each test
    sessionManager.cleanup();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(sessionManager.initialize()).resolves.not.toThrow();
    });

    it('should not initialize twice', async () => {
      await sessionManager.initialize();
      await sessionManager.initialize(); // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('createSession', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should create a new session', async () => {
      const session = await sessionManager.createSession(mockUser, mockTokens);
      
      expect(session).toBeDefined();
      expect(session.userId).toBe(mockUser.id);
      expect(session.email).toBe(mockUser.email);
      expect(session.firstName).toBe(mockUser.firstName);
      expect(session.lastName).toBe(mockUser.lastName);
      expect(session.roles).toEqual(mockUser.roles);
      expect(session.permissions).toEqual(mockUser.permissions);
      expect(session.status).toBe(mockUser.status);
      expect(session.accessToken).toBe(mockTokens.accessToken);
      expect(session.refreshToken).toBe(mockTokens.refreshToken);
      expect(session.isActive).toBe(true);
      expect(session.sessionId).toBeDefined();
      expect(session.deviceId).toBeDefined();
      expect(session.createdAt).toBeDefined();
      expect(session.expiresAt).toBeDefined();
      expect(session.lastActivityAt).toBeDefined();
    });

    it('should set current session after creation', async () => {
      await sessionManager.createSession(mockUser, mockTokens);
      
      const currentSession = sessionManager.getCurrentSession();
      expect(currentSession).toBeDefined();
      expect(currentSession?.userId).toBe(mockUser.id);
    });
  });

  describe('getCurrentSession', () => {
    it('should return null when no session exists', () => {
      const session = sessionManager.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should return current session when exists', async () => {
      await sessionManager.initialize();
      await sessionManager.createSession(mockUser, mockTokens);
      
      const session = sessionManager.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.userId).toBe(mockUser.id);
    });
  });

  describe('validateSession', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should return invalid when no session exists', async () => {
      const result = await sessionManager.validateSession();
      
      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(false);
      expect(result.isInactive).toBe(false);
      expect(result.needsRefresh).toBe(false);
      expect(result.reason).toBe('No active session');
    });

    it('should return valid for active session', async () => {
      await sessionManager.createSession(mockUser, mockTokens);
      
      const result = await sessionManager.validateSession();
      
      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.isInactive).toBe(false);
      expect(result.sessionData).toBeDefined();
    });
  });

  describe('refreshSession', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
      await sessionManager.createSession(mockUser, mockTokens);
    });

    it('should refresh session with new tokens', async () => {
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      const refreshedSession = await sessionManager.refreshSession(newTokens);
      
      expect(refreshedSession).toBeDefined();
      expect(refreshedSession?.accessToken).toBe(newTokens.accessToken);
      expect(refreshedSession?.refreshToken).toBe(newTokens.refreshToken);
      expect(refreshedSession?.lastActivityAt).toBeDefined();
    });

    it('should throw error when no session exists', async () => {
      await sessionManager.invalidateSession();
      
      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      await expect(sessionManager.refreshSession(newTokens)).rejects.toThrow('No active session to refresh');
    });
  });

  describe('updateActivity', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
      await sessionManager.createSession(mockUser, mockTokens);
    });

    it('should update last activity time', async () => {
      const sessionBefore = sessionManager.getCurrentSession();
      const lastActivityBefore = sessionBefore?.lastActivityAt;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await sessionManager.updateActivity();
      
      const sessionAfter = sessionManager.getCurrentSession();
      const lastActivityAfter = sessionAfter?.lastActivityAt;
      
      expect(lastActivityAfter).not.toBe(lastActivityBefore);
    });
  });

  describe('invalidateSession', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
      await sessionManager.createSession(mockUser, mockTokens);
    });

    it('should invalidate current session', async () => {
      await sessionManager.invalidateSession('Test invalidation');
      
      const session = sessionManager.getCurrentSession();
      expect(session).toBeNull();
    });

    it('should invalidate session with custom reason', async () => {
      const reason = 'Custom invalidation reason';
      await sessionManager.invalidateSession(reason);
      
      // Session should be cleared
      const session = sessionManager.getCurrentSession();
      expect(session).toBeNull();
    });
  });

  describe('configuration', () => {
    it('should get current configuration', () => {
      const config = sessionManager.getConfig();
      
      expect(config).toHaveProperty('sessionTimeout');
      expect(config).toHaveProperty('maxInactivityTime');
      expect(config).toHaveProperty('refreshThreshold');
      expect(config).toHaveProperty('maxConcurrentSessions');
      expect(config).toHaveProperty('enableDeviceTracking');
      expect(config).toHaveProperty('enableLocationTracking');
      expect(config).toHaveProperty('enableActivityTracking');
      expect(config).toHaveProperty('storageKey');
      expect(config).toHaveProperty('refreshTokenKey');
      expect(config).toHaveProperty('sessionDataKey');
    });

    it('should configure session manager', () => {
      const newConfig = {
        sessionTimeout: 60,
        maxInactivityTime: 30,
        enableDeviceTracking: false,
      };

      sessionManager.configure(newConfig);
      const config = sessionManager.getConfig();
      
      expect(config.sessionTimeout).toBe(60);
      expect(config.maxInactivityTime).toBe(30);
      expect(config.enableDeviceTracking).toBe(false);
    });
  });

  describe('session statistics', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should return stats for no session', () => {
      const stats = sessionManager.getSessionStats();
      
      expect(stats.isActive).toBe(false);
      expect(stats.sessionId).toBeNull();
      expect(stats.userId).toBeNull();
      expect(stats.createdAt).toBeNull();
      expect(stats.expiresAt).toBeNull();
      expect(stats.lastActivityAt).toBeNull();
      expect(stats.timeUntilExpiry).toBeNull();
      expect(stats.timeSinceLastActivity).toBeNull();
    });

    it('should return stats for active session', async () => {
      await sessionManager.createSession(mockUser, mockTokens);
      
      const stats = sessionManager.getSessionStats();
      
      expect(stats.isActive).toBe(true);
      expect(stats.sessionId).toBeDefined();
      expect(stats.userId).toBe(mockUser.id);
      expect(stats.createdAt).toBeDefined();
      expect(stats.expiresAt).toBeDefined();
      expect(stats.lastActivityAt).toBeDefined();
      expect(typeof stats.timeUntilExpiry).toBe('number');
      expect(typeof stats.timeSinceLastActivity).toBe('number');
    });
  });

  describe('session state checks', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should return false for no active session', () => {
      expect(sessionManager.isSessionActive()).toBe(false);
    });

    it('should return true for active session', async () => {
      await sessionManager.createSession(mockUser, mockTokens);
      expect(sessionManager.isSessionActive()).toBe(true);
    });

    it('should return session timeout', () => {
      const timeout = sessionManager.getSessionTimeout();
      expect(typeof timeout).toBe('number');
      expect(timeout).toBeGreaterThan(0);
    });

    it('should return max inactivity time', () => {
      const maxInactivity = sessionManager.getMaxInactivityTime();
      expect(typeof maxInactivity).toBe('number');
      expect(maxInactivity).toBeGreaterThan(0);
    });
  });

  describe('event listeners', () => {
    beforeEach(async () => {
      await sessionManager.initialize();
    });

    it('should add event listener', () => {
      const callback = jest.fn();
      sessionManager.addEventListener('test', callback);
      
      // Should not throw
      expect(true).toBe(true);
    });

    it('should remove event listener', () => {
      const callback = jest.fn();
      sessionManager.addEventListener('test', callback);
      sessionManager.removeEventListener('test');
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', async () => {
      await sessionManager.initialize();
      await sessionManager.createSession(mockUser, mockTokens);
      
      sessionManager.cleanup();
      
      const session = sessionManager.getCurrentSession();
      expect(session).toBeNull();
      expect(sessionManager.isSessionActive()).toBe(false);
    });
  });
});

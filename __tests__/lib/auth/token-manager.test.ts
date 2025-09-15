/**
 * Tests for Token Manager
 */

import { tokenManager } from '@/lib/auth/token-manager';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('TokenManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeTokens', () => {
    it('should store tokens securely', async () => {
      const tokenData = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000, // 1 hour
        tokenType: 'Bearer',
      };

      await tokenManager.storeTokens(tokenData);

      const SecureStore = require('expo-secure-store');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'access-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'refresh-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token_expires_at', tokenData.expiresAt.toString());
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token_type', 'Bearer');
    });
  });

  describe('getTokens', () => {
    it('should retrieve stored tokens', async () => {
      const SecureStore = require('expo-secure-store');
      SecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() + 3600000).toString())
        .mockResolvedValueOnce('Bearer');

      const tokens = await tokenManager.getTokens();

      expect(tokens).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: expect.any(Number),
        tokenType: 'Bearer',
      });
    });

    it('should return null if no tokens stored', async () => {
      const SecureStore = require('expo-secure-store');
      SecureStore.getItemAsync.mockResolvedValue(null);

      const tokens = await tokenManager.getTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', async () => {
      const SecureStore = require('expo-secure-store');
      SecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() - 3600000).toString()) // 1 hour ago
        .mockResolvedValueOnce('Bearer');

      const isExpired = await tokenManager.isTokenExpired();

      expect(isExpired).toBe(true);
    });

    it('should return false for valid token', async () => {
      const SecureStore = require('expo-secure-store');
      SecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() + 3600000).toString()) // 1 hour from now
        .mockResolvedValueOnce('Bearer');

      const isExpired = await tokenManager.isTokenExpired();

      expect(isExpired).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('should decode valid JWT token', () => {
      // Create a mock JWT token
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        sub: 'user123',
        email: 'test@example.com',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }));
      const signature = 'mock-signature';
      const token = `${header}.${payload}.${signature}`;

      const decoded = tokenManager.decodeToken(token);

      expect(decoded).toEqual({
        sub: 'user123',
        email: 'test@example.com',
        role: 'user',
        iat: expect.any(Number),
        exp: expect.any(Number),
      });
    });

    it('should return null for invalid token', () => {
      const decoded = tokenManager.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('isValidTokenFormat', () => {
    it('should return true for valid JWT format', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      expect(tokenManager.isValidTokenFormat(validToken)).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(tokenManager.isValidTokenFormat('invalid-token')).toBe(false);
      expect(tokenManager.isValidTokenFormat('header.payload')).toBe(false);
      expect(tokenManager.isValidTokenFormat('')).toBe(false);
    });
  });

  describe('clearTokens', () => {
    it('should clear all stored tokens', async () => {
      await tokenManager.clearTokens();

      const SecureStore = require('expo-secure-store');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token_expires_at');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token_type');
    });
  });

  describe('getTokenInfo', () => {
    it('should return comprehensive token info', async () => {
      const SecureStore = require('expo-secure-store');
      SecureStore.getItemAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() + 3600000).toString())
        .mockResolvedValueOnce('Bearer');

      const info = await tokenManager.getTokenInfo();

      expect(info).toEqual({
        hasTokens: true,
        isExpired: false,
        isExpiringSoon: false,
        expiresAt: expect.any(Number),
        timeUntilExpiration: expect.any(Number),
        decodedToken: expect.any(Object),
      });
    });
  });
});

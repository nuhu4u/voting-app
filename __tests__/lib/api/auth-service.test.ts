/**
 * Tests for Auth Service
 */

import { authService } from '@/lib/api/auth-service';

// Mock fetch
global.fetch = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-token',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.login({
        emailOrNin: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            emailOrNin: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.login({
        emailOrNin: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.login({
        emailOrNin: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Network error');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
          token: 'mock-token',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone: '08012345678',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });

    it('should handle registration failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Email already exists',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone: '08012345678',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Email already exists');
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'OTP sent to email',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent to email');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset successfully',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.resetPassword(
        'test@example.com',
        '123456',
        'newpassword123'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset successfully');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.refreshToken('refresh-token');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await authService.logout('token');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('timeout handling', () => {
    it('should handle request timeout', async () => {
      // Mock a timeout by making fetch hang
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => {
          // Never resolve to simulate timeout
        })
      );

      // Mock AbortController
      const mockAbortController = {
        abort: jest.fn(),
        signal: {},
      };
      
      global.AbortController = jest.fn(() => mockAbortController) as any;
      global.setTimeout = jest.fn((callback) => {
        callback();
        return 1;
      }) as any;

      const result = await authService.login({
        emailOrNin: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Request timeout');
    });
  });
});

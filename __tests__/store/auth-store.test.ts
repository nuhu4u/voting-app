import { act, renderHook } from '@testing-library/react-native';
import { useAuthStore } from '@/store/auth-store';
import { createMockUser } from '../utils/test-utils';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock fetch
global.fetch = jest.fn();

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAuthStore.getState().logout();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles login successfully', async () => {
    const mockUser = createMockUser();
    const mockResponse = {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('mock-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles login failure', async () => {
    const mockError = {
      success: false,
      error: {
        message: 'Invalid credentials',
        status: 401,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockError),
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('handles registration successfully', async () => {
    const mockUser = createMockUser();
    const mockResponse = {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.register({
        name: 'Test User',
        email: 'test@example.com',
        nin: '12345678901',
        phone: '+2348012345678',
        password: 'password',
        confirmPassword: 'password',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('mock-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles logout', async () => {
    const mockUser = createMockUser();
    const { result } = renderHook(() => useAuthStore());

    // First login
    act(() => {
      result.current.user = mockUser;
      result.current.token = 'mock-token';
      result.current.isAuthenticated = true;
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles refresh token successfully', async () => {
    const mockUser = createMockUser();
    const mockResponse = {
      success: true,
      data: {
        user: mockUser,
        token: 'new-mock-token',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useAuthStore());

    // Set initial state
    act(() => {
      result.current.user = mockUser;
      result.current.token = 'old-token';
      result.current.isAuthenticated = true;
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(result.current.token).toBe('new-mock-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles refresh token failure', async () => {
    const mockError = {
      success: false,
      error: {
        message: 'Token expired',
        status: 401,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockError),
    });

    const { result } = renderHook(() => useAuthStore());

    // Set initial state
    act(() => {
      result.current.user = createMockUser();
      result.current.token = 'old-token';
      result.current.isAuthenticated = true;
    });

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('sets loading state during async operations', async () => {
    const mockUser = createMockUser();
    const mockResponse = {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-token',
      },
    };

    // Mock a delayed response
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }), 100)
      )
    );

    const { result } = renderHook(() => useAuthStore());

    // Start login
    act(() => {
      result.current.login('test@example.com', 'password');
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    // Wait for completion
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);
  });
});

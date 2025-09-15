/**
 * Logout Hook
 * Custom hook for logout functionality
 */

import { useState, useCallback } from 'react';
// import { logoutService, LogoutOptions, LogoutResult } from '@/lib/auth/logout-service';

// Mock types for now
interface LogoutOptions {
  clearTokens?: boolean;
  clearUserData?: boolean;
  clearCache?: boolean;
  notifyServer?: boolean;
  redirectTo?: string;
  showConfirmation?: boolean;
}

interface LogoutResult {
  success: boolean;
  message: string;
  error?: string;
  clearedData: {
    tokens: boolean;
    userData: boolean;
    cache: boolean;
    serverNotified: boolean;
  };
}

// Mock logout service for now
const logoutService = {
  logout: async (options?: Partial<LogoutOptions>): Promise<LogoutResult> => ({
    success: true,
    message: 'Logout successful',
    clearedData: { tokens: true, userData: true, cache: true, serverNotified: true }
  }),
  quickLogout: async (): Promise<LogoutResult> => ({
    success: true,
    message: 'Quick logout successful',
    clearedData: { tokens: true, userData: true, cache: false, serverNotified: false }
  }),
  completeLogout: async (): Promise<LogoutResult> => ({
    success: true,
    message: 'Complete logout successful',
    clearedData: { tokens: true, userData: true, cache: true, serverNotified: true }
  }),
  silentLogout: async (): Promise<LogoutResult> => ({
    success: true,
    message: 'Silent logout successful',
    clearedData: { tokens: true, userData: true, cache: true, serverNotified: false }
  }),
  logoutFromAllDevices: async (): Promise<LogoutResult> => ({
    success: true,
    message: 'Logout from all devices successful',
    clearedData: { tokens: true, userData: true, cache: true, serverNotified: true }
  }),
  logoutDueToTimeout: async (): Promise<LogoutResult> => ({
    success: true,
    message: 'Logout due to timeout successful',
    clearedData: { tokens: true, userData: true, cache: false, serverNotified: false }
  }),
  logoutDueToSecurityViolation: async (): Promise<LogoutResult> => ({
    success: true,
    message: 'Logout due to security violation successful',
    clearedData: { tokens: true, userData: true, cache: true, serverNotified: true }
  }),
  getLogoutStatus: async () => ({
    isLoggedOut: false,
    hasTokens: true,
    hasUserData: true,
    lastLogout: Date.now()
  })
};

export interface UseLogoutReturn {
  logout: (options?: Partial<LogoutOptions>) => Promise<LogoutResult>;
  quickLogout: () => Promise<LogoutResult>;
  completeLogout: () => Promise<LogoutResult>;
  silentLogout: () => Promise<LogoutResult>;
  logoutFromAllDevices: () => Promise<LogoutResult>;
  logoutDueToTimeout: () => Promise<LogoutResult>;
  logoutDueToSecurityViolation: () => Promise<LogoutResult>;
  isLoggingOut: boolean;
  lastLogoutResult: LogoutResult | null;
  isLoggedOut: boolean;
}

export function useLogout(): UseLogoutReturn {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lastLogoutResult, setLastLogoutResult] = useState<LogoutResult | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const performLogout = useCallback(async (
    logoutFunction: () => Promise<LogoutResult>
  ): Promise<LogoutResult> => {
    setIsLoggingOut(true);
    setLastLogoutResult(null);

    try {
      const result = await logoutFunction();
      setLastLogoutResult(result);
      setIsLoggedOut(result.success);
      return result;
    } catch (error) {
      const errorResult: LogoutResult = {
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        clearedData: {
          tokens: false,
          userData: false,
          cache: false,
          serverNotified: false,
        },
      };
      setLastLogoutResult(errorResult);
      return errorResult;
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  const logout = useCallback(async (options?: Partial<LogoutOptions>): Promise<LogoutResult> => {
    return performLogout(() => logoutService.logout(options));
  }, [performLogout]);

  const quickLogout = useCallback(async (): Promise<LogoutResult> => {
    return performLogout(() => logoutService.quickLogout());
  }, [performLogout]);

  const completeLogout = useCallback(async (): Promise<LogoutResult> => {
    return performLogout(() => logoutService.completeLogout());
  }, [performLogout]);

  const silentLogout = useCallback(async (): Promise<LogoutResult> => {
    return performLogout(() => logoutService.silentLogout());
  }, [performLogout]);

  const logoutFromAllDevices = useCallback(async (): Promise<LogoutResult> => {
    return performLogout(() => logoutService.logoutFromAllDevices());
  }, [performLogout]);

  const logoutDueToTimeout = useCallback(async (): Promise<LogoutResult> => {
    return performLogout(() => logoutService.logoutDueToTimeout());
  }, [performLogout]);

  const logoutDueToSecurityViolation = useCallback(async (): Promise<LogoutResult> => {
    return performLogout(() => logoutService.logoutDueToSecurityViolation());
  }, [performLogout]);

  return {
    logout,
    quickLogout,
    completeLogout,
    silentLogout,
    logoutFromAllDevices,
    logoutDueToTimeout,
    logoutDueToSecurityViolation,
    isLoggingOut,
    lastLogoutResult,
    isLoggedOut,
  };
}

/**
 * Hook for logout with confirmation
 */
export function useLogoutWithConfirmation() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLogout, setPendingLogout] = useState<{
    options?: Partial<LogoutOptions>;
    type: 'normal' | 'allDevices' | 'timeout' | 'security';
  } | null>(null);

  const logout = useCallback(async (options?: Partial<LogoutOptions>): Promise<LogoutResult> => {
    setPendingLogout({ options, type: 'normal' });
    setShowConfirmation(true);
    return { 
      success: false, 
      message: 'Confirmation required',
      clearedData: { tokens: false, userData: false, cache: false, serverNotified: false }
    };
  }, []);

  const logoutFromAllDevices = useCallback(async (): Promise<LogoutResult> => {
    setPendingLogout({ type: 'allDevices' });
    setShowConfirmation(true);
    return { 
      success: false, 
      message: 'Confirmation required',
      clearedData: { tokens: false, userData: false, cache: false, serverNotified: false }
    };
  }, []);

  const confirmLogout = useCallback(async (): Promise<LogoutResult> => {
    if (!pendingLogout) {
      return { 
        success: false, 
        message: 'No pending logout',
        clearedData: { tokens: false, userData: false, cache: false, serverNotified: false }
      };
    }

    setShowConfirmation(false);
    const { options, type } = pendingLogout;
    setPendingLogout(null);

    switch (type) {
      case 'normal':
        return logoutService.logout(options);
      case 'allDevices':
        return logoutService.logoutFromAllDevices();
      case 'timeout':
        return logoutService.logoutDueToTimeout();
      case 'security':
        return logoutService.logoutDueToSecurityViolation();
      default:
        return { 
          success: false, 
          message: 'Invalid logout type',
          clearedData: { tokens: false, userData: false, cache: false, serverNotified: false }
        };
    }
  }, [pendingLogout]);

  const cancelLogout = useCallback(() => {
    setShowConfirmation(false);
    setPendingLogout(null);
  }, []);

  return {
    logout,
    logoutFromAllDevices,
    confirmLogout,
    cancelLogout,
    showConfirmation,
    pendingLogout,
  };
}

/**
 * Hook for logout status monitoring
 */
export function useLogoutStatus() {
  const [status, setStatus] = useState<{
    isLoggedOut: boolean;
    hasTokens: boolean;
    hasUserData: boolean;
    lastLogout?: number;
  }>({
    isLoggedOut: true,
    hasTokens: false,
    hasUserData: false,
  });

  const refreshStatus = useCallback(async () => {
    try {
      const newStatus = await logoutService.getLogoutStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to refresh logout status:', error);
    }
  }, []);

  return {
    ...status,
    refreshStatus,
  };
}

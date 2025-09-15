/**
 * Authentication Hooks
 * Custom hooks for authentication functionality
 */

import { useCallback, useEffect, useState } from 'react';
import { 
  useAuth as useAuthContext, 
  useAuthState as useAuthStateContext, 
  useAuthActions as useAuthActionsContext, 
  useTokenStatus as useTokenStatusContext, 
  useBiometric as useBiometricContext 
} from '@/contexts/auth-context';
import { LoginCredentials, RegisterData, User } from '@/types/auth';
import { tokenManager } from '@/lib/auth/token-manager';
import { secureStorage } from '@/lib/auth/secure-storage';

/**
 * Main authentication hook
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Authentication state hook
 */
export function useAuthState() {
  return useAuthStateContext();
}

/**
 * Authentication actions hook
 */
export function useAuthActions() {
  return useAuthActionsContext();
}

/**
 * Token status hook
 */
export function useTokenStatus() {
  return useTokenStatusContext();
}

/**
 * Biometric authentication hook
 */
export function useBiometric() {
  return useBiometricContext();
}

/**
 * Login hook with loading state
 */
export function useLogin() {
  const { login } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await login(credentials);
      if (!success) {
        setError('Login failed. Please check your credentials.');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return {
    login: handleLogin,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Registration hook with loading state
 */
export function useRegister() {
  const { register } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await register(data);
      if (!success) {
        setError('Registration failed. Please try again.');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [register]);

  return {
    register: handleRegister,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Logout hook with loading state
 */
export function useLogout() {
  const { logout } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  return {
    logout: handleLogout,
    isLoading,
  };
}

/**
 * Token refresh hook
 */
export function useTokenRefresh() {
  const { refreshToken } = useAuthActions();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshToken();
      if (success) {
        setLastRefresh(new Date());
      }
      return success;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken]);

  return {
    refreshToken: handleRefresh,
    isRefreshing,
    lastRefresh,
  };
}

/**
 * User profile update hook
 */
export function useUserUpdate() {
  const { updateUser } = useAuthActions();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = useCallback(async (userData: Partial<User>) => {
    setIsUpdating(true);
    try {
      updateUser(userData);
      return true;
    } catch (err) {
      console.error('User update failed:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [updateUser]);

  return {
    updateUser: handleUpdate,
    isUpdating,
  };
}

/**
 * Auto-login hook for biometric authentication
 */
export function useAutoLogin() {
  const { login } = useAuthActions();
  const { isBiometricEnabled } = useBiometric();
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const attemptAutoLogin = useCallback(async () => {
    if (!isBiometricEnabled) return false;

    setIsAutoLoggingIn(true);
    try {
      // Get stored credentials (this would be encrypted)
      const storedCredentials = await secureStorage.getItem<LoginCredentials>('biometric_credentials');
      if (!storedCredentials) return false;

      // Attempt login with stored credentials
      const success = await login(storedCredentials);
      return success;
    } catch (err) {
      console.error('Auto-login failed:', err);
      return false;
    } finally {
      setIsAutoLoggingIn(false);
    }
  }, [isBiometricEnabled, login]);

  return {
    attemptAutoLogin,
    isAutoLoggingIn,
  };
}

/**
 * Session monitoring hook
 */
export function useSessionMonitor() {
  const { isAuthenticated } = useAuthState();
  const { isTokenExpired, isTokenExpiringSoon, timeUntilExpiration } = useTokenStatus();
  const { refreshToken } = useTokenRefresh();
  const [sessionStatus, setSessionStatus] = useState<'active' | 'expiring' | 'expired'>('active');

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionStatus('active');
      return;
    }

    if (isTokenExpired) {
      setSessionStatus('expired');
    } else if (isTokenExpiringSoon) {
      setSessionStatus('expiring');
    } else {
      setSessionStatus('active');
    }
  }, [isAuthenticated, isTokenExpired, isTokenExpiringSoon]);

  // Auto-refresh token when expiring soon
  useEffect(() => {
    if (isTokenExpiringSoon && isAuthenticated) {
      refreshToken();
    }
  }, [isTokenExpiringSoon, isAuthenticated, refreshToken]);

  return {
    sessionStatus,
    isTokenExpired,
    isTokenExpiringSoon,
    timeUntilExpiration,
    refreshToken,
  };
}

/**
 * Authentication status hook
 */
export function useAuthStatus() {
  const { isAuthenticated, user, isLoading, error } = useAuthState();
  const { isTokenExpired, isTokenExpiringSoon } = useTokenStatus();
  const { isBiometricEnabled } = useBiometric();

  const isLoggedIn = isAuthenticated && user && !isTokenExpired;
  const needsRefresh = isTokenExpiringSoon && isAuthenticated;
  const hasError = !!error;

  return {
    isLoggedIn,
    needsRefresh,
    hasError,
    isAuthenticated,
    user,
    isLoading,
    error,
    isTokenExpired,
    isTokenExpiringSoon,
    isBiometricEnabled,
  };
}

/**
 * Token utilities hook
 */
export function useTokenUtils() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const getTokenInfo = useCallback(async () => {
    try {
      const info = await tokenManager.getTokenInfo();
      setTokenInfo(info);
      return info;
    } catch (err) {
      console.error('Failed to get token info:', err);
      return null;
    }
  }, []);

  const isTokenValid = useCallback(async () => {
    try {
      return !(await tokenManager.isTokenExpired());
    } catch (err) {
      console.error('Failed to check token validity:', err);
      return false;
    }
  }, []);

  const getTimeUntilExpiration = useCallback(async () => {
    try {
      const tokens = await tokenManager.getTokens();
      if (!tokens) return null;
      return tokenManager.getTimeUntilExpiration(tokens.accessToken);
    } catch (err) {
      console.error('Failed to get time until expiration:', err);
      return null;
    }
  }, []);

  return {
    tokenInfo,
    getTokenInfo,
    isTokenValid,
    getTimeUntilExpiration,
  };
}
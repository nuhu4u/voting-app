/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import * as React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { tokenManager } from '@/lib/auth/token-manager';
import { secureStorage } from '@/lib/auth/secure-storage';
import { User, LoginCredentials, RegisterData } from '@/types/auth';
import { storageKeys } from '@/lib/config';

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;

  // Token management
  isTokenExpired: boolean;
  isTokenExpiringSoon: boolean;
  timeUntilExpiration: number | null;

  // Biometric
  isBiometricEnabled: boolean;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    refreshToken: storeRefreshToken,
    updateUser: storeUpdateUser,
    clearError: storeClearError,
  } = useAuthStore();

  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isTokenExpiringSoon, setIsTokenExpiringSoon] = useState(false);
  const [timeUntilExpiration, setTimeUntilExpiration] = useState<number | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Monitor token expiration
  useEffect(() => {
    if (isAuthenticated) {
      checkTokenStatus();
      const interval = setInterval(checkTokenStatus, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    try {
      // Check if user is already authenticated
      const tokens = await tokenManager.getTokens();
      if (tokens && !(await tokenManager.isTokenExpired())) {
        // Token is valid, restore user session
        const userData = await secureStorage.getUserData();
        if (userData) {
          storeUpdateUser(userData);
        }
      } else {
        // Token is expired or doesn't exist, clear auth state
        await clearAuthState();
      }

      // Check biometric preference
      const biometricEnabled = await secureStorage.getBiometricEnabled();
      setIsBiometricEnabled(!!biometricEnabled);
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await clearAuthState();
    }
  };

  const checkTokenStatus = async () => {
    try {
      const tokenInfo = await tokenManager.getTokenInfo();
      setIsTokenExpired(tokenInfo.isExpired);
      setIsTokenExpiringSoon(tokenInfo.isExpiringSoon);
      setTimeUntilExpiration(tokenInfo.timeUntilExpiration);

      // If token is expired, try to refresh
      if (tokenInfo.isExpired && tokenInfo.hasTokens) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          await logout();
        }
      }
    } catch (error) {
      console.error('Failed to check token status:', error);
    }
  };

  const clearAuthState = async () => {
    try {
      await Promise.all([
        tokenManager.clearTokens(),
        secureStorage.removeItem(storageKeys.userData),
      ]);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const result = await storeLogin(credentials);
      
      if (result.success && result.data) {
        // Store tokens securely
        await tokenManager.storeTokens({
          accessToken: result.data.token,
          refreshToken: result.data.refreshToken || result.data.token,
          expiresAt: tokenManager.getTokenExpirationTime(result.data.token) || 0,
          tokenType: 'Bearer',
        });

        // Store user data
        await secureStorage.storeUserData(result.data.user);

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const result = await storeRegister(data);
      
      if (result.success && result.data) {
        // Store tokens securely
        await tokenManager.storeTokens({
          accessToken: result.data.token,
          refreshToken: result.data.refreshToken || result.data.token,
          expiresAt: tokenManager.getTokenExpirationTime(result.data.token) || 0,
          tokenType: 'Bearer',
        });

        // Store user data
        await secureStorage.storeUserData(result.data.user);

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API if token exists
      const token = await tokenManager.getAccessToken();
      if (token) {
        try {
          // Note: This would call the logout API
          // await authService.logout(token);
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
      }

      // Clear local state
      await clearAuthState();
      storeLogout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if clearing fails
      storeLogout();
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const result = await storeRefreshToken();
      
      if (result) {
        // Update stored tokens
        const tokens = await tokenManager.getTokens();
        if (tokens) {
          await tokenManager.storeTokens(tokens);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    storeUpdateUser(userData);
    // Also update stored user data
    secureStorage.storeUserData({ ...user, ...userData });
  };

  const clearError = () => {
    storeClearError();
  };

  const enableBiometric = async () => {
    try {
      await secureStorage.storeBiometricEnabled(true);
      setIsBiometricEnabled(true);
    } catch (error) {
      console.error('Failed to enable biometric:', error);
    }
  };

  const disableBiometric = async () => {
    try {
      await secureStorage.storeBiometricEnabled(false);
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Failed to disable biometric:', error);
    }
  };

  const value: AuthContextType = {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,

    // Token management
    isTokenExpired,
    isTokenExpiringSoon,
    timeUntilExpiration,

    // Biometric
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export individual hooks for convenience
export function useAuthState() {
  const { isAuthenticated, user, isLoading, error } = useAuth();
  return { isAuthenticated, user, isLoading, error };
}

export function useAuthActions() {
  const { login, register, logout, refreshToken, updateUser, clearError } = useAuth();
  return { login, register, logout, refreshToken, updateUser, clearError };
}

export function useTokenStatus() {
  const { isTokenExpired, isTokenExpiringSoon, timeUntilExpiration } = useAuth();
  return { isTokenExpired, isTokenExpiringSoon, timeUntilExpiration };
}

export function useBiometric() {
  const { isBiometricEnabled, enableBiometric, disableBiometric } = useAuth();
  return { isBiometricEnabled, enableBiometric, disableBiometric };
}
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { storageKeys } from '@/lib/config';
import { User, TokenData } from '@/types/auth';

// Token management
export const tokenUtils = {
  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(storageKeys.authToken, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
      throw new Error('Failed to store authentication token');
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(storageKeys.authToken);
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(storageKeys.authToken);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(storageKeys.refreshToken, refreshToken);
    } catch (error) {
      console.error('Failed to store refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(storageKeys.refreshToken);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(storageKeys.refreshToken);
    } catch (error) {
      console.error('Failed to remove refresh token:', error);
    }
  },

  async clearAllTokens(): Promise<void> {
    await Promise.all([
      this.removeToken(),
      this.removeRefreshToken(),
    ]);
  },
};

// User data management
export const userUtils = {
  async setUser(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(storageKeys.userData, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
      throw new Error('Failed to store user data');
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(storageKeys.userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(storageKeys.userData);
    } catch (error) {
      console.error('Failed to remove user data:', error);
    }
  },
};

// Biometric authentication
export const biometricUtils = {
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      return false;
    }
  },

  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Failed to get supported authentication types:', error);
      return [];
    }
  },

  async authenticate(reason: string = 'Authenticate to access your account'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  },

  async isEnabled(): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) return false;
      
      const enabled = await SecureStore.getItemAsync(storageKeys.biometricEnabled);
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check biometric status:', error);
      return false;
    }
  },

  async setEnabled(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync(storageKeys.biometricEnabled, enabled.toString());
    } catch (error) {
      console.error('Failed to set biometric status:', error);
      throw new Error('Failed to update biometric settings');
    }
  },
};

// Token validation
export const tokenValidation = {
  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]!));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to parse token:', error);
      return true;
    }
  },

  getTokenData(token: string): TokenData | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]!));
      return {
        user_id: payload.user_id,
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
        iat: payload.iat,
      };
    } catch (error) {
      console.error('Failed to parse token data:', error);
      return null;
    }
  },

  isTokenValid(token: string): boolean {
    return !this.isTokenExpired(token);
  },
};

// Session management
export const sessionUtils = {
  async createSession(user: User, token: string, refreshToken?: string): Promise<void> {
    await Promise.all([
      userUtils.setUser(user),
      tokenUtils.setToken(token),
      ...(refreshToken ? [tokenUtils.setRefreshToken(refreshToken)] : []),
    ]);
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      userUtils.removeUser(),
      tokenUtils.clearAllTokens(),
    ]);
  },

  async getSession(): Promise<{ user: User | null; token: string | null }> {
    const [user, token] = await Promise.all([
      userUtils.getUser(),
      tokenUtils.getToken(),
    ]);
    return { user, token };
  },

  async isSessionValid(): Promise<boolean> {
    const { user, token } = await this.getSession();
    return !!(user && token && tokenValidation.isTokenValid(token));
  },
};

// Password utilities
export const passwordUtils = {
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '@$!%*?&'[Math.floor(Math.random() * 7)]; // special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },
};

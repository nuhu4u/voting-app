import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { sessionUtils, tokenValidation } from '@/lib/auth-utils';

// Token refresh interval (5 minutes)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

export function useAuthMiddleware() {
  const { isAuthenticated, token, refreshToken } = useAuthStore();

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const setupTokenRefresh = async () => {
      if (isAuthenticated && token) {
        // Check if token is close to expiry (within 10 minutes)
        const isTokenExpiringSoon = () => {
          try {
            const parts = token.split('.');
            if (parts.length !== 3) return true;
            
            const payload = JSON.parse(atob(parts[1]!));
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - currentTime;
            return timeUntilExpiry < 600; // 10 minutes
          } catch {
            return true;
          }
        };

        // Refresh token if it's expiring soon
        if (isTokenExpiringSoon()) {
          await refreshToken();
        }

        // Set up automatic token refresh
        refreshInterval = setInterval(async () => {
          const { token: currentToken } = useAuthStore.getState();
          if (currentToken && tokenValidation.isTokenValid(currentToken)) {
            await refreshToken();
          }
        }, TOKEN_REFRESH_INTERVAL) as unknown as NodeJS.Timeout;
      }
    };

    setupTokenRefresh();

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, token, refreshToken]);
}

export function useAuthGuard(requireAuth: boolean = true) {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Redirect to login if authentication is required
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && requireAuth && !isAuthenticated,
  };
}

export function useGuestGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect to dashboard if user is already authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && isAuthenticated,
  };
}

// API request interceptor for adding auth headers
export function createAuthInterceptor() {
  return {
    request: async (config: any) => {
      const { token } = useAuthStore.getState();
      
      if (token && tokenValidation.isTokenValid(token)) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      
      return config;
    },
    
    response: async (response: any) => {
      // Handle 401 responses by refreshing token or logging out
      if (response.status === 401) {
        const { refreshToken } = useAuthStore.getState();
        const success = await refreshToken();
        
        if (!success) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          router.replace('/(auth)/login');
        }
      }
      
      return response;
    },
  };
}

// Session persistence handler
export function useSessionPersistence() {
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { user, token } = await sessionUtils.getSession();
        
        if (user && token && tokenValidation.isTokenValid(token)) {
          // Restore session in store
          useAuthStore.setState({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            error: null,
          });
        } else {
          // Clear invalid session
          await sessionUtils.clearSession();
          useAuthStore.setState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        await sessionUtils.clearSession();
        useAuthStore.setState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      }
    };

    restoreSession();
  }, []);
}

// Auto-logout on token expiry
export function useAutoLogout() {
  const { token, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      if (tokenValidation.isTokenExpired(token)) {
        logout();
        router.replace('/(auth)/login');
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [token, logout]);
}

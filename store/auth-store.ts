import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';
import { authService } from '@/lib/api/auth-service';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);

          if (response.success && response.data) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null,
            });
            return {
              success: response.success,
              message: response.message || 'Login successful',
              data: response.data
            };
          } else {
            const errorMessage = response.error?.message || 'Login failed';
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
              error: errorMessage,
            });
            return {
              success: false,
              message: errorMessage,
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);

          if (response.success && response.data) {
            set({
              isAuthenticated: true,
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
              error: null,
            });
            return {
              success: response.success,
              message: response.message || 'Registration successful',
              data: response.data
            };
          } else {
            const errorMessage = response.error?.message || 'Registration failed';
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
              error: errorMessage,
            });
            return {
              success: false,
              message: errorMessage,
            };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          });
          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return false;

        try {
          const response = await authService.refreshToken(token);

          if (response.success && response.data) {
            set({
              token: response.data.token,
              refreshToken: response.data.refreshToken,
            });
            return true;
          } else {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
            return false;
          }
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });
          return false;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

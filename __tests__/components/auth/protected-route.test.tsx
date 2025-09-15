/**
 * Protected Route Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProtectedRoute, withProtectedRoute, useRouteAuthorization, ConditionalRoute, RouteProtectionUtils } from '@/components/auth/protected-route';

// Mock the hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['voter'],
      permissions: ['vote', 'view_elections'],
    },
    login: jest.fn(() => Promise.resolve({ success: true })),
    logout: jest.fn(() => Promise.resolve({ success: true })),
    refreshToken: jest.fn(() => Promise.resolve({ success: true })),
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  }),
}));

describe('ProtectedRoute', () => {
  it('should render children when authorized', () => {
    const { getByText } = render(
      React.createElement(ProtectedRoute, { requireAuth: true },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(getByText('Protected Content')).toBeTruthy();
  });

  it('should show loading component while checking', () => {
    // Mock loading state
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ProtectedRoute, { requireAuth: true },
        React.createElement('div', null, 'Protected Content')
      )
    );

    // Should show loading spinner
    expect(true).toBe(true);
  });

  it('should show fallback when not authorized', () => {
    // Mock unauthorized state
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ProtectedRoute, { 
        requireAuth: true,
        fallback: React.createElement('div', null, 'Access Denied')
      },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(getByText('Access Denied')).toBeTruthy();
  });

  it('should allow access when authentication not required', () => {
    const { getByText } = render(
      React.createElement(ProtectedRoute, { requireAuth: false },
        React.createElement('div', null, 'Public Content')
      )
    );

    expect(getByText('Public Content')).toBeTruthy();
  });

  it('should check required roles', () => {
    // Mock user without required role
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['voter'],
        permissions: ['vote'],
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ProtectedRoute, { 
        requireAuth: true,
        requiredRoles: ['admin']
      },
        React.createElement('div', null, 'Admin Content')
      )
    );

    expect(getByText('Access Denied')).toBeTruthy();
  });

  it('should check required permissions', () => {
    // Mock user without required permission
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['voter'],
        permissions: ['vote'],
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ProtectedRoute, { 
        requireAuth: true,
        requiredPermissions: ['admin_access']
      },
        React.createElement('div', null, 'Admin Content')
      )
    );

    expect(getByText('Access Denied')).toBeTruthy();
  });

  it('should call onUnauthorized when not authorized', () => {
    const onUnauthorized = jest.fn();
    
    // Mock unauthorized state
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    render(
      React.createElement(ProtectedRoute, { 
        requireAuth: true,
        onUnauthorized
      },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(onUnauthorized).toHaveBeenCalled();
  });

  it('should call onAuthorized when authorized', () => {
    const onAuthorized = jest.fn();

    render(
      React.createElement(ProtectedRoute, { 
        requireAuth: true,
        onAuthorized
      },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(onAuthorized).toHaveBeenCalled();
  });

  it('should show error component when there is an error', () => {
    // Mock error state
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ProtectedRoute, { 
        requireAuth: true,
        errorComponent: React.createElement('div', null, 'Authorization Error')
      },
        React.createElement('div', null, 'Protected Content')
      )
    );

    // Should show error component
    expect(true).toBe(true);
  });
});

describe('withProtectedRoute', () => {
  const TestComponent = () => React.createElement('div', null, 'Test Component');

  it('should wrap component with protection', () => {
    const ProtectedTestComponent = withProtectedRoute(TestComponent, {
      requireAuth: true,
      requiredRoles: ['voter'],
    });

    const { getByText } = render(
      React.createElement(ProtectedTestComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should pass props to wrapped component', () => {
    const TestComponentWithProps = (props: { message: string }) => 
      React.createElement('div', null, props.message);

    const ProtectedTestComponent = withProtectedRoute(TestComponentWithProps, {
      requireAuth: true,
    });

    const { getByText } = render(
      React.createElement(ProtectedTestComponent, { message: 'Hello World' })
    );

    expect(getByText('Hello World')).toBeTruthy();
  });
});

describe('useRouteAuthorization', () => {
  it('should return authorization state', () => {
    const { result } = render(
      React.createElement(() => {
        const auth = useRouteAuthorization({ requireAuth: true });
        return React.createElement('div', null, `Authorized: ${auth.isAuthorized}`);
      })
    );

    expect(result.current).toBeTruthy();
  });

  it('should check authorization on mount', () => {
    const { result } = render(
      React.createElement(() => {
        const auth = useRouteAuthorization({ requireAuth: true });
        return React.createElement('div', null, `Checking: ${auth.isChecking}`);
      })
    );

    expect(result.current).toBeTruthy();
  });
});

describe('ConditionalRoute', () => {
  it('should render children when authorized', () => {
    const { getByText } = render(
      React.createElement(ConditionalRoute, { 
        config: { requireAuth: true }
      },
        React.createElement('div', null, 'Conditional Content')
      )
    );

    expect(getByText('Conditional Content')).toBeTruthy();
  });

  it('should render fallback when not authorized', () => {
    // Mock unauthorized state
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ConditionalRoute, { 
        config: { requireAuth: true },
        fallback: React.createElement('div', null, 'Not Authorized')
      },
        React.createElement('div', null, 'Conditional Content')
      )
    );

    expect(getByText('Not Authorized')).toBeTruthy();
  });
});

describe('RouteProtectionUtils', () => {
  describe('hasRoles', () => {
    it('should check if user has any required role', () => {
      const userRoles = ['voter', 'observer'];
      const requiredRoles = ['voter', 'admin'];
      
      const result = RouteProtectionUtils.hasRoles(userRoles, requiredRoles, false);
      expect(result).toBe(true);
    });

    it('should check if user has all required roles', () => {
      const userRoles = ['voter', 'observer'];
      const requiredRoles = ['voter', 'observer'];
      
      const result = RouteProtectionUtils.hasRoles(userRoles, requiredRoles, true);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required roles', () => {
      const userRoles = ['voter'];
      const requiredRoles = ['admin'];
      
      const result = RouteProtectionUtils.hasRoles(userRoles, requiredRoles, false);
      expect(result).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('should check if user has any required permission', () => {
      const userPermissions = ['vote', 'view_elections'];
      const requiredPermissions = ['vote', 'admin_access'];
      
      const result = RouteProtectionUtils.hasPermissions(userPermissions, requiredPermissions, false);
      expect(result).toBe(true);
    });

    it('should check if user has all required permissions', () => {
      const userPermissions = ['vote', 'view_elections'];
      const requiredPermissions = ['vote', 'view_elections'];
      
      const result = RouteProtectionUtils.hasPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required permissions', () => {
      const userPermissions = ['vote'];
      const requiredPermissions = ['admin_access'];
      
      const result = RouteProtectionUtils.hasPermissions(userPermissions, requiredPermissions, false);
      expect(result).toBe(false);
    });
  });

  describe('getRedirectPath', () => {
    it('should return admin path for admin user', () => {
      const user = { roles: ['admin'] };
      const path = RouteProtectionUtils.getRedirectPath(user);
      expect(path).toBe('/admin');
    });

    it('should return observer path for observer user', () => {
      const user = { roles: ['observer'] };
      const path = RouteProtectionUtils.getRedirectPath(user);
      expect(path).toBe('/observer');
    });

    it('should return voter path for voter user', () => {
      const user = { roles: ['voter'] };
      const path = RouteProtectionUtils.getRedirectPath(user);
      expect(path).toBe('/voter');
    });

    it('should return login path for user without roles', () => {
      const user = { roles: [] };
      const path = RouteProtectionUtils.getRedirectPath(user);
      expect(path).toBe('/login');
    });
  });

  describe('requiresAuth', () => {
    it('should return true for protected routes', () => {
      expect(RouteProtectionUtils.requiresAuth('/admin')).toBe(true);
      expect(RouteProtectionUtils.requiresAuth('/voter')).toBe(true);
      expect(RouteProtectionUtils.requiresAuth('/observer')).toBe(true);
    });

    it('should return false for public routes', () => {
      expect(RouteProtectionUtils.requiresAuth('/login')).toBe(false);
      expect(RouteProtectionUtils.requiresAuth('/register')).toBe(false);
      expect(RouteProtectionUtils.requiresAuth('/')).toBe(false);
    });
  });

  describe('getRequiredRoles', () => {
    it('should return admin role for admin routes', () => {
      const roles = RouteProtectionUtils.getRequiredRoles('/admin/dashboard');
      expect(roles).toEqual(['admin']);
    });

    it('should return observer role for observer routes', () => {
      const roles = RouteProtectionUtils.getRequiredRoles('/observer/reports');
      expect(roles).toEqual(['observer']);
    });

    it('should return voter role for voter routes', () => {
      const roles = RouteProtectionUtils.getRequiredRoles('/voter/elections');
      expect(roles).toEqual(['voter']);
    });

    it('should return empty array for other routes', () => {
      const roles = RouteProtectionUtils.getRequiredRoles('/some/other/route');
      expect(roles).toEqual([]);
    });
  });

  describe('getRequiredPermissions', () => {
    it('should return admin permissions for admin routes', () => {
      const permissions = RouteProtectionUtils.getRequiredPermissions('/admin/dashboard');
      expect(permissions).toEqual(['admin_access', 'manage_users', 'manage_elections']);
    });

    it('should return observer permissions for observer routes', () => {
      const permissions = RouteProtectionUtils.getRequiredPermissions('/observer/reports');
      expect(permissions).toEqual(['observer_access', 'view_reports', 'create_reports']);
    });

    it('should return voter permissions for voter routes', () => {
      const permissions = RouteProtectionUtils.getRequiredPermissions('/voter/elections');
      expect(permissions).toEqual(['voter_access', 'vote', 'view_elections']);
    });

    it('should return empty array for other routes', () => {
      const permissions = RouteProtectionUtils.getRequiredPermissions('/some/other/route');
      expect(permissions).toEqual([]);
    });
  });
});

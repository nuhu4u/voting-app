/**
 * Auth Guards Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { 
  AuthGuard, 
  RoleGuard, 
  PermissionGuard, 
  ConditionalGuard, 
  GuestGuard, 
  AdminGuard, 
  ObserverGuard, 
  VoterGuard,
  withAuth,
  withRole,
  withPermission,
  withGuest,
  withAdmin,
  withObserver,
  withVoter
} from '@/components/auth/auth-guards';

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
      status: 'active',
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

describe('AuthGuard', () => {
  it('should render children when authenticated', () => {
    const { getByText } = render(
      React.createElement(AuthGuard, { requireAuth: true },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(getByText('Protected Content')).toBeTruthy();
  });

  it('should show fallback when not authenticated', () => {
    // Mock unauthenticated state
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
      React.createElement(AuthGuard, { 
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
      React.createElement(AuthGuard, { requireAuth: false },
        React.createElement('div', null, 'Public Content')
      )
    );

    expect(getByText('Public Content')).toBeTruthy();
  });

  it('should call onUnauthorized when not authenticated', () => {
    const onUnauthorized = jest.fn();
    
    // Mock unauthenticated state
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
      React.createElement(AuthGuard, { 
        requireAuth: true,
        onUnauthorized
      },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(onUnauthorized).toHaveBeenCalled();
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
      React.createElement(AuthGuard, { 
        requireAuth: true,
        loadingComponent: React.createElement('div', null, 'Loading...')
      },
        React.createElement('div', null, 'Protected Content')
      )
    );

    expect(getByText('Loading...')).toBeTruthy();
  });
});

describe('RoleGuard', () => {
  it('should render children when user has required role', () => {
    const { getByText } = render(
      React.createElement(RoleGuard, { 
        requiredRoles: ['voter'],
        requireAll: false
      },
        React.createElement('div', null, 'Role Protected Content')
      )
    );

    expect(getByText('Role Protected Content')).toBeTruthy();
  });

  it('should show fallback when user lacks required role', () => {
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
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(RoleGuard, { 
        requiredRoles: ['admin'],
        requireAll: false,
        fallback: React.createElement('div', null, 'Insufficient Role')
      },
        React.createElement('div', null, 'Role Protected Content')
      )
    );

    expect(getByText('Insufficient Role')).toBeTruthy();
  });

  it('should check all required roles when requireAll is true', () => {
    // Mock user with only one of two required roles
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['voter'],
        permissions: ['vote'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(RoleGuard, { 
        requiredRoles: ['voter', 'admin'],
        requireAll: true,
        fallback: React.createElement('div', null, 'Missing Roles')
      },
        React.createElement('div', null, 'Role Protected Content')
      )
    );

    expect(getByText('Missing Roles')).toBeTruthy();
  });

  it('should allow super admin access when enabled', () => {
    // Mock super admin user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['super_admin'],
        permissions: ['super_admin_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(RoleGuard, { 
        requiredRoles: ['admin'],
        allowSuperAdmin: true
      },
        React.createElement('div', null, 'Super Admin Content')
      )
    );

    expect(getByText('Super Admin Content')).toBeTruthy();
  });
});

describe('PermissionGuard', () => {
  it('should render children when user has required permission', () => {
    const { getByText } = render(
      React.createElement(PermissionGuard, { 
        requiredPermissions: ['vote'],
        requireAll: false
      },
        React.createElement('div', null, 'Permission Protected Content')
      )
    );

    expect(getByText('Permission Protected Content')).toBeTruthy();
  });

  it('should show fallback when user lacks required permission', () => {
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
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(PermissionGuard, { 
        requiredPermissions: ['admin_access'],
        requireAll: false,
        fallback: React.createElement('div', null, 'Insufficient Permission')
      },
        React.createElement('div', null, 'Permission Protected Content')
      )
    );

    expect(getByText('Insufficient Permission')).toBeTruthy();
  });

  it('should check all required permissions when requireAll is true', () => {
    // Mock user with only one of two required permissions
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['voter'],
        permissions: ['vote'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(PermissionGuard, { 
        requiredPermissions: ['vote', 'admin_access'],
        requireAll: true,
        fallback: React.createElement('div', null, 'Missing Permissions')
      },
        React.createElement('div', null, 'Permission Protected Content')
      )
    );

    expect(getByText('Missing Permissions')).toBeTruthy();
  });
});

describe('ConditionalGuard', () => {
  it('should render children when condition is met', () => {
    const condition = (user: any) => user.roles.includes('voter');

    const { getByText } = render(
      React.createElement(ConditionalGuard, { 
        condition,
        conditionName: 'voter access'
      },
        React.createElement('div', null, 'Conditional Content')
      )
    );

    expect(getByText('Conditional Content')).toBeTruthy();
  });

  it('should show fallback when condition is not met', () => {
    const condition = (user: any) => user.roles.includes('admin');

    const { getByText } = render(
      React.createElement(ConditionalGuard, { 
        condition,
        conditionName: 'admin access',
        fallback: React.createElement('div', null, 'Condition Not Met')
      },
        React.createElement('div', null, 'Conditional Content')
      )
    );

    expect(getByText('Condition Not Met')).toBeTruthy();
  });
});

describe('GuestGuard', () => {
  it('should render children when not authenticated', () => {
    // Mock unauthenticated state
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
      React.createElement(GuestGuard, {},
        React.createElement('div', null, 'Guest Content')
      )
    );

    expect(getByText('Guest Content')).toBeTruthy();
  });

  it('should show fallback when authenticated', () => {
    const { getByText } = render(
      React.createElement(GuestGuard, {
        fallback: React.createElement('div', null, 'Already Logged In')
      },
        React.createElement('div', null, 'Guest Content')
      )
    );

    expect(getByText('Already Logged In')).toBeTruthy();
  });

  it('should call onAuthorized when authenticated', () => {
    const onAuthorized = jest.fn();

    render(
      React.createElement(GuestGuard, { 
        onAuthorized
      },
        React.createElement('div', null, 'Guest Content')
      )
    );

    expect(onAuthorized).toHaveBeenCalled();
  });
});

describe('AdminGuard', () => {
  it('should render children when user is admin', () => {
    // Mock admin user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['admin_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(AdminGuard, {},
        React.createElement('div', null, 'Admin Content')
      )
    );

    expect(getByText('Admin Content')).toBeTruthy();
  });

  it('should show fallback when user is not admin', () => {
    const { getByText } = render(
      React.createElement(AdminGuard, {
        fallback: React.createElement('div', null, 'Admin Access Required')
      },
        React.createElement('div', null, 'Admin Content')
      )
    );

    expect(getByText('Admin Access Required')).toBeTruthy();
  });

  it('should allow super admin access when enabled', () => {
    // Mock super admin user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['super_admin'],
        permissions: ['super_admin_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(AdminGuard, { allowSuperAdmin: true },
        React.createElement('div', null, 'Super Admin Content')
      )
    );

    expect(getByText('Super Admin Content')).toBeTruthy();
  });

  it('should check active status when required', () => {
    // Mock inactive admin user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['admin_access'],
        status: 'inactive',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(AdminGuard, { 
        requireActiveStatus: true,
        fallback: React.createElement('div', null, 'Account Inactive')
      },
        React.createElement('div', null, 'Admin Content')
      )
    );

    expect(getByText('Account Inactive')).toBeTruthy();
  });
});

describe('ObserverGuard', () => {
  it('should render children when user is observer', () => {
    // Mock observer user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['observer'],
        permissions: ['observer_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(ObserverGuard, {},
        React.createElement('div', null, 'Observer Content')
      )
    );

    expect(getByText('Observer Content')).toBeTruthy();
  });

  it('should show fallback when user is not observer', () => {
    const { getByText } = render(
      React.createElement(ObserverGuard, {
        fallback: React.createElement('div', null, 'Observer Access Required')
      },
        React.createElement('div', null, 'Observer Content')
      )
    );

    expect(getByText('Observer Access Required')).toBeTruthy();
  });

  it('should allow voter access when enabled', () => {
    const { getByText } = render(
      React.createElement(ObserverGuard, { allowVoterAccess: true },
        React.createElement('div', null, 'Voter as Observer Content')
      )
    );

    expect(getByText('Voter as Observer Content')).toBeTruthy();
  });
});

describe('VoterGuard', () => {
  it('should render children when user is voter', () => {
    const { getByText } = render(
      React.createElement(VoterGuard, {},
        React.createElement('div', null, 'Voter Content')
      )
    );

    expect(getByText('Voter Content')).toBeTruthy();
  });

  it('should show fallback when user is not voter', () => {
    // Mock non-voter user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['admin_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(VoterGuard, {
        fallback: React.createElement('div', null, 'Voter Access Required')
      },
        React.createElement('div', null, 'Voter Content')
      )
    );

    expect(getByText('Voter Access Required')).toBeTruthy();
  });

  it('should allow observer access when enabled', () => {
    // Mock observer user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['observer'],
        permissions: ['observer_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(VoterGuard, { allowObserverAccess: true },
        React.createElement('div', null, 'Observer as Voter Content')
      )
    );

    expect(getByText('Observer as Voter Content')).toBeTruthy();
  });
});

describe('Higher-Order Components', () => {
  const TestComponent = () => React.createElement('div', null, 'Test Component');

  it('should wrap component with auth protection', () => {
    const AuthenticatedComponent = withAuth(TestComponent);

    const { getByText } = render(
      React.createElement(AuthenticatedComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should wrap component with role protection', () => {
    const RoleProtectedComponent = withRole(TestComponent, ['voter']);

    const { getByText } = render(
      React.createElement(RoleProtectedComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should wrap component with permission protection', () => {
    const PermissionProtectedComponent = withPermission(TestComponent, ['vote']);

    const { getByText } = render(
      React.createElement(PermissionProtectedComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should wrap component with guest protection', () => {
    // Mock unauthenticated state
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const GuestComponent = withGuest(TestComponent);

    const { getByText } = render(
      React.createElement(GuestComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should wrap component with admin protection', () => {
    // Mock admin user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['admin_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const AdminComponent = withAdmin(TestComponent);

    const { getByText } = render(
      React.createElement(AdminComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should wrap component with observer protection', () => {
    // Mock observer user
    const mockUseAuth = require('@/hooks/use-auth').useAuth;
    mockUseAuth.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'test@example.com',
        roles: ['observer'],
        permissions: ['observer_access'],
        status: 'active',
      },
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    });

    const ObserverComponent = withObserver(TestComponent);

    const { getByText } = render(
      React.createElement(ObserverComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });

  it('should wrap component with voter protection', () => {
    const VoterComponent = withVoter(TestComponent);

    const { getByText } = render(
      React.createElement(VoterComponent)
    );

    expect(getByText('Test Component')).toBeTruthy();
  });
});

/**
 * Route Protection Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useRouteProtection, useRouteProtectionStatus, useRouteNavigation } from '@/hooks/use-route-protection';

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
  usePathname: () => '/current-path',
}));

describe('useRouteProtection', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useRouteProtection());

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.isChecking).toBe(true);
    expect(result.current.isRedirecting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.currentRoute).toBe('/current-path');
    expect(Array.isArray(result.current.requiredRoles)).toBe(true);
    expect(Array.isArray(result.current.requiredPermissions)).toBe(true);
    expect(Array.isArray(result.current.userRoles)).toBe(true);
    expect(Array.isArray(result.current.userPermissions)).toBe(true);
    expect(typeof result.current.checkAuthorization).toBe('function');
    expect(typeof result.current.redirectToLogin).toBe('function');
    expect(typeof result.current.redirectToUnauthorized).toBe('function');
    expect(typeof result.current.redirectToRole).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.retry).toBe('function');
    expect(typeof result.current.canAccess).toBe('function');
    expect(typeof result.current.hasRole).toBe('function');
    expect(typeof result.current.hasAnyRole).toBe('function');
    expect(typeof result.current.hasAllRoles).toBe('function');
    expect(typeof result.current.hasPermission).toBe('function');
    expect(typeof result.current.hasAnyPermission).toBe('function');
    expect(typeof result.current.hasAllPermissions).toBe('function');
    expect(typeof result.current.isPublicRoute).toBe('function');
    expect(typeof result.current.isAdminRoute).toBe('function');
    expect(typeof result.current.isObserverRoute).toBe('function');
    expect(typeof result.current.isVoterRoute).toBe('function');
    expect(typeof result.current.getRedirectPath).toBe('function');
  });

  it('should allow access to public routes', () => {
    const { result } = renderHook(() => useRouteProtection({ public: true }));

    expect(result.current.isAuthorized).toBe(true);
  });

  it('should check role-based access', () => {
    const { result } = renderHook(() => useRouteProtection({ adminOnly: true }));

    // Should not be authorized since user is not admin
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should check required roles', () => {
    const { result } = renderHook(() => useRouteProtection({ 
      requiredRoles: ['admin'],
      requireAllRoles: false 
    }));

    // Should not be authorized since user doesn't have admin role
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should check required permissions', () => {
    const { result } = renderHook(() => useRouteProtection({ 
      requiredPermissions: ['admin_access'],
      requireAllPermissions: false 
    }));

    // Should not be authorized since user doesn't have admin_access permission
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should check authorization', async () => {
    const { result } = renderHook(() => useRouteProtection());

    await act(async () => {
      const authorized = await result.current.checkAuthorization();
      expect(typeof authorized).toBe('boolean');
    });
  });

  it('should redirect to login', () => {
    const { result } = renderHook(() => useRouteProtection());

    act(() => {
      result.current.redirectToLogin();
    });

    expect(result.current.isRedirecting).toBe(true);
  });

  it('should redirect to unauthorized', () => {
    const { result } = renderHook(() => useRouteProtection());

    act(() => {
      result.current.redirectToUnauthorized();
    });

    expect(result.current.isRedirecting).toBe(true);
  });

  it('should redirect to role-based route', () => {
    const { result } = renderHook(() => useRouteProtection());

    act(() => {
      result.current.redirectToRole();
    });

    expect(result.current.isRedirecting).toBe(true);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useRouteProtection());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should retry authorization', async () => {
    const { result } = renderHook(() => useRouteProtection());

    await act(async () => {
      await result.current.retry();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should check if user can access route', () => {
    const { result } = renderHook(() => useRouteProtection());

    const canAccess = result.current.canAccess({ public: true });
    expect(canAccess).toBe(true);

    const cannotAccess = result.current.canAccess({ adminOnly: true });
    expect(cannotAccess).toBe(false);
  });

  it('should check if user has role', () => {
    const { result } = renderHook(() => useRouteProtection());

    const hasVoterRole = result.current.hasRole('voter');
    expect(hasVoterRole).toBe(true);

    const hasAdminRole = result.current.hasRole('admin');
    expect(hasAdminRole).toBe(false);
  });

  it('should check if user has any role', () => {
    const { result } = renderHook(() => useRouteProtection());

    const hasAnyRole = result.current.hasAnyRole(['voter', 'admin']);
    expect(hasAnyRole).toBe(true);

    const hasNoRole = result.current.hasAnyRole(['admin', 'observer']);
    expect(hasNoRole).toBe(false);
  });

  it('should check if user has all roles', () => {
    const { result } = renderHook(() => useRouteProtection());

    const hasAllRoles = result.current.hasAllRoles(['voter']);
    expect(hasAllRoles).toBe(true);

    const hasNotAllRoles = result.current.hasAllRoles(['voter', 'admin']);
    expect(hasNotAllRoles).toBe(false);
  });

  it('should check if user has permission', () => {
    const { result } = renderHook(() => useRouteProtection());

    const hasVotePermission = result.current.hasPermission('vote');
    expect(hasVotePermission).toBe(true);

    const hasAdminPermission = result.current.hasPermission('admin_access');
    expect(hasAdminPermission).toBe(false);
  });

  it('should check if user has any permission', () => {
    const { result } = renderHook(() => useRouteProtection());

    const hasAnyPermission = result.current.hasAnyPermission(['vote', 'admin_access']);
    expect(hasAnyPermission).toBe(true);

    const hasNoPermission = result.current.hasAnyPermission(['admin_access', 'manage_users']);
    expect(hasNoPermission).toBe(false);
  });

  it('should check if user has all permissions', () => {
    const { result } = renderHook(() => useRouteProtection());

    const hasAllPermissions = result.current.hasAllPermissions(['vote', 'view_elections']);
    expect(hasAllPermissions).toBe(true);

    const hasNotAllPermissions = result.current.hasAllPermissions(['vote', 'admin_access']);
    expect(hasNotAllPermissions).toBe(false);
  });

  it('should check if route is public', () => {
    const { result } = renderHook(() => useRouteProtection());

    const isPublic = result.current.isPublicRoute('/login');
    expect(isPublic).toBe(true);

    const isNotPublic = result.current.isPublicRoute('/admin');
    expect(isNotPublic).toBe(false);
  });

  it('should check if route is admin route', () => {
    const { result } = renderHook(() => useRouteProtection());

    const isAdmin = result.current.isAdminRoute('/admin/dashboard');
    expect(isAdmin).toBe(true);

    const isNotAdmin = result.current.isAdminRoute('/voter/elections');
    expect(isNotAdmin).toBe(false);
  });

  it('should check if route is observer route', () => {
    const { result } = renderHook(() => useRouteProtection());

    const isObserver = result.current.isObserverRoute('/observer/reports');
    expect(isObserver).toBe(true);

    const isNotObserver = result.current.isObserverRoute('/voter/elections');
    expect(isNotObserver).toBe(false);
  });

  it('should check if route is voter route', () => {
    const { result } = renderHook(() => useRouteProtection());

    const isVoter = result.current.isVoterRoute('/voter/elections');
    expect(isVoter).toBe(true);

    const isNotVoter = result.current.isVoterRoute('/admin/dashboard');
    expect(isNotVoter).toBe(false);
  });

  it('should get redirect path based on user role', () => {
    const { result } = renderHook(() => useRouteProtection());

    const redirectPath = result.current.getRedirectPath();
    expect(redirectPath).toBe('/voter');
  });
});

describe('useRouteProtectionStatus', () => {
  it('should return protection status', () => {
    const { result } = renderHook(() => useRouteProtectionStatus());

    expect(typeof result.current.isProtected).toBe('boolean');
    expect(typeof result.current.requiresAuth).toBe('boolean');
    expect(typeof result.current.requiresRole).toBe('boolean');
    expect(result.current.requiredRole).toBeNull();
    expect(typeof result.current.isAuthorized).toBe('boolean');
    expect(typeof result.current.isChecking).toBe('boolean');
    expect(result.current.error).toBeNull();
  });

  it('should detect protected routes', () => {
    const { result } = renderHook(() => useRouteProtectionStatus());

    // Current path is '/current-path' which should be protected
    expect(result.current.isProtected).toBe(true);
    expect(result.current.requiresAuth).toBe(true);
  });

  it('should detect role requirements', () => {
    // Mock pathname for admin route
    const mockUsePathname = require('expo-router').usePathname;
    mockUsePathname.mockReturnValueOnce('/admin/dashboard');

    const { result } = renderHook(() => useRouteProtectionStatus());

    expect(result.current.requiresRole).toBe(true);
    expect(result.current.requiredRole).toBe('admin');
  });
});

describe('useRouteNavigation', () => {
  it('should return navigation functions', () => {
    const { result } = renderHook(() => useRouteNavigation());

    expect(typeof result.current.navigateToRole).toBe('function');
    expect(typeof result.current.navigateToAdmin).toBe('function');
    expect(typeof result.current.navigateToObserver).toBe('function');
    expect(typeof result.current.navigateToVoter).toBe('function');
    expect(typeof result.current.navigateToLogin).toBe('function');
    expect(typeof result.current.navigateToRegister).toBe('function');
    expect(typeof result.current.navigateToHome).toBe('function');
    expect(typeof result.current.canNavigateTo).toBe('function');
  });

  it('should navigate to role-based route', () => {
    const { result } = renderHook(() => useRouteNavigation());

    act(() => {
      result.current.navigateToRole();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should navigate to voter route', () => {
    const { result } = renderHook(() => useRouteNavigation());

    act(() => {
      result.current.navigateToVoter();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should navigate to login', () => {
    const { result } = renderHook(() => useRouteNavigation());

    act(() => {
      result.current.navigateToLogin();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should navigate to register', () => {
    const { result } = renderHook(() => useRouteNavigation());

    act(() => {
      result.current.navigateToRegister();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should navigate to home', () => {
    const { result } = renderHook(() => useRouteNavigation());

    act(() => {
      result.current.navigateToHome();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should check if can navigate to route', () => {
    const { result } = renderHook(() => useRouteNavigation());

    const canNavigateToVoter = result.current.canNavigateTo('/voter/elections');
    expect(canNavigateToVoter).toBe(true);

    const canNavigateToAdmin = result.current.canNavigateTo('/admin/dashboard');
    expect(canNavigateToAdmin).toBe(false);
  });
});

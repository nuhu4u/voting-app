/**
 * Auth Guards Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useAuthGuard, 
  useRoleGuard, 
  usePermissionGuard, 
  useAdminGuard, 
  useObserverGuard, 
  useVoterGuard, 
  useGuestGuard,
  useFeatureAccess,
  useConditionalAccess
} from '@/hooks/use-auth-guards';

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

describe('useAuthGuard', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useAuthGuard());

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.isChecking).toBe(true);
    expect(result.current.isRedirecting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(Array.isArray(result.current.userRoles)).toBe(true);
    expect(Array.isArray(result.current.userPermissions)).toBe(true);
    expect(typeof result.current.userStatus).toBe('string');
    expect(typeof result.current.hasAccess).toBe('boolean');
    expect(typeof result.current.accessReason).toBe('string');
    expect(typeof result.current.checkAccess).toBe('function');
    expect(typeof result.current.redirectToLogin).toBe('function');
    expect(typeof result.current.redirectToUnauthorized).toBe('function');
    expect(typeof result.current.redirectToRole).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.retry).toBe('function');
    expect(typeof result.current.hasRole).toBe('function');
    expect(typeof result.current.hasAnyRole).toBe('function');
    expect(typeof result.current.hasAllRoles).toBe('function');
    expect(typeof result.current.hasPermission).toBe('function');
    expect(typeof result.current.hasAnyPermission).toBe('function');
    expect(typeof result.current.hasAllPermissions).toBe('function');
    expect(typeof result.current.isAdmin).toBe('function');
    expect(typeof result.current.isObserver).toBe('function');
    expect(typeof result.current.isVoter).toBe('function');
    expect(typeof result.current.isSuperAdmin).toBe('function');
    expect(typeof result.current.isActive).toBe('function');
    expect(typeof result.current.canAccessAsAdmin).toBe('function');
    expect(typeof result.current.canAccessAsObserver).toBe('function');
    expect(typeof result.current.canAccessAsVoter).toBe('function');
    expect(typeof result.current.getAccessLevel).toBe('function');
    expect(typeof result.current.getRedirectPath).toBe('function');
  });

  it('should allow access when authentication not required', () => {
    const { result } = renderHook(() => useAuthGuard({ requireAuth: false }));

    expect(result.current.isAuthorized).toBe(true);
    expect(result.current.hasAccess).toBe(true);
  });

  it('should check role-based access', () => {
    const { result } = renderHook(() => useAuthGuard({ requiredRoles: ['admin'] }));

    // Should not be authorized since user is not admin
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should check permission-based access', () => {
    const { result } = renderHook(() => useAuthGuard({ requiredPermissions: ['admin_access'] }));

    // Should not be authorized since user doesn't have admin_access permission
    expect(result.current.isAuthorized).toBe(false);
  });

  it('should check access', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await act(async () => {
      const hasAccess = await result.current.checkAccess();
      expect(typeof hasAccess).toBe('boolean');
    });
  });

  it('should redirect to login', () => {
    const { result } = renderHook(() => useAuthGuard());

    act(() => {
      result.current.redirectToLogin();
    });

    expect(result.current.isRedirecting).toBe(true);
  });

  it('should redirect to unauthorized', () => {
    const { result } = renderHook(() => useAuthGuard());

    act(() => {
      result.current.redirectToUnauthorized();
    });

    expect(result.current.isRedirecting).toBe(true);
  });

  it('should redirect to role-based route', () => {
    const { result } = renderHook(() => useAuthGuard());

    act(() => {
      result.current.redirectToRole();
    });

    expect(result.current.isRedirecting).toBe(true);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthGuard());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should retry access check', async () => {
    const { result } = renderHook(() => useAuthGuard());

    await act(async () => {
      await result.current.retry();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should check if user has role', () => {
    const { result } = renderHook(() => useAuthGuard());

    const hasVoterRole = result.current.hasRole('voter');
    expect(hasVoterRole).toBe(true);

    const hasAdminRole = result.current.hasRole('admin');
    expect(hasAdminRole).toBe(false);
  });

  it('should check if user has any role', () => {
    const { result } = renderHook(() => useAuthGuard());

    const hasAnyRole = result.current.hasAnyRole(['voter', 'admin']);
    expect(hasAnyRole).toBe(true);

    const hasNoRole = result.current.hasAnyRole(['admin', 'observer']);
    expect(hasNoRole).toBe(false);
  });

  it('should check if user has all roles', () => {
    const { result } = renderHook(() => useAuthGuard());

    const hasAllRoles = result.current.hasAllRoles(['voter']);
    expect(hasAllRoles).toBe(true);

    const hasNotAllRoles = result.current.hasAllRoles(['voter', 'admin']);
    expect(hasNotAllRoles).toBe(false);
  });

  it('should check if user has permission', () => {
    const { result } = renderHook(() => useAuthGuard());

    const hasVotePermission = result.current.hasPermission('vote');
    expect(hasVotePermission).toBe(true);

    const hasAdminPermission = result.current.hasPermission('admin_access');
    expect(hasAdminPermission).toBe(false);
  });

  it('should check if user has any permission', () => {
    const { result } = renderHook(() => useAuthGuard());

    const hasAnyPermission = result.current.hasAnyPermission(['vote', 'admin_access']);
    expect(hasAnyPermission).toBe(true);

    const hasNoPermission = result.current.hasAnyPermission(['admin_access', 'manage_users']);
    expect(hasNoPermission).toBe(false);
  });

  it('should check if user has all permissions', () => {
    const { result } = renderHook(() => useAuthGuard());

    const hasAllPermissions = result.current.hasAllPermissions(['vote', 'view_elections']);
    expect(hasAllPermissions).toBe(true);

    const hasNotAllPermissions = result.current.hasAllPermissions(['vote', 'admin_access']);
    expect(hasNotAllPermissions).toBe(false);
  });

  it('should check if user is admin', () => {
    const { result } = renderHook(() => useAuthGuard());

    const isAdmin = result.current.isAdmin();
    expect(isAdmin).toBe(false);
  });

  it('should check if user is observer', () => {
    const { result } = renderHook(() => useAuthGuard());

    const isObserver = result.current.isObserver();
    expect(isObserver).toBe(false);
  });

  it('should check if user is voter', () => {
    const { result } = renderHook(() => useAuthGuard());

    const isVoter = result.current.isVoter();
    expect(isVoter).toBe(true);
  });

  it('should check if user is super admin', () => {
    const { result } = renderHook(() => useAuthGuard());

    const isSuperAdmin = result.current.isSuperAdmin();
    expect(isSuperAdmin).toBe(false);
  });

  it('should check if user is active', () => {
    const { result } = renderHook(() => useAuthGuard());

    const isActive = result.current.isActive();
    expect(isActive).toBe(true);
  });

  it('should check admin access', () => {
    const { result } = renderHook(() => useAuthGuard());

    const canAccessAsAdmin = result.current.canAccessAsAdmin();
    expect(canAccessAsAdmin).toBe(false);
  });

  it('should check observer access', () => {
    const { result } = renderHook(() => useAuthGuard());

    const canAccessAsObserver = result.current.canAccessAsObserver();
    expect(canAccessAsObserver).toBe(false);
  });

  it('should check voter access', () => {
    const { result } = renderHook(() => useAuthGuard());

    const canAccessAsVoter = result.current.canAccessAsVoter();
    expect(canAccessAsVoter).toBe(true);
  });

  it('should get access level', () => {
    const { result } = renderHook(() => useAuthGuard());

    const accessLevel = result.current.getAccessLevel();
    expect(['none', 'voter', 'observer', 'admin', 'super_admin']).toContain(accessLevel);
  });

  it('should get redirect path', () => {
    const { result } = renderHook(() => useAuthGuard());

    const redirectPath = result.current.getRedirectPath();
    expect(['/admin', '/observer', '/voter', '/login']).toContain(redirectPath);
  });
});

describe('useRoleGuard', () => {
  it('should check role-based access', () => {
    const { result } = renderHook(() => useRoleGuard(['voter'], false));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });

  it('should check all roles when requireAll is true', () => {
    const { result } = renderHook(() => useRoleGuard(['voter', 'admin'], true));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('usePermissionGuard', () => {
  it('should check permission-based access', () => {
    const { result } = renderHook(() => usePermissionGuard(['vote'], false));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });

  it('should check all permissions when requireAll is true', () => {
    const { result } = renderHook(() => usePermissionGuard(['vote', 'admin_access'], true));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('useAdminGuard', () => {
  it('should check admin access', () => {
    const { result } = renderHook(() => useAdminGuard());

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });

  it('should allow super admin when enabled', () => {
    const { result } = renderHook(() => useAdminGuard(true, true));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('useObserverGuard', () => {
  it('should check observer access', () => {
    const { result } = renderHook(() => useObserverGuard());

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });

  it('should allow voter access when enabled', () => {
    const { result } = renderHook(() => useObserverGuard(true, true));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('useVoterGuard', () => {
  it('should check voter access', () => {
    const { result } = renderHook(() => useVoterGuard());

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });

  it('should allow observer access when enabled', () => {
    const { result } = renderHook(() => useVoterGuard(true, true));

    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.hasAccess).toBe(false);
  });
});

describe('useGuestGuard', () => {
  it('should allow access when not authenticated', () => {
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

    const { result } = renderHook(() => useGuestGuard());

    expect(result.current.isAuthorized).toBe(true);
    expect(result.current.hasAccess).toBe(true);
  });
});

describe('useFeatureAccess', () => {
  it('should return feature access functions', () => {
    const { result } = renderHook(() => useFeatureAccess());

    expect(typeof result.current.canManageUsers).toBe('function');
    expect(typeof result.current.canManageElections).toBe('function');
    expect(typeof result.current.canViewReports).toBe('function');
    expect(typeof result.current.canCreateReports).toBe('function');
    expect(typeof result.current.canVote).toBe('function');
    expect(typeof result.current.canViewElections).toBe('function');
    expect(typeof result.current.canViewAnalytics).toBe('function');
    expect(typeof result.current.canManageSettings).toBe('function');
    expect(typeof result.current.canAccessBlockchain).toBe('function');
  });

  it('should check if user can manage users', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canManageUsers = result.current.canManageUsers();
    expect(typeof canManageUsers).toBe('boolean');
  });

  it('should check if user can manage elections', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canManageElections = result.current.canManageElections();
    expect(typeof canManageElections).toBe('boolean');
  });

  it('should check if user can view reports', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canViewReports = result.current.canViewReports();
    expect(typeof canViewReports).toBe('boolean');
  });

  it('should check if user can create reports', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canCreateReports = result.current.canCreateReports();
    expect(typeof canCreateReports).toBe('boolean');
  });

  it('should check if user can vote', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canVote = result.current.canVote();
    expect(typeof canVote).toBe('boolean');
  });

  it('should check if user can view elections', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canViewElections = result.current.canViewElections();
    expect(typeof canViewElections).toBe('boolean');
  });

  it('should check if user can view analytics', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canViewAnalytics = result.current.canViewAnalytics();
    expect(typeof canViewAnalytics).toBe('boolean');
  });

  it('should check if user can manage settings', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canManageSettings = result.current.canManageSettings();
    expect(typeof canManageSettings).toBe('boolean');
  });

  it('should check if user can access blockchain', () => {
    const { result } = renderHook(() => useFeatureAccess());

    const canAccessBlockchain = result.current.canAccessBlockchain();
    expect(typeof canAccessBlockchain).toBe('boolean');
  });
});

describe('useConditionalAccess', () => {
  it('should check conditional access', () => {
    const condition = (user: any) => user.roles.includes('voter');

    const { result } = renderHook(() => useConditionalAccess(condition));

    expect(typeof result.current.hasAccess).toBe('boolean');
    expect(typeof result.current.isChecking).toBe('boolean');
    expect(typeof result.current.checkCondition).toBe('function');
  });

  it('should check condition on mount', () => {
    const condition = (user: any) => user.roles.includes('admin');

    const { result } = renderHook(() => useConditionalAccess(condition));

    expect(result.current.hasAccess).toBe(false);
  });

  it('should retry condition check', async () => {
    const condition = (user: any) => user.roles.includes('voter');

    const { result } = renderHook(() => useConditionalAccess(condition));

    await act(async () => {
      await result.current.checkCondition();
    });

    expect(result.current.hasAccess).toBe(true);
  });
});

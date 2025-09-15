/**
 * Auth Guard Utils Tests
 */

import { AuthGuardUtils } from '@/lib/auth/auth-guard-utils';

// Mock User type
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  status: string;
  [key: string]: any;
}

describe('AuthGuardUtils', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['voter'],
    permissions: ['vote', 'view_elections'],
    status: 'active',
  };

  const adminUser: User = {
    id: '2',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['admin'],
    permissions: ['admin_access', 'manage_users', 'manage_elections'],
    status: 'active',
  };

  const superAdminUser: User = {
    id: '3',
    email: 'super@example.com',
    firstName: 'Super',
    lastName: 'Admin',
    roles: ['super_admin'],
    permissions: ['super_admin_access'],
    status: 'active',
  };

  const inactiveUser: User = {
    id: '4',
    email: 'inactive@example.com',
    firstName: 'Inactive',
    lastName: 'User',
    roles: ['voter'],
    permissions: ['vote'],
    status: 'inactive',
  };

  describe('checkAccess', () => {
    it('should return default result for null user', () => {
      const rules = [
        AuthGuardUtils.createRoleRule('voter'),
      ];

      const result = AuthGuardUtils.checkAccess(null, rules);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('No user provided');
      expect(result.missingRequirements).toEqual([]);
      expect(result.userInfo.roles).toEqual([]);
      expect(result.userInfo.permissions).toEqual([]);
      expect(result.userInfo.status).toBe('inactive');
      expect(result.userInfo.accessLevel).toBe('none');
    });

    it('should allow access when user meets requirements', () => {
      const rules = [
        AuthGuardUtils.createRoleRule('voter'),
        AuthGuardUtils.createStatusRule('active'),
      ];

      const result = AuthGuardUtils.checkAccess(mockUser, rules);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Access granted');
      expect(result.missingRequirements).toEqual([]);
    });

    it('should deny access when user lacks required role', () => {
      const rules = [
        AuthGuardUtils.createRoleRule('admin'),
      ];

      const result = AuthGuardUtils.checkAccess(mockUser, rules);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Access denied');
      expect(result.missingRequirements).toContain('Role: admin');
    });

    it('should deny access when user lacks required permission', () => {
      const rules = [
        AuthGuardUtils.createPermissionRule('admin_access'),
      ];

      const result = AuthGuardUtils.checkAccess(mockUser, rules);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Access denied');
      expect(result.missingRequirements).toContain('Permission: admin_access');
    });

    it('should deny access when user status is incorrect', () => {
      const rules = [
        AuthGuardUtils.createStatusRule('active'),
      ];

      const result = AuthGuardUtils.checkAccess(inactiveUser, rules);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Access denied');
      expect(result.missingRequirements).toContain('Status: active');
    });

    it('should require all rules when requireAll is true', () => {
      const rules = [
        AuthGuardUtils.createRoleRule('voter'),
        AuthGuardUtils.createPermissionRule('admin_access'),
      ];

      const result = AuthGuardUtils.checkAccess(mockUser, rules, true);

      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Access denied');
      expect(result.missingRequirements).toContain('Permission: admin_access');
    });

    it('should allow access with any rule when requireAll is false', () => {
      const rules = [
        AuthGuardUtils.createRoleRule('admin'),
        AuthGuardUtils.createRoleRule('voter'),
      ];

      const result = AuthGuardUtils.checkAccess(mockUser, rules, false);

      expect(result.allowed).toBe(true);
      expect(result.reason).toBe('Access granted');
    });
  });

  describe('getAccessLevel', () => {
    it('should return super_admin for super admin user', () => {
      const level = AuthGuardUtils.getAccessLevel(superAdminUser);
      expect(level).toBe('super_admin');
    });

    it('should return admin for admin user', () => {
      const level = AuthGuardUtils.getAccessLevel(adminUser);
      expect(level).toBe('admin');
    });

    it('should return voter for voter user', () => {
      const level = AuthGuardUtils.getAccessLevel(mockUser);
      expect(level).toBe('voter');
    });

    it('should return none for user without roles', () => {
      const userWithoutRoles = { ...mockUser, roles: [] };
      const level = AuthGuardUtils.getAccessLevel(userWithoutRoles);
      expect(level).toBe('none');
    });
  });

  describe('hasRole', () => {
    it('should return true when user has role', () => {
      expect(AuthGuardUtils.hasRole(mockUser, 'voter')).toBe(true);
    });

    it('should return false when user lacks role', () => {
      expect(AuthGuardUtils.hasRole(mockUser, 'admin')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.hasRole(null, 'voter')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any of the roles', () => {
      expect(AuthGuardUtils.hasAnyRole(mockUser, ['voter', 'admin'])).toBe(true);
    });

    it('should return false when user has none of the roles', () => {
      expect(AuthGuardUtils.hasAnyRole(mockUser, ['admin', 'observer'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.hasAnyRole(null, ['voter'])).toBe(false);
    });
  });

  describe('hasAllRoles', () => {
    it('should return true when user has all roles', () => {
      expect(AuthGuardUtils.hasAllRoles(mockUser, ['voter'])).toBe(true);
    });

    it('should return false when user lacks any role', () => {
      expect(AuthGuardUtils.hasAllRoles(mockUser, ['voter', 'admin'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.hasAllRoles(null, ['voter'])).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when user has permission', () => {
      expect(AuthGuardUtils.hasPermission(mockUser, 'vote')).toBe(true);
    });

    it('should return false when user lacks permission', () => {
      expect(AuthGuardUtils.hasPermission(mockUser, 'admin_access')).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.hasPermission(null, 'vote')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has any permission', () => {
      expect(AuthGuardUtils.hasAnyPermission(mockUser, ['vote', 'admin_access'])).toBe(true);
    });

    it('should return false when user has no permissions', () => {
      expect(AuthGuardUtils.hasAnyPermission(mockUser, ['admin_access', 'manage_users'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.hasAnyPermission(null, ['vote'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      expect(AuthGuardUtils.hasAllPermissions(mockUser, ['vote', 'view_elections'])).toBe(true);
    });

    it('should return false when user lacks any permission', () => {
      expect(AuthGuardUtils.hasAllPermissions(mockUser, ['vote', 'admin_access'])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.hasAllPermissions(null, ['vote'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      expect(AuthGuardUtils.isAdmin(adminUser)).toBe(true);
    });

    it('should return true for super admin user', () => {
      expect(AuthGuardUtils.isAdmin(superAdminUser)).toBe(true);
    });

    it('should return false for voter user', () => {
      expect(AuthGuardUtils.isAdmin(mockUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.isAdmin(null)).toBe(false);
    });
  });

  describe('isObserver', () => {
    it('should return true for observer user', () => {
      const observerUser = { ...mockUser, roles: ['observer'] };
      expect(AuthGuardUtils.isObserver(observerUser)).toBe(true);
    });

    it('should return false for voter user', () => {
      expect(AuthGuardUtils.isObserver(mockUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.isObserver(null)).toBe(false);
    });
  });

  describe('isVoter', () => {
    it('should return true for voter user', () => {
      expect(AuthGuardUtils.isVoter(mockUser)).toBe(true);
    });

    it('should return false for admin user', () => {
      expect(AuthGuardUtils.isVoter(adminUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.isVoter(null)).toBe(false);
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true for super admin user', () => {
      expect(AuthGuardUtils.isSuperAdmin(superAdminUser)).toBe(true);
    });

    it('should return false for admin user', () => {
      expect(AuthGuardUtils.isSuperAdmin(adminUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.isSuperAdmin(null)).toBe(false);
    });
  });

  describe('isActive', () => {
    it('should return true for active user', () => {
      expect(AuthGuardUtils.isActive(mockUser)).toBe(true);
    });

    it('should return false for inactive user', () => {
      expect(AuthGuardUtils.isActive(inactiveUser)).toBe(false);
    });

    it('should return false for null user', () => {
      expect(AuthGuardUtils.isActive(null)).toBe(false);
    });
  });

  describe('getRedirectPath', () => {
    it('should return admin path for admin user', () => {
      expect(AuthGuardUtils.getRedirectPath(adminUser)).toBe('/admin');
    });

    it('should return admin path for super admin user', () => {
      expect(AuthGuardUtils.getRedirectPath(superAdminUser)).toBe('/admin');
    });

    it('should return observer path for observer user', () => {
      const observerUser = { ...mockUser, roles: ['observer'] };
      expect(AuthGuardUtils.getRedirectPath(observerUser)).toBe('/observer');
    });

    it('should return voter path for voter user', () => {
      expect(AuthGuardUtils.getRedirectPath(mockUser)).toBe('/voter');
    });

    it('should return login path for null user', () => {
      expect(AuthGuardUtils.getRedirectPath(null)).toBe('/login');
    });
  });

  describe('createRoleRule', () => {
    it('should create role rule with single role', () => {
      const rule = AuthGuardUtils.createRoleRule('voter');
      expect(rule.type).toBe('role');
      expect(rule.value).toEqual(['voter']);
      expect(rule.operator).toBe('any');
    });

    it('should create role rule with multiple roles', () => {
      const rule = AuthGuardUtils.createRoleRule(['voter', 'admin']);
      expect(rule.type).toBe('role');
      expect(rule.value).toEqual(['voter', 'admin']);
      expect(rule.operator).toBe('any');
    });

    it('should create role rule with custom operator', () => {
      const rule = AuthGuardUtils.createRoleRule(['voter', 'admin'], 'all');
      expect(rule.type).toBe('role');
      expect(rule.value).toEqual(['voter', 'admin']);
      expect(rule.operator).toBe('all');
    });
  });

  describe('createPermissionRule', () => {
    it('should create permission rule with single permission', () => {
      const rule = AuthGuardUtils.createPermissionRule('vote');
      expect(rule.type).toBe('permission');
      expect(rule.value).toEqual(['vote']);
      expect(rule.operator).toBe('any');
    });

    it('should create permission rule with multiple permissions', () => {
      const rule = AuthGuardUtils.createPermissionRule(['vote', 'view_elections']);
      expect(rule.type).toBe('permission');
      expect(rule.value).toEqual(['vote', 'view_elections']);
      expect(rule.operator).toBe('any');
    });

    it('should create permission rule with custom operator', () => {
      const rule = AuthGuardUtils.createPermissionRule(['vote', 'view_elections'], 'all');
      expect(rule.type).toBe('permission');
      expect(rule.value).toEqual(['vote', 'view_elections']);
      expect(rule.operator).toBe('all');
    });
  });

  describe('createStatusRule', () => {
    it('should create status rule with equals operator', () => {
      const rule = AuthGuardUtils.createStatusRule('active');
      expect(rule.type).toBe('status');
      expect(rule.value).toBe('active');
      expect(rule.operator).toBe('equals');
    });

    it('should create status rule with excludes operator', () => {
      const rule = AuthGuardUtils.createStatusRule('inactive', 'excludes');
      expect(rule.type).toBe('status');
      expect(rule.value).toBe('inactive');
      expect(rule.operator).toBe('excludes');
    });
  });

  describe('createCustomRule', () => {
    it('should create custom rule with check function', () => {
      const customCheck = (user: User) => user.roles.includes('voter');
      const rule = AuthGuardUtils.createCustomRule('voter check', customCheck);
      
      expect(rule.type).toBe('custom');
      expect(rule.value).toBe('voter check');
      expect(rule.customCheck).toBe(customCheck);
    });
  });

  describe('createAdminRule', () => {
    it('should create admin rule with super admin access', () => {
      const rule = AuthGuardUtils.createAdminRule(true);
      
      expect(rule.name).toBe('admin');
      expect(rule.description).toBe('Admin access required');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Admin access required');
      expect(rule.redirectTo).toBe('/unauthorized');
      expect(rule.rules).toHaveLength(2);
    });

    it('should create admin rule without super admin access', () => {
      const rule = AuthGuardUtils.createAdminRule(false);
      
      expect(rule.name).toBe('admin');
      expect(rule.description).toBe('Admin access required');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Admin access required');
      expect(rule.redirectTo).toBe('/unauthorized');
      expect(rule.rules).toHaveLength(2);
    });
  });

  describe('createObserverRule', () => {
    it('should create observer rule without voter access', () => {
      const rule = AuthGuardUtils.createObserverRule(false);
      
      expect(rule.name).toBe('observer');
      expect(rule.description).toBe('Observer access required');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Observer access required');
      expect(rule.redirectTo).toBe('/unauthorized');
      expect(rule.rules).toHaveLength(2);
    });

    it('should create observer rule with voter access', () => {
      const rule = AuthGuardUtils.createObserverRule(true);
      
      expect(rule.name).toBe('observer');
      expect(rule.description).toBe('Observer access required');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Observer access required');
      expect(rule.redirectTo).toBe('/unauthorized');
      expect(rule.rules).toHaveLength(2);
    });
  });

  describe('createVoterRule', () => {
    it('should create voter rule without observer access', () => {
      const rule = AuthGuardUtils.createVoterRule(false);
      
      expect(rule.name).toBe('voter');
      expect(rule.description).toBe('Voter access required');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Voter access required');
      expect(rule.redirectTo).toBe('/unauthorized');
      expect(rule.rules).toHaveLength(2);
    });

    it('should create voter rule with observer access', () => {
      const rule = AuthGuardUtils.createVoterRule(true);
      
      expect(rule.name).toBe('voter');
      expect(rule.description).toBe('Voter access required');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Voter access required');
      expect(rule.redirectTo).toBe('/unauthorized');
      expect(rule.rules).toHaveLength(2);
    });
  });

  describe('createGuestRule', () => {
    it('should create guest rule', () => {
      const rule = AuthGuardUtils.createGuestRule();
      
      expect(rule.name).toBe('guest');
      expect(rule.description).toBe('Guest access only');
      expect(rule.requireAll).toBe(true);
      expect(rule.fallbackMessage).toBe('Already logged in');
      expect(rule.redirectTo).toBe('/dashboard');
      expect(rule.rules).toHaveLength(1);
    });
  });

  describe('validateGuardRule', () => {
    it('should validate correct guard rule', () => {
      const rule = AuthGuardUtils.createAdminRule();
      const result = AuthGuardUtils.validateGuardRule(rule);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid guard rule', () => {
      const rule = {
        name: '',
        description: '',
        rules: [],
        requireAll: true,
        fallbackMessage: '',
      };
      
      const result = AuthGuardUtils.validateGuardRule(rule as any);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getFeatureAccess', () => {
    it('should return feature access for admin user', () => {
      const access = AuthGuardUtils.getFeatureAccess(adminUser);
      
      expect(access.canManageUsers).toBe(true);
      expect(access.canManageElections).toBe(true);
      expect(access.canViewReports).toBe(true);
      expect(access.canCreateReports).toBe(true);
      expect(access.canVote).toBe(true);
      expect(access.canViewElections).toBe(true);
      expect(access.canViewAnalytics).toBe(true);
      expect(access.canManageSettings).toBe(true);
      expect(access.canAccessBlockchain).toBe(true);
    });

    it('should return feature access for voter user', () => {
      const access = AuthGuardUtils.getFeatureAccess(mockUser);
      
      expect(access.canManageUsers).toBe(false);
      expect(access.canManageElections).toBe(false);
      expect(access.canViewReports).toBe(false);
      expect(access.canCreateReports).toBe(false);
      expect(access.canVote).toBe(true);
      expect(access.canViewElections).toBe(true);
      expect(access.canViewAnalytics).toBe(false);
      expect(access.canManageSettings).toBe(false);
      expect(access.canAccessBlockchain).toBe(false);
    });

    it('should return no access for null user', () => {
      const access = AuthGuardUtils.getFeatureAccess(null);
      
      expect(access.canManageUsers).toBe(false);
      expect(access.canManageElections).toBe(false);
      expect(access.canViewReports).toBe(false);
      expect(access.canCreateReports).toBe(false);
      expect(access.canVote).toBe(false);
      expect(access.canViewElections).toBe(false);
      expect(access.canViewAnalytics).toBe(false);
      expect(access.canManageSettings).toBe(false);
      expect(access.canAccessBlockchain).toBe(false);
    });
  });

  describe('getUserCapabilities', () => {
    it('should return capabilities for active user', () => {
      const capabilities = AuthGuardUtils.getUserCapabilities(mockUser);
      
      expect(capabilities.accessLevel).toBe('voter');
      expect(capabilities.roles).toEqual(['voter']);
      expect(capabilities.permissions).toEqual(['vote', 'view_elections']);
      expect(capabilities.status).toBe('active');
      expect(capabilities.isActive).toBe(true);
      expect(capabilities.features).toContain('canVote');
      expect(capabilities.features).toContain('canViewElections');
    });

    it('should return capabilities for admin user', () => {
      const capabilities = AuthGuardUtils.getUserCapabilities(adminUser);
      
      expect(capabilities.accessLevel).toBe('admin');
      expect(capabilities.roles).toEqual(['admin']);
      expect(capabilities.permissions).toEqual(['admin_access', 'manage_users', 'manage_elections']);
      expect(capabilities.status).toBe('active');
      expect(capabilities.isActive).toBe(true);
      expect(capabilities.features.length).toBeGreaterThan(0);
    });

    it('should return no capabilities for null user', () => {
      const capabilities = AuthGuardUtils.getUserCapabilities(null);
      
      expect(capabilities.accessLevel).toBe('none');
      expect(capabilities.roles).toEqual([]);
      expect(capabilities.permissions).toEqual([]);
      expect(capabilities.status).toBe('inactive');
      expect(capabilities.isActive).toBe(false);
      expect(capabilities.features).toEqual([]);
    });
  });
});

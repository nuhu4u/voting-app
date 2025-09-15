/**
 * Route Protection Middleware Tests
 */

import { routeProtectionMiddleware, RouteProtectionUtils } from '@/lib/auth/route-protection-middleware';

// Mock dependencies
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

describe('RouteProtectionMiddleware', () => {
  beforeEach(() => {
    // Clear all registered routes and middleware
    const registeredRoutes = routeProtectionMiddleware.getRegisteredRoutes();
    registeredRoutes.forEach(route => routeProtectionMiddleware.removeRoute(route));
    
    const registeredMiddleware = routeProtectionMiddleware.getRegisteredMiddleware();
    registeredMiddleware.forEach(middleware => routeProtectionMiddleware.removeMiddleware(middleware));
  });

  describe('Route Registration', () => {
    it('should register route configuration', () => {
      const config = {
        requireAuth: true,
        requiredRoles: ['voter'],
        requiredPermissions: ['vote'],
      };

      routeProtectionMiddleware.registerRoute('/test-route', config);
      const registeredConfig = routeProtectionMiddleware.getRouteConfig('/test-route');

      expect(registeredConfig).toBeDefined();
      expect(registeredConfig?.requireAuth).toBe(true);
      expect(registeredConfig?.requiredRoles).toEqual(['voter']);
      expect(registeredConfig?.requiredPermissions).toEqual(['vote']);
    });

    it('should get route configuration', () => {
      const config = {
        requireAuth: false,
        public: true,
      };

      routeProtectionMiddleware.registerRoute('/public-route', config);
      const retrievedConfig = routeProtectionMiddleware.getRouteConfig('/public-route');

      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig?.public).toBe(true);
    });

    it('should return undefined for unregistered route', () => {
      const config = routeProtectionMiddleware.getRouteConfig('/unregistered-route');
      expect(config).toBeUndefined();
    });

    it('should remove route configuration', () => {
      routeProtectionMiddleware.registerRoute('/test-route', { requireAuth: true });
      const removed = routeProtectionMiddleware.removeRoute('/test-route');
      
      expect(removed).toBe(true);
      expect(routeProtectionMiddleware.getRouteConfig('/test-route')).toBeUndefined();
    });
  });

  describe('Middleware Registration', () => {
    it('should register middleware', () => {
      const middleware = {
        name: 'test-middleware',
        priority: 1,
        execute: jest.fn(() => Promise.resolve({ allow: true })),
      };

      routeProtectionMiddleware.registerMiddleware(middleware);
      const registeredMiddleware = routeProtectionMiddleware.getRegisteredMiddleware();

      expect(registeredMiddleware).toContain('test-middleware');
    });

    it('should remove middleware', () => {
      const middleware = {
        name: 'test-middleware',
        execute: jest.fn(() => Promise.resolve({ allow: true })),
      };

      routeProtectionMiddleware.registerMiddleware(middleware);
      const removed = routeProtectionMiddleware.removeMiddleware('test-middleware');
      
      expect(removed).toBe(true);
      expect(routeProtectionMiddleware.getRegisteredMiddleware()).not.toContain('test-middleware');
    });
  });

  describe('Route Protection Execution', () => {
    it('should allow access to public routes', async () => {
      routeProtectionMiddleware.registerRoute('/public', { public: true });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/public',
        null,
        false,
        {}
      );

      expect(result.allow).toBe(true);
    });

    it('should allow access to unregistered routes', async () => {
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/unregistered',
        null,
        false,
        {}
      );

      expect(result.allow).toBe(true);
    });

    it('should deny access when authentication required but user not authenticated', async () => {
      routeProtectionMiddleware.registerRoute('/protected', { requireAuth: true });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/protected',
        null,
        false,
        {}
      );

      expect(result.allow).toBe(false);
      expect(result.redirectTo).toBeDefined();
    });

    it('should allow access when user is authenticated', async () => {
      const user = {
        id: '1',
        roles: ['voter'],
        permissions: ['vote'],
      };

      routeProtectionMiddleware.registerRoute('/protected', { requireAuth: true });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/protected',
        user,
        true,
        {}
      );

      expect(result.allow).toBe(true);
    });

    it('should deny access for admin-only routes when user is not admin', async () => {
      const user = {
        id: '1',
        roles: ['voter'],
        permissions: ['vote'],
      };

      routeProtectionMiddleware.registerRoute('/admin', { adminOnly: true });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/admin',
        user,
        true,
        {}
      );

      expect(result.allow).toBe(false);
      expect(result.error).toBe('Admin access required');
    });

    it('should allow access for admin-only routes when user is admin', async () => {
      const user = {
        id: '1',
        roles: ['admin'],
        permissions: ['admin_access'],
      };

      routeProtectionMiddleware.registerRoute('/admin', { adminOnly: true });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/admin',
        user,
        true,
        {}
      );

      expect(result.allow).toBe(true);
    });

    it('should check required roles', async () => {
      const user = {
        id: '1',
        roles: ['voter'],
        permissions: ['vote'],
      };

      routeProtectionMiddleware.registerRoute('/special', { 
        requiredRoles: ['admin', 'observer'],
        requireAllRoles: false 
      });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/special',
        user,
        true,
        {}
      );

      expect(result.allow).toBe(false);
    });

    it('should check required permissions', async () => {
      const user = {
        id: '1',
        roles: ['voter'],
        permissions: ['vote'],
      };

      routeProtectionMiddleware.registerRoute('/special', { 
        requiredPermissions: ['admin_access', 'manage_users'],
        requireAllPermissions: false 
      });
      
      const result = await routeProtectionMiddleware.executeRouteProtection(
        '/special',
        user,
        true,
        {}
      );

      expect(result.allow).toBe(false);
    });
  });

  describe('Route Detection', () => {
    it('should detect protected routes', () => {
      routeProtectionMiddleware.registerRoute('/protected', { requireAuth: true });
      routeProtectionMiddleware.registerRoute('/public', { public: true });

      expect(routeProtectionMiddleware.isRouteProtected('/protected')).toBe(true);
      expect(routeProtectionMiddleware.isRouteProtected('/public')).toBe(false);
    });

    it('should get required roles for route', () => {
      routeProtectionMiddleware.registerRoute('/admin', { adminOnly: true });
      routeProtectionMiddleware.registerRoute('/observer', { observerOnly: true });
      routeProtectionMiddleware.registerRoute('/voter', { voterOnly: true });
      routeProtectionMiddleware.registerRoute('/special', { requiredRoles: ['admin', 'voter'] });

      expect(routeProtectionMiddleware.getRequiredRoles('/admin')).toEqual(['admin']);
      expect(routeProtectionMiddleware.getRequiredRoles('/observer')).toEqual(['observer']);
      expect(routeProtectionMiddleware.getRequiredRoles('/voter')).toEqual(['voter']);
      expect(routeProtectionMiddleware.getRequiredRoles('/special')).toEqual(['admin', 'voter']);
    });

    it('should get required permissions for route', () => {
      routeProtectionMiddleware.registerRoute('/special', { 
        requiredPermissions: ['admin_access', 'manage_users'] 
      });

      const permissions = routeProtectionMiddleware.getRequiredPermissions('/special');
      expect(permissions).toEqual(['admin_access', 'manage_users']);
    });
  });

  describe('Configuration', () => {
    it('should configure middleware', () => {
      const newConfig = {
        defaultRedirectTo: '/custom-login',
        enableLogging: false,
        enableCaching: false,
      };

      routeProtectionMiddleware.configure(newConfig);
      const config = routeProtectionMiddleware.getConfig();

      expect(config.defaultRedirectTo).toBe('/custom-login');
      expect(config.enableLogging).toBe(false);
      expect(config.enableCaching).toBe(false);
    });

    it('should get current configuration', () => {
      const config = routeProtectionMiddleware.getConfig();

      expect(config).toHaveProperty('defaultRedirectTo');
      expect(config).toHaveProperty('defaultFallbackRoute');
      expect(config).toHaveProperty('enableLogging');
      expect(config).toHaveProperty('enableCaching');
      expect(config).toHaveProperty('cacheTimeout');
      expect(config).toHaveProperty('retryAttempts');
      expect(config).toHaveProperty('retryDelay');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      routeProtectionMiddleware.clearCache();
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should clear route cache', () => {
      routeProtectionMiddleware.clearRouteCache('/test-route');
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should get middleware statistics', () => {
      const stats = routeProtectionMiddleware.getStats();

      expect(stats).toHaveProperty('totalRoutes');
      expect(stats).toHaveProperty('totalMiddleware');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(typeof stats.totalRoutes).toBe('number');
      expect(typeof stats.totalMiddleware).toBe('number');
      expect(typeof stats.cacheSize).toBe('number');
      expect(typeof stats.cacheHitRate).toBe('number');
    });
  });
});

describe('RouteProtectionUtils', () => {
  describe('createRouteConfig', () => {
    it('should create route configuration with defaults', () => {
      const config = RouteProtectionUtils.createRouteConfig({ path: '/test' });

      expect(config.path).toBe('/test');
      expect(config.requireAuth).toBe(true);
      expect(config.requiredRoles).toEqual([]);
      expect(config.requiredPermissions).toEqual([]);
      expect(config.requireAllRoles).toBe(false);
      expect(config.requireAllPermissions).toBe(false);
      expect(config.public).toBe(false);
      expect(config.adminOnly).toBe(false);
      expect(config.observerOnly).toBe(false);
      expect(config.voterOnly).toBe(false);
      expect(config.middleware).toEqual([]);
    });

    it('should merge provided configuration', () => {
      const config = RouteProtectionUtils.createRouteConfig({
        path: '/test',
        requireAuth: false,
        public: true,
        requiredRoles: ['admin'],
      });

      expect(config.path).toBe('/test');
      expect(config.requireAuth).toBe(false);
      expect(config.public).toBe(true);
      expect(config.requiredRoles).toEqual(['admin']);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow access to public routes', () => {
      const config = RouteProtectionUtils.createRouteConfig({ public: true });
      const user = null;

      const canAccess = RouteProtectionUtils.canAccessRoute(user, config);
      expect(canAccess).toBe(true);
    });

    it('should deny access when authentication required but user not authenticated', () => {
      const config = RouteProtectionUtils.createRouteConfig({ requireAuth: true });
      const user = null;

      const canAccess = RouteProtectionUtils.canAccessRoute(user, config);
      expect(canAccess).toBe(false);
    });

    it('should allow access when user is authenticated', () => {
      const config = RouteProtectionUtils.createRouteConfig({ requireAuth: true });
      const user = { roles: ['voter'] };

      const canAccess = RouteProtectionUtils.canAccessRoute(user, config);
      expect(canAccess).toBe(true);
    });

    it('should check admin-only access', () => {
      const config = RouteProtectionUtils.createRouteConfig({ adminOnly: true });
      const adminUser = { roles: ['admin'] };
      const voterUser = { roles: ['voter'] };

      expect(RouteProtectionUtils.canAccessRoute(adminUser, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(voterUser, config)).toBe(false);
    });

    it('should check observer-only access', () => {
      const config = RouteProtectionUtils.createRouteConfig({ observerOnly: true });
      const observerUser = { roles: ['observer'] };
      const voterUser = { roles: ['voter'] };

      expect(RouteProtectionUtils.canAccessRoute(observerUser, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(voterUser, config)).toBe(false);
    });

    it('should check voter-only access', () => {
      const config = RouteProtectionUtils.createRouteConfig({ voterOnly: true });
      const voterUser = { roles: ['voter'] };
      const adminUser = { roles: ['admin'] };

      expect(RouteProtectionUtils.canAccessRoute(voterUser, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(adminUser, config)).toBe(false);
    });

    it('should check required roles', () => {
      const config = RouteProtectionUtils.createRouteConfig({ 
        requiredRoles: ['admin', 'voter'],
        requireAllRoles: false 
      });
      const userWithAnyRole = { roles: ['admin'] };
      const userWithAllRoles = { roles: ['admin', 'voter'] };
      const userWithNoRoles = { roles: ['observer'] };

      expect(RouteProtectionUtils.canAccessRoute(userWithAnyRole, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(userWithAllRoles, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(userWithNoRoles, config)).toBe(false);
    });

    it('should check required permissions', () => {
      const config = RouteProtectionUtils.createRouteConfig({ 
        requiredPermissions: ['admin_access', 'vote'],
        requireAllPermissions: false 
      });
      const userWithAnyPermission = { roles: ['voter'], permissions: ['vote'] };
      const userWithAllPermissions = { roles: ['admin'], permissions: ['admin_access', 'vote'] };
      const userWithNoPermissions = { roles: ['voter'], permissions: ['view_elections'] };

      expect(RouteProtectionUtils.canAccessRoute(userWithAnyPermission, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(userWithAllPermissions, config)).toBe(true);
      expect(RouteProtectionUtils.canAccessRoute(userWithNoPermissions, config)).toBe(false);
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

    it('should return login path for null user', () => {
      const path = RouteProtectionUtils.getRedirectPath(null);
      expect(path).toBe('/login');
    });
  });
});

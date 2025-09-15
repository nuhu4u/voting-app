/**
 * Tests for Auth Guards
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AuthGuard, GuestGuard, RoleGuard, PermissionGuard } from '@/lib/auth/auth-guards';

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-auth', () => ({
  useTokenStatus: jest.fn(),
}));

const mockUseAuth = require('@/contexts/auth-context').useAuth;
const mockUseTokenStatus = require('@/hooks/use-auth').useTokenStatus;

describe('Auth Guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthGuard', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Protected Content')).toBeTruthy();
    });

    it('should show loading when loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: true,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Protected Content')).toBeFalsy();
      // Should show loading spinner
    });

    it('should show fallback when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <AuthGuard fallback={<div>Please log in</div>}>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Please log in')).toBeTruthy();
      expect(screen.getByText('Protected Content')).toBeFalsy();
    });

    it('should show default message when not authenticated and no fallback', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Authentication Required')).toBeTruthy();
      expect(screen.getByText('Please log in to access this page.')).toBeTruthy();
    });

    it('should show message when token is expired', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: true,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Authentication Required')).toBeTruthy();
      expect(screen.getByText('Protected Content')).toBeFalsy();
    });
  });

  describe('GuestGuard', () => {
    it('should render children when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

      render(
        <GuestGuard>
          <div>Guest Content</div>
        </GuestGuard>
      );

      expect(screen.getByText('Guest Content')).toBeTruthy();
    });

    it('should show fallback when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        isLoading: false,
      });

      render(
        <GuestGuard fallback={<div>Already logged in</div>}>
          <div>Guest Content</div>
        </GuestGuard>
      );

      expect(screen.getByText('Already logged in')).toBeTruthy();
      expect(screen.getByText('Guest Content')).toBeFalsy();
    });

    it('should show default message when authenticated and no fallback', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com' },
        isLoading: false,
      });

      render(
        <GuestGuard>
          <div>Guest Content</div>
        </GuestGuard>
      );

      expect(screen.getByText('Already Logged In')).toBeTruthy();
      expect(screen.getByText('Guest Content')).toBeFalsy();
    });
  });

  describe('RoleGuard', () => {
    it('should render children when user has required role', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'admin' },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <RoleGuard requiredRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Admin Content')).toBeTruthy();
    });

    it('should show access denied when user does not have required role', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'user' },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <RoleGuard requiredRoles={['admin']}>
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Access Denied')).toBeTruthy();
      expect(screen.getByText('Admin Content')).toBeFalsy();
    });

    it('should show fallback when user does not have required role', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'user' },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <RoleGuard 
          requiredRoles={['admin']} 
          fallback={<div>Insufficient role</div>}
        >
          <div>Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Insufficient role')).toBeTruthy();
      expect(screen.getByText('Admin Content')).toBeFalsy();
    });

    it('should require all roles when requireAll is true', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'admin' },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <RoleGuard 
          requiredRoles={['admin', 'superadmin']} 
          requireAll={true}
        >
          <div>Super Admin Content</div>
        </RoleGuard>
      );

      expect(screen.getByText('Access Denied')).toBeTruthy();
      expect(screen.getByText('Super Admin Content')).toBeFalsy();
    });
  });

  describe('PermissionGuard', () => {
    it('should render children when user has required permission', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com', 
          permissions: ['read', 'write'] 
        },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <PermissionGuard requiredPermissions={['read']}>
          <div>Permission Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText('Permission Content')).toBeTruthy();
    });

    it('should show access denied when user does not have required permission', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com', 
          permissions: ['read'] 
        },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <PermissionGuard requiredPermissions={['delete']}>
          <div>Permission Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText('Access Denied')).toBeTruthy();
      expect(screen.getByText('Permission Content')).toBeFalsy();
    });

    it('should require all permissions when requireAll is true', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { 
          id: '1', 
          email: 'test@example.com', 
          permissions: ['read'] 
        },
        isLoading: false,
      });
      mockUseTokenStatus.mockReturnValue({
        isTokenExpired: false,
      });

      render(
        <PermissionGuard 
          requiredPermissions={['read', 'write']} 
          requireAll={true}
        >
          <div>Permission Content</div>
        </PermissionGuard>
      );

      expect(screen.getByText('Access Denied')).toBeTruthy();
      expect(screen.getByText('Permission Content')).toBeFalsy();
    });
  });
});

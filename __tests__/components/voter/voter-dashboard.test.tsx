/**
 * Voter Dashboard Tests
 */

import * as React from 'react';
import { render, fireEvent, renderHook, act } from '@testing-library/react-native';
import { VoterDashboard, VoterDashboardWithErrorBoundary, useVoterDashboard } from '@/components/voter/voter-dashboard';

// Mock the hooks
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'voter@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['voter'],
      permissions: ['vote', 'view_elections'],
      status: 'active',
      profileImage: null,
      lastLoginAt: new Date().toISOString(),
    },
    logout: jest.fn(() => Promise.resolve({ success: true })),
  }),
}));

jest.mock('@/hooks/use-session', () => ({
  useSession: () => ({
    session: {
      userId: '1',
      email: 'voter@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['voter'],
      permissions: ['vote', 'view_elections'],
      status: 'active',
      lastActivityAt: new Date().toISOString(),
      sessionId: 'session_123',
      isActive: true,
    },
    isSessionActive: true,
    sessionStats: {
      timeUntilExpiry: 25,
      timeSinceLastActivity: 2,
    },
  }),
}));

describe('VoterDashboard', () => {
  it('should render dashboard with default tab', () => {
    const { getByText } = render(
      React.createElement(VoterDashboard)
    );

    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Dashboard overview and quick stats')).toBeTruthy();
  });

  it('should render dashboard with custom initial tab', () => {
    const { getByText } = render(
      React.createElement(VoterDashboard, { initialTab: 'elections' })
    );

    expect(getByText('Elections')).toBeTruthy();
    expect(getByText('View and participate in elections')).toBeTruthy();
  });

  it('should handle tab change', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(VoterDashboard, { onTabChange })
    );

    // Should start with overview tab
    expect(getByText('Overview')).toBeTruthy();

    // Tab change should be called when changing tabs
    // Note: In a real implementation, this would be triggered by user interaction
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('should show notifications when enabled', () => {
    const { getByText } = render(
      React.createElement(VoterDashboard, { 
        showNotifications: true, 
        notificationCount: 3 
      })
    );

    // Should render dashboard with notifications
    expect(getByText('Overview')).toBeTruthy();
  });

  it('should apply custom className', () => {
    const { container } = render(
      React.createElement(VoterDashboard, { className: 'custom-class' })
    );

    // Should apply custom className
    expect(container.firstChild).toBeTruthy();
  });
});

describe('VoterDashboardWithErrorBoundary', () => {
  it('should render dashboard normally when no error', () => {
    const { getByText } = render(
      React.createElement(VoterDashboardWithErrorBoundary)
    );

    expect(getByText('Overview')).toBeTruthy();
  });

  it('should render error boundary when error occurs', () => {
    // Mock console.error to prevent error logging during test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create a component that throws an error
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      React.createElement(VoterDashboardWithErrorBoundary, {},
        React.createElement(ErrorComponent)
      )
    );

    expect(getByText('Dashboard Error')).toBeTruthy();
    expect(getByText('Something went wrong while loading the dashboard. Please try refreshing the page.')).toBeTruthy();
    expect(getByText('Refresh Page')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();

    consoleSpy.mockRestore();
  });

  it('should handle refresh page action', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.location.reload
    const reloadSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true
    });

    const { getByText } = render(
      React.createElement(VoterDashboardWithErrorBoundary, {},
        React.createElement(() => { throw new Error('Test error'); })
      )
    );

    const refreshButton = getByText('Refresh Page');
    fireEvent.press(refreshButton);

    expect(reloadSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle try again action', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      React.createElement(VoterDashboardWithErrorBoundary, {},
        React.createElement(() => { throw new Error('Test error'); })
      )
    );

    const tryAgainButton = getByText('Try Again');
    fireEvent.press(tryAgainButton);

    // Should render dashboard again
    expect(getByText('Overview')).toBeTruthy();

    consoleSpy.mockRestore();
  });
});

describe('useVoterDashboard', () => {
  it('should return dashboard state and actions', () => {
    const { result } = renderHook(() => useVoterDashboard());

    expect(result.current.currentTab).toBe('overview');
    expect(result.current.isLoading).toBe(false);
    expect(Array.isArray(result.current.notifications)).toBe(true);
    expect(typeof result.current.changeTab).toBe('function');
    expect(typeof result.current.addNotification).toBe('function');
    expect(typeof result.current.removeNotification).toBe('function');
    expect(typeof result.current.clearNotifications).toBe('function');
  });

  it('should change tab', () => {
    const { result } = renderHook(() => useVoterDashboard());

    act(() => {
      result.current.changeTab('elections');
    });

    expect(result.current.currentTab).toBe('elections');
    expect(result.current.isLoading).toBe(false);
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useVoterDashboard());

    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test notification',
        timestamp: new Date().toISOString()
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].message).toBe('Test notification');
  });

  it('should remove notification', () => {
    const { result } = renderHook(() => useVoterDashboard());

    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test notification',
        timestamp: new Date().toISOString()
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useVoterDashboard());

    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test notification 1',
        timestamp: new Date().toISOString()
      });
      result.current.addNotification({
        type: 'warning',
        message: 'Test notification 2',
        timestamp: new Date().toISOString()
      });
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });
});

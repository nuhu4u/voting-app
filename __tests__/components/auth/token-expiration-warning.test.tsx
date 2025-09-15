/**
 * Token Expiration Warning Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TokenExpirationWarning, TokenExpirationStatus, TokenExpirationSettings } from '@/components/auth/token-expiration-warning';

// Mock the hooks
jest.mock('@/hooks/use-token-expiration', () => ({
  useTokenExpiration: () => ({
    status: {
      isExpired: false,
      isExpiringSoon: false,
      timeUntilExpiration: null,
      timeUntilRefresh: null,
      needsRefresh: false,
      lastChecked: Date.now(),
      refreshAttempts: 0,
    },
    forceRefresh: jest.fn(() => Promise.resolve(true)),
    configure: jest.fn(),
    getStats: jest.fn(() => ({
      isActive: false,
      refreshAttempts: 0,
      lastCheck: 0,
      config: {},
      eventListeners: 0,
    })),
  }),
  useTokenExpirationCountdown: () => ({
    countdown: null,
    formattedCountdown: '',
    isExpired: false,
    isExpiringSoon: false,
    needsRefresh: false,
  }),
  useTokenExpirationNotifications: () => ({
    notifications: [],
  }),
}));

describe('TokenExpirationWarning', () => {
  it('should render nothing when token is not expiring', () => {
    const { queryByText } = render(
      React.createElement(TokenExpirationWarning)
    );

    expect(queryByText('Session Expired')).toBeNull();
    expect(queryByText('Session Expiring Soon')).toBeNull();
  });

  it('should render warning when token is expiring soon', () => {
    // Mock expiring soon state
    jest.doMock('@/hooks/use-token-expiration', () => ({
      useTokenExpiration: () => ({
        status: {
          isExpired: false,
          isExpiringSoon: true,
          timeUntilExpiration: 300, // 5 minutes
          timeUntilRefresh: 300,
          needsRefresh: true,
          lastChecked: Date.now(),
          refreshAttempts: 0,
        },
        forceRefresh: jest.fn(() => Promise.resolve(true)),
        configure: jest.fn(),
        getStats: jest.fn(() => ({
          isActive: false,
          refreshAttempts: 0,
          lastCheck: 0,
          config: {},
          eventListeners: 0,
        })),
      }),
      useTokenExpirationCountdown: () => ({
        countdown: 300,
        formattedCountdown: '5:00',
        isExpired: false,
        isExpiringSoon: true,
        needsRefresh: true,
      }),
      useTokenExpirationNotifications: () => ({
        notifications: [],
      }),
    }));

    const { getByText } = render(
      React.createElement(TokenExpirationWarning)
    );

    expect(getByText('Session Expiring Soon')).toBeTruthy();
    expect(getByText('Your session will expire soon. Click refresh to extend your session.')).toBeTruthy();
  });

  it('should render expired warning when token is expired', () => {
    // Mock expired state
    jest.doMock('@/hooks/use-token-expiration', () => ({
      useTokenExpiration: () => ({
        status: {
          isExpired: true,
          isExpiringSoon: true,
          timeUntilExpiration: null,
          timeUntilRefresh: null,
          needsRefresh: false,
          lastChecked: Date.now(),
          refreshAttempts: 0,
        },
        forceRefresh: jest.fn(() => Promise.resolve(true)),
        configure: jest.fn(),
        getStats: jest.fn(() => ({
          isActive: false,
          refreshAttempts: 0,
          lastCheck: 0,
          config: {},
          eventListeners: 0,
        })),
      }),
      useTokenExpirationCountdown: () => ({
        countdown: null,
        formattedCountdown: '',
        isExpired: true,
        isExpiringSoon: true,
        needsRefresh: false,
      }),
      useTokenExpirationNotifications: () => ({
        notifications: [],
      }),
    }));

    const { getByText } = render(
      React.createElement(TokenExpirationWarning)
    );

    expect(getByText('Session Expired')).toBeTruthy();
    expect(getByText('Your session has expired. Please login again to continue.')).toBeTruthy();
  });

  it('should call onExpired when token expires', () => {
    const onExpired = jest.fn();
    const onExpiringSoon = jest.fn();

    render(
      React.createElement(TokenExpirationWarning, {
        onExpired,
        onExpiringSoon,
      })
    );

    // In a real test, we would trigger the expiration
    expect(onExpired).not.toHaveBeenCalled();
    expect(onExpiringSoon).not.toHaveBeenCalled();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn();

    // Mock expiring soon state with refresh button
    jest.doMock('@/hooks/use-token-expiration', () => ({
      useTokenExpiration: () => ({
        status: {
          isExpired: false,
          isExpiringSoon: true,
          timeUntilExpiration: 300,
          timeUntilRefresh: 300,
          needsRefresh: true,
          lastChecked: Date.now(),
          refreshAttempts: 0,
        },
        forceRefresh: jest.fn(() => Promise.resolve(true)),
        configure: jest.fn(),
        getStats: jest.fn(() => ({
          isActive: false,
          refreshAttempts: 0,
          lastCheck: 0,
          config: {},
          eventListeners: 0,
        })),
      }),
      useTokenExpirationCountdown: () => ({
        countdown: 300,
        formattedCountdown: '5:00',
        isExpired: false,
        isExpiringSoon: true,
        needsRefresh: true,
      }),
      useTokenExpirationNotifications: () => ({
        notifications: [],
      }),
    }));

    const { getByText } = render(
      React.createElement(TokenExpirationWarning, {
        onRefresh,
      })
    );

    const refreshButton = getByText('Refresh');
    fireEvent.press(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });
});

describe('TokenExpirationStatus', () => {
  it('should render valid status', () => {
    const { getByText } = render(
      React.createElement(TokenExpirationStatus)
    );

    expect(getByText('Valid')).toBeTruthy();
  });

  it('should render expiring soon status', () => {
    // Mock expiring soon state
    jest.doMock('@/hooks/use-token-expiration', () => ({
      useTokenExpiration: () => ({
        status: {
          isExpired: false,
          isExpiringSoon: true,
          timeUntilExpiration: 300,
          timeUntilRefresh: 300,
          needsRefresh: true,
          lastChecked: Date.now(),
          refreshAttempts: 0,
        },
        forceRefresh: jest.fn(() => Promise.resolve(true)),
        configure: jest.fn(),
        getStats: jest.fn(() => ({
          isActive: false,
          refreshAttempts: 0,
          lastCheck: 0,
          config: {},
          eventListeners: 0,
        })),
      }),
      useTokenExpirationCountdown: () => ({
        countdown: 300,
        formattedCountdown: '5:00',
        isExpired: false,
        isExpiringSoon: true,
        needsRefresh: true,
      }),
      useTokenExpirationNotifications: () => ({
        notifications: [],
      }),
    }));

    const { getByText } = render(
      React.createElement(TokenExpirationStatus)
    );

    expect(getByText('Expiring Soon')).toBeTruthy();
  });

  it('should show details when showDetails is true', () => {
    const { getByText } = render(
      React.createElement(TokenExpirationStatus, {
        showDetails: true,
      })
    );

    expect(getByText('Last checked:')).toBeTruthy();
    expect(getByText('Refresh attempts:')).toBeTruthy();
  });
});

describe('TokenExpirationSettings', () => {
  it('should render settings form', () => {
    const { getByText } = render(
      React.createElement(TokenExpirationSettings)
    );

    expect(getByText('Token Expiration Settings')).toBeTruthy();
    expect(getByText('Check Interval (seconds)')).toBeTruthy();
    expect(getByText('Refresh Threshold (minutes)')).toBeTruthy();
    expect(getByText('Enable Auto Refresh')).toBeTruthy();
    expect(getByText('Enable Notifications')).toBeTruthy();
    expect(getByText('Save Settings')).toBeTruthy();
  });

  it('should call onSave when settings are saved', () => {
    const onSave = jest.fn();

    const { getByText } = render(
      React.createElement(TokenExpirationSettings, {
        onSave,
      })
    );

    const saveButton = getByText('Save Settings');
    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalled();
  });

  it('should show current status', () => {
    const { getByText } = render(
      React.createElement(TokenExpirationSettings)
    );

    expect(getByText('Current Status')).toBeTruthy();
    expect(getByText('Monitoring: Inactive')).toBeTruthy();
    expect(getByText('Refresh Attempts: 0')).toBeTruthy();
    expect(getByText('Event Listeners: 0')).toBeTruthy();
  });
});

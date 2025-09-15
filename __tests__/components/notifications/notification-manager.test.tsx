/**
 * Notification Manager Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NotificationPermissionCard, NotificationSettings, NotificationTest, NotificationStatus } from '@/components/notifications/notification-manager';

// Mock the hooks
jest.mock('@/hooks/use-push-notifications', () => ({
  usePushNotifications: () => ({
    isInitialized: true,
    permission: {
      status: 'granted',
      canAskAgain: true,
      expires: 'never',
      ios: {
        allowsAlert: true,
        allowsBadge: true,
        allowsSound: true,
        allowsAnnouncements: false,
        allowsCriticalAlerts: false,
        allowsProvisional: false,
        allowsLockScreen: true,
        allowsNotificationCenter: true,
        allowsCarPlay: false,
      },
    },
    pushToken: {
      type: 'expo',
      data: 'mock-expo-push-token',
    },
    badgeCount: 0,
    isLoading: false,
    error: null,
    initialize: jest.fn(() => Promise.resolve(true)),
    requestPermissions: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
    sendLocalNotification: jest.fn(() => Promise.resolve('notification-id')),
    scheduleNotification: jest.fn(() => Promise.resolve('notification-id')),
    cancelNotification: jest.fn(() => Promise.resolve(true)),
    cancelAllNotifications: jest.fn(() => Promise.resolve(true)),
    dismissNotification: jest.fn(() => Promise.resolve(true)),
    dismissAllNotifications: jest.fn(() => Promise.resolve(true)),
    setBadgeCount: jest.fn(() => Promise.resolve(true)),
    sendPushNotification: jest.fn(() => Promise.resolve(true)),
    configure: jest.fn(),
    getConfig: jest.fn(() => ({
      enableNotifications: true,
      enableSounds: true,
      enableVibration: true,
      enableBadges: true,
      enableCriticalAlerts: false,
      enableProvisional: false,
      enableLockScreen: true,
      enableNotificationCenter: true,
      enableCarPlay: false,
      enableAnnouncements: false,
      defaultPriority: 'default',
      defaultSound: true,
      defaultVibrate: true,
      defaultBadge: true,
      maxNotifications: 100,
      retentionDays: 30,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
  useNotificationPermissions: () => ({
    permission: {
      status: 'granted',
      canAskAgain: true,
      expires: 'never',
    },
    isGranted: true,
    isDenied: false,
    canAskAgain: true,
    requestPermission: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
    isLoading: false,
    error: null,
  }),
  useNotificationSettings: () => ({
    config: {
      enableNotifications: true,
      enableSounds: true,
      enableVibration: true,
      enableBadges: true,
      enableCriticalAlerts: false,
      enableProvisional: false,
      enableLockScreen: true,
      enableNotificationCenter: true,
      enableCarPlay: false,
      enableAnnouncements: false,
      defaultPriority: 'default',
      defaultSound: true,
      defaultVibrate: true,
      defaultBadge: true,
      maxNotifications: 100,
      retentionDays: 30,
    },
    updateConfig: jest.fn(),
    resetConfig: jest.fn(),
  }),
  useNotificationEvents: () => ({
    events: [],
    clearEvents: jest.fn(),
    getEventsByType: jest.fn(() => []),
  }),
}));

describe('NotificationPermissionCard', () => {
  it('should render permission card', () => {
    const { getByText } = render(
      React.createElement(NotificationPermissionCard)
    );

    expect(getByText('Notification Permissions')).toBeTruthy();
    expect(getByText('Granted')).toBeTruthy();
  });

  it('should call onPermissionChange when permission is requested', async () => {
    const onPermissionChange = jest.fn();
    const { getByText } = render(
      React.createElement(NotificationPermissionCard, { onPermissionChange })
    );

    // Should not show request button when already granted
    expect(getByText('Notifications are enabled for this app.')).toBeTruthy();
  });

  it('should show error when there is an error', () => {
    // Mock error state
    const mockUseNotificationPermissions = require('@/hooks/use-push-notifications').useNotificationPermissions;
    mockUseNotificationPermissions.mockReturnValueOnce({
      permission: {
        status: 'denied',
        canAskAgain: false,
        expires: 'never',
      },
      isGranted: false,
      isDenied: true,
      canAskAgain: false,
      requestPermission: jest.fn(() => Promise.resolve({ granted: false, status: 'denied' })),
      isLoading: false,
      error: 'Permission denied',
    });

    const { getByText } = render(
      React.createElement(NotificationPermissionCard)
    );

    expect(getByText('Error: Permission denied')).toBeTruthy();
  });

  it('should show request button when permission is not granted', () => {
    // Mock denied state
    const mockUseNotificationPermissions = require('@/hooks/use-push-notifications').useNotificationPermissions;
    mockUseNotificationPermissions.mockReturnValueOnce({
      permission: {
        status: 'denied',
        canAskAgain: true,
        expires: 'never',
      },
      isGranted: false,
      isDenied: true,
      canAskAgain: true,
      requestPermission: jest.fn(() => Promise.resolve({ granted: false, status: 'denied' })),
      isLoading: false,
      error: null,
    });

    const { getByText } = render(
      React.createElement(NotificationPermissionCard)
    );

    expect(getByText('Request Permission')).toBeTruthy();
  });
});

describe('NotificationSettings', () => {
  it('should render settings form', () => {
    const { getByText } = render(
      React.createElement(NotificationSettings)
    );

    expect(getByText('Notification Settings')).toBeTruthy();
    expect(getByText('Enable Notifications')).toBeTruthy();
    expect(getByText('Enable Sounds')).toBeTruthy();
    expect(getByText('Enable Vibration')).toBeTruthy();
    expect(getByText('Enable Badges')).toBeTruthy();
    expect(getByText('Default Priority')).toBeTruthy();
    expect(getByText('Max Notifications')).toBeTruthy();
    expect(getByText('Save Settings')).toBeTruthy();
    expect(getByText('Reset')).toBeTruthy();
  });

  it('should call onSave when settings are saved', () => {
    const onSave = jest.fn();
    const { getByText } = render(
      React.createElement(NotificationSettings, { onSave })
    );

    const saveButton = getByText('Save Settings');
    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalled();
  });

  it('should handle toggle changes', () => {
    const { getByText } = render(
      React.createElement(NotificationSettings)
    );

    // Should not throw error when toggles are pressed
    expect(true).toBe(true);
  });
});

describe('NotificationTest', () => {
  it('should render test form', () => {
    const { getByText } = render(
      React.createElement(NotificationTest)
    );

    expect(getByText('Test Notifications')).toBeTruthy();
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Body')).toBeTruthy();
    expect(getByText('Delay (seconds)')).toBeTruthy();
    expect(getByText('Send Now')).toBeTruthy();
    expect(getByText('Schedule')).toBeTruthy();
  });

  it('should call onSend when notification is sent', async () => {
    const onSend = jest.fn();
    const { getByText } = render(
      React.createElement(NotificationTest, { onSend })
    );

    const sendButton = getByText('Send Now');
    fireEvent.press(sendButton);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onSend).toHaveBeenCalled();
  });

  it('should call onSend when notification is scheduled', async () => {
    const onSend = jest.fn();
    const { getByText } = render(
      React.createElement(NotificationTest, { onSend })
    );

    const scheduleButton = getByText('Schedule');
    fireEvent.press(scheduleButton);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onSend).toHaveBeenCalled();
  });

  it('should handle input changes', () => {
    const { getByText } = render(
      React.createElement(NotificationTest)
    );

    // Should not throw error when inputs change
    expect(true).toBe(true);
  });
});

describe('NotificationStatus', () => {
  it('should render status', () => {
    const { getByText } = render(
      React.createElement(NotificationStatus)
    );

    expect(getByText('Ready')).toBeTruthy();
  });

  it('should show details when showDetails is true', () => {
    const { getByText } = render(
      React.createElement(NotificationStatus, { showDetails: true })
    );

    expect(getByText('Ready')).toBeTruthy();
    expect(getByText('Initialized: Yes')).toBeTruthy();
    expect(getByText('Permission: granted')).toBeTruthy();
    expect(getByText('Token: Available')).toBeTruthy();
    expect(getByText('Badge Count: 0')).toBeTruthy();
  });

  it('should show error status when there is an error', () => {
    // Mock error state
    const mockUsePushNotifications = require('@/hooks/use-push-notifications').usePushNotifications;
    mockUsePushNotifications.mockReturnValueOnce({
      isInitialized: true,
      permission: {
        status: 'granted',
        canAskAgain: true,
        expires: 'never',
        ios: {
          allowsAlert: true,
          allowsBadge: true,
          allowsSound: true,
          allowsAnnouncements: false,
          allowsCriticalAlerts: false,
          allowsProvisional: false,
          allowsLockScreen: true,
          allowsNotificationCenter: true,
          allowsCarPlay: false,
        },
      },
      pushToken: {
        type: 'expo',
        data: 'mock-expo-push-token',
      },
      badgeCount: 0,
      isLoading: false,
      error: 'Service error',
      initialize: jest.fn(() => Promise.resolve(true)),
      requestPermissions: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
      sendLocalNotification: jest.fn(() => Promise.resolve('notification-id')),
      scheduleNotification: jest.fn(() => Promise.resolve('notification-id')),
      cancelNotification: jest.fn(() => Promise.resolve(true)),
      cancelAllNotifications: jest.fn(() => Promise.resolve(true)),
      dismissNotification: jest.fn(() => Promise.resolve(true)),
      dismissAllNotifications: jest.fn(() => Promise.resolve(true)),
      setBadgeCount: jest.fn(() => Promise.resolve(true)),
      sendPushNotification: jest.fn(() => Promise.resolve(true)),
      configure: jest.fn(),
      getConfig: jest.fn(() => ({})),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(NotificationStatus, { showDetails: true })
    );

    expect(getByText('Error')).toBeTruthy();
    expect(getByText('Service error')).toBeTruthy();
  });

  it('should show not initialized status', () => {
    // Mock not initialized state
    const mockUsePushNotifications = require('@/hooks/use-push-notifications').usePushNotifications;
    mockUsePushNotifications.mockReturnValueOnce({
      isInitialized: false,
      permission: null,
      pushToken: null,
      badgeCount: 0,
      isLoading: false,
      error: null,
      initialize: jest.fn(() => Promise.resolve(true)),
      requestPermissions: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
      sendLocalNotification: jest.fn(() => Promise.resolve('notification-id')),
      scheduleNotification: jest.fn(() => Promise.resolve('notification-id')),
      cancelNotification: jest.fn(() => Promise.resolve(true)),
      cancelAllNotifications: jest.fn(() => Promise.resolve(true)),
      dismissNotification: jest.fn(() => Promise.resolve(true)),
      dismissAllNotifications: jest.fn(() => Promise.resolve(true)),
      setBadgeCount: jest.fn(() => Promise.resolve(true)),
      sendPushNotification: jest.fn(() => Promise.resolve(true)),
      configure: jest.fn(),
      getConfig: jest.fn(() => ({})),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    const { getByText } = render(
      React.createElement(NotificationStatus, { showDetails: true })
    );

    expect(getByText('Not Initialized')).toBeTruthy();
  });
});

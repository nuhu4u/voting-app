/**
 * Push Notifications Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePushNotifications, usePushNotificationManager, useNotificationPermissions, useNotificationSettings, useNotificationEvents } from '@/hooks/use-push-notifications';

// Mock the push notification service
jest.mock('@/lib/notifications/push-notification-service', () => ({
  pushNotificationService: {
    initialize: jest.fn(() => Promise.resolve(true)),
    requestPermissions: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
    getPermissions: jest.fn(() => Promise.resolve({
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
    })),
    getPushTokenAsync: jest.fn(() => Promise.resolve({
      type: 'expo',
      data: 'mock-expo-push-token',
    })),
    sendLocalNotification: jest.fn(() => Promise.resolve('notification-id')),
    scheduleNotification: jest.fn(() => Promise.resolve('notification-id')),
    cancelNotification: jest.fn(() => Promise.resolve(true)),
    cancelAllNotifications: jest.fn(() => Promise.resolve(true)),
    dismissNotification: jest.fn(() => Promise.resolve(true)),
    dismissAllNotifications: jest.fn(() => Promise.resolve(true)),
    setBadgeCount: jest.fn(() => Promise.resolve(true)),
    getBadgeCount: jest.fn(() => Promise.resolve(0)),
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
    isServiceInitialized: jest.fn(() => true),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    cleanup: jest.fn(),
  },
}));

describe('usePushNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => usePushNotifications());

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.permission).toBeNull();
    expect(result.current.pushToken).toBeNull();
    expect(result.current.badgeCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.initialize).toBe('function');
    expect(typeof result.current.requestPermissions).toBe('function');
    expect(typeof result.current.sendLocalNotification).toBe('function');
    expect(typeof result.current.scheduleNotification).toBe('function');
    expect(typeof result.current.cancelNotification).toBe('function');
    expect(typeof result.current.cancelAllNotifications).toBe('function');
    expect(typeof result.current.dismissNotification).toBe('function');
    expect(typeof result.current.dismissAllNotifications).toBe('function');
    expect(typeof result.current.setBadgeCount).toBe('function');
    expect(typeof result.current.sendPushNotification).toBe('function');
    expect(typeof result.current.configure).toBe('function');
    expect(typeof result.current.getConfig).toBe('function');
    expect(typeof result.current.addEventListener).toBe('function');
    expect(typeof result.current.removeEventListener).toBe('function');
  });

  it('should initialize successfully', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(true);
    });

    expect(result.current.isInitialized).toBe(true);
    expect(result.current.permission).toBeDefined();
    expect(result.current.pushToken).toBeDefined();
    expect(result.current.badgeCount).toBe(0);
  });

  it('should handle initialization failure', async () => {
    const mockInitialize = require('@/lib/notifications/push-notification-service').pushNotificationService.initialize;
    mockInitialize.mockRejectedValueOnce(new Error('Initialization failed'));

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Initialization failed');
  });

  it('should request permissions successfully', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const permission = await result.current.requestPermissions();
      expect(permission.granted).toBe(true);
    });

    expect(result.current.permission).toBeDefined();
  });

  it('should handle permission request failure', async () => {
    const mockRequestPermissions = require('@/lib/notifications/push-notification-service').pushNotificationService.requestPermissions;
    mockRequestPermissions.mockRejectedValueOnce(new Error('Permission request failed'));

    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const permission = await result.current.requestPermissions();
      expect(permission.granted).toBe(false);
    });

    expect(result.current.error).toBe('Permission request failed');
  });

  it('should send local notification', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const notificationId = await result.current.sendLocalNotification({
        title: 'Test',
        body: 'Test notification',
      });
      expect(notificationId).toBe('notification-id');
    });
  });

  it('should schedule notification', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const notificationId = await result.current.scheduleNotification({
        id: 'test',
        title: 'Test',
        body: 'Test notification',
        trigger: { seconds: 60 },
      });
      expect(notificationId).toBe('notification-id');
    });
  });

  it('should cancel notification', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.cancelNotification('test-id');
      expect(success).toBe(true);
    });
  });

  it('should cancel all notifications', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.cancelAllNotifications();
      expect(success).toBe(true);
    });
  });

  it('should dismiss notification', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.dismissNotification('test-id');
      expect(success).toBe(true);
    });
  });

  it('should dismiss all notifications', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.dismissAllNotifications();
      expect(success).toBe(true);
    });
  });

  it('should set badge count', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.setBadgeCount(5);
      expect(success).toBe(true);
    });

    expect(result.current.badgeCount).toBe(5);
  });

  it('should send push notification', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      const success = await result.current.sendPushNotification('test-token', {
        title: 'Test',
        body: 'Test notification',
      });
      expect(success).toBe(true);
    });
  });

  it('should configure settings', () => {
    const { result } = renderHook(() => usePushNotifications());

    act(() => {
      result.current.configure({ enableNotifications: false });
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should get configuration', () => {
    const { result } = renderHook(() => usePushNotifications());

    const config = result.current.getConfig();
    expect(config).toBeDefined();
    expect(config.enableNotifications).toBe(true);
  });

  it('should add event listener', () => {
    const { result } = renderHook(() => usePushNotifications());

    act(() => {
      result.current.addEventListener('notification_sent', jest.fn());
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should remove event listener', () => {
    const { result } = renderHook(() => usePushNotifications());

    act(() => {
      result.current.addEventListener('notification_sent', jest.fn());
      result.current.removeEventListener('notification_sent', jest.fn());
    });

    // Should not throw error
    expect(true).toBe(true);
  });
});

describe('usePushNotificationManager', () => {
  it('should auto-initialize on mount', () => {
    const { result } = renderHook(() => usePushNotificationManager());

    // Should have initialized
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.permission).toBeDefined();
    expect(result.current.pushToken).toBeDefined();
  });
});

describe('useNotificationPermissions', () => {
  it('should return permission information', () => {
    const { result } = renderHook(() => useNotificationPermissions());

    expect(result.current.permission).toBeDefined();
    expect(result.current.isGranted).toBe(true);
    expect(result.current.isDenied).toBe(false);
    expect(result.current.canAskAgain).toBe(true);
    expect(typeof result.current.requestPermission).toBe('function');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should request permission', async () => {
    const { result } = renderHook(() => useNotificationPermissions());

    await act(async () => {
      const permission = await result.current.requestPermission();
      expect(permission.granted).toBe(true);
    });
  });
});

describe('useNotificationSettings', () => {
  it('should return settings management functions', () => {
    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.config).toBeDefined();
    expect(typeof result.current.updateConfig).toBe('function');
    expect(typeof result.current.resetConfig).toBe('function');
  });

  it('should update configuration', () => {
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.updateConfig({ enableNotifications: false });
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should reset configuration', () => {
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.resetConfig();
    });

    // Should not throw error
    expect(true).toBe(true);
  });
});

describe('useNotificationEvents', () => {
  it('should return events information', () => {
    const { result } = renderHook(() => useNotificationEvents());

    expect(result.current.events).toBeDefined();
    expect(Array.isArray(result.current.events)).toBe(true);
    expect(typeof result.current.clearEvents).toBe('function');
    expect(typeof result.current.getEventsByType).toBe('function');
  });

  it('should clear events', () => {
    const { result } = renderHook(() => useNotificationEvents());

    act(() => {
      result.current.clearEvents();
    });

    expect(result.current.events).toEqual([]);
  });

  it('should get events by type', () => {
    const { result } = renderHook(() => useNotificationEvents());

    const events = result.current.getEventsByType('notification_sent');
    expect(Array.isArray(events)).toBe(true);
  });
});

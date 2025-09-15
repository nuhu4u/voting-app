/**
 * Push Notification Service Tests
 */

import { pushNotificationService } from '@/lib/notifications/push-notification-service';

// Mock dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getPresentedNotificationsAsync: jest.fn(() => Promise.resolve([])),
  dismissNotificationAsync: jest.fn(() => Promise.resolve()),
  dismissAllNotificationsAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-expo-push-token' })),
  sendPushNotificationAsync: jest.fn(() => Promise.resolve({ data: { status: 'ok' } })),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  osName: 'iOS',
  osVersion: '15.0',
  deviceName: 'iPhone',
  deviceYearClass: 2021,
  totalMemory: 4000000000,
  supportedCpuArchitectures: ['arm64'],
  osBuildId: '19A346',
  platformApiLevel: null,
  modelName: 'iPhone 13',
  brand: 'Apple',
  manufacturer: 'Apple',
  modelId: 'iPhone13,2',
  designName: 'iPhone 13',
  productName: 'iPhone 13',
  deviceType: 1,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'Voting App',
    slug: 'voting-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.votingapp.mobile',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.votingapp.mobile',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'mock-project-id',
      },
    },
  },
  platform: {
    ios: {
      buildNumber: '1',
      bundleIdentifier: 'com.votingapp.mobile',
    },
    android: {
      versionCode: 1,
      package: 'com.votingapp.mobile',
    },
  },
  isDevice: true,
  appOwnership: 'expo',
  executionEnvironment: 'standalone',
  statusBarHeight: 44,
  deviceYearClass: 2021,
  manifest: {},
  linkingUrl: null,
  sessionId: 'mock-session-id',
  appVersion: '1.0.0',
  nativeAppVersion: '1.0.0',
  nativeBuildVersion: '1',
  installationId: 'mock-installation-id',
  isDebuggingRemotely: false,
  linkingUri: 'exp://192.168.1.100:8081',
  debugMode: false,
  isHeadless: false,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '15.0',
    isPad: false,
    isTVOS: false,
    isTesting: false,
  },
}));

describe('PushNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pushNotificationService.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await pushNotificationService.initialize();
      
      expect(result).toBe(true);
      expect(pushNotificationService.isServiceInitialized()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const mockSetNotificationHandler = require('expo-notifications').setNotificationHandler;
      mockSetNotificationHandler.mockRejectedValueOnce(new Error('Handler setup failed'));

      const result = await pushNotificationService.initialize();
      
      expect(result).toBe(false);
    });

    it('should not initialize if already initialized', async () => {
      await pushNotificationService.initialize();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await pushNotificationService.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('Push notification service is already initialized');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Permissions', () => {
    beforeEach(async () => {
      await pushNotificationService.initialize();
    });

    it('should request permissions successfully', async () => {
      const result = await pushNotificationService.requestPermissions();
      
      expect(result.granted).toBe(true);
      expect(result.status).toBe('granted');
    });

    it('should handle permission request errors', async () => {
      const mockRequestPermissions = require('expo-notifications').requestPermissionsAsync;
      mockRequestPermissions.mockRejectedValueOnce(new Error('Permission request failed'));

      const result = await pushNotificationService.requestPermissions();
      
      expect(result.granted).toBe(false);
      expect(result.status).toBe('denied');
    });

    it('should get current permissions', async () => {
      const permission = await pushNotificationService.getPermissions();
      
      expect(permission).toBeDefined();
      expect(permission.status).toBe('granted');
    });
  });

  describe('Push Token', () => {
    beforeEach(async () => {
      await pushNotificationService.initialize();
    });

    it('should get push token', async () => {
      const token = await pushNotificationService.getPushTokenAsync();
      
      expect(token).toBeDefined();
      expect(token?.type).toBe('expo');
      expect(token?.data).toBe('mock-expo-push-token');
    });

    it('should return null for non-device', async () => {
      const mockDevice = require('expo-device');
      mockDevice.isDevice = false;

      const token = await pushNotificationService.getPushTokenAsync();
      
      expect(token).toBeNull();
    });

    it('should handle token retrieval errors', async () => {
      const mockGetExpoPushTokenAsync = require('expo-notifications').getExpoPushTokenAsync;
      mockGetExpoPushTokenAsync.mockRejectedValueOnce(new Error('Token retrieval failed'));

      const token = await pushNotificationService.getPushTokenAsync();
      
      expect(token).toBeNull();
    });
  });

  describe('Local Notifications', () => {
    beforeEach(async () => {
      await pushNotificationService.initialize();
    });

    it('should send local notification', async () => {
      const notification = {
        title: 'Test Notification',
        body: 'This is a test',
        data: { test: true },
      };

      const notificationId = await pushNotificationService.sendLocalNotification(notification);
      
      expect(notificationId).toBe('notification-id');
    });

    it('should schedule notification', async () => {
      const notification = {
        id: 'test-notification',
        title: 'Scheduled Notification',
        body: 'This is scheduled',
        trigger: {
          seconds: 60,
        },
      };

      const notificationId = await pushNotificationService.scheduleNotification(notification);
      
      expect(notificationId).toBe('notification-id');
    });

    it('should handle notification errors', async () => {
      const mockScheduleNotificationAsync = require('expo-notifications').scheduleNotificationAsync;
      mockScheduleNotificationAsync.mockRejectedValueOnce(new Error('Notification failed'));

      const notification = {
        title: 'Test',
        body: 'Test',
      };

      const notificationId = await pushNotificationService.sendLocalNotification(notification);
      
      expect(notificationId).toBeNull();
    });
  });

  describe('Notification Management', () => {
    beforeEach(async () => {
      await pushNotificationService.initialize();
    });

    it('should cancel notification', async () => {
      const result = await pushNotificationService.cancelNotification('test-id');
      
      expect(result).toBe(true);
    });

    it('should cancel all notifications', async () => {
      const result = await pushNotificationService.cancelAllNotifications();
      
      expect(result).toBe(true);
    });

    it('should dismiss notification', async () => {
      const result = await pushNotificationService.dismissNotification('test-id');
      
      expect(result).toBe(true);
    });

    it('should dismiss all notifications', async () => {
      const result = await pushNotificationService.dismissAllNotifications();
      
      expect(result).toBe(true);
    });

    it('should get presented notifications', async () => {
      const notifications = await pushNotificationService.getPresentedNotifications();
      
      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe('Badge Management', () => {
    beforeEach(async () => {
      await pushNotificationService.initialize();
    });

    it('should set badge count', async () => {
      const result = await pushNotificationService.setBadgeCount(5);
      
      expect(result).toBe(true);
    });

    it('should get badge count', async () => {
      const count = await pushNotificationService.getBadgeCount();
      
      expect(count).toBe(0);
    });
  });

  describe('Push Notifications', () => {
    beforeEach(async () => {
      await pushNotificationService.initialize();
    });

    it('should send push notification', async () => {
      const notification = {
        title: 'Push Notification',
        body: 'This is a push notification',
        data: { test: true },
      };

      const result = await pushNotificationService.sendPushNotification('test-token', notification);
      
      expect(result).toBe(true);
    });

    it('should handle push notification errors', async () => {
      const mockSendPushNotificationAsync = require('expo-notifications').sendPushNotificationAsync;
      mockSendPushNotificationAsync.mockRejectedValueOnce(new Error('Push notification failed'));

      const notification = {
        title: 'Test',
        body: 'Test',
      };

      const result = await pushNotificationService.sendPushNotification('test-token', notification);
      
      expect(result).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should configure settings', () => {
      const newConfig = {
        enableNotifications: false,
        enableSounds: false,
        defaultPriority: 'high' as const,
      };

      pushNotificationService.configure(newConfig);
      const config = pushNotificationService.getConfig();
      
      expect(config.enableNotifications).toBe(false);
      expect(config.enableSounds).toBe(false);
      expect(config.defaultPriority).toBe('high');
    });

    it('should get current configuration', () => {
      const config = pushNotificationService.getConfig();
      
      expect(config).toHaveProperty('enableNotifications');
      expect(config).toHaveProperty('enableSounds');
      expect(config).toHaveProperty('enableVibration');
      expect(config).toHaveProperty('enableBadges');
      expect(config).toHaveProperty('defaultPriority');
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const listener = jest.fn();
      
      pushNotificationService.addEventListener('notification_sent', listener);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should remove event listener', () => {
      const listener = jest.fn();
      
      pushNotificationService.addEventListener('notification_sent', listener);
      pushNotificationService.removeEventListener('notification_sent', listener);
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Service Status', () => {
    it('should check if service is initialized', () => {
      expect(pushNotificationService.isServiceInitialized()).toBe(false);
    });

    it('should get push token', () => {
      const token = pushNotificationService.getPushToken();
      
      expect(token).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await pushNotificationService.initialize();
      pushNotificationService.addEventListener('test', jest.fn());
      
      pushNotificationService.cleanup();
      
      expect(pushNotificationService.isServiceInitialized()).toBe(false);
      expect(pushNotificationService.getPushToken()).toBeNull();
    });
  });
});

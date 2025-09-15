/**
 * Network Monitor Tests
 */

import { networkMonitor } from '@/lib/network/network-monitor';

// Mock dependencies
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => () => {}),
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifiEnabled: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'TestWiFi',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
    },
  })),
  refresh: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifiEnabled: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'TestWiFi',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
    },
  })),
}));

describe('NetworkMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    networkMonitor.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await networkMonitor.initialize();
      
      expect(result).toBe(true);
      expect(networkMonitor.isActive()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const mockFetch = require('@react-native-community/netinfo').fetch;
      mockFetch.mockRejectedValueOnce(new Error('Network check failed'));

      const result = await networkMonitor.initialize();
      
      expect(result).toBe(false);
    });

    it('should not initialize if already active', async () => {
      await networkMonitor.initialize();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await networkMonitor.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('Network monitoring is already active');
      
      consoleSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await networkMonitor.initialize();
    });

    it('should get current state', () => {
      const state = networkMonitor.getCurrentState();
      
      expect(state).toBeDefined();
      expect(state?.isConnected).toBe(true);
      expect(state?.type).toBe('wifi');
    });

    it('should check if connected', () => {
      const isConnected = networkMonitor.isConnected();
      
      expect(isConnected).toBe(true);
    });

    it('should check if internet is reachable', () => {
      const isInternetReachable = networkMonitor.isInternetReachable();
      
      expect(isInternetReachable).toBe(true);
    });

    it('should get connection type', () => {
      const type = networkMonitor.getConnectionType();
      
      expect(type).toBe('wifi');
    });

    it('should check if WiFi is enabled', () => {
      const isWifiEnabled = networkMonitor.isWifiEnabled();
      
      expect(isWifiEnabled).toBe(true);
    });

    it('should get network details', () => {
      const details = networkMonitor.getNetworkDetails();
      
      expect(details).toBeDefined();
      expect(details?.ssid).toBe('TestWiFi');
      expect(details?.strength).toBe(100);
    });
  });

  describe('Refresh', () => {
    beforeEach(async () => {
      await networkMonitor.initialize();
    });

    it('should refresh network state', async () => {
      const state = await networkMonitor.refresh();
      
      expect(state).toBeDefined();
      expect(state?.isConnected).toBe(true);
    });

    it('should handle refresh errors', async () => {
      const mockRefresh = require('@react-native-community/netinfo').refresh;
      mockRefresh.mockRejectedValueOnce(new Error('Refresh failed'));

      const state = await networkMonitor.refresh();
      
      expect(state).toBeNull();
    });
  });

  describe('Configuration', () => {
    it('should configure settings', () => {
      const newConfig = {
        enableMonitoring: false,
        checkInterval: 10000,
        enableNotifications: false,
      };

      networkMonitor.configure(newConfig);
      const config = networkMonitor.getConfig();
      
      expect(config.enableMonitoring).toBe(false);
      expect(config.checkInterval).toBe(10000);
      expect(config.enableNotifications).toBe(false);
    });

    it('should get current configuration', () => {
      const config = networkMonitor.getConfig();
      
      expect(config).toHaveProperty('enableMonitoring');
      expect(config).toHaveProperty('checkInterval');
      expect(config).toHaveProperty('timeout');
      expect(config).toHaveProperty('retryAttempts');
      expect(config).toHaveProperty('enableNotifications');
      expect(config).toHaveProperty('enableLogging');
      expect(config).toHaveProperty('enableOfflineMode');
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await networkMonitor.initialize();
    });

    it('should get network statistics', () => {
      const stats = networkMonitor.getStats();
      
      expect(stats).toHaveProperty('totalConnections');
      expect(stats).toHaveProperty('totalDisconnections');
      expect(stats).toHaveProperty('totalWifiChanges');
      expect(stats).toHaveProperty('totalCellularChanges');
      expect(stats).toHaveProperty('averageConnectionTime');
      expect(stats).toHaveProperty('lastConnected');
      expect(stats).toHaveProperty('lastDisconnected');
      expect(stats).toHaveProperty('uptime');
      expect(stats).toHaveProperty('downtime');
    });

    it('should reset statistics', () => {
      networkMonitor.resetStats();
      const stats = networkMonitor.getStats();
      
      expect(stats.totalConnections).toBe(0);
      expect(stats.totalDisconnections).toBe(0);
      expect(stats.totalWifiChanges).toBe(0);
      expect(stats.totalCellularChanges).toBe(0);
      expect(stats.averageConnectionTime).toBe(0);
      expect(stats.lastConnected).toBeNull();
      expect(stats.lastDisconnected).toBeNull();
      expect(stats.uptime).toBe(0);
      expect(stats.downtime).toBe(0);
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const listener = jest.fn();
      
      networkMonitor.addEventListener('connected', listener);
      
      const status = networkMonitor.getStatus();
      expect(status.eventListeners).toBe(1);
    });

    it('should remove event listener', () => {
      const listener = jest.fn();
      
      networkMonitor.addEventListener('connected', listener);
      networkMonitor.removeEventListener('connected', listener);
      
      const status = networkMonitor.getStatus();
      expect(status.eventListeners).toBe(0);
    });
  });

  describe('Monitoring Control', () => {
    it('should start monitoring', async () => {
      await networkMonitor.initialize();
      
      expect(networkMonitor.isActive()).toBe(true);
    });

    it('should stop monitoring', async () => {
      await networkMonitor.initialize();
      networkMonitor.stopMonitoring();
      
      expect(networkMonitor.isActive()).toBe(false);
    });
  });

  describe('Status', () => {
    it('should get monitoring status', () => {
      const status = networkMonitor.getStatus();
      
      expect(status).toHaveProperty('isActive');
      expect(status).toHaveProperty('currentState');
      expect(status).toHaveProperty('config');
      expect(status).toHaveProperty('stats');
      expect(status).toHaveProperty('eventListeners');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await networkMonitor.initialize();
      networkMonitor.addEventListener('connected', jest.fn());
      
      networkMonitor.cleanup();
      
      const status = networkMonitor.getStatus();
      expect(status.isActive).toBe(false);
      expect(status.eventListeners).toBe(0);
    });
  });
});

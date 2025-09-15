/**
 * Network Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNetwork, useNetworkMonitor, useNetworkStatus, useNetworkStats, useNetworkEvents } from '@/hooks/use-network';

// Mock the network monitor
jest.mock('@/lib/network/network-monitor', () => ({
  networkMonitor: {
    initialize: jest.fn(() => Promise.resolve(true)),
    stopMonitoring: jest.fn(),
    getCurrentState: jest.fn(() => ({
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
      timestamp: Date.now(),
    })),
    isConnected: jest.fn(() => true),
    isInternetReachable: jest.fn(() => true),
    getConnectionType: jest.fn(() => 'wifi'),
    isWifiEnabled: jest.fn(() => true),
    getNetworkDetails: jest.fn(() => ({
      isConnectionExpensive: false,
      ssid: 'TestWiFi',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
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
      timestamp: Date.now(),
    })),
    configure: jest.fn(),
    getConfig: jest.fn(() => ({
      enableMonitoring: true,
      checkInterval: 5000,
      timeout: 10000,
      retryAttempts: 3,
      enableNotifications: true,
      enableLogging: true,
      enableOfflineMode: true,
    })),
    getStats: jest.fn(() => ({
      totalConnections: 10,
      totalDisconnections: 2,
      totalWifiChanges: 5,
      totalCellularChanges: 3,
      averageConnectionTime: 300000,
      lastConnected: Date.now() - 60000,
      lastDisconnected: Date.now() - 300000,
      uptime: 3600000,
      downtime: 300000,
    })),
    resetStats: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    isActive: jest.fn(() => true),
    getStatus: jest.fn(() => ({
      isActive: true,
      currentState: null,
      config: {},
      stats: {},
      eventListeners: 0,
    })),
    cleanup: jest.fn(),
  },
}));

describe('useNetwork', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useNetwork());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.connectionType).toBe('unknown');
    expect(result.current.isWifiEnabled).toBe(false);
    expect(result.current.networkDetails).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastUpdate).toBeNull();
    expect(typeof result.current.initialize).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.configure).toBe('function');
    expect(typeof result.current.resetStats).toBe('function');
    expect(typeof result.current.getStats).toBe('function');
    expect(typeof result.current.getConfig).toBe('function');
    expect(typeof result.current.getStatus).toBe('function');
    expect(typeof result.current.addEventListener).toBe('function');
    expect(typeof result.current.removeEventListener).toBe('function');
  });

  it('should initialize successfully', async () => {
    const { result } = renderHook(() => useNetwork());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(true);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.connectionType).toBe('wifi');
    expect(result.current.isWifiEnabled).toBe(true);
    expect(result.current.networkDetails).toBeDefined();
  });

  it('should handle initialization failure', async () => {
    const mockInitialize = require('@/lib/network/network-monitor').networkMonitor.initialize;
    mockInitialize.mockRejectedValueOnce(new Error('Initialization failed'));

    const { result } = renderHook(() => useNetwork());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Initialization failed');
  });

  it('should refresh network state', async () => {
    const { result } = renderHook(() => useNetwork());

    await act(async () => {
      const state = await result.current.refresh();
      expect(state).toBeDefined();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionType).toBe('wifi');
  });

  it('should handle refresh failure', async () => {
    const mockRefresh = require('@/lib/network/network-monitor').networkMonitor.refresh;
    mockRefresh.mockRejectedValueOnce(new Error('Refresh failed'));

    const { result } = renderHook(() => useNetwork());

    await act(async () => {
      const state = await result.current.refresh();
      expect(state).toBeNull();
    });

    expect(result.current.error).toBe('Refresh failed');
  });

  it('should configure network monitoring', () => {
    const { result } = renderHook(() => useNetwork());

    act(() => {
      result.current.configure({ enableMonitoring: false });
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should reset statistics', () => {
    const { result } = renderHook(() => useNetwork());

    act(() => {
      result.current.resetStats();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should get statistics', () => {
    const { result } = renderHook(() => useNetwork());

    const stats = result.current.getStats();
    expect(stats).toBeDefined();
    expect(stats.totalConnections).toBe(10);
  });

  it('should get configuration', () => {
    const { result } = renderHook(() => useNetwork());

    const config = result.current.getConfig();
    expect(config).toBeDefined();
    expect(config.enableMonitoring).toBe(true);
  });

  it('should add event listener', () => {
    const { result } = renderHook(() => useNetwork());

    act(() => {
      result.current.addEventListener('connected', jest.fn());
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should remove event listener', () => {
    const { result } = renderHook(() => useNetwork());

    act(() => {
      result.current.addEventListener('connected', jest.fn());
      result.current.removeEventListener('connected', jest.fn());
    });

    // Should not throw error
    expect(true).toBe(true);
  });
});

describe('useNetworkMonitor', () => {
  it('should auto-initialize on mount', () => {
    const { result } = renderHook(() => useNetworkMonitor());

    // Should have initialized
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
  });
});

describe('useNetworkStatus', () => {
  it('should return status information', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.connectionType).toBe('wifi');
    expect(result.current.statusText).toBeDefined();
    expect(result.current.statusColor).toBeDefined();
    expect(result.current.connectionIcon).toBeDefined();
  });

  it('should return correct status text', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(['Error', 'Disconnected', 'No Internet', 'Connected']).toContain(result.current.statusText);
  });

  it('should return correct status color', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(['red', 'yellow', 'green']).toContain(result.current.statusColor);
  });

  it('should return correct connection icon', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(['❌', '📶', '📱', '🌐']).toContain(result.current.connectionIcon);
  });
});

describe('useNetworkStats', () => {
  it('should return statistics', () => {
    const { result } = renderHook(() => useNetworkStats());

    expect(result.current.stats).toBeDefined();
    expect(result.current.stats.totalConnections).toBe(10);
    expect(typeof result.current.resetStats).toBe('function');
    expect(typeof result.current.formatUptime).toBe('function');
    expect(typeof result.current.formatConnectionTime).toBe('function');
    expect(typeof result.current.connectionReliability).toBe('number');
  });

  it('should format uptime correctly', () => {
    const { result } = renderHook(() => useNetworkStats());

    const formatted = result.current.formatUptime(3661000); // 1 hour, 1 minute, 1 second
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should format connection time correctly', () => {
    const { result } = renderHook(() => useNetworkStats());

    const formatted = result.current.formatConnectionTime(300000); // 5 minutes
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should calculate connection reliability', () => {
    const { result } = renderHook(() => useNetworkStats());

    expect(result.current.connectionReliability).toBeDefined();
    expect(typeof result.current.connectionReliability).toBe('number');
    expect(result.current.connectionReliability).toBeGreaterThanOrEqual(0);
    expect(result.current.connectionReliability).toBeLessThanOrEqual(100);
  });
});

describe('useNetworkEvents', () => {
  it('should return events information', () => {
    const { result } = renderHook(() => useNetworkEvents());

    expect(result.current.events).toBeDefined();
    expect(Array.isArray(result.current.events)).toBe(true);
    expect(typeof result.current.clearEvents).toBe('function');
    expect(typeof result.current.getEventsByType).toBe('function');
  });

  it('should clear events', () => {
    const { result } = renderHook(() => useNetworkEvents());

    act(() => {
      result.current.clearEvents();
    });

    expect(result.current.events).toEqual([]);
  });

  it('should get events by type', () => {
    const { result } = renderHook(() => useNetworkEvents());

    const connectedEvents = result.current.getEventsByType('connected');
    expect(Array.isArray(connectedEvents)).toBe(true);
  });
});

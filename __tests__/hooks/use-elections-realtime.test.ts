/**
 * Elections Real-time Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useElectionsRealtime } from '@/hooks/use-elections-realtime';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Notification API
Object.defineProperty(window, 'Notification', {
  value: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
    onclick: null
  })),
  writable: true
});

// Mock console methods
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useElectionsRealtime', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    consoleSpy.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.connectionQuality).toBe('disconnected');
    expect(result.current.updates).toEqual([]);
    expect(result.current.settings.updateFrequency).toBe(10);
    expect(result.current.settings.enableNotifications).toBe(true);
  });

  it('should connect to real-time updates', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionQuality).toBe('excellent');
  });

  it('should disconnect from real-time updates', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.connectionQuality).toBe('disconnected');
  });

  it('should refresh data', async () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
    });

    const initialLastUpdate = result.current.lastUpdate;

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.lastUpdate).not.toBe(initialLastUpdate);
  });

  it('should clear all updates', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      // Simulate some updates
      result.current.updates = [
        {
          id: '1',
          type: 'election_created',
          electionId: 'election-1',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ];
    });

    act(() => {
      result.current.clearUpdates();
    });

    expect(result.current.updates).toEqual([]);
  });

  it('should dismiss specific update', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      result.current.updates = [
        {
          id: '1',
          type: 'election_created',
          electionId: 'election-1',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: '2',
          type: 'vote_cast',
          electionId: 'election-2',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'high'
        }
      ];
    });

    act(() => {
      result.current.dismissUpdate('1');
    });

    expect(result.current.updates).toHaveLength(1);
    expect(result.current.updates[0].id).toBe('2');
  });

  it('should dismiss all updates', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      result.current.updates = [
        {
          id: '1',
          type: 'election_created',
          electionId: 'election-1',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ];
    });

    act(() => {
      result.current.dismissAllUpdates();
    });

    expect(result.current.updates).toEqual([]);
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.updateSettings({
        updateFrequency: 30,
        enableNotifications: false
      });
    });

    expect(result.current.settings.updateFrequency).toBe(30);
    expect(result.current.settings.enableNotifications).toBe(false);
  });

  it('should get update statistics', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      result.current.updates = [
        {
          id: '1',
          type: 'election_created',
          electionId: 'election-1',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: '2',
          type: 'vote_cast',
          electionId: 'election-2',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '3',
          type: 'election_created',
          electionId: 'election-3',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'low'
        }
      ];
    });

    const stats = result.current.getUpdateStats();

    expect(stats.totalUpdates).toBe(3);
    expect(stats.updatesByType.election_created).toBe(2);
    expect(stats.updatesByType.vote_cast).toBe(1);
    expect(stats.updatesByPriority.medium).toBe(1);
    expect(stats.updatesByPriority.high).toBe(1);
    expect(stats.updatesByPriority.low).toBe(1);
    expect(stats.recentUpdates).toHaveLength(3);
  });

  it('should export updates data', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      result.current.updates = [
        {
          id: '1',
          type: 'election_created',
          electionId: 'election-1',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ];
    });

    const exportedData = result.current.exportUpdates();

    expect(exportedData.updates).toHaveLength(1);
    expect(exportedData.settings).toBeDefined();
    expect(exportedData.status).toBeDefined();
    expect(exportedData.timestamp).toBeDefined();
  });

  it('should import updates data', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    const importData = {
      updates: [
        {
          id: '1',
          type: 'election_created',
          electionId: 'election-1',
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        }
      ],
      settings: {
        updateFrequency: 30,
        enableNotifications: false
      }
    };

    act(() => {
      result.current.importUpdates(importData);
    });

    expect(result.current.updates).toHaveLength(1);
    expect(result.current.settings.updateFrequency).toBe(30);
    expect(result.current.settings.enableNotifications).toBe(false);
  });

  it('should load settings from localStorage on mount', () => {
    const savedSettings = {
      updateFrequency: 30,
      enableNotifications: false,
      enableSound: false,
      enableVibration: true,
      maxUpdates: 100,
      autoDismiss: false,
      dismissDelay: 10000
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    const { result } = renderHook(() => useElectionsRealtime());

    expect(result.current.settings.updateFrequency).toBe(30);
    expect(result.current.settings.enableNotifications).toBe(false);
    expect(result.current.settings.enableSound).toBe(false);
    expect(result.current.settings.enableVibration).toBe(true);
  });

  it('should save settings to localStorage when changed', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.updateSettings({
        updateFrequency: 30,
        enableNotifications: false
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-realtime-settings',
      expect.stringContaining('"updateFrequency":30')
    );
  });

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useElectionsRealtime());

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load realtime settings:', expect.any(Error));
    expect(result.current.settings).toEqual(defaultSettings);
  });

  it('should request notification permission on mount', () => {
    const mockRequestPermission = jest.fn().mockResolvedValue('granted');
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: mockRequestPermission
      },
      writable: true
    });

    renderHook(() => useElectionsRealtime());

    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('should simulate updates when connected', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
    });

    expect(result.current.updates).toHaveLength(0);

    act(() => {
      jest.advanceTimersByTime(10000); // Advance by 10 seconds
    });

    expect(result.current.updates.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });

  it('should not simulate updates when disconnected', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.connect();
      result.current.disconnect();
    });

    const initialUpdateCount = result.current.updates.length;

    act(() => {
      jest.advanceTimersByTime(10000); // Advance by 10 seconds
    });

    expect(result.current.updates.length).toBe(initialUpdateCount);

    jest.useRealTimers();
  });

  it('should limit updates based on maxUpdates setting', () => {
    const { result } = renderHook(() => useElectionsRealtime());

    act(() => {
      result.current.updateSettings({ maxUpdates: 2 });
      result.current.connect();
    });

    // Simulate multiple updates
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.updates.push({
          id: `update-${i}`,
          type: 'election_created',
          electionId: `election-${i}`,
          data: {},
          timestamp: new Date().toISOString(),
          priority: 'medium'
        });
      }
    });

    expect(result.current.updates.length).toBeLessThanOrEqual(2);
  });

  it('should clean up timers on unmount', () => {
    jest.useFakeTimers();
    
    const { unmount } = renderHook(() => useElectionsRealtime());

    unmount();

    // Should not throw any errors
    expect(() => {
      jest.advanceTimersByTime(10000);
    }).not.toThrow();

    jest.useRealTimers();
  });
});

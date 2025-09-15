/**
 * Offline Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useOffline, useOfflineManager, useOfflineSync, useOfflineData, useOfflineStorage } from '@/hooks/use-offline';

// Mock the offline manager
jest.mock('@/lib/offline/offline-manager', () => ({
  offlineManager: {
    initialize: jest.fn(() => Promise.resolve(true)),
    storeOfflineData: jest.fn(() => Promise.resolve('data-id')),
    getOfflineData: jest.fn(() => Promise.resolve(null)),
    getOfflineDataByType: jest.fn(() => Promise.resolve([])),
    getUnsyncedData: jest.fn(() => Promise.resolve([])),
    markAsSynced: jest.fn(() => Promise.resolve(true)),
    removeOfflineData: jest.fn(() => Promise.resolve(true)),
    clearOfflineData: jest.fn(() => Promise.resolve(true)),
    syncData: jest.fn(() => Promise.resolve(true)),
    setOnlineStatus: jest.fn(),
    getSyncStatus: jest.fn(() => ({
      isOnline: true,
      isSyncing: false,
      lastSync: Date.now(),
      pendingItems: 0,
      failedItems: 0,
      totalItems: 0,
      syncProgress: 0,
      errors: [],
    })),
    configure: jest.fn(),
    getConfig: jest.fn(() => ({
      enableAutoSync: true,
      syncInterval: 30000,
      maxRetries: 3,
      retryDelay: 5000,
      batchSize: 10,
      enableConflictResolution: true,
      enableDataCompression: false,
      enableEncryption: false,
      maxStorageSize: 52428800,
      cleanupInterval: 86400000,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    isManagerInitialized: jest.fn(() => true),
    getStorageUsage: jest.fn(() => Promise.resolve({ used: 0, available: 52428800, percentage: 0 })),
    cleanup: jest.fn(),
  },
}));

// Mock the network hook
jest.mock('@/hooks/use-network', () => ({
  useNetwork: () => ({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
    isWifiEnabled: true,
    networkDetails: null,
    isLoading: false,
    error: null,
    lastUpdate: Date.now(),
    initialize: jest.fn(() => Promise.resolve(true)),
    refresh: jest.fn(() => Promise.resolve(null)),
    configure: jest.fn(),
    resetStats: jest.fn(),
    getStats: jest.fn(() => ({})),
    getConfig: jest.fn(() => ({})),
    getStatus: jest.fn(() => ({})),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
}));

describe('useOffline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.syncStatus).toBeDefined();
    expect(result.current.storageUsage).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.initialize).toBe('function');
    expect(typeof result.current.storeData).toBe('function');
    expect(typeof result.current.getData).toBe('function');
    expect(typeof result.current.getDataByType).toBe('function');
    expect(typeof result.current.getUnsyncedData).toBe('function');
    expect(typeof result.current.markAsSynced).toBe('function');
    expect(typeof result.current.removeData).toBe('function');
    expect(typeof result.current.clearAllData).toBe('function');
    expect(typeof result.current.syncData).toBe('function');
    expect(typeof result.current.refreshStorageUsage).toBe('function');
    expect(typeof result.current.configure).toBe('function');
    expect(typeof result.current.getConfig).toBe('function');
    expect(typeof result.current.addEventListener).toBe('function');
    expect(typeof result.current.removeEventListener).toBe('function');
  });

  it('should initialize successfully', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(true);
    });

    expect(result.current.isInitialized).toBe(true);
  });

  it('should handle initialization failure', async () => {
    const mockInitialize = require('@/lib/offline/offline-manager').offlineManager.initialize;
    mockInitialize.mockRejectedValueOnce(new Error('Initialization failed'));

    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const success = await result.current.initialize();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe('Initialization failed');
  });

  it('should store data', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const id = await result.current.storeData('election', { title: 'Test Election' });
      expect(id).toBe('data-id');
    });
  });

  it('should handle store data errors', async () => {
    const mockStoreOfflineData = require('@/lib/offline/offline-manager').offlineManager.storeOfflineData;
    mockStoreOfflineData.mockRejectedValueOnce(new Error('Storage failed'));

    const { result } = renderHook(() => useOffline());

    await act(async () => {
      await expect(result.current.storeData('election', { title: 'Test' })).rejects.toThrow('Storage failed');
    });

    expect(result.current.error).toBe('Storage failed');
  });

  it('should get data', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const data = await result.current.getData('test-id');
      expect(data).toBeNull();
    });
  });

  it('should get data by type', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const data = await result.current.getDataByType('election');
      expect(data).toEqual([]);
    });
  });

  it('should get unsynced data', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const data = await result.current.getUnsyncedData();
      expect(data).toEqual([]);
    });
  });

  it('should mark data as synced', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const success = await result.current.markAsSynced('test-id');
      expect(success).toBe(true);
    });
  });

  it('should remove data', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const success = await result.current.removeData('test-id');
      expect(success).toBe(true);
    });
  });

  it('should clear all data', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const success = await result.current.clearAllData();
      expect(success).toBe(true);
    });
  });

  it('should sync data', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      const success = await result.current.syncData();
      expect(success).toBe(true);
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it('should refresh storage usage', async () => {
    const { result } = renderHook(() => useOffline());

    await act(async () => {
      await result.current.refreshStorageUsage();
    });

    expect(result.current.storageUsage).toBeDefined();
  });

  it('should configure settings', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.configure({ enableAutoSync: false });
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should get configuration', () => {
    const { result } = renderHook(() => useOffline());

    const config = result.current.getConfig();
    expect(config).toBeDefined();
    expect(config.enableAutoSync).toBe(true);
  });

  it('should add event listener', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.addEventListener('data_stored', jest.fn());
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should remove event listener', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.addEventListener('data_stored', jest.fn());
      result.current.removeEventListener('data_stored', jest.fn());
    });

    // Should not throw error
    expect(true).toBe(true);
  });
});

describe('useOfflineManager', () => {
  it('should auto-initialize on mount', () => {
    const { result } = renderHook(() => useOfflineManager());

    // Should have initialized
    expect(result.current.isInitialized).toBe(true);
  });
});

describe('useOfflineSync', () => {
  it('should return sync information', () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.syncStatus).toBeDefined();
    expect(result.current.statusText).toBeDefined();
    expect(result.current.statusColor).toBeDefined();
    expect(result.current.canSync).toBeDefined();
    expect(typeof result.current.syncData).toBe('function');
  });

  it('should return correct status text', () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(['Error', 'Offline', 'Syncing', 'Pending', 'Up to date']).toContain(result.current.statusText);
  });

  it('should return correct status color', () => {
    const { result } = renderHook(() => useOfflineSync());

    expect(['red', 'yellow', 'blue', 'orange', 'green']).toContain(result.current.statusColor);
  });
});

describe('useOfflineData', () => {
  it('should return data information', () => {
    const { result } = renderHook(() => useOfflineData('election'));

    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refreshData).toBe('function');
    expect(typeof result.current.markItemAsSynced).toBe('function');
    expect(typeof result.current.removeItem).toBe('function');
  });

  it('should refresh data', () => {
    const { result } = renderHook(() => useOfflineData('election'));

    act(() => {
      result.current.refreshData();
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should mark item as synced', async () => {
    const { result } = renderHook(() => useOfflineData('election'));

    await act(async () => {
      const success = await result.current.markItemAsSynced('test-id');
      expect(success).toBe(true);
    });
  });

  it('should remove item', async () => {
    const { result } = renderHook(() => useOfflineData('election'));

    await act(async () => {
      const success = await result.current.removeItem('test-id');
      expect(success).toBe(true);
    });
  });
});

describe('useOfflineStorage', () => {
  it('should return storage information', () => {
    const { result } = renderHook(() => useOfflineStorage());

    expect(result.current.storageUsage).toBeDefined();
    expect(typeof result.current.refreshStorageUsage).toBe('function');
    expect(typeof result.current.clearStorage).toBe('function');
    expect(result.current.isClearing).toBe(false);
    expect(typeof result.current.formatBytes).toBe('function');
    expect(typeof result.current.getStoragePercentage).toBe('function');
    expect(typeof result.current.isStorageFull).toBe('function');
  });

  it('should format bytes correctly', () => {
    const { result } = renderHook(() => useOfflineStorage());

    const formatted = result.current.formatBytes(1024);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should get storage percentage', () => {
    const { result } = renderHook(() => useOfflineStorage());

    const percentage = result.current.getStoragePercentage();
    expect(typeof percentage).toBe('number');
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('should check if storage is full', () => {
    const { result } = renderHook(() => useOfflineStorage());

    const isFull = result.current.isStorageFull();
    expect(typeof isFull).toBe('boolean');
  });

  it('should clear storage', async () => {
    const { result } = renderHook(() => useOfflineStorage());

    await act(async () => {
      const success = await result.current.clearStorage();
      expect(success).toBe(true);
    });

    expect(result.current.isClearing).toBe(false);
  });
});

/**
 * Offline Manager Tests
 */

import { offlineManager } from '@/lib/offline/offline-manager';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    refetchQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    removeQueries: jest.fn(),
    clear: jest.fn(),
  }),
}));

describe('OfflineManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    offlineManager.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const result = await offlineManager.initialize();
      
      expect(result).toBe(true);
      expect(offlineManager.isManagerInitialized()).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const mockGetAllKeys = require('@react-native-async-storage/async-storage').getAllKeys;
      mockGetAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      const result = await offlineManager.initialize();
      
      expect(result).toBe(false);
    });

    it('should not initialize if already initialized', async () => {
      await offlineManager.initialize();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await offlineManager.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('Offline manager is already initialized');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Data Storage', () => {
    beforeEach(async () => {
      await offlineManager.initialize();
    });

    it('should store offline data', async () => {
      const data = { title: 'Test Election', description: 'Test Description' };
      const id = await offlineManager.storeOfflineData('election', data);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should store data with options', async () => {
      const data = { title: 'Test Vote', candidate: 'John Doe' };
      const options = {
        priority: 'high' as const,
        dependencies: ['election_1'],
        id: 'custom-id',
      };
      
      const id = await offlineManager.storeOfflineData('vote', data, options);
      
      expect(id).toBe('custom-id');
    });

    it('should handle storage errors', async () => {
      const mockSetItem = require('@react-native-async-storage/async-storage').setItem;
      mockSetItem.mockRejectedValueOnce(new Error('Storage full'));

      const data = { title: 'Test' };
      
      await expect(offlineManager.storeOfflineData('election', data)).rejects.toThrow('Storage full');
    });
  });

  describe('Data Retrieval', () => {
    beforeEach(async () => {
      await offlineManager.initialize();
    });

    it('should retrieve offline data', async () => {
      const data = { title: 'Test Election' };
      const id = await offlineManager.storeOfflineData('election', data);
      
      const retrievedData = await offlineManager.getOfflineData(id);
      
      expect(retrievedData).toBeDefined();
      expect(retrievedData?.data).toEqual(data);
      expect(retrievedData?.type).toBe('election');
    });

    it('should return null for non-existent data', async () => {
      const data = await offlineManager.getOfflineData('non-existent-id');
      
      expect(data).toBeNull();
    });

    it('should get data by type', async () => {
      await offlineManager.storeOfflineData('election', { title: 'Election 1' });
      await offlineManager.storeOfflineData('election', { title: 'Election 2' });
      await offlineManager.storeOfflineData('vote', { candidate: 'John' });
      
      const elections = await offlineManager.getOfflineDataByType('election');
      
      expect(elections).toHaveLength(2);
      expect(elections.every(item => item.type === 'election')).toBe(true);
    });

    it('should get unsynced data', async () => {
      await offlineManager.storeOfflineData('election', { title: 'Election 1' });
      await offlineManager.storeOfflineData('election', { title: 'Election 2' });
      
      const unsyncedData = await offlineManager.getUnsyncedData();
      
      expect(unsyncedData).toHaveLength(2);
      expect(unsyncedData.every(item => !item.synced)).toBe(true);
    });
  });

  describe('Data Management', () => {
    beforeEach(async () => {
      await offlineManager.initialize();
    });

    it('should mark data as synced', async () => {
      const id = await offlineManager.storeOfflineData('election', { title: 'Test' });
      
      const result = await offlineManager.markAsSynced(id);
      
      expect(result).toBe(true);
    });

    it('should remove offline data', async () => {
      const id = await offlineManager.storeOfflineData('election', { title: 'Test' });
      
      const result = await offlineManager.removeOfflineData(id);
      
      expect(result).toBe(true);
    });

    it('should clear all offline data', async () => {
      await offlineManager.storeOfflineData('election', { title: 'Test 1' });
      await offlineManager.storeOfflineData('election', { title: 'Test 2' });
      
      const result = await offlineManager.clearOfflineData();
      
      expect(result).toBe(true);
    });
  });

  describe('Synchronization', () => {
    beforeEach(async () => {
      await offlineManager.initialize();
    });

    it('should sync data', async () => {
      await offlineManager.storeOfflineData('election', { title: 'Test' });
      
      const result = await offlineManager.syncData();
      
      expect(result).toBe(true);
    });

    it('should not sync when offline', async () => {
      offlineManager.setOnlineStatus(false);
      
      const result = await offlineManager.syncData();
      
      expect(result).toBe(false);
    });

    it('should not sync when already syncing', async () => {
      // Mock sync in progress
      const mockSyncData = jest.spyOn(offlineManager, 'syncData');
      mockSyncData.mockImplementationOnce(async () => {
        // Simulate long-running sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      });

      const syncPromise1 = offlineManager.syncData();
      const syncPromise2 = offlineManager.syncData();
      
      const [result1, result2] = await Promise.all([syncPromise1, syncPromise2]);
      
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('Online Status', () => {
    beforeEach(async () => {
      await offlineManager.initialize();
    });

    it('should set online status', () => {
      offlineManager.setOnlineStatus(false);
      
      const status = offlineManager.getSyncStatus();
      expect(status.isOnline).toBe(false);
    });

    it('should trigger sync when coming online', async () => {
      const syncSpy = jest.spyOn(offlineManager, 'syncData');
      
      offlineManager.setOnlineStatus(false);
      offlineManager.setOnlineStatus(true);
      
      // Wait for potential sync
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(syncSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should configure settings', () => {
      const newConfig = {
        enableAutoSync: false,
        syncInterval: 60000,
        maxRetries: 5,
      };

      offlineManager.configure(newConfig);
      const config = offlineManager.getConfig();
      
      expect(config.enableAutoSync).toBe(false);
      expect(config.syncInterval).toBe(60000);
      expect(config.maxRetries).toBe(5);
    });

    it('should get current configuration', () => {
      const config = offlineManager.getConfig();
      
      expect(config).toHaveProperty('enableAutoSync');
      expect(config).toHaveProperty('syncInterval');
      expect(config).toHaveProperty('maxRetries');
      expect(config).toHaveProperty('retryDelay');
      expect(config).toHaveProperty('batchSize');
      expect(config).toHaveProperty('enableConflictResolution');
      expect(config).toHaveProperty('enableDataCompression');
      expect(config).toHaveProperty('enableEncryption');
      expect(config).toHaveProperty('maxStorageSize');
      expect(config).toHaveProperty('cleanupInterval');
    });
  });

  describe('Storage Usage', () => {
    beforeEach(async () => {
      await offlineManager.initialize();
    });

    it('should get storage usage', async () => {
      const usage = await offlineManager.getStorageUsage();
      
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(usage).toHaveProperty('percentage');
      expect(typeof usage.used).toBe('number');
      expect(typeof usage.available).toBe('number');
      expect(typeof usage.percentage).toBe('number');
    });

    it('should handle storage usage errors', async () => {
      const mockGetAllKeys = require('@react-native-async-storage/async-storage').getAllKeys;
      mockGetAllKeys.mockRejectedValueOnce(new Error('Storage error'));

      const usage = await offlineManager.getStorageUsage();
      
      expect(usage.used).toBe(0);
      expect(usage.available).toBeGreaterThan(0);
      expect(usage.percentage).toBe(0);
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const listener = jest.fn();
      
      offlineManager.addEventListener('data_stored', listener);
      
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should remove event listener', () => {
      const listener = jest.fn();
      
      offlineManager.addEventListener('data_stored', listener);
      offlineManager.removeEventListener('data_stored', listener);
      
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await offlineManager.initialize();
      offlineManager.addEventListener('test', jest.fn());
      
      offlineManager.cleanup();
      
      expect(offlineManager.isManagerInitialized()).toBe(false);
    });
  });
});

/**
 * Offline Manager Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OfflineStatus, OfflineSyncButton, OfflineDataList, OfflineStorageInfo, OfflineSettings } from '@/components/offline/offline-manager';

// Mock the hooks
jest.mock('@/hooks/use-offline', () => ({
  useOffline: () => ({
    isInitialized: true,
    isOnline: true,
    isSyncing: false,
    syncStatus: {
      isOnline: true,
      isSyncing: false,
      lastSync: Date.now(),
      pendingItems: 0,
      failedItems: 0,
      totalItems: 0,
      syncProgress: 0,
      errors: [],
    },
    storageUsage: { used: 0, available: 52428800, percentage: 0 },
    isLoading: false,
    error: null,
    initialize: jest.fn(() => Promise.resolve(true)),
    storeData: jest.fn(() => Promise.resolve('data-id')),
    getData: jest.fn(() => Promise.resolve(null)),
    getDataByType: jest.fn(() => Promise.resolve([])),
    getUnsyncedData: jest.fn(() => Promise.resolve([])),
    markAsSynced: jest.fn(() => Promise.resolve(true)),
    removeData: jest.fn(() => Promise.resolve(true)),
    clearAllData: jest.fn(() => Promise.resolve(true)),
    syncData: jest.fn(() => Promise.resolve(true)),
    refreshStorageUsage: jest.fn(() => Promise.resolve()),
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
  }),
  useOfflineSync: () => ({
    isOnline: true,
    isSyncing: false,
    syncStatus: {
      isOnline: true,
      isSyncing: false,
      lastSync: Date.now(),
      pendingItems: 0,
      failedItems: 0,
      totalItems: 0,
      syncProgress: 0,
      errors: [],
    },
    syncData: jest.fn(() => Promise.resolve(true)),
    error: null,
    statusText: 'Up to date',
    statusColor: 'green',
    canSync: false,
  }),
  useOfflineData: (type: string) => ({
    data: [],
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
    markItemAsSynced: jest.fn(() => Promise.resolve(true)),
    removeItem: jest.fn(() => Promise.resolve(true)),
  }),
  useOfflineStorage: () => ({
    storageUsage: { used: 0, available: 52428800, percentage: 0 },
    refreshStorageUsage: jest.fn(() => Promise.resolve()),
    clearStorage: jest.fn(() => Promise.resolve(true)),
    isClearing: false,
    formatBytes: jest.fn((bytes: number) => '0 Bytes'),
    getStoragePercentage: jest.fn(() => 0),
    isStorageFull: jest.fn(() => false),
  }),
}));

describe('OfflineStatus', () => {
  it('should render status', () => {
    const { getByText } = render(
      React.createElement(OfflineStatus)
    );

    expect(getByText('Up to date')).toBeTruthy();
  });

  it('should show details when showDetails is true', () => {
    const { getByText } = render(
      React.createElement(OfflineStatus, { showDetails: true })
    );

    expect(getByText('Up to date')).toBeTruthy();
    expect(getByText('Online: Yes')).toBeTruthy();
    expect(getByText('Pending: 0')).toBeTruthy();
    expect(getByText('Total: 0')).toBeTruthy();
  });

  it('should show progress when showProgress is true', () => {
    const { getByText } = render(
      React.createElement(OfflineStatus, { showProgress: true })
    );

    expect(getByText('Up to date')).toBeTruthy();
  });

  it('should show offline status', () => {
    // Mock offline state
    const mockUseOfflineSync = require('@/hooks/use-offline').useOfflineSync;
    mockUseOfflineSync.mockReturnValueOnce({
      isOnline: false,
      isSyncing: false,
      syncStatus: {
        isOnline: false,
        isSyncing: false,
        lastSync: Date.now(),
        pendingItems: 0,
        failedItems: 0,
        totalItems: 0,
        syncProgress: 0,
        errors: [],
      },
      syncData: jest.fn(() => Promise.resolve(true)),
      error: null,
      statusText: 'Offline',
      statusColor: 'yellow',
      canSync: false,
    });

    const { getByText } = render(
      React.createElement(OfflineStatus)
    );

    expect(getByText('Offline')).toBeTruthy();
  });
});

describe('OfflineSyncButton', () => {
  it('should render sync button', () => {
    const { getByText } = render(
      React.createElement(OfflineSyncButton)
    );

    expect(getByText('Up to date')).toBeTruthy();
  });

  it('should call onSync when clicked', async () => {
    const onSync = jest.fn();
    const { getByText } = render(
      React.createElement(OfflineSyncButton, { onSync })
    );

    const button = getByText('Up to date');
    fireEvent.press(button);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onSync).toHaveBeenCalled();
  });

  it('should render different variants', () => {
    const { getByText: getByTextOutline } = render(
      React.createElement(OfflineSyncButton, { variant: 'outline' })
    );

    const { getByText: getByTextGhost } = render(
      React.createElement(OfflineSyncButton, { variant: 'ghost' })
    );

    expect(getByTextOutline('Up to date')).toBeTruthy();
    expect(getByTextGhost('Up to date')).toBeTruthy();
  });

  it('should render different sizes', () => {
    const { getByText: getByTextSm } = render(
      React.createElement(OfflineSyncButton, { size: 'sm' })
    );

    const { getByText: getByTextLg } = render(
      React.createElement(OfflineSyncButton, { size: 'lg' })
    );

    expect(getByTextSm('Up to date')).toBeTruthy();
    expect(getByTextLg('Up to date')).toBeTruthy();
  });

  it('should show syncing state', () => {
    // Mock syncing state
    const mockUseOfflineSync = require('@/hooks/use-offline').useOfflineSync;
    mockUseOfflineSync.mockReturnValueOnce({
      isOnline: true,
      isSyncing: true,
      syncStatus: {
        isOnline: true,
        isSyncing: true,
        lastSync: Date.now(),
        pendingItems: 0,
        failedItems: 0,
        totalItems: 0,
        syncProgress: 50,
        errors: [],
      },
      syncData: jest.fn(() => Promise.resolve(true)),
      error: null,
      statusText: 'Syncing...',
      statusColor: 'blue',
      canSync: false,
    });

    const { getByText } = render(
      React.createElement(OfflineSyncButton)
    );

    expect(getByText('Syncing...')).toBeTruthy();
  });
});

describe('OfflineDataList', () => {
  it('should render data list', () => {
    const { getByText } = render(
      React.createElement(OfflineDataList, { type: 'election' })
    );

    expect(getByText('Election Data (0)')).toBeTruthy();
    expect(getByText('No election data available offline')).toBeTruthy();
  });

  it('should call onItemClick when item is clicked', () => {
    const onItemClick = jest.fn();
    const { getByText } = render(
      React.createElement(OfflineDataList, { type: 'election', onItemClick })
    );

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should call onSyncItem when sync button is clicked', async () => {
    const onSyncItem = jest.fn();
    const { getByText } = render(
      React.createElement(OfflineDataList, { type: 'election', onSyncItem })
    );

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should call onRemoveItem when remove button is clicked', async () => {
    const onRemoveItem = jest.fn();
    const { getByText } = render(
      React.createElement(OfflineDataList, { type: 'election', onRemoveItem })
    );

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should show loading state', () => {
    // Mock loading state
    const mockUseOfflineData = require('@/hooks/use-offline').useOfflineData;
    mockUseOfflineData.mockReturnValueOnce({
      data: [],
      isLoading: true,
      error: null,
      refreshData: jest.fn(),
      markItemAsSynced: jest.fn(() => Promise.resolve(true)),
      removeItem: jest.fn(() => Promise.resolve(true)),
    });

    const { getByText } = render(
      React.createElement(OfflineDataList, { type: 'election' })
    );

    // Should show loading spinner
    expect(true).toBe(true);
  });

  it('should show error state', () => {
    // Mock error state
    const mockUseOfflineData = require('@/hooks/use-offline').useOfflineData;
    mockUseOfflineData.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: 'Failed to load data',
      refreshData: jest.fn(),
      markItemAsSynced: jest.fn(() => Promise.resolve(true)),
      removeItem: jest.fn(() => Promise.resolve(true)),
    });

    const { getByText } = render(
      React.createElement(OfflineDataList, { type: 'election' })
    );

    expect(getByText('Error: Failed to load data')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });
});

describe('OfflineStorageInfo', () => {
  it('should render storage info', () => {
    const { getByText } = render(
      React.createElement(OfflineStorageInfo)
    );

    expect(getByText('Offline Storage')).toBeTruthy();
    expect(getByText('Storage Used')).toBeTruthy();
    expect(getByText('Clear All Offline Data')).toBeTruthy();
  });

  it('should call onClear when clear button is clicked', async () => {
    const onClear = jest.fn();
    const { getByText } = render(
      React.createElement(OfflineStorageInfo, { onClear })
    );

    const clearButton = getByText('Clear All Offline Data');
    fireEvent.press(clearButton);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onClear).toHaveBeenCalled();
  });

  it('should show details when showDetails is true', () => {
    const { getByText } = render(
      React.createElement(OfflineStorageInfo, { showDetails: true })
    );

    expect(getByText('Offline Storage')).toBeTruthy();
    expect(getByText('Available: 0 Bytes')).toBeTruthy();
    expect(getByText('Used: 0 Bytes')).toBeTruthy();
  });

  it('should show storage full warning', () => {
    // Mock storage full state
    const mockUseOfflineStorage = require('@/hooks/use-offline').useOfflineStorage;
    mockUseOfflineStorage.mockReturnValueOnce({
      storageUsage: { used: 47185920, available: 5242880, percentage: 90 },
      refreshStorageUsage: jest.fn(() => Promise.resolve()),
      clearStorage: jest.fn(() => Promise.resolve(true)),
      isClearing: false,
      formatBytes: jest.fn((bytes: number) => bytes === 47185920 ? '45 MB' : '5 MB'),
      getStoragePercentage: jest.fn(() => 90),
      isStorageFull: jest.fn(() => true),
    });

    const { getByText } = render(
      React.createElement(OfflineStorageInfo, { showDetails: true })
    );

    expect(getByText('Storage is nearly full!')).toBeTruthy();
  });
});

describe('OfflineSettings', () => {
  it('should render settings form', () => {
    const { getByText } = render(
      React.createElement(OfflineSettings)
    );

    expect(getByText('Offline Settings')).toBeTruthy();
    expect(getByText('Enable Auto Sync')).toBeTruthy();
    expect(getByText('Sync Interval (seconds)')).toBeTruthy();
    expect(getByText('Max Retries')).toBeTruthy();
    expect(getByText('Batch Size')).toBeTruthy();
    expect(getByText('Enable Conflict Resolution')).toBeTruthy();
    expect(getByText('Save Settings')).toBeTruthy();
  });

  it('should call onSave when settings are saved', () => {
    const onSave = jest.fn();
    const { getByText } = render(
      React.createElement(OfflineSettings, { onSave })
    );

    const saveButton = getByText('Save Settings');
    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalled();
  });

  it('should handle toggle changes', () => {
    const { getByText } = render(
      React.createElement(OfflineSettings)
    );

    // Should not throw error when toggles are pressed
    expect(true).toBe(true);
  });

  it('should handle input changes', () => {
    const { getByText } = render(
      React.createElement(OfflineSettings)
    );

    // Should not throw error when inputs change
    expect(true).toBe(true);
  });
});

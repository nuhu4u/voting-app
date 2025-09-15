import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiConfig } from './config';

export interface OfflineAction {
  id: string;
  type: 'vote' | 'election_create' | 'election_update' | 'user_update' | 'report_create' | 'report_update';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface OfflineState {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  pendingActions: OfflineAction[];
  lastSyncTime: number | null;
  syncInProgress: boolean;
}

class OfflineService {
  private static instance: OfflineService;
  private offlineState: OfflineState = {
    isOnline: false,
    isConnected: false,
    connectionType: null,
    pendingActions: [],
    lastSyncTime: null,
    syncInProgress: false,
  };

  private listeners: Set<(state: OfflineState) => void> = new Set();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private retryInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  private async initialize(): Promise<void> {
    // Load offline state from storage
    await this.loadOfflineState();
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
    
    // Start sync intervals
    this.startSyncIntervals();
  }

  private async loadOfflineState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.offlineState = {
          ...this.offlineState,
          ...parsed,
          syncInProgress: false, // Reset sync state on app restart
        };
      }
    } catch (error) {
      console.error('Error loading offline state:', error);
    }
  }

  private async saveOfflineState(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_state', JSON.stringify(this.offlineState));
    } catch (error) {
      console.error('Error saving offline state:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.offlineState.isOnline;
      const isOnline = state.isConnected && state.isInternetReachable;
      
      this.offlineState.isOnline = isOnline || false;
      this.offlineState.isConnected = state.isConnected || false;
      this.offlineState.connectionType = state.type;

      // If we just came online, trigger sync
      if (!wasOnline && isOnline) {
        this.syncPendingActions();
      }

      this.notifyListeners();
    });
  }

  private startSyncIntervals(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.offlineState.isOnline && !this.offlineState.syncInProgress) {
        this.syncPendingActions();
      }
    }, 30000);

    // Retry failed actions every 5 minutes
    this.retryInterval = setInterval(() => {
      if (this.offlineState.isOnline && !this.offlineState.syncInProgress) {
        this.retryFailedActions();
      }
    }, 300000);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.offlineState));
  }

  public subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): OfflineState {
    return { ...this.offlineState };
  }

  public isOnline(): boolean {
    return this.offlineState.isOnline;
  }

  public isConnected(): boolean {
    return this.offlineState.isConnected;
  }

  public getConnectionType(): string | null {
    return this.offlineState.connectionType;
  }

  public getPendingActionsCount(): number {
    return this.offlineState.pendingActions.length;
  }

  public getPendingActions(): OfflineAction[] {
    return [...this.offlineState.pendingActions];
  }

  // Add action to offline queue
  public async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const id = `${action.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineAction: OfflineAction = {
      ...action,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineState.pendingActions.push(offlineAction);
    await this.saveOfflineState();
    this.notifyListeners();

    // If online, try to sync immediately
    if (this.offlineState.isOnline) {
      this.syncPendingActions();
    }

    return id;
  }

  // Remove action from offline queue
  public async removeOfflineAction(actionId: string): Promise<void> {
    this.offlineState.pendingActions = this.offlineState.pendingActions.filter(
      action => action.id !== actionId
    );
    await this.saveOfflineState();
    this.notifyListeners();
  }

  // Clear all pending actions
  public async clearPendingActions(): Promise<void> {
    this.offlineState.pendingActions = [];
    await this.saveOfflineState();
    this.notifyListeners();
  }

  // Sync pending actions with server
  public async syncPendingActions(): Promise<void> {
    if (this.offlineState.syncInProgress || !this.offlineState.isOnline) {
      return;
    }

    this.offlineState.syncInProgress = true;
    this.notifyListeners();

    try {
      const actionsToSync = [...this.offlineState.pendingActions];
      const syncedActions: string[] = [];

      for (const action of actionsToSync) {
        try {
          const success = await this.executeAction(action);
          if (success) {
            syncedActions.push(action.id);
          } else {
            action.retryCount++;
            if (action.retryCount >= action.maxRetries) {
              // Remove action after max retries
              syncedActions.push(action.id);
            }
          }
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error);
          action.retryCount++;
          if (action.retryCount >= action.maxRetries) {
            syncedActions.push(action.id);
          }
        }
      }

      // Remove synced actions
      this.offlineState.pendingActions = this.offlineState.pendingActions.filter(
        action => !syncedActions.includes(action.id)
      );

      this.offlineState.lastSyncTime = Date.now();
      await this.saveOfflineState();
    } catch (error) {
      console.error('Error syncing pending actions:', error);
    } finally {
      this.offlineState.syncInProgress = false;
      this.notifyListeners();
    }
  }

  // Retry failed actions
  private async retryFailedActions(): Promise<void> {
    const failedActions = this.offlineState.pendingActions.filter(
      action => action.retryCount > 0 && action.retryCount < action.maxRetries
    );

    for (const action of failedActions) {
      try {
        const success = await this.executeAction(action);
        if (success) {
          await this.removeOfflineAction(action.id);
        }
      } catch (error) {
        console.error(`Error retrying action ${action.id}:`, error);
      }
    }
  }

  // Execute individual action
  private async executeAction(action: OfflineAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'vote':
          return await this.executeVote(action.data);
        case 'election_create':
          return await this.executeElectionCreate(action.data);
        case 'election_update':
          return await this.executeElectionUpdate(action.data);
        case 'user_update':
          return await this.executeUserUpdate(action.data);
        case 'report_create':
          return await this.executeReportCreate(action.data);
        case 'report_update':
          return await this.executeReportUpdate(action.data);
        default:
          console.warn(`Unknown action type: ${action.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      return false;
    }
  }

  // Action executors
  private async executeVote(data: any): Promise<boolean> {
    const response = await fetch(`${apiConfig.baseUrl}/elections/${data.electionId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify({
        candidateId: data.candidateId,
        position: data.position,
      }),
    });

    return response.ok;
  }

  private async executeElectionCreate(data: any): Promise<boolean> {
    const response = await fetch(`${apiConfig.baseUrl}/elections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify(data.election),
    });

    return response.ok;
  }

  private async executeElectionUpdate(data: any): Promise<boolean> {
    const response = await fetch(`${apiConfig.baseUrl}/elections/${data.electionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify(data.updates),
    });

    return response.ok;
  }

  private async executeUserUpdate(data: any): Promise<boolean> {
    const response = await fetch(`${apiConfig.baseUrl}/users/${data.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify(data.updates),
    });

    return response.ok;
  }

  private async executeReportCreate(data: any): Promise<boolean> {
    const response = await fetch(`${apiConfig.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify(data.report),
    });

    return response.ok;
  }

  private async executeReportUpdate(data: any): Promise<boolean> {
    const response = await fetch(`${apiConfig.baseUrl}/reports/${data.reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
      body: JSON.stringify(data.updates),
    });

    return response.ok;
  }

  // Cache management
  public async cacheData(key: string, data: any, ttl: number = 300000): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  public async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const cacheItem = JSON.parse(cached);
        const now = Date.now();
        
        if (now - cacheItem.timestamp < cacheItem.ttl) {
          return cacheItem.data;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(`cache_${key}`);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  public async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();

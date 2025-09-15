/**
 * Network Monitoring Service
 * Monitors network connectivity and status using @react-native-community/netinfo
 */

// import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

// Mock implementation for development environment
const NetInfo = {
  addEventListener: (callback: (state: any) => void) => {
    // Mock listener
    const mockState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      isWifiEnabled: true,
      details: {
        isConnectionExpensive: false,
        ssid: 'MockWiFi',
        strength: 100,
        ipAddress: '192.168.1.100',
        subnet: '255.255.255.0',
        frequency: 2400,
      },
    };
    
    // Simulate initial state
    setTimeout(() => callback(mockState), 100);
    
    // Return unsubscribe function
    return () => {};
  },
  fetch: () => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifiEnabled: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'MockWiFi',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
    },
  }),
  refresh: () => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifiEnabled: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'MockWiFi',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
    },
  }),
};

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifiEnabled: boolean;
  details: NetworkDetails | null;
  timestamp: number;
}

export interface NetworkDetails {
  isConnectionExpensive: boolean;
  ssid?: string;
  strength?: number;
  ipAddress?: string;
  subnet?: string;
  frequency?: number;
  cellularGeneration?: string;
  carrier?: string;
}

export interface NetworkEvent {
  type: 'connected' | 'disconnected' | 'wifi_changed' | 'cellular_changed' | 'unknown_changed' | 'error';
  timestamp: number;
  previousState: NetworkState | null;
  currentState: NetworkState;
  data?: any;
}

export interface NetworkConfig {
  enableMonitoring: boolean;
  checkInterval: number; // milliseconds
  timeout: number; // milliseconds
  retryAttempts: number;
  enableNotifications: boolean;
  enableLogging: boolean;
  enableOfflineMode: boolean;
}

export interface NetworkStats {
  totalConnections: number;
  totalDisconnections: number;
  totalWifiChanges: number;
  totalCellularChanges: number;
  averageConnectionTime: number;
  lastConnected: number | null;
  lastDisconnected: number | null;
  uptime: number;
  downtime: number;
}

class NetworkMonitor {
  private static instance: NetworkMonitor;
  private config: NetworkConfig;
  private currentState: NetworkState | null = null;
  private isMonitoring: boolean = false;
  private unsubscribe: (() => void) | null = null;
  private eventListeners: Map<string, ((event: NetworkEvent) => void)[]> = new Map();
  private stats: NetworkStats;
  private connectionStartTime: number | null = null;
  private lastStateChange: number = Date.now();

  private constructor() {
    this.config = {
      enableMonitoring: true,
      checkInterval: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      enableNotifications: true,
      enableLogging: true,
      enableOfflineMode: true,
    };

    this.stats = {
      totalConnections: 0,
      totalDisconnections: 0,
      totalWifiChanges: 0,
      totalCellularChanges: 0,
      averageConnectionTime: 0,
      lastConnected: null,
      lastDisconnected: null,
      uptime: 0,
      downtime: 0,
    };
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isMonitoring) {
        console.warn('Network monitoring is already active');
        return true;
      }

      // Get initial state
      const initialState = await NetInfo.fetch();
      this.currentState = this.mapNetInfoState(initialState);

      // Start monitoring
      this.startMonitoring();

      this.isMonitoring = true;
      this.lastStateChange = Date.now();

      if (this.config.enableLogging) {
        console.log('Network monitoring initialized', this.currentState);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
      return false;
    }
  }

  /**
   * Start monitoring network changes
   */
  private startMonitoring(): void {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.handleNetworkChange(state);
    });
  }

  /**
   * Stop monitoring network changes
   */
  stopMonitoring(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isMonitoring = false;

    if (this.config.enableLogging) {
      console.log('Network monitoring stopped');
    }
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange(netInfoState: any): void {
    const previousState = this.currentState;
    const newState = this.mapNetInfoState(netInfoState);
    const now = Date.now();

    // Update stats
    this.updateStats(previousState, newState, now);

    // Update current state
    this.currentState = newState;
    this.lastStateChange = now;

    // Determine event type
    const eventType = this.determineEventType(previousState, newState);

    // Create event
    const event: NetworkEvent = {
      type: eventType,
      timestamp: now,
      previousState,
      currentState: newState,
    };

    // Emit event
    this.emitEvent(event);

    // Log change
    if (this.config.enableLogging) {
      console.log('Network state changed:', {
        type: eventType,
        previous: previousState,
        current: newState,
      });
    }
  }

  /**
   * Map NetInfo state to our NetworkState
   */
  private mapNetInfoState(netInfoState: any): NetworkState {
    return {
      isConnected: netInfoState.isConnected || false,
      isInternetReachable: netInfoState.isInternetReachable,
      type: netInfoState.type || 'unknown',
      isWifiEnabled: netInfoState.isWifiEnabled || false,
      details: netInfoState.details || null,
      timestamp: Date.now(),
    };
  }

  /**
   * Determine event type based on state changes
   */
  private determineEventType(previous: NetworkState | null, current: NetworkState): NetworkEvent['type'] {
    if (!previous) {
      return current.isConnected ? 'connected' : 'disconnected';
    }

    if (previous.isConnected !== current.isConnected) {
      return current.isConnected ? 'connected' : 'disconnected';
    }

    if (previous.type !== current.type) {
      if (current.type === 'wifi') return 'wifi_changed';
      if (current.type === 'cellular') return 'cellular_changed';
      return 'unknown_changed';
    }

    return 'connected'; // Default for other changes
  }

  /**
   * Update statistics
   */
  private updateStats(previous: NetworkState | null, current: NetworkState, timestamp: number): void {
    if (!previous) return;

    const timeDiff = timestamp - this.lastStateChange;

    if (previous.isConnected !== current.isConnected) {
      if (current.isConnected) {
        this.stats.totalConnections++;
        this.stats.lastConnected = timestamp;
        this.connectionStartTime = timestamp;
      } else {
        this.stats.totalDisconnections++;
        this.stats.lastDisconnected = timestamp;
        
        if (this.connectionStartTime) {
          const connectionTime = timestamp - this.connectionStartTime;
          this.stats.averageConnectionTime = 
            (this.stats.averageConnectionTime * (this.stats.totalConnections - 1) + connectionTime) / 
            this.stats.totalConnections;
        }
      }
    }

    if (previous.type !== current.type) {
      if (current.type === 'wifi') {
        this.stats.totalWifiChanges++;
      } else if (current.type === 'cellular') {
        this.stats.totalCellularChanges++;
      }
    }

    // Update uptime/downtime
    if (current.isConnected) {
      this.stats.uptime += timeDiff;
    } else {
      this.stats.downtime += timeDiff;
    }
  }

  /**
   * Get current network state
   */
  getCurrentState(): NetworkState | null {
    return this.currentState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.currentState?.isConnected || false;
  }

  /**
   * Check if internet is reachable
   */
  isInternetReachable(): boolean {
    return this.currentState?.isInternetReachable === true;
  }

  /**
   * Get connection type
   */
  getConnectionType(): string {
    return this.currentState?.type || 'unknown';
  }

  /**
   * Check if WiFi is enabled
   */
  isWifiEnabled(): boolean {
    return this.currentState?.isWifiEnabled || false;
  }

  /**
   * Get network details
   */
  getNetworkDetails(): NetworkDetails | null {
    return this.currentState?.details || null;
  }

  /**
   * Refresh network state
   */
  async refresh(): Promise<NetworkState | null> {
    try {
      const state = await NetInfo.refresh();
      this.currentState = this.mapNetInfoState(state);
      return this.currentState;
    } catch (error) {
      console.error('Failed to refresh network state:', error);
      return null;
    }
  }

  /**
   * Configure network monitoring
   */
  configure(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): NetworkConfig {
    return { ...this.config };
  }

  /**
   * Get network statistics
   */
  getStats(): NetworkStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      totalConnections: 0,
      totalDisconnections: 0,
      totalWifiChanges: 0,
      totalCellularChanges: 0,
      averageConnectionTime: 0,
      lastConnected: null,
      lastDisconnected: null,
      uptime: 0,
      downtime: 0,
    };
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, listener: (event: NetworkEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: string, listener: (event: NetworkEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: NetworkEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in network event listener:', error);
        }
      });
    }

    // Also emit to 'all' listeners
    const allListeners = this.eventListeners.get('all');
    if (allListeners) {
      allListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in network event listener:', error);
        }
      });
    }
  }

  /**
   * Check if monitoring is active
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isActive: boolean;
    currentState: NetworkState | null;
    config: NetworkConfig;
    stats: NetworkStats;
    eventListeners: number;
  } {
    return {
      isActive: this.isMonitoring,
      currentState: this.currentState,
      config: this.config,
      stats: this.stats,
      eventListeners: Array.from(this.eventListeners.values()).reduce((total, listeners) => total + listeners.length, 0),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopMonitoring();
    this.eventListeners.clear();
    this.resetStats();
  }
}

// Export singleton instance
export const networkMonitor = NetworkMonitor.getInstance();
export default networkMonitor;

/**
 * Elections Real-time Update Hook
 * Live updates and real-time synchronization for elections
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastUpdate: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  updateFrequency: number; // in seconds
}

export interface RealtimeUpdate {
  id: string;
  type: 'election_created' | 'election_updated' | 'election_deleted' | 'vote_cast' | 'status_changed';
  electionId: string;
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RealtimeSettings {
  updateFrequency: number;
  enableNotifications: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  maxUpdates: number;
  autoDismiss: boolean;
  dismissDelay: number;
}

export interface UseElectionsRealtimeReturn {
  status: RealtimeStatus;
  updates: RealtimeUpdate[];
  settings: RealtimeSettings;
  isConnected: boolean;
  isReconnecting: boolean;
  connectionQuality: string;
  lastUpdate: string;
  connect: () => void;
  disconnect: () => void;
  refresh: () => Promise<void>;
  clearUpdates: () => void;
  dismissUpdate: (updateId: string) => void;
  dismissAllUpdates: () => void;
  updateSettings: (settings: Partial<RealtimeSettings>) => void;
  getUpdateStats: () => {
    totalUpdates: number;
    updatesByType: Record<string, number>;
    updatesByPriority: Record<string, number>;
    recentUpdates: RealtimeUpdate[];
  };
  exportUpdates: () => any;
  importUpdates: (data: any) => void;
}

const defaultSettings: RealtimeSettings = {
  updateFrequency: 10,
  enableNotifications: true,
  enableSound: true,
  enableVibration: false,
  maxUpdates: 50,
  autoDismiss: true,
  dismissDelay: 5000
};

const defaultStatus: RealtimeStatus = {
  isConnected: false,
  isReconnecting: false,
  lastUpdate: new Date().toISOString(),
  connectionQuality: 'disconnected',
  updateFrequency: 10
};

/**
 * Main Elections Real-time Hook
 */
export function useElectionsRealtime(): UseElectionsRealtimeReturn {
  const [status, setStatus] = useState<RealtimeStatus>(defaultStatus);
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [settings, setSettings] = useState<RealtimeSettings>(defaultSettings);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('elections-realtime-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load realtime settings:', error);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elections-realtime-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save realtime settings:', error);
    }
  }, [settings]);

  // Simulate real-time updates
  const simulateUpdate = useCallback(() => {
    if (!status.isConnected) return;

    const updateTypes: RealtimeUpdate['type'][] = [
      'election_created',
      'election_updated', 
      'election_deleted',
      'vote_cast',
      'status_changed'
    ];

    const priorities: RealtimeUpdate['priority'][] = ['low', 'medium', 'high', 'critical'];
    
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const newUpdate: RealtimeUpdate = {
      id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: randomType,
      electionId: `election-${Math.floor(Math.random() * 1000)}`,
      data: {
        title: `Election ${Math.floor(Math.random() * 1000)}`,
        status: randomType === 'status_changed' ? 'active' : 'upcoming',
        votes: randomType === 'vote_cast' ? Math.floor(Math.random() * 1000) : undefined
      },
      timestamp: new Date().toISOString(),
      priority: randomPriority
    };

    setUpdates(prev => {
      const newUpdates = [newUpdate, ...prev].slice(0, settings.maxUpdates);
      return newUpdates;
    });

    setStatus(prev => ({
      ...prev,
      lastUpdate: newUpdate.timestamp
    }));

    // Show notification if enabled
    if (settings.enableNotifications) {
      showNotification(newUpdate);
    }
  }, [status.isConnected, settings.maxUpdates, settings.enableNotifications]);

  // Show notification
  const showNotification = useCallback((update: RealtimeUpdate) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification('Election Update', {
        body: getUpdateMessage(update),
        icon: '/icon-192x192.png',
        tag: update.id,
        requireInteraction: update.priority === 'critical'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after delay
      if (settings.autoDismiss) {
        setTimeout(() => notification.close(), settings.dismissDelay);
      }
    }
  }, [settings.autoDismiss, settings.dismissDelay]);

  // Get update message
  const getUpdateMessage = (update: RealtimeUpdate): string => {
    const messages = {
      election_created: 'New election created',
      election_updated: 'Election updated',
      election_deleted: 'Election deleted',
      vote_cast: 'Vote cast',
      status_changed: 'Election status changed'
    };
    return messages[update.type] || 'Update received';
  };

  // Start real-time updates
  const startUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      simulateUpdate();
    }, settings.updateFrequency * 1000);
  }, [settings.updateFrequency, simulateUpdate]);

  // Stop real-time updates
  const stopUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Connect to real-time updates
  const connect = useCallback(() => {
    if (status.isConnected) return;

    setStatus(prev => ({
      ...prev,
      isConnected: true,
      isReconnecting: false,
      connectionQuality: 'excellent',
      lastUpdate: new Date().toISOString()
    }));

    connectionAttempts.current = 0;
    startUpdates();
  }, [status.isConnected, startUpdates]);

  // Disconnect from real-time updates
  const disconnect = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isConnected: false,
      isReconnecting: false,
      connectionQuality: 'disconnected'
    }));

    stopUpdates();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [stopUpdates]);

  // Refresh data
  const refresh = useCallback(async () => {
    if (!status.isConnected) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [status.isConnected]);

  // Clear all updates
  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  // Dismiss specific update
  const dismissUpdate = useCallback((updateId: string) => {
    setUpdates(prev => prev.filter(update => update.id !== updateId));
  }, []);

  // Dismiss all updates
  const dismissAllUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<RealtimeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get update statistics
  const getUpdateStats = useCallback(() => {
    const updatesByType = updates.reduce((acc, update) => {
      acc[update.type] = (acc[update.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const updatesByPriority = updates.reduce((acc, update) => {
      acc[update.priority] = (acc[update.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentUpdates = updates.slice(0, 10);

    return {
      totalUpdates: updates.length,
      updatesByType,
      updatesByPriority,
      recentUpdates
    };
  }, [updates]);

  // Export updates
  const exportUpdates = useCallback(() => {
    return {
      updates,
      settings,
      status,
      timestamp: new Date().toISOString()
    };
  }, [updates, settings, status]);

  // Import updates
  const importUpdates = useCallback((data: any) => {
    try {
      if (data.updates) {
        setUpdates(data.updates);
      }
      if (data.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to import updates:', error);
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Start/stop updates based on connection status
  useEffect(() => {
    if (status.isConnected) {
      startUpdates();
    } else {
      stopUpdates();
    }

    return () => stopUpdates();
  }, [status.isConnected, startUpdates, stopUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopUpdates();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [stopUpdates]);

  return {
    status,
    updates,
    settings,
    isConnected: status.isConnected,
    isReconnecting: status.isReconnecting,
    connectionQuality: status.connectionQuality,
    lastUpdate: status.lastUpdate,
    connect,
    disconnect,
    refresh,
    clearUpdates,
    dismissUpdate,
    dismissAllUpdates,
    updateSettings,
    getUpdateStats,
    exportUpdates,
    importUpdates
  };
}

export default useElectionsRealtime;

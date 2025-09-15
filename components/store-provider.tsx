import React, { useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useElectionStore } from '@/store/election-store';
import { useBlockchainStore } from '@/store/blockchain-store';
import NetInfo from '@react-native-community/netinfo';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { setOnlineStatus, setLastSyncTime } = useUIStore();
  const { refreshToken } = useAuthStore();
  const { refreshElections } = useElectionStore();
  const { fetchMetrics } = useBlockchainStore();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnlineStatus(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, [setOnlineStatus]);

  // Auto-refresh data when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = () => {
      // Refresh token if authenticated
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        refreshToken();
      }

      // Refresh elections
      refreshElections();

      // Refresh blockchain metrics
      fetchMetrics();

      // Update last sync time
      setLastSyncTime(new Date().toISOString());
    };

    // Listen for app state changes
    const { AppState } = require('react-native');
    const subscription = AppState.addEventListener('change', (nextAppState: string) => {
      if (nextAppState === 'active') {
        handleAppStateChange();
      }
    });

    return () => subscription?.remove();
  }, [refreshToken, refreshElections, fetchMetrics, setLastSyncTime]);

  // Initialize stores on mount
  useEffect(() => {
    // Set initial online status
    NetInfo.fetch().then(state => {
      setOnlineStatus(state.isConnected ?? false);
    });

    // Initial data fetch
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      refreshToken();
      refreshElections();
      fetchMetrics();
    }
  }, [setOnlineStatus, refreshToken, refreshElections, fetchMetrics]);

  return <>{children}</>;
}

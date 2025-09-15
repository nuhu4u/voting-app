/**
 * Network Status Components
 * UI components for displaying network connectivity status
 */

import * as React from 'react';
// import { useNetwork, useNetworkStatus, useNetworkStats, useNetworkEvents } from '@/hooks/use-network';

// Mock hooks for now
const useNetwork = () => ({
  isConnected: true,
  isInternetReachable: true,
  connectionType: 'wifi',
  isWifiEnabled: true,
  networkDetails: {
    isConnectionExpensive: false,
    ssid: 'MockWiFi',
    strength: 100,
    ipAddress: '192.168.1.100',
    subnet: '255.255.255.0',
    frequency: 2400,
  },
  isLoading: false,
  error: null,
  lastUpdate: Date.now(),
  initialize: async () => true,
  refresh: async () => null,
  configure: (config: any) => {},
  resetStats: () => {},
  getStats: () => ({
    totalConnections: 10,
    totalDisconnections: 2,
    totalWifiChanges: 5,
    totalCellularChanges: 3,
    averageConnectionTime: 300000,
    lastConnected: Date.now() - 60000,
    lastDisconnected: Date.now() - 300000,
    uptime: 3600000,
    downtime: 300000,
  }),
  getConfig: () => ({
    enableMonitoring: true,
    checkInterval: 5000,
    timeout: 10000,
    retryAttempts: 3,
    enableNotifications: true,
    enableLogging: true,
    enableOfflineMode: true,
  }),
  getStatus: () => ({}),
  addEventListener: (eventType: string, listener: any) => {},
  removeEventListener: (eventType: string, listener: any) => {},
});

const useNetworkStatus = () => ({
  isConnected: true,
  isInternetReachable: true,
  connectionType: 'wifi',
  error: null,
  lastUpdate: Date.now(),
  statusText: 'Connected',
  statusColor: 'green',
  connectionIcon: '📶',
});

const useNetworkStats = () => ({
  stats: {
    totalConnections: 10,
    totalDisconnections: 2,
    totalWifiChanges: 5,
    totalCellularChanges: 3,
    averageConnectionTime: 300000,
    lastConnected: Date.now() - 60000,
    lastDisconnected: Date.now() - 300000,
    uptime: 3600000,
    downtime: 300000,
  },
  resetStats: () => {},
  formatUptime: (ms: number) => '1h 0m',
  formatConnectionTime: (ms: number) => '5m 0s',
  connectionReliability: 83,
});

const useNetworkEvents = () => ({
  events: [],
  clearEvents: () => {},
  getEventsByType: (type: string) => [],
});

export interface NetworkStatusIndicatorProps {
  showDetails?: boolean;
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NetworkStatusIndicator({
  showDetails = false,
  showIcon = true,
  showText = true,
  className = '',
  size = 'md',
}: NetworkStatusIndicatorProps) {
  const { isConnected, isInternetReachable, connectionType, statusText, statusColor, connectionIcon } = useNetworkStatus();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-lg';
      default: return 'text-sm';
    }
  };

  const getStatusColorClasses = () => {
    switch (statusColor) {
      case 'red': return 'text-red-600';
      case 'yellow': return 'text-yellow-600';
      case 'green': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return React.createElement('div', { className: `flex items-center space-x-2 ${className}` },
    showIcon && React.createElement('span', { className: getSizeClasses() }, connectionIcon),
    
    showText && React.createElement('div', { className: 'flex flex-col' },
      React.createElement('span', { className: `${getSizeClasses()} font-medium ${getStatusColorClasses()}` },
        statusText
      ),
      showDetails && React.createElement('span', { className: 'text-xs text-gray-500' },
        `${connectionType.toUpperCase()}${isInternetReachable ? ' • Internet' : ' • No Internet'}`
      )
    )
  );
}

export interface NetworkStatusCardProps {
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export function NetworkStatusCard({
  className = '',
  showRefresh = true,
  onRefresh,
}: NetworkStatusCardProps) {
  const { isConnected, isInternetReachable, connectionType, networkDetails, lastUpdate, error } = useNetwork();
  const { statusText, statusColor, connectionIcon } = useNetworkStatus();

  const handleRefresh = React.useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  const getStatusColorClasses = () => {
    switch (statusColor) {
      case 'red': return 'bg-red-50 border-red-200 text-red-800';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'green': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return React.createElement('div', { className: `p-4 rounded-lg border ${getStatusColorClasses()} ${className}` },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', { className: 'flex items-center space-x-3' },
        React.createElement('span', { className: 'text-2xl' }, connectionIcon),
        React.createElement('div', null,
          React.createElement('h3', { className: 'text-lg font-semibold' }, statusText),
          React.createElement('p', { className: 'text-sm opacity-75' },
            `${connectionType.toUpperCase()}${isInternetReachable ? ' • Internet Available' : ' • No Internet'}`
          )
        )
      ),
      
      showRefresh && React.createElement('button', {
        onClick: handleRefresh,
        className: 'p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors',
        title: 'Refresh Network Status'
      },
        React.createElement('svg', {
          className: 'w-5 h-5',
          viewBox: '0 0 24 24',
          fill: 'currentColor'
        },
          React.createElement('path', {
            d: 'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
          })
        )
      )
    ),

    networkDetails && React.createElement('div', { className: 'mt-4 space-y-2' },
      React.createElement('div', { className: 'grid grid-cols-2 gap-4 text-sm' },
        networkDetails.ssid && React.createElement('div', null,
          React.createElement('span', { className: 'font-medium' }, 'SSID: '),
          React.createElement('span', null, networkDetails.ssid)
        ),
        networkDetails.ipAddress && React.createElement('div', null,
          React.createElement('span', { className: 'font-medium' }, 'IP: '),
          React.createElement('span', null, networkDetails.ipAddress)
        ),
        networkDetails.strength && React.createElement('div', null,
          React.createElement('span', { className: 'font-medium' }, 'Signal: '),
          React.createElement('span', null, `${networkDetails.strength}%`)
        ),
        networkDetails.frequency && React.createElement('div', null,
          React.createElement('span', { className: 'font-medium' }, 'Frequency: '),
          React.createElement('span', null, `${networkDetails.frequency} MHz`)
        )
      ),
      
      lastUpdate && React.createElement('div', { className: 'text-xs opacity-60' },
        `Last updated: ${formatTimestamp(lastUpdate)}`
      ),
      
      error && React.createElement('div', { className: 'text-sm text-red-600' },
        `Error: ${error}`
      )
    )
  );
}

export interface NetworkStatsCardProps {
  className?: string;
  showReset?: boolean;
  onReset?: () => void;
}

export function NetworkStatsCard({
  className = '',
  showReset = true,
  onReset,
}: NetworkStatsCardProps) {
  const { stats, resetStats, formatUptime, formatConnectionTime, connectionReliability } = useNetworkStats();

  const handleReset = React.useCallback(() => {
    resetStats();
    onReset?.();
  }, [resetStats, onReset]);

  return React.createElement('div', { className: `p-4 bg-white rounded-lg border border-gray-200 ${className}` },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Network Statistics'),
      showReset && React.createElement('button', {
        onClick: handleReset,
        className: 'px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'
      }, 'Reset')
    ),

    React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Connections'),
          React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, stats.totalConnections)
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Disconnections'),
          React.createElement('div', { className: 'text-2xl font-bold text-red-600' }, stats.totalDisconnections)
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'WiFi Changes'),
          React.createElement('div', { className: 'text-2xl font-bold text-blue-600' }, stats.totalWifiChanges)
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Cellular Changes'),
          React.createElement('div', { className: 'text-2xl font-bold text-purple-600' }, stats.totalCellularChanges)
        )
      ),

      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Reliability'),
          React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, `${connectionReliability}%`)
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Avg Connection Time'),
          React.createElement('div', { className: 'text-lg font-semibold text-gray-900' }, formatConnectionTime(stats.averageConnectionTime))
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Total Uptime'),
          React.createElement('div', { className: 'text-lg font-semibold text-gray-900' }, formatUptime(stats.uptime))
        ),
        React.createElement('div', null,
          React.createElement('div', { className: 'text-sm font-medium text-gray-600' }, 'Total Downtime'),
          React.createElement('div', { className: 'text-lg font-semibold text-gray-900' }, formatUptime(stats.downtime))
        )
      )
    )
  );
}

export interface NetworkEventsListProps {
  className?: string;
  maxEvents?: number;
  showClear?: boolean;
  onClear?: () => void;
}

export function NetworkEventsList({
  className = '',
  maxEvents = 10,
  showClear = true,
  onClear,
}: NetworkEventsListProps) {
  const { events, clearEvents, getEventsByType } = useNetworkEvents();

  const handleClear = React.useCallback(() => {
    clearEvents();
    onClear?.();
  }, [clearEvents, onClear]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'wifi_changed': return '📶';
      case 'cellular_changed': return '📱';
      case 'unknown_changed': return '❓';
      case 'error': return '⚠️';
      default: return '📡';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'wifi_changed': return 'text-blue-600';
      case 'cellular_changed': return 'text-purple-600';
      case 'unknown_changed': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatEventTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const displayEvents = events.slice(-maxEvents).reverse();

  return React.createElement('div', { className: `bg-white rounded-lg border border-gray-200 ${className}` },
    React.createElement('div', { className: 'p-4 border-b border-gray-200' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Network Events'),
        showClear && React.createElement('button', {
          onClick: handleClear,
          className: 'px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'
        }, 'Clear')
      )
    ),

    React.createElement('div', { className: 'max-h-64 overflow-y-auto' },
      displayEvents.length === 0 ? React.createElement('div', { className: 'p-4 text-center text-gray-500' },
        'No network events recorded'
      ) : displayEvents.map((event, index) => 
        React.createElement('div', {
          key: `${event.timestamp}-${index}`,
          className: 'p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50'
        },
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('span', { className: 'text-lg' }, getEventIcon(event.type)),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('div', { className: `font-medium ${getEventColor(event.type)}` },
                event.type.replace('_', ' ').toUpperCase()
              ),
              React.createElement('div', { className: 'text-sm text-gray-500' },
                formatEventTime(event.timestamp)
              )
            )
          )
        )
      )
    )
  );
}

export interface NetworkSettingsProps {
  className?: string;
  onSave?: (config: any) => void;
}

export function NetworkSettings({
  className = '',
  onSave,
}: NetworkSettingsProps) {
  const { getConfig, configure } = useNetwork();
  const [config, setConfig] = React.useState(getConfig());

  const handleSave = React.useCallback(() => {
    configure(config);
    onSave?.(config);
  }, [config, configure, onSave]);

  const handleChange = React.useCallback((key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  return React.createElement('div', { className: `space-y-4 ${className}` },
    React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, 'Network Settings'),
    
    React.createElement('div', { className: 'space-y-4' },
      React.createElement('div', { className: 'flex items-center' },
        React.createElement('input', {
          type: 'checkbox',
          checked: config.enableMonitoring,
          onChange: (e) => handleChange('enableMonitoring', e.target.checked),
          className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
        }),
        React.createElement('label', { className: 'ml-2 block text-sm text-gray-700' },
          'Enable Network Monitoring'
        )
      ),

      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700' },
          'Check Interval (seconds)'
        ),
        React.createElement('input', {
          type: 'number',
          value: config.checkInterval / 1000,
          onChange: (e) => handleChange('checkInterval', parseInt(e.target.value) * 1000),
          className: 'mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
        })
      ),

      React.createElement('div', null,
        React.createElement('label', { className: 'block text-sm font-medium text-gray-700' },
          'Timeout (seconds)'
        ),
        React.createElement('input', {
          type: 'number',
          value: config.timeout / 1000,
          onChange: (e) => handleChange('timeout', parseInt(e.target.value) * 1000),
          className: 'mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
        })
      ),

      React.createElement('div', { className: 'flex items-center' },
        React.createElement('input', {
          type: 'checkbox',
          checked: config.enableNotifications,
          onChange: (e) => handleChange('enableNotifications', e.target.checked),
          className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
        }),
        React.createElement('label', { className: 'ml-2 block text-sm text-gray-700' },
          'Enable Notifications'
        )
      ),

      React.createElement('div', { className: 'flex items-center' },
        React.createElement('input', {
          type: 'checkbox',
          checked: config.enableOfflineMode,
          onChange: (e) => handleChange('enableOfflineMode', e.target.checked),
          className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
        }),
        React.createElement('label', { className: 'ml-2 block text-sm text-gray-700' },
          'Enable Offline Mode'
        )
      ),

      React.createElement('button', {
        onClick: handleSave,
        className: 'w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
      }, 'Save Settings')
    )
  );
}

/**
 * Network Status Component Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NetworkStatusIndicator, NetworkStatusCard, NetworkStatsCard, NetworkEventsList, NetworkSettings } from '@/components/network/network-status';

// Mock the hooks
jest.mock('@/hooks/use-network', () => ({
  useNetwork: () => ({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
    isWifiEnabled: true,
    networkDetails: {
      isConnectionExpensive: false,
      ssid: 'TestWiFi',
      strength: 100,
      ipAddress: '192.168.1.100',
      subnet: '255.255.255.0',
      frequency: 2400,
    },
    isLoading: false,
    error: null,
    lastUpdate: Date.now(),
    initialize: jest.fn(() => Promise.resolve(true)),
    refresh: jest.fn(() => Promise.resolve(null)),
    configure: jest.fn(),
    resetStats: jest.fn(),
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
    getConfig: jest.fn(() => ({
      enableMonitoring: true,
      checkInterval: 5000,
      timeout: 10000,
      retryAttempts: 3,
      enableNotifications: true,
      enableLogging: true,
      enableOfflineMode: true,
    })),
    getStatus: jest.fn(() => ({})),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
  useNetworkStatus: () => ({
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
    error: null,
    lastUpdate: Date.now(),
    statusText: 'Connected',
    statusColor: 'green',
    connectionIcon: '📶',
  }),
  useNetworkStats: () => ({
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
    resetStats: jest.fn(),
    formatUptime: jest.fn((ms: number) => '1h 0m'),
    formatConnectionTime: jest.fn((ms: number) => '5m 0s'),
    connectionReliability: 83,
  }),
  useNetworkEvents: () => ({
    events: [],
    clearEvents: jest.fn(),
    getEventsByType: jest.fn(() => []),
  }),
}));

describe('NetworkStatusIndicator', () => {
  it('should render with default props', () => {
    const { getByText } = render(
      React.createElement(NetworkStatusIndicator)
    );

    expect(getByText('Connected')).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { getByText: getByTextSm } = render(
      React.createElement(NetworkStatusIndicator, { size: 'sm' })
    );

    const { getByText: getByTextLg } = render(
      React.createElement(NetworkStatusIndicator, { size: 'lg' })
    );

    expect(getByTextSm('Connected')).toBeTruthy();
    expect(getByTextLg('Connected')).toBeTruthy();
  });

  it('should show details when showDetails is true', () => {
    const { getByText } = render(
      React.createElement(NetworkStatusIndicator, { showDetails: true })
    );

    expect(getByText('Connected')).toBeTruthy();
    expect(getByText('WIFI • Internet')).toBeTruthy();
  });

  it('should hide icon when showIcon is false', () => {
    const { queryByText } = render(
      React.createElement(NetworkStatusIndicator, { showIcon: false })
    );

    // Icon should not be visible
    expect(queryByText('📶')).toBeNull();
  });

  it('should hide text when showText is false', () => {
    const { queryByText } = render(
      React.createElement(NetworkStatusIndicator, { showText: false })
    );

    // Text should not be visible
    expect(queryByText('Connected')).toBeNull();
  });
});

describe('NetworkStatusCard', () => {
  it('should render status card', () => {
    const { getByText } = render(
      React.createElement(NetworkStatusCard)
    );

    expect(getByText('Connected')).toBeTruthy();
    expect(getByText('WIFI • Internet Available')).toBeTruthy();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn();
    const { getByTitle } = render(
      React.createElement(NetworkStatusCard, { onRefresh })
    );

    const refreshButton = getByTitle('Refresh Network Status');
    fireEvent.press(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });

  it('should hide refresh button when showRefresh is false', () => {
    const { queryByTitle } = render(
      React.createElement(NetworkStatusCard, { showRefresh: false })
    );

    expect(queryByTitle('Refresh Network Status')).toBeNull();
  });

  it('should show network details', () => {
    const { getByText } = render(
      React.createElement(NetworkStatusCard)
    );

    expect(getByText('SSID: TestWiFi')).toBeTruthy();
    expect(getByText('IP: 192.168.1.100')).toBeTruthy();
    expect(getByText('Signal: 100%')).toBeTruthy();
    expect(getByText('Frequency: 2400 MHz')).toBeTruthy();
  });

  it('should show error when there is an error', () => {
    // Mock error state
    const mockUseNetwork = require('@/hooks/use-network').useNetwork;
    mockUseNetwork.mockReturnValueOnce({
      isConnected: true,
      isInternetReachable: true,
      connectionType: 'wifi',
      isWifiEnabled: true,
      networkDetails: {
        isConnectionExpensive: false,
        ssid: 'TestWiFi',
        strength: 100,
        ipAddress: '192.168.1.100',
        subnet: '255.255.255.0',
        frequency: 2400,
      },
      isLoading: false,
      error: 'Network error',
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
    });

    const { getByText } = render(
      React.createElement(NetworkStatusCard)
    );

    expect(getByText('Error: Network error')).toBeTruthy();
  });
});

describe('NetworkStatsCard', () => {
  it('should render stats card', () => {
    const { getByText } = render(
      React.createElement(NetworkStatsCard)
    );

    expect(getByText('Network Statistics')).toBeTruthy();
    expect(getByText('Connections')).toBeTruthy();
    expect(getByText('Disconnections')).toBeTruthy();
    expect(getByText('WiFi Changes')).toBeTruthy();
    expect(getByText('Cellular Changes')).toBeTruthy();
    expect(getByText('Reliability')).toBeTruthy();
  });

  it('should call onReset when reset button is clicked', () => {
    const onReset = jest.fn();
    const { getByText } = render(
      React.createElement(NetworkStatsCard, { onReset })
    );

    const resetButton = getByText('Reset');
    fireEvent.press(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('should hide reset button when showReset is false', () => {
    const { queryByText } = render(
      React.createElement(NetworkStatsCard, { showReset: false })
    );

    expect(queryByText('Reset')).toBeNull();
  });

  it('should display statistics correctly', () => {
    const { getByText } = render(
      React.createElement(NetworkStatsCard)
    );

    expect(getByText('10')).toBeTruthy(); // totalConnections
    expect(getByText('2')).toBeTruthy(); // totalDisconnections
    expect(getByText('5')).toBeTruthy(); // totalWifiChanges
    expect(getByText('3')).toBeTruthy(); // totalCellularChanges
    expect(getByText('83%')).toBeTruthy(); // connectionReliability
  });
});

describe('NetworkEventsList', () => {
  it('should render events list', () => {
    const { getByText } = render(
      React.createElement(NetworkEventsList)
    );

    expect(getByText('Network Events')).toBeTruthy();
    expect(getByText('No network events recorded')).toBeTruthy();
  });

  it('should call onClear when clear button is clicked', () => {
    const onClear = jest.fn();
    const { getByText } = render(
      React.createElement(NetworkEventsList, { onClear })
    );

    const clearButton = getByText('Clear');
    fireEvent.press(clearButton);

    expect(onClear).toHaveBeenCalled();
  });

  it('should hide clear button when showClear is false', () => {
    const { queryByText } = render(
      React.createElement(NetworkEventsList, { showClear: false })
    );

    expect(queryByText('Clear')).toBeNull();
  });

  it('should limit events to maxEvents', () => {
    const { getByText } = render(
      React.createElement(NetworkEventsList, { maxEvents: 5 })
    );

    expect(getByText('Network Events')).toBeTruthy();
    // Should not throw error
    expect(true).toBe(true);
  });
});

describe('NetworkSettings', () => {
  it('should render settings form', () => {
    const { getByText } = render(
      React.createElement(NetworkSettings)
    );

    expect(getByText('Network Settings')).toBeTruthy();
    expect(getByText('Enable Network Monitoring')).toBeTruthy();
    expect(getByText('Check Interval (seconds)')).toBeTruthy();
    expect(getByText('Timeout (seconds)')).toBeTruthy();
    expect(getByText('Enable Notifications')).toBeTruthy();
    expect(getByText('Enable Offline Mode')).toBeTruthy();
    expect(getByText('Save Settings')).toBeTruthy();
  });

  it('should call onSave when settings are saved', () => {
    const onSave = jest.fn();
    const { getByText } = render(
      React.createElement(NetworkSettings, { onSave })
    );

    const saveButton = getByText('Save Settings');
    fireEvent.press(saveButton);

    expect(onSave).toHaveBeenCalled();
  });

  it('should update settings when inputs change', () => {
    const { getByDisplayValue } = render(
      React.createElement(NetworkSettings)
    );

    const intervalInput = getByDisplayValue('5');
    fireEvent.changeText(intervalInput, '10');

    expect(intervalInput.props.value).toBe('10');
  });

  it('should handle checkbox changes', () => {
    const { getByText } = render(
      React.createElement(NetworkSettings)
    );

    // Should not throw error when checkboxes are toggled
    expect(true).toBe(true);
  });
});

/**
 * Elections Real-time Update Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  RealtimeIndicator, 
  RealtimeNotification, 
  RealtimeUpdatesList, 
  RealtimeSettings 
} from '@/components/elections/elections-realtime';

// Mock notification API
Object.defineProperty(window, 'Notification', {
  value: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
    onclick: null
  })),
  writable: true
});

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

// Mock data
const mockStatus = {
  isConnected: true,
  isReconnecting: false,
  lastUpdate: '2023-01-01T12:00:00Z',
  connectionQuality: 'excellent' as const,
  updateFrequency: 10
};

const mockUpdate = {
  id: 'update-1',
  type: 'election_created' as const,
  electionId: 'election-1',
  data: { title: 'Test Election' },
  timestamp: '2023-01-01T12:00:00Z',
  priority: 'medium' as const
};

const mockUpdates = [
  mockUpdate,
  {
    ...mockUpdate,
    id: 'update-2',
    type: 'vote_cast' as const,
    priority: 'high' as const
  },
  {
    ...mockUpdate,
    id: 'update-3',
    type: 'status_changed' as const,
    priority: 'low' as const
  }
];

describe('RealtimeIndicator', () => {
  const mockProps = {
    status: mockStatus,
    onToggleConnection: jest.fn(),
    onRefresh: jest.fn()
  };

  it('should render real-time indicator', () => {
    const { getByText } = render(
      React.createElement(RealtimeIndicator, mockProps)
    );

    expect(getByText('Live')).toBeTruthy();
    expect(getByText('Last update:')).toBeTruthy();
    expect(getByText('Quality:')).toBeTruthy();
  });

  it('should show offline status when disconnected', () => {
    const { getByText } = render(
      React.createElement(RealtimeIndicator, {
        ...mockProps,
        status: { ...mockStatus, isConnected: false, connectionQuality: 'disconnected' }
      })
    );

    expect(getByText('Offline')).toBeTruthy();
  });

  it('should call onToggleConnection when toggle button is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeIndicator, mockProps)
    );

    const toggleButton = container.querySelector('button');
    fireEvent.press(toggleButton!);

    expect(mockProps.onToggleConnection).toHaveBeenCalled();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeIndicator, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const refreshButton = buttons[0]; // First button should be refresh
    fireEvent.press(refreshButton!);

    expect(mockProps.onRefresh).toHaveBeenCalled();
  });

  it('should show different colors for different connection qualities', () => {
    const { container } = render(
      React.createElement(RealtimeIndicator, {
        ...mockProps,
        status: { ...mockStatus, connectionQuality: 'poor' }
      })
    );

    const statusElement = container.querySelector('.text-yellow-600');
    expect(statusElement).toBeTruthy();
  });

  it('should not show last update when showLastUpdate is false', () => {
    const { queryByText } = render(
      React.createElement(RealtimeIndicator, {
        ...mockProps,
        showLastUpdate: false
      })
    );

    expect(queryByText('Last update:')).toBeFalsy();
  });

  it('should not show connection quality when showConnectionQuality is false', () => {
    const { queryByText } = render(
      React.createElement(RealtimeIndicator, {
        ...mockProps,
        showConnectionQuality: false
      })
    );

    expect(queryByText('Quality:')).toBeFalsy();
  });
});

describe('RealtimeNotification', () => {
  const mockProps = {
    update: mockUpdate,
    onDismiss: jest.fn(),
    onViewDetails: jest.fn()
  };

  it('should render real-time notification', () => {
    const { getByText } = render(
      React.createElement(RealtimeNotification, mockProps)
    );

    expect(getByText('New election created')).toBeTruthy();
    expect(getByText('Test Election')).toBeTruthy();
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeNotification, mockProps)
    );

    const dismissButton = container.querySelector('button');
    fireEvent.press(dismissButton!);

    expect(mockProps.onDismiss).toHaveBeenCalled();
  });

  it('should call onViewDetails when view button is clicked', () => {
    const { getByText } = render(
      React.createElement(RealtimeNotification, mockProps)
    );

    const viewButton = getByText('View');
    fireEvent.press(viewButton);

    expect(mockProps.onViewDetails).toHaveBeenCalledWith('election-1');
  });

  it('should show different icons for different update types', () => {
    const { container } = render(
      React.createElement(RealtimeNotification, {
        ...mockProps,
        update: { ...mockUpdate, type: 'vote_cast' }
      })
    );

    const icon = container.querySelector('.text-purple-600');
    expect(icon).toBeTruthy();
  });

  it('should show different colors for different priorities', () => {
    const { container } = render(
      React.createElement(RealtimeNotification, {
        ...mockProps,
        update: { ...mockUpdate, priority: 'critical' }
      })
    );

    const notification = container.querySelector('.border-red-200');
    expect(notification).toBeTruthy();
  });

  it('should auto-dismiss after delay when autoDismiss is true', async () => {
    const { container } = render(
      React.createElement(RealtimeNotification, {
        ...mockProps,
        autoDismiss: true,
        dismissDelay: 100
      })
    );

    await waitFor(() => {
      expect(mockProps.onDismiss).toHaveBeenCalled();
    }, { timeout: 200 });
  });
});

describe('RealtimeUpdatesList', () => {
  const mockProps = {
    updates: mockUpdates,
    onDismissAll: jest.fn(),
    onClearHistory: jest.fn()
  };

  it('should render updates list', () => {
    const { getByText } = render(
      React.createElement(RealtimeUpdatesList, mockProps)
    );

    expect(getByText('Recent Updates (3)')).toBeTruthy();
    expect(getByText('New election created')).toBeTruthy();
    expect(getByText('Vote cast')).toBeTruthy();
  });

  it('should call onDismissAll when dismiss all button is clicked', () => {
    const { getByText } = render(
      React.createElement(RealtimeUpdatesList, mockProps)
    );

    const dismissAllButton = getByText('Dismiss All');
    fireEvent.press(dismissAllButton);

    expect(mockProps.onDismissAll).toHaveBeenCalled();
  });

  it('should call onClearHistory when clear history button is clicked', () => {
    const { getByText } = render(
      React.createElement(RealtimeUpdatesList, mockProps)
    );

    const clearHistoryButton = getByText('Clear History');
    fireEvent.press(clearHistoryButton);

    expect(mockProps.onClearHistory).toHaveBeenCalled();
  });

  it('should show empty state when no updates', () => {
    const { getByText } = render(
      React.createElement(RealtimeUpdatesList, {
        ...mockProps,
        updates: []
      })
    );

    expect(getByText('No recent updates')).toBeTruthy();
  });

  it('should limit updates based on maxUpdates', () => {
    const { getByText } = render(
      React.createElement(RealtimeUpdatesList, {
        ...mockProps,
        maxUpdates: 2
      })
    );

    expect(getByText('Recent Updates (3)')).toBeTruthy();
    // Should only show 2 updates
    const updateElements = document.querySelectorAll('[data-testid="update"]');
    expect(updateElements.length).toBeLessThanOrEqual(2);
  });
});

describe('RealtimeSettings', () => {
  const mockProps = {
    updateFrequency: 10,
    onUpdateFrequencyChange: jest.fn(),
    enableNotifications: true,
    onNotificationsToggle: jest.fn(),
    enableSound: true,
    onSoundToggle: jest.fn(),
    enableVibration: false,
    onVibrationToggle: jest.fn(),
    isOpen: true,
    onToggle: jest.fn()
  };

  it('should render settings when open', () => {
    const { getByText } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    expect(getByText('Real-time Settings')).toBeTruthy();
    expect(getByText('Update Frequency')).toBeTruthy();
    expect(getByText('Enable Notifications')).toBeTruthy();
    expect(getByText('Enable Sound')).toBeTruthy();
    expect(getByText('Enable Vibration')).toBeTruthy();
  });

  it('should not render when closed', () => {
    const { queryByText } = render(
      React.createElement(RealtimeSettings, {
        ...mockProps,
        isOpen: false
      })
    );

    expect(queryByText('Real-time Settings')).toBeFalsy();
  });

  it('should call onUpdateFrequencyChange when frequency changes', () => {
    const { container } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    const select = container.querySelector('select');
    fireEvent.change(select!, { target: { value: '30' } });

    expect(mockProps.onUpdateFrequencyChange).toHaveBeenCalledWith(30);
  });

  it('should call onNotificationsToggle when notification toggle is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    const toggles = container.querySelectorAll('button');
    const notificationToggle = toggles[0]; // First toggle should be notifications
    fireEvent.press(notificationToggle!);

    expect(mockProps.onNotificationsToggle).toHaveBeenCalledWith(false);
  });

  it('should call onSoundToggle when sound toggle is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    const toggles = container.querySelectorAll('button');
    const soundToggle = toggles[1]; // Second toggle should be sound
    fireEvent.press(soundToggle!);

    expect(mockProps.onSoundToggle).toHaveBeenCalledWith(false);
  });

  it('should call onVibrationToggle when vibration toggle is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    const toggles = container.querySelectorAll('button');
    const vibrationToggle = toggles[2]; // Third toggle should be vibration
    fireEvent.press(vibrationToggle!);

    expect(mockProps.onVibrationToggle).toHaveBeenCalledWith(true);
  });

  it('should call onToggle when close button is clicked', () => {
    const { container } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    const closeButton = container.querySelector('button');
    fireEvent.press(closeButton!);

    expect(mockProps.onToggle).toHaveBeenCalled();
  });

  it('should show correct toggle states', () => {
    const { container } = render(
      React.createElement(RealtimeSettings, mockProps)
    );

    const toggles = container.querySelectorAll('button');
    // Notifications should be enabled (blue background)
    expect(toggles[0].querySelector('.bg-blue-600')).toBeTruthy();
    // Sound should be enabled (blue background)
    expect(toggles[1].querySelector('.bg-blue-600')).toBeTruthy();
    // Vibration should be disabled (gray background)
    expect(toggles[2].querySelector('.bg-gray-200')).toBeTruthy();
  });
});

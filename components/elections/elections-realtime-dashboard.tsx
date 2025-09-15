/**
 * Elections Real-time Dashboard Component
 * Integrated real-time updates with elections dashboard
 */

import * as React from 'react';
import { useElectionsRealtime } from '@/hooks/use-elections-realtime';
import { 
  RealtimeIndicator, 
  RealtimeNotification, 
  RealtimeUpdatesList, 
  RealtimeSettings 
} from './elections-realtime';

export interface ElectionsRealtimeDashboardProps {
  children: React.ReactNode;
  showIndicator?: boolean;
  showUpdatesList?: boolean;
  showSettings?: boolean;
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

export interface RealtimeOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface RealtimeFloatingButtonProps {
  updateCount: number;
  onClick: () => void;
  className?: string;
}

/**
 * Real-time Overlay Component
 */
export function RealtimeOverlay({
  isVisible,
  onClose,
  children,
  className = ''
}: RealtimeOverlayProps) {
  if (!isVisible) return null;

  return React.createElement('div', {
    className: `fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 ${className}`
  },
    React.createElement('div', {
      className: 'bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden'
    },
      React.createElement('div', {
        className: 'flex items-center justify-between p-4 border-b border-gray-200'
      },
        React.createElement('h3', {
          className: 'text-lg font-medium text-gray-900'
        }, 'Real-time Updates'),
        React.createElement('button', {
          onClick: onClose,
          className: 'text-gray-400 hover:text-gray-600'
        },
          React.createElement('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M6 18L18 6M6 6l12 12'
            })
          )
        )
      ),
      React.createElement('div', {
        className: 'p-4 overflow-y-auto max-h-80'
      }, children)
    )
  );
}

/**
 * Real-time Floating Button Component
 */
export function RealtimeFloatingButton({
  updateCount,
  onClick,
  className = ''
}: RealtimeFloatingButtonProps) {
  return React.createElement('button', {
    onClick,
    className: `fixed bottom-4 right-4 z-40 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors ${className}`
  },
    React.createElement('div', { className: 'relative' },
      React.createElement('svg', {
        className: 'w-6 h-6',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7H4.828z'
        })
      ),
      updateCount > 0 && React.createElement('span', {
        className: 'absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'
      }, updateCount > 99 ? '99+' : updateCount)
    )
  );
}

/**
 * Main Elections Real-time Dashboard Component
 */
export function ElectionsRealtimeDashboard({
  children,
  showIndicator = true,
  showUpdatesList = true,
  showSettings = true,
  position = 'top',
  className = ''
}: ElectionsRealtimeDashboardProps) {
  const {
    status,
    updates,
    settings,
    connect,
    disconnect,
    refresh,
    clearUpdates,
    dismissUpdate,
    dismissAllUpdates,
    updateSettings,
    getUpdateStats
  } = useElectionsRealtime();

  const [showUpdatesOverlay, setShowUpdatesOverlay] = React.useState(false);
  const [showSettingsOverlay, setShowSettingsOverlay] = React.useState(false);
  const [localSettings, setLocalSettings] = React.useState(settings);

  // Update local settings when settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Handle settings change
  const handleSettingsChange = React.useCallback((newSettings: Partial<typeof localSettings>) => {
    const updatedSettings = { ...localSettings, ...newSettings };
    setLocalSettings(updatedSettings);
    updateSettings(updatedSettings);
  }, [localSettings, updateSettings]);

  // Handle notification click
  const handleNotificationClick = React.useCallback((electionId: string) => {
    // Navigate to election details
    console.log('Navigate to election:', electionId);
    setShowUpdatesOverlay(false);
  }, []);

  // Get recent updates for display
  const recentUpdates = updates.slice(0, 10);
  const unreadUpdates = updates.filter(update => 
    new Date(update.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
  );

  const renderIndicator = () => {
    if (!showIndicator) return null;

    return React.createElement(RealtimeIndicator, {
      status,
      onToggleConnection: status.isConnected ? disconnect : connect,
      onRefresh: refresh,
      showLastUpdate: true,
      showConnectionQuality: true,
      className: 'mb-4'
    });
  };

  const renderUpdatesList = () => {
    if (!showUpdatesList) return null;

    return React.createElement(RealtimeUpdatesList, {
      updates: recentUpdates,
      onDismissAll: dismissAllUpdates,
      onClearHistory: clearUpdates,
      maxUpdates: 10,
      showTimestamp: true
    });
  };

  const renderSettings = () => {
    if (!showSettings) return null;

    return React.createElement(RealtimeSettings, {
      updateFrequency: localSettings.updateFrequency,
      onUpdateFrequencyChange: (frequency) => handleSettingsChange({ updateFrequency: frequency }),
      enableNotifications: localSettings.enableNotifications,
      onNotificationsToggle: (enabled) => handleSettingsChange({ enableNotifications: enabled }),
      enableSound: localSettings.enableSound,
      onSoundToggle: (enabled) => handleSettingsChange({ enableSound: enabled }),
      enableVibration: localSettings.enableVibration,
      onVibrationToggle: (enabled) => handleSettingsChange({ enableVibration: enabled }),
      isOpen: showSettingsOverlay,
      onToggle: () => setShowSettingsOverlay(!showSettingsOverlay)
    });
  };

  const renderFloatingButton = () => {
    if (position !== 'floating' || unreadUpdates.length === 0) return null;

    return React.createElement(RealtimeFloatingButton, {
      updateCount: unreadUpdates.length,
      onClick: () => setShowUpdatesOverlay(true)
    });
  };

  return React.createElement('div', { className: `relative ${className}` },
    // Real-time Indicator
    position === 'top' && renderIndicator(),

    // Main Content
    React.createElement('div', { className: 'relative' },
      children,

      // Real-time Updates List (inline)
      position === 'bottom' && showUpdatesList && React.createElement('div', {
        className: 'mt-4 border-t border-gray-200 pt-4'
      }, renderUpdatesList())
    ),

    // Floating Button
    renderFloatingButton(),

    // Updates Overlay
    React.createElement(RealtimeOverlay, {
      isVisible: showUpdatesOverlay,
      onClose: () => setShowUpdatesOverlay(false)
    }, renderUpdatesList()),

    // Settings Overlay
    React.createElement(RealtimeOverlay, {
      isVisible: showSettingsOverlay,
      onClose: () => setShowSettingsOverlay(false)
    }, renderSettings()),

    // Settings Toggle Button
    showSettings && React.createElement('button', {
      onClick: () => setShowSettingsOverlay(true),
      className: 'fixed top-4 right-4 z-30 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors',
      title: 'Real-time Settings'
    },
      React.createElement('svg', {
        className: 'w-5 h-5',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
        }),
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
        })
      )
    ),

    // Real-time Status Badge
    status.isConnected && React.createElement('div', {
      className: 'fixed bottom-4 left-4 z-30 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200'
    },
      React.createElement('div', { className: 'flex items-center space-x-2' },
        React.createElement('div', {
          className: 'w-2 h-2 bg-green-500 rounded-full animate-pulse'
        }),
        React.createElement('span', {}, 'Live Updates')
      )
    )
  );
}

export default ElectionsRealtimeDashboard;

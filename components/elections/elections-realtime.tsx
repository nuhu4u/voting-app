/**
 * Elections Real-time Update Components
 * Live updates and real-time synchronization for elections
 */

import * as React from 'react';

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

export interface RealtimeIndicatorProps {
  status: RealtimeStatus;
  onToggleConnection?: () => void;
  onRefresh?: () => void;
  showLastUpdate?: boolean;
  showConnectionQuality?: boolean;
  className?: string;
}

export interface RealtimeNotificationProps {
  update: RealtimeUpdate;
  onDismiss?: () => void;
  onViewDetails?: (electionId: string) => void;
  autoDismiss?: boolean;
  dismissDelay?: number;
  className?: string;
}

export interface RealtimeUpdatesListProps {
  updates: RealtimeUpdate[];
  onDismissAll?: () => void;
  onClearHistory?: () => void;
  maxUpdates?: number;
  showTimestamp?: boolean;
  className?: string;
}

export interface RealtimeSettingsProps {
  updateFrequency: number;
  onUpdateFrequencyChange: (frequency: number) => void;
  enableNotifications: boolean;
  onNotificationsToggle: (enabled: boolean) => void;
  enableSound: boolean;
  onSoundToggle: (enabled: boolean) => void;
  enableVibration: boolean;
  onVibrationToggle: (enabled: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Real-time Status Indicator Component
 */
export function RealtimeIndicator({
  status,
  onToggleConnection,
  onRefresh,
  showLastUpdate = true,
  showConnectionQuality = true,
  className = ''
}: RealtimeIndicatorProps) {
  const getStatusColor = (quality: string) => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      poor: 'text-yellow-600 bg-yellow-100',
      disconnected: 'text-red-600 bg-red-100'
    };
    return colors[quality as keyof typeof colors] || colors.disconnected;
  };

  const getStatusIcon = (quality: string) => {
    const icons = {
      excellent: React.createElement('div', {
        className: 'w-2 h-2 bg-green-500 rounded-full animate-pulse'
      }),
      good: React.createElement('div', {
        className: 'w-2 h-2 bg-blue-500 rounded-full animate-pulse'
      }),
      poor: React.createElement('div', {
        className: 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse'
      }),
      disconnected: React.createElement('div', {
        className: 'w-2 h-2 bg-red-500 rounded-full'
      })
    };
    return icons[quality as keyof typeof icons] || icons.disconnected;
  };

  const formatLastUpdate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return React.createElement('div', {
    className: `flex items-center space-x-3 ${className}`
  },
    // Connection Status
    React.createElement('div', {
      className: 'flex items-center space-x-2'
    },
      getStatusIcon(status.connectionQuality),
      React.createElement('span', {
        className: `text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(status.connectionQuality)}`
      }, status.isConnected ? 'Live' : 'Offline')
    ),

    // Last Update
    showLastUpdate && React.createElement('div', {
      className: 'text-xs text-gray-500'
    },
      React.createElement('span', {}, 'Last update: '),
      React.createElement('span', {
        className: 'font-medium'
      }, formatLastUpdate(status.lastUpdate))
    ),

    // Connection Quality
    showConnectionQuality && React.createElement('div', {
      className: 'text-xs text-gray-500'
    },
      React.createElement('span', {}, 'Quality: '),
      React.createElement('span', {
        className: 'font-medium capitalize'
      }, status.connectionQuality)
    ),

    // Actions
    React.createElement('div', {
      className: 'flex items-center space-x-2'
    },
      onRefresh && React.createElement('button', {
        onClick: onRefresh,
        className: 'p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors',
        title: 'Refresh now'
      },
        React.createElement('svg', {
          className: 'w-4 h-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
          })
        )
      ),
      onToggleConnection && React.createElement('button', {
        onClick: onToggleConnection,
        className: `p-1 rounded transition-colors ${
          status.isConnected 
            ? 'text-red-400 hover:text-red-600 hover:bg-red-50' 
            : 'text-green-400 hover:text-green-600 hover:bg-green-50'
        }`,
        title: status.isConnected ? 'Disconnect' : 'Connect'
      },
        React.createElement('svg', {
          className: 'w-4 h-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          status.isConnected 
            ? React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728'
              })
            : React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M13 10V3L4 14h7v7l9-11h-7z'
              })
        )
      )
    )
  );
}

/**
 * Real-time Notification Component
 */
export function RealtimeNotification({
  update,
  onDismiss,
  onViewDetails,
  autoDismiss = true,
  dismissDelay = 5000,
  className = ''
}: RealtimeNotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss?.(), 300); // Allow fade out animation
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDelay, onDismiss]);

  const getUpdateIcon = (type: string) => {
    const icons = {
      election_created: React.createElement('svg', {
        className: 'w-5 h-5 text-green-600',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
        })
      ),
      election_updated: React.createElement('svg', {
        className: 'w-5 h-5 text-blue-600',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
        })
      ),
      election_deleted: React.createElement('svg', {
        className: 'w-5 h-5 text-red-600',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
        })
      ),
      vote_cast: React.createElement('svg', {
        className: 'w-5 h-5 text-purple-600',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        })
      ),
      status_changed: React.createElement('svg', {
        className: 'w-5 h-5 text-yellow-600',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        })
      )
    };
    return icons[type as keyof typeof icons] || icons.election_updated;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-gray-200 bg-gray-50',
      medium: 'border-blue-200 bg-blue-50',
      high: 'border-yellow-200 bg-yellow-50',
      critical: 'border-red-200 bg-red-50'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getUpdateMessage = (update: RealtimeUpdate) => {
    const messages = {
      election_created: 'New election created',
      election_updated: 'Election updated',
      election_deleted: 'Election deleted',
      vote_cast: 'Vote cast',
      status_changed: 'Election status changed'
    };
    return messages[update.type as keyof typeof messages] || 'Update received';
  };

  if (!isVisible) return null;

  return React.createElement('div', {
    className: `flex items-start space-x-3 p-4 border rounded-lg shadow-sm transition-all duration-300 ${getPriorityColor(update.priority)} ${className}`
  },
    getUpdateIcon(update.type),
    React.createElement('div', { className: 'flex-1 min-w-0' },
      React.createElement('p', {
        className: 'text-sm font-medium text-gray-900'
      }, getUpdateMessage(update)),
      React.createElement('p', {
        className: 'text-xs text-gray-500 mt-1'
      }, new Date(update.timestamp).toLocaleTimeString()),
      update.data?.title && React.createElement('p', {
        className: 'text-sm text-gray-700 mt-1 truncate'
      }, update.data.title)
    ),
    React.createElement('div', {
      className: 'flex items-center space-x-2'
    },
      onViewDetails && React.createElement('button', {
        onClick: () => onViewDetails(update.electionId),
        className: 'text-xs text-blue-600 hover:text-blue-800 font-medium'
      }, 'View'),
      onDismiss && React.createElement('button', {
        onClick: onDismiss,
        className: 'text-gray-400 hover:text-gray-600'
      },
        React.createElement('svg', {
          className: 'w-4 h-4',
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
    )
  );
}

/**
 * Real-time Updates List Component
 */
export function RealtimeUpdatesList({
  updates,
  onDismissAll,
  onClearHistory,
  maxUpdates = 10,
  showTimestamp = true,
  className = ''
}: RealtimeUpdatesListProps) {
  const displayUpdates = updates.slice(0, maxUpdates);

  return React.createElement('div', { className: `space-y-2 ${className}` },
    // Header
    React.createElement('div', {
      className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg'
    },
      React.createElement('h4', {
        className: 'text-sm font-medium text-gray-700'
      }, `Recent Updates (${updates.length})`),
      React.createElement('div', { className: 'flex items-center space-x-2' },
        onClearHistory && React.createElement('button', {
          onClick: onClearHistory,
          className: 'text-xs text-gray-500 hover:text-gray-700'
        }, 'Clear History'),
        onDismissAll && React.createElement('button', {
          onClick: onDismissAll,
          className: 'text-xs text-red-600 hover:text-red-800'
        }, 'Dismiss All')
      )
    ),

    // Updates List
    React.createElement('div', { className: 'space-y-2' },
      displayUpdates.length === 0 ? React.createElement('div', {
        className: 'text-center py-4 text-gray-500'
      },
        React.createElement('p', { className: 'text-sm' }, 'No recent updates')
      ) : displayUpdates.map((update) => 
        React.createElement(RealtimeNotification, {
          key: update.id,
          update,
          autoDismiss: false
        })
      )
    )
  );
}

/**
 * Real-time Settings Component
 */
export function RealtimeSettings({
  updateFrequency,
  onUpdateFrequencyChange,
  enableNotifications,
  onNotificationsToggle,
  enableSound,
  onSoundToggle,
  enableVibration,
  onVibrationToggle,
  isOpen,
  onToggle,
  className = ''
}: RealtimeSettingsProps) {
  if (!isOpen) return null;

  return React.createElement('div', {
    className: `bg-white border border-gray-300 rounded-lg shadow-lg p-4 ${className}`
  },
    React.createElement('div', {
      className: 'flex items-center justify-between mb-4'
    },
      React.createElement('h4', {
        className: 'text-lg font-medium text-gray-900'
      }, 'Real-time Settings'),
      React.createElement('button', {
        onClick: onToggle,
        className: 'text-gray-400 hover:text-gray-600'
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
            d: 'M6 18L18 6M6 6l12 12'
          })
        )
      )
    ),

    React.createElement('div', { className: 'space-y-4' },
      // Update Frequency
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('label', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Update Frequency'),
        React.createElement('select', {
          value: updateFrequency,
          onChange: (e: any) => onUpdateFrequencyChange(Number(e.target.value)),
          className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        },
          React.createElement('option', { value: 5 }, '5 seconds'),
          React.createElement('option', { value: 10 }, '10 seconds'),
          React.createElement('option', { value: 30 }, '30 seconds'),
          React.createElement('option', { value: 60 }, '1 minute')
        )
      ),

      // Notifications
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', {},
          React.createElement('label', {
            className: 'text-sm font-medium text-gray-700'
          }, 'Enable Notifications'),
          React.createElement('p', {
            className: 'text-xs text-gray-500'
          }, 'Show real-time update notifications')
        ),
        React.createElement('button', {
          onClick: () => onNotificationsToggle(!enableNotifications),
          className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enableNotifications ? 'bg-blue-600' : 'bg-gray-200'
          }`
        },
          React.createElement('span', {
            className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enableNotifications ? 'translate-x-6' : 'translate-x-1'
            }`
          })
        )
      ),

      // Sound
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', {},
          React.createElement('label', {
            className: 'text-sm font-medium text-gray-700'
          }, 'Enable Sound'),
          React.createElement('p', {
            className: 'text-xs text-gray-500'
          }, 'Play sound for notifications')
        ),
        React.createElement('button', {
          onClick: () => onSoundToggle(!enableSound),
          className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enableSound ? 'bg-blue-600' : 'bg-gray-200'
          }`
        },
          React.createElement('span', {
            className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enableSound ? 'translate-x-6' : 'translate-x-1'
            }`
          })
        )
      ),

      // Vibration
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', {},
          React.createElement('label', {
            className: 'text-sm font-medium text-gray-700'
          }, 'Enable Vibration'),
          React.createElement('p', {
            className: 'text-xs text-gray-500'
          }, 'Vibrate device for notifications')
        ),
        React.createElement('button', {
          onClick: () => onVibrationToggle(!enableVibration),
          className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enableVibration ? 'bg-blue-600' : 'bg-gray-200'
          }`
        },
          React.createElement('span', {
            className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enableVibration ? 'translate-x-6' : 'translate-x-1'
            }`
          })
        )
      )
    )
  );
}

export default RealtimeIndicator;

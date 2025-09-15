/**
 * Voter Dashboard Main Component
 * Main dashboard component that combines layout and sections
 */

import * as React from 'react';
// import { VoterDashboardLayout } from './voter-dashboard-layout';
// import { OverviewSection, ElectionsSection, VotingHistorySection, ProfileSection } from './voter-dashboard-sections';

// Import tab navigation components
const TabNavigation = React.lazy(() => import('./voter-tab-navigation'));
const TabContent = React.lazy(() => import('./voter-tab-navigation'));

// Mock components for now
const VoterDashboardLayout = ({ children, ...props }: any) => React.createElement('div', props, children);
const OverviewSection = () => React.createElement('div', { className: 'p-4' }, 'Overview Section');
const ElectionsSection = () => React.createElement('div', { className: 'p-4' }, 'Elections Section');
const VotingHistorySection = () => React.createElement('div', { className: 'p-4' }, 'Voting History Section');
const ProfileSection = () => React.createElement('div', { className: 'p-4' }, 'Profile Section');

export interface VoterDashboardProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
  showNotifications?: boolean;
  notificationCount?: number;
  className?: string;
}

export interface TabConfig {
  id: string;
  label: string;
  component: React.ComponentType;
  icon: string;
  description: string;
}

/**
 * Main Voter Dashboard Component
 */
export function VoterDashboard({
  initialTab = 'overview',
  onTabChange,
  showNotifications = true,
  notificationCount = 0,
  className = '',
}: VoterDashboardProps) {
  const [currentTab, setCurrentTab] = React.useState(initialTab);
  const [isLoading, setIsLoading] = React.useState(false);

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      component: OverviewSection,
      icon: '📊',
      description: 'Dashboard overview and quick stats'
    },
    {
      id: 'elections',
      label: 'Elections',
      component: ElectionsSection,
      icon: '🗳️',
      description: 'View and participate in elections'
    },
    {
      id: 'history',
      label: 'Voting History',
      component: VotingHistorySection,
      icon: '📋',
      description: 'Your voting history and records'
    },
    {
      id: 'profile',
      label: 'Profile',
      component: ProfileSection,
      icon: '👤',
      description: 'Manage your profile and settings'
    }
  ];

  // Handle tab change
  const handleTabChange = React.useCallback((tabId: string) => {
    setIsLoading(true);
    setCurrentTab(tabId);
    onTabChange?.(tabId);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [onTabChange]);

  // Get current tab configuration
  const currentTabConfig = tabs.find(tab => tab.id === currentTab) || tabs[0];
  const CurrentComponent = currentTabConfig.component;

  // Handle navigation events
  const handleVote = React.useCallback(() => {
    handleTabChange('elections');
  }, [handleTabChange]);

  const handleViewElections = React.useCallback(() => {
    handleTabChange('elections');
  }, [handleTabChange]);

  const handleViewHistory = React.useCallback(() => {
    handleTabChange('history');
  }, [handleTabChange]);

  const handleViewProfile = React.useCallback(() => {
    handleTabChange('profile');
  }, [handleTabChange]);

  return React.createElement(React.Suspense, {
    fallback: React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' }),
        React.createElement('p', { className: 'text-gray-600' }, 'Loading dashboard...')
      )
    )
  },
    React.createElement(VoterDashboardLayout, {
      currentTab,
      onTabChange: handleTabChange,
      showNotifications,
      notificationCount,
      className
    },
      // Tab Content
      React.createElement('div', { className: 'space-y-6' },
        // Tab Header
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('span', { className: 'text-2xl' }, currentTabConfig.icon),
            React.createElement('div', null,
              React.createElement('h1', { className: 'text-2xl font-bold text-gray-900' }, currentTabConfig.label),
              React.createElement('p', { className: 'text-sm text-gray-600' }, currentTabConfig.description)
            )
          ),
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement('span', { className: 'text-sm text-gray-500' }, 'Last updated:'),
            React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, 
              new Date().toLocaleTimeString()
            )
          )
        ),

        // Loading State
        isLoading && React.createElement('div', { className: 'flex items-center justify-center py-8' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2' }),
            React.createElement('p', { className: 'text-sm text-gray-600' }, 'Loading...')
          )
        ),

        // Tab Content
        !isLoading && React.createElement(CurrentComponent, null)
      )
    )
  );
}

/**
 * Voter Dashboard with Error Boundary
 */
export function VoterDashboardWithErrorBoundary(props: VoterDashboardProps) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      setError(new Error(error.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen bg-gray-50' },
      React.createElement('div', { className: 'max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center' },
        React.createElement('div', { className: 'mb-6' },
          React.createElement('div', { className: 'mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4' },
            React.createElement('span', { className: 'text-2xl' }, '⚠️')
          ),
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Dashboard Error'),
          React.createElement('p', { className: 'text-gray-600 mb-4' }, 
            'Something went wrong while loading the dashboard. Please try refreshing the page.'
          ),
          error && React.createElement('details', { className: 'text-left text-sm text-gray-500 mb-4' },
            React.createElement('summary', { className: 'cursor-pointer' }, 'Error Details'),
            React.createElement('pre', { className: 'mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto' }, 
              error.message
            )
          )
        ),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('button', {
            onClick: () => window.location.reload(),
            className: 'w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }, 'Refresh Page'),
          React.createElement('button', {
            onClick: () => setHasError(false),
            className: 'w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500'
          }, 'Try Again')
        )
      )
    );
  }

  return React.createElement(VoterDashboard, props);
}

/**
 * Voter Dashboard Hook
 */
export function useVoterDashboard() {
  const [currentTab, setCurrentTab] = React.useState('overview');
  const [isLoading, setIsLoading] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  const changeTab = React.useCallback((tabId: string) => {
    setIsLoading(true);
    setCurrentTab(tabId);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const addNotification = React.useCallback((notification: any) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
  }, []);

  const removeNotification = React.useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    currentTab,
    isLoading,
    notifications,
    changeTab,
    addNotification,
    removeNotification,
    clearNotifications
  };
}

export default VoterDashboardWithErrorBoundary;

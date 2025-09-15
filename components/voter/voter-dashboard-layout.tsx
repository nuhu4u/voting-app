/**
 * Voter Dashboard Layout Component
 * Main layout component for the voter dashboard
 */

import * as React from 'react';
// import { View, Text, ScrollView, SafeAreaView, StatusBar } from 'react-native';
// import { useAuth } from '@/hooks/use-auth';
// import { useSession } from '@/hooks/use-session';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Avatar } from '@/components/ui/avatar';
// import { Bell, Settings, LogOut, User, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';

// Mock components for now
const View = ({ children, ...props }: any) => React.createElement('div', props, children);
const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
const SafeAreaView = ({ children, ...props }: any) => React.createElement('div', props, children);
const StatusBar = ({ ...props }: any) => React.createElement('div', props);

const useAuth = () => ({
  user: {
    id: '1',
    email: 'voter@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['voter'],
    permissions: ['vote', 'view_elections'],
    status: 'active',
    profileImage: null,
    lastLoginAt: new Date().toISOString(),
  },
  logout: jest.fn(() => Promise.resolve({ success: true })),
});

const useSession = () => ({
  session: {
    userId: '1',
    email: 'voter@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['voter'],
    permissions: ['vote', 'view_elections'],
    status: 'active',
    lastActivityAt: new Date().toISOString(),
    sessionId: 'session_123',
    isActive: true,
  },
  isSessionActive: true,
  sessionStats: {
    timeUntilExpiry: 25,
    timeSinceLastActivity: 2,
  },
});

const Button = ({ children, ...props }: any) => React.createElement('button', props, children);
const Card = ({ children, ...props }: any) => React.createElement('div', props, children);
const Badge = ({ children, ...props }: any) => React.createElement('span', props, children);
const Avatar = ({ ...props }: any) => React.createElement('div', props);

// Mock icons
const Bell = () => React.createElement('span', { className: 'text-gray-600' }, '🔔');
const Settings = () => React.createElement('span', { className: 'text-gray-600' }, '⚙️');
const LogOut = () => React.createElement('span', { className: 'text-gray-600' }, '🚪');
const User = () => React.createElement('span', { className: 'text-gray-600' }, '👤');
const Shield = () => React.createElement('span', { className: 'text-gray-600' }, '🛡️');
const Clock = () => React.createElement('span', { className: 'text-gray-600' }, '🕐');
const CheckCircle = () => React.createElement('span', { className: 'text-green-600' }, '✅');
const AlertCircle = () => React.createElement('span', { className: 'text-orange-600' }, '⚠️');

export interface VoterDashboardLayoutProps {
  children: React.ReactNode;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  showNotifications?: boolean;
  notificationCount?: number;
  className?: string;
}

export interface DashboardHeaderProps {
  user: any;
  sessionStats: any;
  onLogout: () => void;
  onSettings: () => void;
  onNotifications: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

export interface DashboardSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  user: any;
}

export interface DashboardStatsProps {
  stats: {
    totalElections: number;
    votedElections: number;
    pendingElections: number;
    upcomingElections: number;
  };
}

export interface DashboardQuickActionsProps {
  onVote: () => void;
  onViewElections: () => void;
  onViewHistory: () => void;
  onViewProfile: () => void;
}

/**
 * Dashboard Header Component
 */
export function DashboardHeader({
  user,
  sessionStats,
  onLogout,
  onSettings,
  onNotifications,
  showNotifications = true,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  return React.createElement('header', { className: 'bg-white border-b border-gray-200 px-4 py-3' },
    React.createElement('div', { className: 'flex items-center justify-between' },
      // Logo and Title
      React.createElement('div', { className: 'flex items-center space-x-3' },
        React.createElement('div', { className: 'w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center' },
          React.createElement(Text, { className: 'text-white font-bold text-sm' }, 'V')
        ),
        React.createElement('div', null,
          React.createElement(Text, { className: 'text-lg font-semibold text-gray-900' }, 'Voter Dashboard'),
          React.createElement(Text, { className: 'text-xs text-gray-500' }, 'Nigerian E-Voting System')
        )
      ),

      // User Info and Actions
      React.createElement('div', { className: 'flex items-center space-x-4' },
        // Session Status
        React.createElement('div', { className: 'hidden md:flex items-center space-x-2 text-xs text-gray-500' },
          React.createElement(Shield, null),
          React.createElement(Text, null, `Session: ${sessionStats.timeUntilExpiry}m left`)
        ),

        // Notifications
        showNotifications && React.createElement('button', {
          onClick: onNotifications,
          className: 'relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
        },
          React.createElement(Bell, null),
          notificationCount > 0 && React.createElement(Badge, {
            className: 'absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'
          }, notificationCount)
        ),

        // Settings
        React.createElement('button', {
          onClick: onSettings,
          className: 'p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
        },
          React.createElement(Settings, null)
        ),

        // User Profile Dropdown
        React.createElement('div', { className: 'relative' },
          React.createElement('button', {
            onClick: () => setIsProfileOpen(!isProfileOpen),
            className: 'flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors'
          },
            React.createElement(Avatar, {
              className: 'w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'
            },
              React.createElement(User, null)
            ),
            React.createElement('div', { className: 'hidden md:block text-left' },
              React.createElement(Text, { className: 'text-sm font-medium text-gray-900' }, `${user.firstName} ${user.lastName}`),
              React.createElement(Text, { className: 'text-xs text-gray-500' }, user.email)
            )
          ),

          // Profile Dropdown Menu
          isProfileOpen && React.createElement('div', {
            className: 'absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'
          },
            React.createElement('button', {
              onClick: () => {
                setIsProfileOpen(false);
                // Handle profile view
              },
              className: 'w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
            },
              React.createElement(User, null),
              React.createElement(Text, null, 'View Profile')
            ),
            React.createElement('button', {
              onClick: () => {
                setIsProfileOpen(false);
                onSettings();
              },
              className: 'w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
            },
              React.createElement(Settings, null),
              React.createElement(Text, null, 'Settings')
            ),
            React.createElement('div', { className: 'border-t border-gray-200 my-1' }),
            React.createElement('button', {
              onClick: () => {
                setIsProfileOpen(false);
                onLogout();
              },
              className: 'w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2'
            },
              React.createElement(LogOut, null),
              React.createElement(Text, null, 'Logout')
            )
          )
        )
      )
    )
  );
}

/**
 * Dashboard Sidebar Component
 */
export function DashboardSidebar({
  currentTab,
  onTabChange,
  user,
}: DashboardSidebarProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'elections', label: 'Elections', icon: '🗳️' },
    { id: 'history', label: 'Voting History', icon: '📋' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return React.createElement('aside', { className: 'w-64 bg-gray-50 border-r border-gray-200 min-h-screen' },
    React.createElement('div', { className: 'p-4' },
      // User Info Card
      React.createElement(Card, { className: 'p-4 bg-white border border-gray-200 rounded-lg mb-6' },
        React.createElement('div', { className: 'flex items-center space-x-3' },
          React.createElement(Avatar, {
            className: 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'
          },
            React.createElement(User, null)
          ),
          React.createElement('div', { className: 'flex-1' },
            React.createElement(Text, { className: 'font-medium text-gray-900' }, `${user.firstName} ${user.lastName}`),
            React.createElement(Text, { className: 'text-sm text-gray-500' }, user.email),
            React.createElement(Badge, {
              className: 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1'
            },
              React.createElement(CheckCircle, null),
              React.createElement(Text, { className: 'ml-1' }, 'Active Voter')
            )
          )
        )
      ),

      // Navigation Tabs
      React.createElement('nav', { className: 'space-y-1' },
        tabs.map((tab) => 
          React.createElement('button', {
            key: tab.id,
            onClick: () => onTabChange(tab.id),
            className: `w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              currentTab === tab.id
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
            }`
          },
            React.createElement('span', { className: 'text-lg' }, tab.icon),
            React.createElement(Text, { className: 'font-medium' }, tab.label)
          )
        )
      ),

      // Quick Stats
      React.createElement('div', { className: 'mt-8' },
        React.createElement(Text, { className: 'text-xs font-medium text-gray-500 uppercase tracking-wide mb-3' }, 'Quick Stats'),
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'flex items-center justify-between text-sm' },
            React.createElement(Text, { className: 'text-gray-600' }, 'Elections Voted'),
            React.createElement(Badge, { className: 'bg-blue-100 text-blue-800' }, '3')
          ),
          React.createElement('div', { className: 'flex items-center justify-between text-sm' },
            React.createElement(Text, { className: 'text-gray-600' }, 'Pending Votes'),
            React.createElement(Badge, { className: 'bg-orange-100 text-orange-800' }, '1')
          ),
          React.createElement('div', { className: 'flex items-center justify-between text-sm' },
            React.createElement(Text, { className: 'text-gray-600' }, 'Upcoming'),
            React.createElement(Badge, { className: 'bg-green-100 text-green-800' }, '2')
          )
        )
      )
    )
  );
}

/**
 * Dashboard Stats Component
 */
export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      label: 'Total Elections',
      value: stats.totalElections,
      icon: '🗳️',
      color: 'blue',
      description: 'All available elections'
    },
    {
      label: 'Voted Elections',
      value: stats.votedElections,
      icon: '✅',
      color: 'green',
      description: 'Elections you\'ve voted in'
    },
    {
      label: 'Pending Elections',
      value: stats.pendingElections,
      icon: '⏳',
      color: 'orange',
      description: 'Elections awaiting your vote'
    },
    {
      label: 'Upcoming Elections',
      value: stats.upcomingElections,
      icon: '📅',
      color: 'purple',
      description: 'Elections starting soon'
    }
  ];

  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
    statItems.map((item, index) => 
      React.createElement(Card, {
        key: index,
        className: `p-4 border-l-4 border-${item.color}-500 bg-white hover:shadow-md transition-shadow`
      },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement(Text, { className: 'text-2xl font-bold text-gray-900' }, item.value),
            React.createElement(Text, { className: 'text-sm font-medium text-gray-600' }, item.label),
            React.createElement(Text, { className: 'text-xs text-gray-500 mt-1' }, item.description)
          ),
          React.createElement('div', { className: `text-3xl text-${item.color}-500` }, item.icon)
        )
      )
    )
  );
}

/**
 * Dashboard Quick Actions Component
 */
export function DashboardQuickActions({
  onVote,
  onViewElections,
  onViewHistory,
  onViewProfile,
}: DashboardQuickActionsProps) {
  const actions = [
    {
      label: 'Vote Now',
      description: 'Cast your vote in active elections',
      icon: '🗳️',
      color: 'blue',
      onClick: onVote
    },
    {
      label: 'View Elections',
      description: 'Browse all available elections',
      icon: '📋',
      color: 'green',
      onClick: onViewElections
    },
    {
      label: 'Voting History',
      description: 'See your past voting records',
      icon: '📊',
      color: 'purple',
      onClick: onViewHistory
    },
    {
      label: 'Update Profile',
      description: 'Manage your account settings',
      icon: '👤',
      color: 'orange',
      onClick: onViewProfile
    }
  ];

  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
    actions.map((action, index) => 
      React.createElement(Card, {
        key: index,
        className: 'p-4 bg-white hover:shadow-md transition-shadow cursor-pointer border border-gray-200'
      },
        React.createElement('button', {
          onClick: action.onClick,
          className: 'w-full text-left'
        },
          React.createElement('div', { className: 'flex items-center space-x-3 mb-2' },
            React.createElement('div', { className: `text-2xl text-${action.color}-500` }, action.icon),
            React.createElement(Text, { className: 'font-medium text-gray-900' }, action.label)
          ),
          React.createElement(Text, { className: 'text-sm text-gray-600' }, action.description)
        )
      )
    )
  );
}

/**
 * Main Voter Dashboard Layout Component
 */
export function VoterDashboardLayout({
  children,
  currentTab = 'overview',
  onTabChange,
  showNotifications = true,
  notificationCount = 0,
  className = '',
}: VoterDashboardLayoutProps) {
  const auth = useAuth();
  const session = useSession();

  const handleLogout = React.useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [auth]);

  const handleSettings = React.useCallback(() => {
    onTabChange?.('settings');
  }, [onTabChange]);

  const handleNotifications = React.useCallback(() => {
    // Handle notifications
    console.log('Notifications clicked');
  }, []);

  const handleVote = React.useCallback(() => {
    onTabChange?.('elections');
  }, [onTabChange]);

  const handleViewElections = React.useCallback(() => {
    onTabChange?.('elections');
  }, [onTabChange]);

  const handleViewHistory = React.useCallback(() => {
    onTabChange?.('history');
  }, [onTabChange]);

  const handleViewProfile = React.useCallback(() => {
    onTabChange?.('profile');
  }, [onTabChange]);

  // Mock stats data
  const stats = {
    totalElections: 12,
    votedElections: 8,
    pendingElections: 2,
    upcomingElections: 2,
  };

  return React.createElement(SafeAreaView, { className: 'min-h-screen bg-gray-50' },
    React.createElement(StatusBar, { barStyle: 'dark-content', backgroundColor: '#ffffff' }),
    
    React.createElement('div', { className: `flex h-screen ${className}` },
      // Sidebar
      React.createElement(DashboardSidebar, {
        currentTab,
        onTabChange: onTabChange || (() => {}),
        user: auth.user
      }),

      // Main Content Area
      React.createElement('div', { className: 'flex-1 flex flex-col overflow-hidden' },
        // Header
        React.createElement(DashboardHeader, {
          user: auth.user,
          sessionStats: session.sessionStats,
          onLogout: handleLogout,
          onSettings: handleSettings,
          onNotifications: handleNotifications,
          showNotifications,
          notificationCount
        }),

        // Main Content
        React.createElement(ScrollView, {
          className: 'flex-1 p-6',
          showsVerticalScrollIndicator: false
        },
          // Dashboard Stats
          currentTab === 'overview' && React.createElement(DashboardStats, { stats }),

          // Quick Actions
          currentTab === 'overview' && React.createElement(DashboardQuickActions, {
            onVote: handleVote,
            onViewElections: handleViewElections,
            onViewHistory: handleViewHistory,
            onViewProfile: handleViewProfile
          }),

          // Tab Content
          React.createElement('div', { className: 'flex-1' }, children)
        )
      )
    )
  );
}

export default VoterDashboardLayout;

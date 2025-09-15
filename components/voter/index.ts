/**
 * Voter Components Index
 * Export all voter-related components
 */

// Main dashboard components
export { VoterDashboard, VoterDashboardWithErrorBoundary, useVoterDashboard } from './voter-dashboard';
export { VoterDashboardLayout } from './voter-dashboard-layout';
export { 
  OverviewSection, 
  ElectionsSection, 
  VotingHistorySection, 
  ProfileSection 
} from './voter-dashboard-sections';

// Profile components
export { 
  VoterProfileSection, 
  ProfileHeader, 
  ProfileForm, 
  ProfileStats 
} from './voter-profile';

// Tab navigation components
export { 
  TabNavigation, 
  TabContent, 
  TabIndicator, 
  TabDropdown 
} from './voter-tab-navigation';

// Election list components
export { 
  ElectionCard, 
  ElectionFilters, 
  ElectionList 
} from './voter-election-list';

// Voting history components
export { 
  VotingRecordCard, 
  VotingStatsCard, 
  VotingHistory 
} from './voter-voting-history';

// Dashboard analytics components
export { 
  AnalyticsCard, 
  SimpleChart, 
  AchievementCard, 
  InsightCard, 
  AnalyticsOverview 
} from './voter-dashboard-analytics';

// Layout components
export { 
  DashboardHeader, 
  DashboardSidebar, 
  DashboardStats, 
  DashboardQuickActions 
} from './voter-dashboard-layout';

// Types
export type { 
  VoterDashboardLayoutProps,
  DashboardHeaderProps,
  DashboardSidebarProps,
  DashboardStatsProps,
  DashboardQuickActionsProps
} from './voter-dashboard-layout';

export type { 
  Election, 
  VotingRecord, 
  UserProfile 
} from './voter-dashboard-sections';

export type { 
  TabConfig 
} from './voter-dashboard';

// Default export
export { default } from './voter-dashboard';

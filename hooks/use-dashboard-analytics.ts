/**
 * Dashboard Analytics Hooks
 * Custom hooks for dashboard analytics and insights
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface AnalyticsData {
  overview: {
    totalElections: number;
    totalVotes: number;
    participationRate: number;
    successRate: number;
    averageVoteTime: number;
    votingStreak: number;
    lastVoteDate: string;
    accountAge: number;
  };
  votingPatterns: {
    monthlyVotes: Array<{ month: string; votes: number }>;
    hourlyDistribution: Array<{ hour: number; votes: number }>;
    categoryBreakdown: Array<{ category: string; votes: number; percentage: number }>;
    partyBreakdown: Array<{ party: string; votes: number; percentage: number }>;
    methodBreakdown: Array<{ method: string; votes: number; percentage: number }>;
  };
  trends: {
    votingFrequency: number;
    participationTrend: 'increasing' | 'decreasing' | 'stable';
    favoriteCategory: string;
    mostVotedParty: string;
    peakVotingHour: number;
    averageVotesPerMonth: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
  }>;
  insights: Array<{
    id: string;
    type: 'info' | 'warning' | 'success' | 'tip';
    title: string;
    message: string;
    action?: string;
  }>;
}

export interface UseDashboardAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  exportData: () => void;
  getInsightById: (id: string) => AnalyticsData['insights'][0] | null;
  getAchievementById: (id: string) => AnalyticsData['achievements'][0] | null;
}

/**
 * Main Dashboard Analytics Hook
 */
export function useDashboardAnalytics(userId?: string): UseDashboardAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    overview: {
      totalElections: 12,
      totalVotes: 15,
      participationRate: 85,
      successRate: 95,
      averageVoteTime: 3.2,
      votingStreak: 7,
      lastVoteDate: '2023-02-25T10:30:00Z',
      accountAge: 365
    },
    votingPatterns: {
      monthlyVotes: [
        { month: '2023-01', votes: 3 },
        { month: '2023-02', votes: 5 },
        { month: '2023-03', votes: 4 },
        { month: '2023-04', votes: 2 },
        { month: '2023-05', votes: 1 }
      ],
      hourlyDistribution: [
        { hour: 9, votes: 2 },
        { hour: 10, votes: 4 },
        { hour: 11, votes: 3 },
        { hour: 14, votes: 3 },
        { hour: 15, votes: 2 },
        { hour: 16, votes: 1 }
      ],
      categoryBreakdown: [
        { category: 'Presidential', votes: 4, percentage: 27 },
        { category: 'Senate', votes: 3, percentage: 20 },
        { category: 'House of Reps', votes: 3, percentage: 20 },
        { category: 'Governor', votes: 2, percentage: 13 },
        { category: 'State Assembly', votes: 2, percentage: 13 },
        { category: 'Local Government', votes: 1, percentage: 7 }
      ],
      partyBreakdown: [
        { party: 'Progressive Party', votes: 6, percentage: 40 },
        { party: 'Democratic Alliance', votes: 4, percentage: 27 },
        { party: 'Conservative Party', votes: 3, percentage: 20 },
        { party: 'Independent', votes: 2, percentage: 13 }
      ],
      methodBreakdown: [
        { method: 'online', votes: 8, percentage: 53 },
        { method: 'hybrid', votes: 4, percentage: 27 },
        { method: 'offline', votes: 3, percentage: 20 }
      ]
    },
    trends: {
      votingFrequency: 2.5,
      participationTrend: 'increasing',
      favoriteCategory: 'Presidential',
      mostVotedParty: 'Progressive Party',
      peakVotingHour: 10,
      averageVotesPerMonth: 3.0
    },
    achievements: [
      {
        id: 'first_vote',
        title: 'First Vote',
        description: 'Cast your first vote in an election',
        icon: '🗳️',
        unlocked: true,
        unlockedAt: '2023-01-15T10:30:00Z'
      },
      {
        id: 'voting_streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day voting streak',
        icon: '🔥',
        unlocked: true,
        unlockedAt: '2023-02-25T10:30:00Z'
      },
      {
        id: 'voting_streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day voting streak',
        icon: '🏆',
        unlocked: false,
        progress: 23
      },
      {
        id: 'category_explorer',
        title: 'Category Explorer',
        description: 'Vote in 5 different election categories',
        icon: '🗺️',
        unlocked: true,
        unlockedAt: '2023-02-20T14:15:00Z'
      },
      {
        id: 'party_diversity',
        title: 'Party Diversity',
        description: 'Vote for candidates from 3 different parties',
        icon: '🌈',
        unlocked: true,
        unlockedAt: '2023-02-10T09:45:00Z'
      },
      {
        id: 'method_master',
        title: 'Method Master',
        description: 'Use all three voting methods (online, hybrid, offline)',
        icon: '⚡',
        unlocked: false,
        progress: 67
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Vote within the first hour of election opening',
        icon: '🐦',
        unlocked: false,
        progress: 0
      },
      {
        id: 'loyal_voter',
        title: 'Loyal Voter',
        description: 'Participate in 10 elections',
        icon: '💎',
        unlocked: false,
        progress: 80
      }
    ],
    insights: [
      {
        id: 'participation_trend',
        type: 'success',
        title: 'Great Participation!',
        message: 'Your voting participation has increased by 15% this month compared to last month.',
        action: 'View Details'
      },
      {
        id: 'peak_hour',
        type: 'info',
        title: 'Peak Voting Time',
        message: 'You tend to vote most frequently between 10-11 AM. Consider this for future elections.',
        action: 'Set Reminder'
      },
      {
        id: 'category_balance',
        type: 'tip',
        title: 'Category Balance',
        message: 'You\'ve voted in 4 different election categories. Try exploring local government elections too!',
        action: 'Browse Elections'
      },
      {
        id: 'streak_reminder',
        type: 'warning',
        title: 'Streak Alert',
        message: 'You\'re 3 days away from breaking your voting streak. Don\'t miss the next election!',
        action: 'View Upcoming'
      },
      {
        id: 'achievement_progress',
        type: 'info',
        title: 'Achievement Progress',
        message: 'You\'re 80% complete on the "Loyal Voter" achievement. Just 2 more elections to go!',
        action: 'View Achievements'
      }
    ]
  };

  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData(mockAnalyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Export data
  const exportData = useCallback(() => {
    if (!data) return;

    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      userId: userId || 'anonymous'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${userId || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, userId]);

  // Get insight by ID
  const getInsightById = useCallback((id: string) => {
    return data?.insights.find(insight => insight.id === id) || null;
  }, [data]);

  // Get achievement by ID
  const getAchievementById = useCallback((id: string) => {
    return data?.achievements.find(achievement => achievement.id === id) || null;
  }, [data]);

  // Load data on mount
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return {
    data,
    isLoading,
    error,
    refreshData,
    exportData,
    getInsightById,
    getAchievementById
  };
}

/**
 * Analytics Insights Hook
 */
export function useAnalyticsInsights(analyticsData: AnalyticsData | null) {
  const insights = useMemo(() => {
    if (!analyticsData) return [];

    const generatedInsights = [];

    // Participation insights
    if (analyticsData.overview.participationRate > 80) {
      generatedInsights.push({
        id: 'high_participation',
        type: 'success' as const,
        title: 'Excellent Participation',
        message: `Your participation rate of ${analyticsData.overview.participationRate}% is above average!`,
        action: 'Share Achievement'
      });
    }

    // Streak insights
    if (analyticsData.overview.votingStreak >= 7) {
      generatedInsights.push({
        id: 'streak_milestone',
        type: 'success' as const,
        title: 'Streak Milestone',
        message: `You've maintained a ${analyticsData.overview.votingStreak}-day voting streak!`,
        action: 'View Streak'
      });
    }

    // Category diversity insights
    const uniqueCategories = analyticsData.votingPatterns.categoryBreakdown.length;
    if (uniqueCategories >= 4) {
      generatedInsights.push({
        id: 'category_diversity',
        type: 'info' as const,
        title: 'Category Diversity',
        message: `You've participated in ${uniqueCategories} different election categories. Great variety!`,
        action: 'Explore More'
      });
    }

    // Party diversity insights
    const uniqueParties = analyticsData.votingPatterns.partyBreakdown.length;
    if (uniqueParties >= 3) {
      generatedInsights.push({
        id: 'party_diversity',
        type: 'info' as const,
        title: 'Party Diversity',
        message: `You've voted for candidates from ${uniqueParties} different parties.`,
        action: 'View History'
      });
    }

    // Peak hour insights
    const peakHour = analyticsData.trends.peakVotingHour;
    if (peakHour >= 9 && peakHour <= 11) {
      generatedInsights.push({
        id: 'morning_voter',
        type: 'tip' as const,
        title: 'Morning Voter',
        message: `You prefer voting in the morning (${peakHour}:00). Consider setting morning reminders for elections.`,
        action: 'Set Reminder'
      });
    }

    // Success rate insights
    if (analyticsData.overview.successRate >= 95) {
      generatedInsights.push({
        id: 'high_success_rate',
        type: 'success' as const,
        title: 'High Success Rate',
        message: `Your vote success rate of ${analyticsData.overview.successRate}% is excellent!`,
        action: 'View Details'
      });
    }

    return generatedInsights;
  }, [analyticsData]);

  return insights;
}

/**
 * Analytics Trends Hook
 */
export function useAnalyticsTrends(analyticsData: AnalyticsData | null) {
  const trends = useMemo(() => {
    if (!analyticsData) return null;

    const monthlyData = analyticsData.votingPatterns.monthlyVotes;
    const recentMonths = monthlyData.slice(-3);
    const olderMonths = monthlyData.slice(-6, -3);

    const recentAverage = recentMonths.reduce((sum, month) => sum + month.votes, 0) / recentMonths.length;
    const olderAverage = olderMonths.length > 0 ? 
      olderMonths.reduce((sum, month) => sum + month.votes, 0) / olderMonths.length : 0;

    const trendDirection = recentAverage > olderAverage ? 'increasing' : 
                          recentAverage < olderAverage ? 'decreasing' : 'stable';

    const trendPercentage = olderAverage > 0 ? 
      Math.abs(((recentAverage - olderAverage) / olderAverage) * 100) : 0;

    return {
      direction: trendDirection,
      percentage: trendPercentage,
      recentAverage,
      olderAverage,
      isSignificant: trendPercentage > 10
    };
  }, [analyticsData]);

  return trends;
}

/**
 * Analytics Achievements Hook
 */
export function useAnalyticsAchievements(analyticsData: AnalyticsData | null) {
  const achievements = useMemo(() => {
    if (!analyticsData) return { unlocked: [], locked: [], progress: [] };

    const unlocked = analyticsData.achievements.filter(a => a.unlocked);
    const locked = analyticsData.achievements.filter(a => !a.unlocked);
    const progress = analyticsData.achievements.filter(a => !a.unlocked && a.progress && a.progress > 0);

    return {
      unlocked,
      locked,
      progress,
      total: analyticsData.achievements.length,
      unlockedCount: unlocked.length,
      lockedCount: locked.length,
      progressCount: progress.length
    };
  }, [analyticsData]);

  return achievements;
}

export default useDashboardAnalytics;

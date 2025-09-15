/**
 * Dashboard Analytics Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useDashboardAnalytics, 
  useAnalyticsInsights, 
  useAnalyticsTrends, 
  useAnalyticsAchievements 
} from '@/hooks/use-dashboard-analytics';

describe('useDashboardAnalytics', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useDashboardAnalytics('1'));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load analytics data', async () => {
    const { result } = renderHook(() => useDashboardAnalytics('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1600));
    });

    expect(result.current.data).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.overview.totalElections).toBe(12);
    expect(result.current.data?.overview.totalVotes).toBe(15);
  });

  it('should refresh data', async () => {
    const { result } = renderHook(() => useDashboardAnalytics('1'));

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1600));
    });

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.data).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('should export data', () => {
    const { result } = renderHook(() => useDashboardAnalytics('1'));

    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    const mockCreateElement = jest.fn(() => mockLink);
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    });
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true
    });

    // Set data first
    act(() => {
      result.current.data = {
        overview: { totalElections: 5, totalVotes: 8, participationRate: 80, successRate: 90, averageVoteTime: 3, votingStreak: 5, lastVoteDate: '2023-01-01', accountAge: 100 },
        votingPatterns: { monthlyVotes: [], hourlyDistribution: [], categoryBreakdown: [], partyBreakdown: [], methodBreakdown: [] },
        trends: { votingFrequency: 2, participationTrend: 'stable', favoriteCategory: 'Presidential', mostVotedParty: 'Party A', peakVotingHour: 10, averageVotesPerMonth: 2 },
        achievements: [],
        insights: []
      };
    });

    act(() => {
      result.current.exportData();
    });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });

  it('should get insight by ID', () => {
    const { result } = renderHook(() => useDashboardAnalytics('1'));

    act(() => {
      result.current.data = {
        overview: { totalElections: 5, totalVotes: 8, participationRate: 80, successRate: 90, averageVoteTime: 3, votingStreak: 5, lastVoteDate: '2023-01-01', accountAge: 100 },
        votingPatterns: { monthlyVotes: [], hourlyDistribution: [], categoryBreakdown: [], partyBreakdown: [], methodBreakdown: [] },
        trends: { votingFrequency: 2, participationTrend: 'stable', favoriteCategory: 'Presidential', mostVotedParty: 'Party A', peakVotingHour: 10, averageVotesPerMonth: 2 },
        achievements: [],
        insights: [
          { id: 'test-insight', type: 'info', title: 'Test Insight', message: 'Test message' }
        ]
      };
    });

    const insight = result.current.getInsightById('test-insight');
    expect(insight?.title).toBe('Test Insight');
  });

  it('should get achievement by ID', () => {
    const { result } = renderHook(() => useDashboardAnalytics('1'));

    act(() => {
      result.current.data = {
        overview: { totalElections: 5, totalVotes: 8, participationRate: 80, successRate: 90, averageVoteTime: 3, votingStreak: 5, lastVoteDate: '2023-01-01', accountAge: 100 },
        votingPatterns: { monthlyVotes: [], hourlyDistribution: [], categoryBreakdown: [], partyBreakdown: [], methodBreakdown: [] },
        trends: { votingFrequency: 2, participationTrend: 'stable', favoriteCategory: 'Presidential', mostVotedParty: 'Party A', peakVotingHour: 10, averageVotesPerMonth: 2 },
        achievements: [
          { id: 'test-achievement', title: 'Test Achievement', description: 'Test description', icon: '🏆', unlocked: true }
        ],
        insights: []
      };
    });

    const achievement = result.current.getAchievementById('test-achievement');
    expect(achievement?.title).toBe('Test Achievement');
  });
});

describe('useAnalyticsInsights', () => {
  const mockData = {
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
      monthlyVotes: [],
      hourlyDistribution: [],
      categoryBreakdown: [
        { category: 'Presidential', votes: 4, percentage: 27 },
        { category: 'Senate', votes: 3, percentage: 20 },
        { category: 'House', votes: 2, percentage: 13 },
        { category: 'Governor', votes: 2, percentage: 13 }
      ],
      partyBreakdown: [
        { party: 'Party A', votes: 6, percentage: 40 },
        { party: 'Party B', votes: 4, percentage: 27 },
        { party: 'Party C', votes: 3, percentage: 20 }
      ],
      methodBreakdown: []
    },
    trends: {
      votingFrequency: 2.5,
      participationTrend: 'increasing' as const,
      favoriteCategory: 'Presidential',
      mostVotedParty: 'Party A',
      peakVotingHour: 10,
      averageVotesPerMonth: 3.0
    },
    achievements: [],
    insights: []
  };

  it('should generate insights for high participation', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockData));

    expect(result.current).toHaveLength(4); // High participation, category diversity, party diversity, morning voter
    expect(result.current.some(insight => insight.title === 'Excellent Participation')).toBe(true);
  });

  it('should generate insights for category diversity', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockData));

    expect(result.current.some(insight => insight.title === 'Category Diversity')).toBe(true);
  });

  it('should generate insights for party diversity', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockData));

    expect(result.current.some(insight => insight.title === 'Party Diversity')).toBe(true);
  });

  it('should generate insights for morning voting preference', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockData));

    expect(result.current.some(insight => insight.title === 'Morning Voter')).toBe(true);
  });

  it('should generate insights for high success rate', () => {
    const { result } = renderHook(() => useAnalyticsInsights(mockData));

    expect(result.current.some(insight => insight.title === 'High Success Rate')).toBe(true);
  });

  it('should return empty array when no data', () => {
    const { result } = renderHook(() => useAnalyticsInsights(null));

    expect(result.current).toEqual([]);
  });
});

describe('useAnalyticsTrends', () => {
  const mockData = {
    overview: { totalElections: 5, totalVotes: 8, participationRate: 80, successRate: 90, averageVoteTime: 3, votingStreak: 5, lastVoteDate: '2023-01-01', accountAge: 100 },
    votingPatterns: {
      monthlyVotes: [
        { month: '2023-01', votes: 2 },
        { month: '2023-02', votes: 3 },
        { month: '2023-03', votes: 4 },
        { month: '2023-04', votes: 1 },
        { month: '2023-05', votes: 2 },
        { month: '2023-06', votes: 3 }
      ],
      hourlyDistribution: [],
      categoryBreakdown: [],
      partyBreakdown: [],
      methodBreakdown: []
    },
    trends: { votingFrequency: 2, participationTrend: 'stable', favoriteCategory: 'Presidential', mostVotedParty: 'Party A', peakVotingHour: 10, averageVotesPerMonth: 2 },
    achievements: [],
    insights: []
  };

  it('should calculate increasing trend', () => {
    const { result } = renderHook(() => useAnalyticsTrends(mockData));

    expect(result.current?.direction).toBe('increasing');
    expect(result.current?.percentage).toBeGreaterThan(0);
    expect(result.current?.recentAverage).toBe(2); // Last 3 months: 1, 2, 3 = 2 average
    expect(result.current?.olderAverage).toBe(3); // Previous 3 months: 2, 3, 4 = 3 average
  });

  it('should calculate decreasing trend', () => {
    const decreasingData = {
      ...mockData,
      votingPatterns: {
        ...mockData.votingPatterns,
        monthlyVotes: [
          { month: '2023-01', votes: 4 },
          { month: '2023-02', votes: 3 },
          { month: '2023-03', votes: 2 },
          { month: '2023-04', votes: 1 },
          { month: '2023-05', votes: 1 },
          { month: '2023-06', votes: 1 }
        ]
      }
    };

    const { result } = renderHook(() => useAnalyticsTrends(decreasingData));

    expect(result.current?.direction).toBe('decreasing');
    expect(result.current?.percentage).toBeGreaterThan(0);
  });

  it('should calculate stable trend', () => {
    const stableData = {
      ...mockData,
      votingPatterns: {
        ...mockData.votingPatterns,
        monthlyVotes: [
          { month: '2023-01', votes: 2 },
          { month: '2023-02', votes: 2 },
          { month: '2023-03', votes: 2 },
          { month: '2023-04', votes: 2 },
          { month: '2023-05', votes: 2 },
          { month: '2023-06', votes: 2 }
        ]
      }
    };

    const { result } = renderHook(() => useAnalyticsTrends(stableData));

    expect(result.current?.direction).toBe('stable');
    expect(result.current?.percentage).toBe(0);
  });

  it('should return null when no data', () => {
    const { result } = renderHook(() => useAnalyticsTrends(null));

    expect(result.current).toBeNull();
  });
});

describe('useAnalyticsAchievements', () => {
  const mockData = {
    overview: { totalElections: 5, totalVotes: 8, participationRate: 80, successRate: 90, averageVoteTime: 3, votingStreak: 5, lastVoteDate: '2023-01-01', accountAge: 100 },
    votingPatterns: { monthlyVotes: [], hourlyDistribution: [], categoryBreakdown: [], partyBreakdown: [], methodBreakdown: [] },
    trends: { votingFrequency: 2, participationTrend: 'stable', favoriteCategory: 'Presidential', mostVotedParty: 'Party A', peakVotingHour: 10, averageVotesPerMonth: 2 },
    achievements: [
      { id: '1', title: 'Achievement 1', description: 'Desc 1', icon: '🏆', unlocked: true, unlockedAt: '2023-01-01' },
      { id: '2', title: 'Achievement 2', description: 'Desc 2', icon: '🎯', unlocked: false, progress: 50 },
      { id: '3', title: 'Achievement 3', description: 'Desc 3', icon: '⭐', unlocked: false, progress: 0 },
      { id: '4', title: 'Achievement 4', description: 'Desc 4', icon: '🔥', unlocked: true, unlockedAt: '2023-02-01' }
    ],
    insights: []
  };

  it('should categorize achievements correctly', () => {
    const { result } = renderHook(() => useAnalyticsAchievements(mockData));

    expect(result.current.unlocked).toHaveLength(2);
    expect(result.current.locked).toHaveLength(2);
    expect(result.current.progress).toHaveLength(1);
    expect(result.current.total).toBe(4);
    expect(result.current.unlockedCount).toBe(2);
    expect(result.current.lockedCount).toBe(2);
    expect(result.current.progressCount).toBe(1);
  });

  it('should return empty arrays when no data', () => {
    const { result } = renderHook(() => useAnalyticsAchievements(null));

    expect(result.current.unlocked).toEqual([]);
    expect(result.current.locked).toEqual([]);
    expect(result.current.progress).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('should filter achievements with progress', () => {
    const { result } = renderHook(() => useAnalyticsAchievements(mockData));

    expect(result.current.progress).toHaveLength(1);
    expect(result.current.progress[0].id).toBe('2');
    expect(result.current.progress[0].progress).toBe(50);
  });
});

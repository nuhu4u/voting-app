/**
 * Voter Dashboard Analytics Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  AnalyticsCard, 
  SimpleChart, 
  AchievementCard, 
  InsightCard, 
  AnalyticsOverview 
} from '@/components/voter/voter-dashboard-analytics';

// Mock analytics data
const mockAnalyticsData = {
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
      { month: '2023-03', votes: 4 }
    ],
    hourlyDistribution: [
      { hour: 9, votes: 2 },
      { hour: 10, votes: 4 },
      { hour: 11, votes: 3 }
    ],
    categoryBreakdown: [
      { category: 'Presidential', votes: 4, percentage: 27 },
      { category: 'Senate', votes: 3, percentage: 20 }
    ],
    partyBreakdown: [
      { party: 'Progressive Party', votes: 6, percentage: 40 },
      { party: 'Democratic Alliance', votes: 4, percentage: 27 }
    ],
    methodBreakdown: [
      { method: 'online', votes: 8, percentage: 53 },
      { method: 'hybrid', votes: 4, percentage: 27 }
    ]
  },
  trends: {
    votingFrequency: 2.5,
    participationTrend: 'increasing' as const,
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
      id: 'voting_streak_30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day voting streak',
      icon: '🏆',
      unlocked: false,
      progress: 23
    }
  ],
  insights: [
    {
      id: 'participation_trend',
      type: 'success' as const,
      title: 'Great Participation!',
      message: 'Your voting participation has increased by 15% this month.',
      action: 'View Details'
    },
    {
      id: 'peak_hour',
      type: 'info' as const,
      title: 'Peak Voting Time',
      message: 'You tend to vote most frequently between 10-11 AM.',
      action: 'Set Reminder'
    }
  ]
};

describe('AnalyticsCard', () => {
  it('should render analytics card with basic info', () => {
    const { getByText } = render(
      React.createElement(AnalyticsCard, {
        title: 'Total Votes',
        value: 15,
        subtitle: 'Successfully cast',
        icon: React.createElement('span', null, '🗳️')
      })
    );

    expect(getByText('Total Votes')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Successfully cast')).toBeTruthy();
  });

  it('should display trend information when provided', () => {
    const { getByText } = render(
      React.createElement(AnalyticsCard, {
        title: 'Participation Rate',
        value: '85%',
        subtitle: 'Overall participation',
        icon: React.createElement('span', null, '📊'),
        trend: {
          value: 15,
          direction: 'up',
          period: 'vs last month'
        }
      })
    );

    expect(getByText('15%')).toBeTruthy();
    expect(getByText('vs last month')).toBeTruthy();
  });

  it('should apply correct color classes', () => {
    const { container } = render(
      React.createElement(AnalyticsCard, {
        title: 'Test Card',
        value: 100,
        icon: React.createElement('span', null, '📊'),
        color: 'green'
      })
    );

    expect(container.querySelector('.text-green-600')).toBeTruthy();
  });
});

describe('SimpleChart', () => {
  const mockData = [
    { label: 'Presidential', value: 4, color: '#3B82F6' },
    { label: 'Senate', value: 3, color: '#10B981' }
  ];

  it('should render chart with title and data', () => {
    const { getByText } = render(
      React.createElement(SimpleChart, {
        data: mockData,
        type: 'bar',
        title: 'Votes by Category',
        subtitle: 'Distribution of votes'
      })
    );

    expect(getByText('Votes by Category')).toBeTruthy();
    expect(getByText('Distribution of votes')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Senate')).toBeTruthy();
  });

  it('should display data values', () => {
    const { getByText } = render(
      React.createElement(SimpleChart, {
        data: mockData,
        type: 'bar',
        title: 'Test Chart'
      })
    );

    expect(getByText('4')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('should render progress bars', () => {
    const { container } = render(
      React.createElement(SimpleChart, {
        data: mockData,
        type: 'bar',
        title: 'Test Chart'
      })
    );

    const progressBars = container.querySelectorAll('.h-2.rounded-full');
    expect(progressBars).toHaveLength(2);
  });
});

describe('AchievementCard', () => {
  const unlockedAchievement = mockAnalyticsData.achievements[0];
  const lockedAchievement = mockAnalyticsData.achievements[1];

  it('should render unlocked achievement', () => {
    const { getByText } = render(
      React.createElement(AchievementCard, {
        achievement: unlockedAchievement
      })
    );

    expect(getByText('First Vote')).toBeTruthy();
    expect(getByText('Cast your first vote in an election')).toBeTruthy();
    expect(getByText('🗳️')).toBeTruthy();
  });

  it('should render locked achievement with progress', () => {
    const { getByText } = render(
      React.createElement(AchievementCard, {
        achievement: lockedAchievement
      })
    );

    expect(getByText('Monthly Master')).toBeTruthy();
    expect(getByText('Maintain a 30-day voting streak')).toBeTruthy();
    expect(getByText('Progress')).toBeTruthy();
    expect(getByText('23%')).toBeTruthy();
  });

  it('should show unlock date for unlocked achievements', () => {
    const { getByText } = render(
      React.createElement(AchievementCard, {
        achievement: unlockedAchievement
      })
    );

    expect(getByText('Unlocked 1/15/2023')).toBeTruthy();
  });

  it('should apply correct styling for unlocked vs locked', () => {
    const { container: unlockedContainer } = render(
      React.createElement(AchievementCard, {
        achievement: unlockedAchievement
      })
    );

    const { container: lockedContainer } = render(
      React.createElement(AchievementCard, {
        achievement: lockedAchievement
      })
    );

    expect(unlockedContainer.querySelector('.border-green-200')).toBeTruthy();
    expect(lockedContainer.querySelector('.border-gray-200')).toBeTruthy();
  });
});

describe('InsightCard', () => {
  const successInsight = mockAnalyticsData.insights[0];
  const infoInsight = mockAnalyticsData.insights[1];

  it('should render insight with correct type styling', () => {
    const { getByText } = render(
      React.createElement(InsightCard, {
        insight: successInsight
      })
    );

    expect(getByText('Great Participation!')).toBeTruthy();
    expect(getByText('Your voting participation has increased by 15% this month.')).toBeTruthy();
    expect(getByText('View Details')).toBeTruthy();
  });

  it('should display correct icon for insight type', () => {
    const { getByText } = render(
      React.createElement(InsightCard, {
        insight: successInsight
      })
    );

    expect(getByText('✅')).toBeTruthy();
  });

  it('should apply correct color classes for different types', () => {
    const { container: successContainer } = render(
      React.createElement(InsightCard, {
        insight: successInsight
      })
    );

    const { container: infoContainer } = render(
      React.createElement(InsightCard, {
        insight: infoInsight
      })
    );

    expect(successContainer.querySelector('.border-green-200')).toBeTruthy();
    expect(infoContainer.querySelector('.border-blue-200')).toBeTruthy();
  });

  it('should render action button when provided', () => {
    const { getByText } = render(
      React.createElement(InsightCard, {
        insight: successInsight
      })
    );

    const actionButton = getByText('View Details');
    expect(actionButton).toBeTruthy();
  });
});

describe('AnalyticsOverview', () => {
  const mockProps = {
    data: mockAnalyticsData,
    onRefresh: jest.fn(),
    isLoading: false
  };

  it('should render analytics overview', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Dashboard Analytics')).toBeTruthy();
    expect(getByText('Your voting participation insights and statistics')).toBeTruthy();
  });

  it('should render overview cards', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Total Elections')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(getByText('Total Votes')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Participation Rate')).toBeTruthy();
    expect(getByText('85%')).toBeTruthy();
  });

  it('should render charts section', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Votes by Category')).toBeTruthy();
    expect(getByText('Votes by Party')).toBeTruthy();
    expect(getByText('Voting Methods')).toBeTruthy();
    expect(getByText('Monthly Voting Pattern')).toBeTruthy();
  });

  it('should render achievements section', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Achievements')).toBeTruthy();
    expect(getByText('First Vote')).toBeTruthy();
    expect(getByText('Monthly Master')).toBeTruthy();
  });

  it('should render insights section', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Insights & Tips')).toBeTruthy();
    expect(getByText('Great Participation!')).toBeTruthy();
    expect(getByText('Peak Voting Time')).toBeTruthy();
  });

  it('should handle refresh button click', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    const refreshButton = getByText('Refresh');
    fireEvent.press(refreshButton);

    expect(mockProps.onRefresh).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, { ...mockProps, isLoading: true })
    );

    expect(getByText('Refreshing...')).toBeTruthy();
  });

  it('should render export button', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Export')).toBeTruthy();
  });

  it('should display chart data correctly', () => {
    const { getByText } = render(
      React.createElement(AnalyticsOverview, mockProps)
    );

    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Senate')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('Democratic Alliance')).toBeTruthy();
  });
});

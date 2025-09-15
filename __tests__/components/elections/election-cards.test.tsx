/**
 * Election Cards Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  ElectionCard, 
  ElectionCardGrid, 
  ElectionCardList 
} from '@/components/elections/election-cards';

// Mock election data
const mockElection = {
  id: '1',
  title: 'Presidential Election 2023',
  description: 'Election for the President of Nigeria',
  startDate: '2023-02-25T08:00:00Z',
  endDate: '2023-02-25T18:00:00Z',
  status: 'active' as const,
  totalCandidates: 4,
  totalVoters: 15000000,
  hasVoted: false,
  category: 'Presidential',
  location: 'Nigeria',
  requirements: ['Valid Voter ID', 'NIN'],
  votingMethod: 'hybrid' as const,
  securityLevel: 'maximum' as const,
  blockchainHash: '0x1234567890abcdef',
  resultsAvailable: false,
  participationRate: 85,
  isBookmarked: false,
  isStarred: false,
  priority: 'high' as const,
  tags: ['presidential', 'national', '2023'],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-02-25T18:00:00Z'
};

const mockElections = [
  mockElection,
  {
    ...mockElection,
    id: '2',
    title: 'Senate Election 2023',
    status: 'upcoming' as const,
    isBookmarked: true,
    isStarred: true
  },
  {
    ...mockElection,
    id: '3',
    title: 'House Election 2023',
    status: 'completed' as const,
    hasVoted: true,
    resultsAvailable: true
  }
];

describe('ElectionCard', () => {
  const mockProps = {
    election: mockElection,
    onSelect: jest.fn(),
    onVote: jest.fn(),
    onViewResults: jest.fn(),
    onBookmark: jest.fn(),
    onStar: jest.fn(),
    onShare: jest.fn()
  };

  it('should render default election card', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, mockProps)
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Election for the President of Nigeria')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Nigeria')).toBeTruthy();
  });

  it('should render compact election card', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, variant: 'compact' })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
  });

  it('should render detailed election card', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, variant: 'detailed' })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Election for the President of Nigeria')).toBeTruthy();
    expect(getByText('Candidates')).toBeTruthy();
    expect(getByText('Voters')).toBeTruthy();
    expect(getByText('Participation')).toBeTruthy();
    expect(getByText('Method')).toBeTruthy();
  });

  it('should render minimal election card', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, variant: 'minimal' })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
  });

  it('should display election statistics', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, showStats: true })
    );

    expect(getByText('4')).toBeTruthy(); // totalCandidates
    expect(getByText('15,000,000')).toBeTruthy(); // totalVoters
    expect(getByText('85%')).toBeTruthy(); // participationRate
    expect(getByText('Hybrid')).toBeTruthy(); // votingMethod
  });

  it('should display requirements when enabled', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, showRequirements: true })
    );

    expect(getByText('Requirements')).toBeTruthy();
    expect(getByText('Valid Voter ID')).toBeTruthy();
    expect(getByText('NIN')).toBeTruthy();
  });

  it('should display tags when enabled', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, showTags: true })
    );

    expect(getByText('Tags')).toBeTruthy();
    expect(getByText('presidential')).toBeTruthy();
    expect(getByText('national')).toBeTruthy();
    expect(getByText('2023')).toBeTruthy();
  });

  it('should call onSelect when view details is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, mockProps)
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(mockProps.onSelect).toHaveBeenCalledWith(mockElection);
  });

  it('should call onVote when vote now is clicked for active elections', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, mockProps)
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(mockProps.onVote).toHaveBeenCalledWith(mockElection);
  });

  it('should call onViewResults when view results is clicked for completed elections', () => {
    const completedElection = { 
      ...mockElection, 
      status: 'completed' as const, 
      resultsAvailable: true 
    };
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, election: completedElection })
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(mockProps.onViewResults).toHaveBeenCalledWith(completedElection);
  });

  it('should call onBookmark when bookmark button is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCard, mockProps)
    );

    const bookmarkButton = container.querySelector('button');
    fireEvent.press(bookmarkButton!);

    expect(mockProps.onBookmark).toHaveBeenCalledWith('1');
  });

  it('should call onStar when star button is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCard, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const starButton = buttons[1]; // Second button should be star
    fireEvent.press(starButton!);

    expect(mockProps.onStar).toHaveBeenCalledWith('1');
  });

  it('should call onShare when share button is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCard, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const shareButton = buttons[2]; // Third button should be share
    fireEvent.press(shareButton!);

    expect(mockProps.onShare).toHaveBeenCalledWith(mockElection);
  });

  it('should show voted badge when user has voted', () => {
    const votedElection = { ...mockElection, hasVoted: true };
    const { getByText } = render(
      React.createElement(ElectionCard, { ...mockProps, election: votedElection })
    );

    expect(getByText('Voted')).toBeTruthy();
  });

  it('should show high priority badge for high priority elections', () => {
    const { getByText } = render(
      React.createElement(ElectionCard, mockProps)
    );

    expect(getByText('High Priority')).toBeTruthy();
  });

  it('should not show actions when showActions is false', () => {
    const { queryByText } = render(
      React.createElement(ElectionCard, { ...mockProps, showActions: false })
    );

    expect(queryByText('View Details')).toBeFalsy();
    expect(queryByText('Vote Now')).toBeFalsy();
  });

  it('should not show stats when showStats is false', () => {
    const { queryByText } = render(
      React.createElement(ElectionCard, { ...mockProps, showStats: false })
    );

    expect(queryByText('Candidates')).toBeFalsy();
    expect(queryByText('Voters')).toBeFalsy();
  });
});

describe('ElectionCardGrid', () => {
  const mockProps = {
    elections: mockElections,
    onElectionSelect: jest.fn(),
    onElectionVote: jest.fn(),
    onElectionViewResults: jest.fn(),
    onElectionBookmark: jest.fn(),
    onElectionStar: jest.fn(),
    onElectionShare: jest.fn()
  };

  it('should render election cards in grid layout', () => {
    const { getByText } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Senate Election 2023')).toBeTruthy();
    expect(getByText('House Election 2023')).toBeTruthy();
  });

  it('should render with different column counts', () => {
    const { container } = render(
      React.createElement(ElectionCardGrid, { ...mockProps, columns: 2 })
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
  });

  it('should render with different variants', () => {
    const { getByText } = render(
      React.createElement(ElectionCardGrid, { ...mockProps, variant: 'compact' })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
  });

  it('should call onElectionSelect when election is selected', () => {
    const { getByText } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(mockProps.onElectionSelect).toHaveBeenCalled();
  });

  it('should call onElectionVote when vote button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(mockProps.onElectionVote).toHaveBeenCalled();
  });

  it('should call onElectionViewResults when view results is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(mockProps.onElectionViewResults).toHaveBeenCalled();
  });

  it('should call onElectionBookmark when bookmark is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    const bookmarkButton = container.querySelector('button');
    fireEvent.press(bookmarkButton!);

    expect(mockProps.onElectionBookmark).toHaveBeenCalled();
  });

  it('should call onElectionStar when star is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const starButton = buttons[1];
    fireEvent.press(starButton!);

    expect(mockProps.onElectionStar).toHaveBeenCalled();
  });

  it('should call onElectionShare when share is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCardGrid, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const shareButton = buttons[2];
    fireEvent.press(shareButton!);

    expect(mockProps.onElectionShare).toHaveBeenCalled();
  });
});

describe('ElectionCardList', () => {
  const mockProps = {
    elections: mockElections,
    onElectionSelect: jest.fn(),
    onElectionVote: jest.fn(),
    onElectionViewResults: jest.fn(),
    onElectionBookmark: jest.fn(),
    onElectionStar: jest.fn(),
    onElectionShare: jest.fn()
  };

  it('should render election cards in list layout', () => {
    const { getByText } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Senate Election 2023')).toBeTruthy();
    expect(getByText('House Election 2023')).toBeTruthy();
  });

  it('should render with different variants', () => {
    const { getByText } = render(
      React.createElement(ElectionCardList, { ...mockProps, variant: 'compact' })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
  });

  it('should call onElectionSelect when election is selected', () => {
    const { getByText } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(mockProps.onElectionSelect).toHaveBeenCalled();
  });

  it('should call onElectionVote when vote button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(mockProps.onElectionVote).toHaveBeenCalled();
  });

  it('should call onElectionViewResults when view results is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(mockProps.onElectionViewResults).toHaveBeenCalled();
  });

  it('should call onElectionBookmark when bookmark is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    const bookmarkButton = container.querySelector('button');
    fireEvent.press(bookmarkButton!);

    expect(mockProps.onElectionBookmark).toHaveBeenCalled();
  });

  it('should call onElectionStar when star is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const starButton = buttons[1];
    fireEvent.press(starButton!);

    expect(mockProps.onElectionStar).toHaveBeenCalled();
  });

  it('should call onElectionShare when share is clicked', () => {
    const { container } = render(
      React.createElement(ElectionCardList, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const shareButton = buttons[2];
    fireEvent.press(shareButton!);

    expect(mockProps.onElectionShare).toHaveBeenCalled();
  });
});

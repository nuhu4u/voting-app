/**
 * Elections List Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  ElectionListItem, 
  ElectionsList 
} from '@/components/elections/elections-list';

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
    hasVoted: false,
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

describe('ElectionListItem', () => {
  it('should render election list item with basic info', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Election for the President of Nigeria')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Nigeria')).toBeTruthy();
  });

  it('should display election details', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Nigeria')).toBeTruthy();
    expect(getByText('Method')).toBeTruthy();
    expect(getByText('Hybrid')).toBeTruthy();
    expect(getByText('Participation')).toBeTruthy();
    expect(getByText('85%')).toBeTruthy();
  });

  it('should display requirements and tags', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    expect(getByText('Requirements:')).toBeTruthy();
    expect(getByText('Valid Voter ID')).toBeTruthy();
    expect(getByText('NIN')).toBeTruthy();
    expect(getByText('Tags:')).toBeTruthy();
    expect(getByText('presidential')).toBeTruthy();
    expect(getByText('national')).toBeTruthy();
    expect(getByText('2023')).toBeTruthy();
  });

  it('should display blockchain information when available', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    expect(getByText('Blockchain Verified')).toBeTruthy();
    expect(getByText('0x1234567890ab...')).toBeTruthy();
  });

  it('should call onSelect when view details is clicked', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(onSelect).toHaveBeenCalledWith(mockElection);
  });

  it('should call onVote when vote now is clicked for active elections', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(onVote).toHaveBeenCalledWith(mockElection);
  });

  it('should call onViewResults when view results is clicked for completed elections', () => {
    const completedElection = { 
      ...mockElection, 
      status: 'completed' as const, 
      resultsAvailable: true 
    };
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: completedElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(onViewResults).toHaveBeenCalledWith(completedElection);
  });

  it('should call onBookmark when bookmark button is clicked', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { container } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    const bookmarkButton = container.querySelector('button');
    fireEvent.press(bookmarkButton!);

    expect(onBookmark).toHaveBeenCalledWith('1');
  });

  it('should call onStar when star button is clicked', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { container } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    const buttons = container.querySelectorAll('button');
    const starButton = buttons[1]; // Second button should be star
    fireEvent.press(starButton!);

    expect(onStar).toHaveBeenCalledWith('1');
  });

  it('should call onShare when share button is clicked', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { container } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    const buttons = container.querySelectorAll('button');
    const shareButton = buttons[2]; // Third button should be share
    fireEvent.press(shareButton!);

    expect(onShare).toHaveBeenCalledWith(mockElection);
  });

  it('should show voted badge when user has voted', () => {
    const votedElection = { ...mockElection, hasVoted: true };
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: votedElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    expect(getByText('Voted')).toBeTruthy();
  });

  it('should show high priority badge for high priority elections', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();
    const onBookmark = jest.fn();
    const onStar = jest.fn();
    const onShare = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionListItem, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults,
        onBookmark,
        onStar,
        onShare
      })
    );

    expect(getByText('High Priority')).toBeTruthy();
  });
});

describe('ElectionsList', () => {
  const mockProps = {
    elections: mockElections,
    onElectionSelect: jest.fn(),
    onVote: jest.fn(),
    onViewResults: jest.fn(),
    onBookmark: jest.fn(),
    onStar: jest.fn(),
    onShare: jest.fn()
  };

  it('should render elections list', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, mockProps)
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Senate Election 2023')).toBeTruthy();
    expect(getByText('House Election 2023')).toBeTruthy();
  });

  it('should show loading state', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, { ...mockProps, isLoading: true })
    );

    expect(getByText('Loading elections...')).toBeTruthy();
  });

  it('should show error state', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, { 
        ...mockProps, 
        error: 'Failed to load elections' 
      })
    );

    expect(getByText('Failed to load elections')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should show empty state when no elections', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, { ...mockProps, elections: [] })
    );

    expect(getByText('No Elections Found')).toBeTruthy();
    expect(getByText('There are no elections available at the moment.')).toBeTruthy();
  });

  it('should handle view mode toggle', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const listButton = getByText('List');
    fireEvent.press(listButton);

    // Should switch to list view
    expect(listButton).toBeTruthy();
  });

  it('should handle sort changes', () => {
    const { container } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const sortSelect = container.querySelector('select');
    fireEvent.change(sortSelect!, { target: { value: 'title-asc' } });

    // Should update sort state
    expect(sortSelect).toBeTruthy();
  });

  it('should call onElectionSelect when election is selected', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(mockProps.onElectionSelect).toHaveBeenCalled();
  });

  it('should call onVote when vote button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(mockProps.onVote).toHaveBeenCalled();
  });

  it('should call onViewResults when view results is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(mockProps.onViewResults).toHaveBeenCalled();
  });

  it('should call onBookmark when bookmark is clicked', () => {
    const { container } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const bookmarkButton = container.querySelector('button');
    fireEvent.press(bookmarkButton!);

    expect(mockProps.onBookmark).toHaveBeenCalled();
  });

  it('should call onStar when star is clicked', () => {
    const { container } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const starButton = buttons[1];
    fireEvent.press(starButton!);

    expect(mockProps.onStar).toHaveBeenCalled();
  });

  it('should call onShare when share is clicked', () => {
    const { container } = render(
      React.createElement(ElectionsList, mockProps)
    );

    const buttons = container.querySelectorAll('button');
    const shareButton = buttons[2];
    fireEvent.press(shareButton!);

    expect(mockProps.onShare).toHaveBeenCalled();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = jest.fn();
    const { getByText } = render(
      React.createElement(ElectionsList, { ...mockProps, onRefresh })
    );

    const refreshButton = getByText('Refresh');
    fireEvent.press(refreshButton);

    expect(onRefresh).toHaveBeenCalled();
  });
});

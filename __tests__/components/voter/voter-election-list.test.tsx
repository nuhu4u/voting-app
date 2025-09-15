/**
 * Voter Election List Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  ElectionCard, 
  ElectionFilters, 
  ElectionList 
} from '@/components/voter/voter-election-list';

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
    hasVoted: false
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
  it('should render election card with basic info', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Election for the President of Nigeria')).toBeTruthy();
    expect(getByText('Active')).toBeTruthy();
    expect(getByText('4 candidates')).toBeTruthy();
  });

  it('should show voted badge when user has voted', () => {
    const votedElection = { ...mockElection, hasVoted: true };
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: votedElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    expect(getByText('Voted')).toBeTruthy();
  });

  it('should show vote button for active elections', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    expect(getByText('Vote Now')).toBeTruthy();
  });

  it('should show view results button for completed elections with results', () => {
    const completedElection = { 
      ...mockElection, 
      status: 'completed' as const, 
      resultsAvailable: true 
    };
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: completedElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    expect(getByText('View Results')).toBeTruthy();
  });

  it('should call onSelect when view details is clicked', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(onSelect).toHaveBeenCalledWith(mockElection);
  });

  it('should call onVote when vote now is clicked', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(onVote).toHaveBeenCalledWith(mockElection);
  });

  it('should call onViewResults when view results is clicked', () => {
    const completedElection = { 
      ...mockElection, 
      status: 'completed' as const, 
      resultsAvailable: true 
    };
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: completedElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(onViewResults).toHaveBeenCalledWith(completedElection);
  });

  it('should display requirements', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    expect(getByText('Requirements:')).toBeTruthy();
    expect(getByText('Valid Voter ID')).toBeTruthy();
    expect(getByText('NIN')).toBeTruthy();
  });

  it('should display security level', () => {
    const onSelect = jest.fn();
    const onVote = jest.fn();
    const onViewResults = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionCard, {
        election: mockElection,
        onSelect,
        onVote,
        onViewResults
      })
    );

    expect(getByText('Security: maximum')).toBeTruthy();
  });
});

describe('ElectionFilters', () => {
  const mockFilters = {
    status: [],
    category: [],
    location: [],
    votingMethod: [],
    securityLevel: [],
    hasVoted: null,
    dateRange: { start: '', end: '' }
  };

  it('should render filter toggle button', () => {
    const onFiltersChange = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionFilters, {
        filters: mockFilters,
        onFiltersChange,
        onClearFilters
      })
    );

    expect(getByText('Filters')).toBeTruthy();
  });

  it('should open filter panel when clicked', () => {
    const onFiltersChange = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText, queryByText } = render(
      React.createElement(ElectionFilters, {
        filters: mockFilters,
        onFiltersChange,
        onClearFilters
      })
    );

    const filterButton = getByText('Filters');
    fireEvent.press(filterButton);

    expect(queryByText('Status')).toBeTruthy();
    expect(queryByText('Category')).toBeTruthy();
  });

  it('should handle status filter changes', () => {
    const onFiltersChange = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionFilters, {
        filters: mockFilters,
        onFiltersChange,
        onClearFilters
      })
    );

    const filterButton = getByText('Filters');
    fireEvent.press(filterButton);

    const activeCheckbox = getByText('Active');
    fireEvent.press(activeCheckbox);

    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('should handle category filter changes', () => {
    const onFiltersChange = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionFilters, {
        filters: mockFilters,
        onFiltersChange,
        onClearFilters
      })
    );

    const filterButton = getByText('Filters');
    fireEvent.press(filterButton);

    const presidentialCheckbox = getByText('Presidential');
    fireEvent.press(presidentialCheckbox);

    expect(onFiltersChange).toHaveBeenCalled();
  });

  it('should show clear all button when filters are active', () => {
    const activeFilters = {
      ...mockFilters,
      status: ['active']
    };
    const onFiltersChange = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionFilters, {
        filters: activeFilters,
        onFiltersChange,
        onClearFilters
      })
    );

    expect(getByText('Clear All')).toBeTruthy();
  });

  it('should call onClearFilters when clear all is clicked', () => {
    const activeFilters = {
      ...mockFilters,
      status: ['active']
    };
    const onFiltersChange = jest.fn();
    const onClearFilters = jest.fn();

    const { getByText } = render(
      React.createElement(ElectionFilters, {
        filters: activeFilters,
        onFiltersChange,
        onClearFilters
      })
    );

    const clearButton = getByText('Clear All');
    fireEvent.press(clearButton);

    expect(onClearFilters).toHaveBeenCalled();
  });
});

describe('ElectionList', () => {
  const mockProps = {
    elections: mockElections,
    onElectionSelect: jest.fn(),
    onVote: jest.fn(),
    onViewResults: jest.fn(),
    filters: {
      status: [],
      category: [],
      location: [],
      votingMethod: [],
      securityLevel: [],
      hasVoted: null,
      dateRange: { start: '', end: '' }
    },
    onFiltersChange: jest.fn(),
    sort: { field: 'startDate' as const, direction: 'asc' as const },
    onSortChange: jest.fn(),
    searchQuery: '',
    onSearchChange: jest.fn()
  };

  it('should render election list', () => {
    const { getByText } = render(
      React.createElement(ElectionList, mockProps)
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Senate Election 2023')).toBeTruthy();
    expect(getByText('House Election 2023')).toBeTruthy();
  });

  it('should render search input', () => {
    const { getByPlaceholderText } = render(
      React.createElement(ElectionList, mockProps)
    );

    expect(getByPlaceholderText('Search elections...')).toBeTruthy();
  });

  it('should handle search input changes', () => {
    const { getByPlaceholderText } = render(
      React.createElement(ElectionList, mockProps)
    );

    const searchInput = getByPlaceholderText('Search elections...');
    fireEvent.change(searchInput, { target: { value: 'presidential' } });

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('presidential');
  });

  it('should show loading state', () => {
    const { getByText } = render(
      React.createElement(ElectionList, { ...mockProps, isLoading: true })
    );

    expect(getByText('Loading elections...')).toBeTruthy();
  });

  it('should show error state', () => {
    const { getByText } = render(
      React.createElement(ElectionList, { 
        ...mockProps, 
        error: 'Failed to load elections' 
      })
    );

    expect(getByText('Failed to load elections')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should show empty state when no elections', () => {
    const { getByText } = render(
      React.createElement(ElectionList, { ...mockProps, elections: [] })
    );

    expect(getByText('No Elections Found')).toBeTruthy();
    expect(getByText('There are no elections matching your current filters.')).toBeTruthy();
  });

  it('should handle view mode toggle', () => {
    const { getByText } = render(
      React.createElement(ElectionList, mockProps)
    );

    const listButton = getByText('List');
    fireEvent.press(listButton);

    // Should switch to list view
    expect(listButton).toBeTruthy();
  });

  it('should handle sort changes', () => {
    const { container } = render(
      React.createElement(ElectionList, mockProps)
    );

    const sortSelect = container.querySelector('select');
    fireEvent.change(sortSelect!, { target: { value: 'title-desc' } });

    expect(mockProps.onSortChange).toHaveBeenCalledWith({
      field: 'title',
      direction: 'desc'
    });
  });

  it('should call onElectionSelect when election is selected', () => {
    const { getByText } = render(
      React.createElement(ElectionList, mockProps)
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(mockProps.onElectionSelect).toHaveBeenCalled();
  });

  it('should call onVote when vote button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionList, mockProps)
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(mockProps.onVote).toHaveBeenCalled();
  });

  it('should call onViewResults when view results is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionList, mockProps)
    );

    const viewResultsButton = getByText('View Results');
    fireEvent.press(viewResultsButton);

    expect(mockProps.onViewResults).toHaveBeenCalled();
  });
});

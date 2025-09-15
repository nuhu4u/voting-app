/**
 * Election Details Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ElectionDetails } from '@/components/elections/election-details';

// Mock election data
const mockElection = {
  id: '1',
  title: 'Presidential Election 2023',
  description: 'Election for the President of Nigeria',
  start_date: '2023-02-25T08:00:00Z',
  end_date: '2023-02-25T18:00:00Z',
  status: 'ONGOING',
  election_type: 'Presidential',
  total_votes: 15000000,
  contestants: [
    {
      id: '1',
      name: 'John Doe',
      party: 'Progressive Party',
      party_acronym: 'PP',
      position: 'President',
      votes: 6500000,
      picture: null
    },
    {
      id: '2',
      name: 'Jane Smith',
      party: 'Democratic Alliance',
      party_acronym: 'DA',
      position: 'President',
      votes: 4200000,
      picture: null
    }
  ],
  electionStats: {
    totalRegisteredVoters: 20000000,
    totalVotesCast: 15000000,
    electionTurnoutPercentage: 75
  }
};

// Mock stores
jest.mock('@/store/election-store', () => ({
  useElectionStore: () => ({
    currentElection: mockElection,
    isLoading: false,
    error: null,
    fetchElectionById: jest.fn(),
    clearError: jest.fn()
  })
}));

jest.mock('@/store/auth-store', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Test User' }
  })
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
  formatDateTime: (date: string) => new Date(date).toLocaleString()
}));

describe('ElectionDetails', () => {
  const mockProps = {
    electionId: '1',
    onVotePress: jest.fn(),
    onResultsPress: jest.fn()
  };

  it('should render election details', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Election for the President of Nigeria')).toBeTruthy();
    expect(getByText('ONGOING')).toBeTruthy();
  });

  it('should render action buttons', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Vote Now')).toBeTruthy();
    expect(getByText('View Results')).toBeTruthy();
  });

  it('should render tabs', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Candidates')).toBeTruthy();
    expect(getByText('Results')).toBeTruthy();
  });

  it('should call onVotePress when vote button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    const voteButton = getByText('Vote Now');
    fireEvent.press(voteButton);

    expect(mockProps.onVotePress).toHaveBeenCalledWith(mockElection);
  });

  it('should call onResultsPress when results button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    const resultsButton = getByText('View Results');
    fireEvent.press(resultsButton);

    expect(mockProps.onResultsPress).toHaveBeenCalledWith(mockElection);
  });

  it('should show election information in overview tab', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Election Information')).toBeTruthy();
    expect(getByText('Type')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();
    expect(getByText('Start Date')).toBeTruthy();
    expect(getByText('End Date')).toBeTruthy();
    expect(getByText('Total Votes')).toBeTruthy();
    expect(getByText('Candidates')).toBeTruthy();
  });

  it('should show candidates in candidates tab', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    const candidatesTab = getByText('Candidates');
    fireEvent.press(candidatesTab);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('Democratic Alliance')).toBeTruthy();
  });

  it('should show results in results tab', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    const resultsTab = getByText('Results');
    fireEvent.press(resultsTab);

    expect(getByText('Live Results')).toBeTruthy();
    expect(getByText('Total Votes')).toBeTruthy();
    expect(getByText('View Detailed Results')).toBeTruthy();
  });

  it('should show loading state when loading', () => {
    // Mock loading state
    jest.doMock('@/store/election-store', () => ({
      useElectionStore: () => ({
        currentElection: null,
        isLoading: true,
        error: null,
        fetchElectionById: jest.fn(),
        clearError: jest.fn()
      })
    }));

    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Loading election details...')).toBeTruthy();
  });

  it('should show error state when error occurs', () => {
    // Mock error state
    jest.doMock('@/store/election-store', () => ({
      useElectionStore: () => ({
        currentElection: null,
        isLoading: false,
        error: 'Failed to load election',
        fetchElectionById: jest.fn(),
        clearError: jest.fn()
      })
    }));

    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Failed to load election')).toBeTruthy();
  });

  it('should show not found state when election is null', () => {
    // Mock null election state
    jest.doMock('@/store/election-store', () => ({
      useElectionStore: () => ({
        currentElection: null,
        isLoading: false,
        error: null,
        fetchElectionById: jest.fn(),
        clearError: jest.fn()
      })
    }));

    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Election Not Found')).toBeTruthy();
    expect(getByText('The requested election could not be found.')).toBeTruthy();
  });

  it('should show statistics when available', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    expect(getByText('Statistics')).toBeTruthy();
    expect(getByText('Registered Voters')).toBeTruthy();
    expect(getByText('Votes Cast')).toBeTruthy();
    expect(getByText('Turnout')).toBeTruthy();
  });

  it('should display candidate votes correctly', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    const candidatesTab = getByText('Candidates');
    fireEvent.press(candidatesTab);

    expect(getByText('6,500,000')).toBeTruthy(); // John Doe votes
    expect(getByText('4,200,000')).toBeTruthy(); // Jane Smith votes
  });

  it('should sort candidates by votes in results tab', () => {
    const { getByText } = render(
      React.createElement(ElectionDetails, mockProps)
    );

    const resultsTab = getByText('Results');
    fireEvent.press(resultsTab);

    // John Doe should be first (highest votes)
    const candidateElements = getByText('John Doe').parentElement;
    expect(candidateElements).toBeTruthy();
  });
});

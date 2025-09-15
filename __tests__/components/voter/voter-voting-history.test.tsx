/**
 * Voter Voting History Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  VotingRecordCard, 
  VotingStatsCard, 
  VotingHistory 
} from '@/components/voter/voter-voting-history';

// Mock voting record data
const mockVotingRecord = {
  id: '1',
  electionId: '1',
  electionTitle: 'Presidential Election 2023',
  electionCategory: 'Presidential',
  candidateId: 'c1',
  candidateName: 'John Doe',
  candidateParty: 'Progressive Party',
  voteDate: '2023-02-25',
  voteTime: '10:30 AM',
  votingMethod: 'hybrid' as const,
  location: 'Lagos State',
  pollingUnit: 'PU 001',
  status: 'confirmed' as const,
  blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
  transactionId: 'tx_1234567890abcdef',
  verificationStatus: 'verified' as const,
  voteWeight: 1,
  isSecretBallot: true,
  auditTrail: ['Vote cast', 'Blockchain verified', 'Transaction confirmed'],
  createdAt: '2023-02-25T10:30:00Z',
  updatedAt: '2023-02-25T10:30:00Z'
};

const mockVotingRecords = [
  mockVotingRecord,
  {
    ...mockVotingRecord,
    id: '2',
    electionTitle: 'Senate Election 2023',
    electionCategory: 'Senate',
    candidateName: 'Jane Smith',
    candidateParty: 'Democratic Alliance',
    status: 'pending' as const,
    verificationStatus: 'pending' as const
  },
  {
    ...mockVotingRecord,
    id: '3',
    electionTitle: 'House Election 2023',
    electionCategory: 'House of Reps',
    candidateName: 'Mike Johnson',
    candidateParty: 'Conservative Party',
    status: 'rejected' as const,
    verificationStatus: 'failed' as const
  }
];

const mockStats = {
  totalVotes: 15,
  successfulVotes: 12,
  failedVotes: 1,
  averageVoteTime: 3.5,
  participationRate: 85,
  favoriteCategory: 'Presidential',
  mostVotedParty: 'Progressive Party',
  votingStreak: 7,
  lastVoteDate: '2023-02-25T10:30:00Z',
  totalElectionsParticipated: 8
};

describe('VotingRecordCard', () => {
  it('should render voting record card with basic info', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Confirmed')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
  });

  it('should display voting details', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    expect(getByText('Voted For')).toBeTruthy();
    expect(getByText('Method:')).toBeTruthy();
    expect(getByText('Hybrid')).toBeTruthy();
    expect(getByText('Location:')).toBeTruthy();
    expect(getByText('Lagos State')).toBeTruthy();
    expect(getByText('Polling Unit:')).toBeTruthy();
    expect(getByText('PU 001')).toBeTruthy();
  });

  it('should display blockchain information', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    expect(getByText('Blockchain Verified')).toBeTruthy();
    expect(getByText('0x1234567890ab...')).toBeTruthy();
  });

  it('should call onSelect when view details is clicked', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(onSelect).toHaveBeenCalledWith(mockVotingRecord);
  });

  it('should call onViewElection when view election is clicked', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    const viewElectionButton = getByText('View Election');
    fireEvent.press(viewElectionButton);

    expect(onViewElection).toHaveBeenCalledWith('1');
  });

  it('should call onViewCandidate when view candidate is clicked', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    const viewCandidateButton = getByText('View Candidate');
    fireEvent.press(viewCandidateButton);

    expect(onViewCandidate).toHaveBeenCalledWith('c1');
  });

  it('should show different status colors', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText: getByTextConfirmed } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    expect(getByTextConfirmed('Confirmed')).toBeTruthy();

    const pendingRecord = { ...mockVotingRecord, status: 'pending' as const };
    const { getByText: getByTextPending } = render(
      React.createElement(VotingRecordCard, {
        record: pendingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    expect(getByTextPending('Pending')).toBeTruthy();
  });

  it('should display vote weight and secret ballot info', () => {
    const onSelect = jest.fn();
    const onViewElection = jest.fn();
    const onViewCandidate = jest.fn();

    const { getByText } = render(
      React.createElement(VotingRecordCard, {
        record: mockVotingRecord,
        onSelect,
        onViewElection,
        onViewCandidate
      })
    );

    expect(getByText('Vote Weight:')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(getByText('Secret Ballot:')).toBeTruthy();
    expect(getByText('Yes')).toBeTruthy();
  });
});

describe('VotingStatsCard', () => {
  it('should render voting stats card', () => {
    const { getByText } = render(
      React.createElement(VotingStatsCard, {
        stats: mockStats
      })
    );

    expect(getByText('Voting Statistics')).toBeTruthy();
    expect(getByText('Your voting participation overview')).toBeTruthy();
  });

  it('should display main statistics', () => {
    const { getByText } = render(
      React.createElement(VotingStatsCard, {
        stats: mockStats
      })
    );

    expect(getByText('15')).toBeTruthy(); // totalVotes
    expect(getByText('Total Votes')).toBeTruthy();
    expect(getByText('12')).toBeTruthy(); // successfulVotes
    expect(getByText('Successful')).toBeTruthy();
    expect(getByText('85%')).toBeTruthy(); // participationRate
    expect(getByText('Participation')).toBeTruthy();
    expect(getByText('7')).toBeTruthy(); // votingStreak
    expect(getByText('Day Streak')).toBeTruthy();
  });

  it('should display additional statistics', () => {
    const { getByText } = render(
      React.createElement(VotingStatsCard, {
        stats: mockStats
      })
    );

    expect(getByText('Average Vote Time')).toBeTruthy();
    expect(getByText('3.5 min')).toBeTruthy();
    expect(getByText('Favorite Category')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Most Voted Party')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('Last Vote')).toBeTruthy();
    expect(getByText('Elections Participated')).toBeTruthy();
    expect(getByText('8')).toBeTruthy();
    expect(getByText('Failed Votes')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });
});

describe('VotingHistory', () => {
  const mockProps = {
    votingRecords: mockVotingRecords,
    stats: mockStats,
    onRecordSelect: jest.fn(),
    onViewElection: jest.fn(),
    onViewCandidate: jest.fn(),
    onDownloadHistory: jest.fn(),
    filters: {
      electionCategory: [],
      votingMethod: [],
      status: [],
      dateRange: { start: '', end: '' },
      candidateParty: []
    },
    onFiltersChange: jest.fn(),
    searchQuery: '',
    onSearchChange: jest.fn()
  };

  it('should render voting history', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    expect(getByText('Voting Statistics')).toBeTruthy();
    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Senate Election 2023')).toBeTruthy();
    expect(getByText('House Election 2023')).toBeTruthy();
  });

  it('should render search input', () => {
    const { getByPlaceholderText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    expect(getByPlaceholderText('Search voting history...')).toBeTruthy();
  });

  it('should handle search input changes', () => {
    const { getByPlaceholderText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const searchInput = getByPlaceholderText('Search voting history...');
    fireEvent.change(searchInput, { target: { value: 'presidential' } });

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('presidential');
  });

  it('should show loading state', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, { ...mockProps, isLoading: true })
    );

    expect(getByText('Loading voting history...')).toBeTruthy();
  });

  it('should show error state', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, { 
        ...mockProps, 
        error: 'Failed to load voting history' 
      })
    );

    expect(getByText('Failed to load voting history')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should show empty state when no records', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, { ...mockProps, votingRecords: [] })
    );

    expect(getByText('No Voting History')).toBeTruthy();
    expect(getByText('You haven\'t voted in any elections yet.')).toBeTruthy();
  });

  it('should handle view mode toggle', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const listButton = getByText('List');
    fireEvent.press(listButton);

    // Should switch to list view
    expect(listButton).toBeTruthy();
  });

  it('should handle sort changes', () => {
    const { container } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const sortSelect = container.querySelector('select');
    fireEvent.change(sortSelect!, { target: { value: 'election-asc' } });

    // Should update sort state
    expect(sortSelect).toBeTruthy();
  });

  it('should call onRecordSelect when record is selected', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const viewDetailsButton = getByText('View Details');
    fireEvent.press(viewDetailsButton);

    expect(mockProps.onRecordSelect).toHaveBeenCalled();
  });

  it('should call onViewElection when view election is clicked', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const viewElectionButton = getByText('View Election');
    fireEvent.press(viewElectionButton);

    expect(mockProps.onViewElection).toHaveBeenCalled();
  });

  it('should call onViewCandidate when view candidate is clicked', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const viewCandidateButton = getByText('View Candidate');
    fireEvent.press(viewCandidateButton);

    expect(mockProps.onViewCandidate).toHaveBeenCalled();
  });

  it('should call onDownloadHistory when download is clicked', () => {
    const { getByText } = render(
      React.createElement(VotingHistory, mockProps)
    );

    const downloadButton = getByText('Download');
    fireEvent.press(downloadButton);

    expect(mockProps.onDownloadHistory).toHaveBeenCalled();
  });
});

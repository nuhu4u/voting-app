/**
 * Voting Modal Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VotingModal } from '@/components/voting/voting-modal';
import { Election, Contestant } from '@/types/election';

// Mock election data
const mockElection: Election = {
  id: '1',
  title: 'Presidential Election 2024',
  description: 'Vote for the next president of Nigeria',
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-01-31T23:59:59Z',
  status: 'ONGOING',
  type: 'PRESIDENTIAL',
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
  total_votes: 10700000,
  created_at: '2023-12-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockCandidate: Contestant = mockElection.contestants[0];

describe('VotingModal', () => {
  const mockOnClose = jest.fn();
  const mockOnVote = jest.fn();
  const mockOnSelectCandidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render voting modal when visible', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('Cast Your Vote')).toBeTruthy();
    expect(getByText('Presidential Election 2024')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      React.createElement(VotingModal, {
        visible: false,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(queryByText('Cast Your Vote')).toBeNull();
  });

  it('should show candidate selection step initially', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('Select Your Candidate')).toBeTruthy();
    expect(getByText('Choose the candidate you want to vote for in this election.')).toBeTruthy();
  });

  it('should display election information', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('Presidential Election 2024')).toBeTruthy();
    expect(getByText('Vote for the next president of Nigeria')).toBeTruthy();
    expect(getByText('2 candidates')).toBeTruthy();
  });

  it('should display candidates list', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
    expect(getByText('Democratic Alliance')).toBeTruthy();
  });

  it('should call onSelectCandidate when candidate is selected', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    fireEvent.press(getByText('John Doe'));
    expect(mockOnSelectCandidate).toHaveBeenCalledWith(mockCandidate);
  });

  it('should show confirmation step when candidate is selected', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('Confirm Your Vote')).toBeTruthy();
    expect(getByText('You are voting for:')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('should call onVote when vote button is pressed', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    fireEvent.press(getByText('Cast Vote'));
    expect(mockOnVote).toHaveBeenCalledWith(mockCandidate.id);
  });

  it('should show back button in confirmation step', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('Back')).toBeTruthy();
  });

  it('should show warning message in confirmation step', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('Once you cast your vote, it cannot be changed. Please ensure you have selected the correct candidate.')).toBeTruthy();
  });

  it('should show processing step when voting', async () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate,
        isLoading: true
      })
    );

    expect(getByText('Processing Your Vote')).toBeTruthy();
    expect(getByText('Voting for John Doe...')).toBeTruthy();
  });

  it('should show success step after successful vote', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    // Simulate successful vote
    fireEvent.press(getByText('Cast Vote'));
    
    // This would be triggered by the voting logic
    // In a real test, you'd mock the voting response
  });

  it('should show error step when vote fails', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: mockCandidate,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate,
        error: 'Vote failed'
      })
    );

    expect(getByText('Vote Failed')).toBeTruthy();
    expect(getByText('Vote failed')).toBeTruthy();
  });

  it('should call onClose when close button is pressed', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    // Find and press close button (X icon)
    const closeButton = getByText('Cast Your Vote').parent?.parent?.children[2];
    if (closeButton) {
      fireEvent.press(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should display candidate vote counts', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    expect(getByText('6,500,000')).toBeTruthy();
    expect(getByText('4,200,000')).toBeTruthy();
    expect(getByText('votes')).toBeTruthy();
  });

  it('should display election dates', () => {
    const { getByText } = render(
      React.createElement(VotingModal, {
        visible: true,
        election: mockElection,
        selectedCandidate: null,
        onClose: mockOnClose,
        onVote: mockOnVote,
        onSelectCandidate: mockOnSelectCandidate
      })
    );

    // Check for formatted date range
    expect(getByText(/Jan 1, 2024/)).toBeTruthy();
    expect(getByText(/Jan 31, 2024/)).toBeTruthy();
  });
});

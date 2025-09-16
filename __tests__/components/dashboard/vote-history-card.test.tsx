import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { VoteHistoryCard } from '@/components/dashboard/vote-history-card';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockElection = {
  title: 'Governorship Election 2025',
  candidate: 'Adebayo Ogundimu',
  party: 'All Progressives Congress',
  partyAcronym: 'APC',
  runningMate: 'Dr. Fatima Abdullahi',
  votedOn: '9/12/2025, 9:39:37 PM',
  votePosition: 2,
  blockchainTx: '0x8d7885e4...a3551e60',
};

const mockHandlers = {
  onViewPosition: jest.fn(),
  onViewResults: jest.fn(),
  onExploreBlockchain: jest.fn(),
  onViewTransaction: jest.fn(),
};

describe('VoteHistoryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders election information correctly', () => {
    const { getByText } = render(
      <VoteHistoryCard
        election={mockElection}
        {...mockHandlers}
      />
    );

    expect(getByText('Governorship Election 2025')).toBeTruthy();
    expect(getByText('Candidate: Adebayo Ogundimu')).toBeTruthy();
    expect(getByText('All Progressives Congress (APC)')).toBeTruthy();
    expect(getByText('Running Mate: Dr. Fatima Abdullahi')).toBeTruthy();
    expect(getByText('Voted on: 9/12/2025, 9:39:37 PM')).toBeTruthy();
    expect(getByText('Vote Position: #2')).toBeTruthy();
    expect(getByText('0x8d7885e4...a3551e60')).toBeTruthy();
  });

  it('renders voted badge', () => {
    const { getByText } = render(
      <VoteHistoryCard
        election={mockElection}
        {...mockHandlers}
      />
    );

    expect(getByText('Voted')).toBeTruthy();
  });

  it('calls onViewPosition when View Position button is pressed', () => {
    const { getByText } = render(
      <VoteHistoryCard
        election={mockElection}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('View Position'));
    expect(mockHandlers.onViewPosition).toHaveBeenCalledTimes(1);
  });

  it('calls onViewResults when View Results button is pressed', () => {
    const { getByText } = render(
      <VoteHistoryCard
        election={mockElection}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('View Results'));
    expect(mockHandlers.onViewResults).toHaveBeenCalledTimes(1);
  });

  it('calls onExploreBlockchain when Explore Blockchain button is pressed', () => {
    const { getByText } = render(
      <VoteHistoryCard
        election={mockElection}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('Explore Blockchain'));
    expect(mockHandlers.onExploreBlockchain).toHaveBeenCalledTimes(1);
  });

  it('calls onViewTransaction when transaction hash is pressed', () => {
    const { getByText } = render(
      <VoteHistoryCard
        election={mockElection}
        {...mockHandlers}
      />
    );

    fireEvent.press(getByText('0x8d7885e4...a3551e60'));
    expect(mockHandlers.onViewTransaction).toHaveBeenCalledTimes(1);
  });
});

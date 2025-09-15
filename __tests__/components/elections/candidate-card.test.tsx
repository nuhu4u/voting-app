/**
 * Candidate Card Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CandidateCard } from '@/components/elections/candidate-card';
import { Contestant } from '@/types/election';

// Mock candidate data
const mockCandidate: Contestant = {
  id: '1',
  name: 'John Doe',
  party: 'Progressive Party',
  party_acronym: 'PP',
  position: 'President',
  votes: 6500000,
  picture: null
};

describe('CandidateCard', () => {
  const mockOnPress = jest.fn();
  const mockOnVote = jest.fn();
  const mockOnViewProfile = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render candidate information', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING'
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('President')).toBeTruthy();
    expect(getByText('6,500,000')).toBeTruthy();
  });

  it('should render vote button when election is ongoing', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        onVote: mockOnVote
      })
    );

    expect(getByText('Vote Now')).toBeTruthy();
  });

  it('should not render vote button when election is not ongoing', () => {
    const { queryByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'UPCOMING',
        onVote: mockOnVote
      })
    );

    expect(queryByText('Vote Now')).toBeNull();
  });

  it('should call onPress when card is pressed', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        onPress: mockOnPress
      })
    );

    fireEvent.press(getByText('John Doe'));
    expect(mockOnPress).toHaveBeenCalledWith(mockCandidate);
  });

  it('should call onVote when vote button is pressed', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        onVote: mockOnVote
      })
    );

    fireEvent.press(getByText('Vote Now'));
    expect(mockOnVote).toHaveBeenCalledWith(mockCandidate);
  });

  it('should show alert when trying to vote in non-ongoing election', () => {
    const alertSpy = jest.spyOn(require('react-native'), 'Alert').mockImplementation(() => {});
    
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'UPCOMING',
        onVote: mockOnVote
      })
    );

    // Try to vote (this should show alert)
    fireEvent.press(getByText('Vote Now'));
    expect(alertSpy).toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('should render minimal variant correctly', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        variant: 'minimal'
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('PP')).toBeTruthy();
  });

  it('should render compact variant correctly', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        variant: 'compact'
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('President')).toBeTruthy();
  });

  it('should render detailed variant correctly', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        variant: 'detailed',
        onViewProfile: mockOnViewProfile,
        onShare: mockOnShare
      })
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('President')).toBeTruthy();
    expect(getByText('Vote for Candidate')).toBeTruthy();
  });

  it('should hide vote count when showVoteCount is false', () => {
    const { queryByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        showVoteCount: false
      })
    );

    expect(queryByText('6,500,000')).toBeNull();
  });

  it('should hide vote button when showVoteButton is false', () => {
    const { queryByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        showVoteButton: false
      })
    );

    expect(queryByText('Vote Now')).toBeNull();
  });

  it('should display candidate avatar with first letter when no picture', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING'
      })
    );

    expect(getByText('J')).toBeTruthy(); // First letter of John
  });

  it('should handle press states correctly', () => {
    const { getByText } = render(
      React.createElement(CandidateCard, {
        candidate: mockCandidate,
        electionStatus: 'ONGOING',
        onPress: mockOnPress
      })
    );

    const card = getByText('John Doe').parent;
    fireEvent.pressIn(card);
    fireEvent.pressOut(card);
    
    expect(mockOnPress).toHaveBeenCalled();
  });
});

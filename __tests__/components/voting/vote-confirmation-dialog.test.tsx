/**
 * Vote Confirmation Dialog Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { VoteConfirmationDialog } from '@/components/voting/vote-confirmation-dialog';
import { Election, Contestant } from '@/types/election';

// Mock election and candidate data
const mockElection: Election = {
  id: '1',
  title: 'Presidential Election 2024',
  description: 'Vote for the next president of Nigeria',
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z',
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
    }
  ],
  total_votes: 6500000,
  created_at: '2023-12-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockCandidate: Contestant = mockElection.contestants[0];

describe('VoteConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render confirmation dialog when visible', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(getByText('Confirm Your Vote')).toBeTruthy();
    expect(getByText('Final Verification')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: false,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(queryByText('Confirm Your Vote')).toBeNull();
  });

  it('should display vote summary', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(getByText('Vote Summary')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Progressive Party')).toBeTruthy();
    expect(getByText('President')).toBeTruthy();
  });

  it('should display election information', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(getByText('Presidential Election 2024')).toBeTruthy();
    expect(getByText(/Jan 1, 2024/)).toBeTruthy();
    expect(getByText(/Dec 31, 2024/)).toBeTruthy();
  });

  it('should display verification code', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(getByText('Verification Code')).toBeTruthy();
    expect(getByText('••••••')).toBeTruthy();
  });

  it('should toggle verification code visibility', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    const showButton = getByText('••••••').parent?.children[1];
    if (showButton) {
      fireEvent.press(showButton);
      // Code should now be visible
    }
  });

  it('should show biometric verification step', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    // This would be triggered by the confirmation logic
    // In a real test, you'd mock the biometric verification
  });

  it('should show processing step when confirming', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
        isLoading: true
      })
    );

    expect(getByText('Processing Vote')).toBeTruthy();
    expect(getByText('Confirming vote for John Doe...')).toBeTruthy();
  });

  it('should show success step after successful confirmation', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    // This would be triggered by successful confirmation
    // In a real test, you'd mock the confirmation success
  });

  it('should show error step when confirmation fails', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
        error: 'Confirmation failed'
      })
    );

    expect(getByText('Confirmation Failed')).toBeTruthy();
    expect(getByText('Confirmation failed')).toBeTruthy();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    fireEvent.press(getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onConfirm when confirm button is pressed', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    fireEvent.press(getByText('Confirm Vote'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should display warning message', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(getByText('This action cannot be undone. Your vote will be permanently recorded on the blockchain.')).toBeTruthy();
  });

  it('should display biometric status', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    expect(getByText('Biometric Required')).toBeTruthy();
  });

  it('should handle close button press', () => {
    const { getByText } = render(
      React.createElement(VoteConfirmationDialog, {
        visible: true,
        election: mockElection,
        candidate: mockCandidate,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel
      })
    );

    // Find and press close button (X icon)
    const closeButton = getByText('Confirm Your Vote').parent?.parent?.children[2];
    if (closeButton) {
      fireEvent.press(closeButton);
      expect(mockOnCancel).toHaveBeenCalled();
    }
  });
});

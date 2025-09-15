/**
 * Voting Integration Component
 * Integrates voting modal with election data and voting logic
 */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { VotingModal } from './voting-modal';
import { useVoting } from '../../hooks/use-voting';
import { useElectionStore } from '../../store/election-store';
import { Election, Contestant } from '../../types/election';

interface VotingIntegrationProps {
  visible: boolean;
  electionId: string | null;
  onClose: () => void;
  onVoteSuccess?: (voteResponse: any) => void;
  onVoteError?: (error: string) => void;
  className?: string;
}

export function VotingIntegration({
  visible,
  electionId,
  onClose,
  onVoteSuccess,
  onVoteError,
  className
}: VotingIntegrationProps) {
  const { elections } = useElectionStore();
  const {
    state: votingState,
    selectCandidate,
    clearSelection,
    castVote,
    canVoteForElection,
    validateVote
  } = useVoting();

  const [selectedCandidate, setSelectedCandidate] = React.useState<Contestant | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get election data
  const election = React.useMemo(() => {
    if (!electionId) return null;
    return elections.find(e => e.id === electionId) || null;
  }, [electionId, elections]);

  // Handle candidate selection
  const handleSelectCandidate = React.useCallback((candidate: Contestant) => {
    if (!election) return;

    // Validate candidate selection
    const validation = validateVote(election, candidate);
    if (!validation.valid) {
      setError(validation.message || 'Invalid candidate selection');
      return;
    }

    setSelectedCandidate(candidate);
    selectCandidate(candidate);
    setError(null);
  }, [election, validateVote, selectCandidate]);

  // Handle vote submission
  const handleVote = React.useCallback(async (candidateId: string, position?: number) => {
    if (!election) return { success: false, message: 'No election selected' };

    setIsLoading(true);
    setError(null);

    try {
      const result = await castVote(election.id, candidateId, position);
      
      if (result.success) {
        onVoteSuccess?.(result);
        // Clear selection after successful vote
        setSelectedCandidate(null);
        clearSelection();
      } else {
        onVoteError?.(result.message || 'Vote failed');
        setError(result.message || 'Vote failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Vote failed';
      onVoteError?.(errorMessage);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [election, castVote, onVoteSuccess, onVoteError, clearSelection]);

  // Handle modal close
  const handleClose = React.useCallback(() => {
    setSelectedCandidate(null);
    clearSelection();
    setError(null);
    onClose();
  }, [clearSelection, onClose]);

  // Check if voting is allowed
  const canVote = React.useMemo(() => {
    if (!election) return false;
    return canVoteForElection(election);
  }, [election, canVoteForElection]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!visible) {
      setSelectedCandidate(null);
      clearSelection();
      setError(null);
    }
  }, [visible, clearSelection]);

  if (!election) {
    return null;
  }

  return React.createElement(View, { style: styles.container },
    React.createElement(VotingModal, {
      visible: visible && canVote,
      election: election,
      selectedCandidate: selectedCandidate,
      onClose: handleClose,
      onVote: handleVote,
      onSelectCandidate: handleSelectCandidate,
      isLoading: isLoading || votingState.isVoting,
      error: error || votingState.error
    })
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default VotingIntegration;

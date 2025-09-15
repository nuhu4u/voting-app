/**
 * Vote Submission Integration Component
 * Integrates vote submission with confirmation and status tracking
 */

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { useVoteSubmission } from '../../hooks/use-vote-submission';
import { useElectionStore } from '../../store/election-store';
import { Election, Contestant } from '../../types/election';

interface VoteSubmissionIntegrationProps {
  electionId: string | null;
  candidateId: string | null;
  verificationCode: string | null;
  biometricHash: string | null;
  voterId: string | null;
  onSubmissionComplete: (result: any) => void;
  onSubmissionError: (error: string) => void;
  className?: string;
}

export function VoteSubmissionIntegration({
  electionId,
  candidateId,
  verificationCode,
  biometricHash,
  voterId,
  onSubmissionComplete,
  onSubmissionError,
  className
}: VoteSubmissionIntegrationProps) {
  const { elections } = useElectionStore();
  const {
    state: submissionState,
    submitVote,
    validateSubmission,
    createSubmissionRequest,
    clearError
  } = useVoteSubmission();

  const [election, setElection] = React.useState<Election | null>(null);
  const [candidate, setCandidate] = React.useState<Contestant | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get election and candidate data
  React.useEffect(() => {
    if (electionId && candidateId) {
      const foundElection = elections.find(e => e.id === electionId);
      const foundCandidate = foundElection?.contestants.find(c => c.id === candidateId);
      
      setElection(foundElection || null);
      setCandidate(foundCandidate || null);
    } else {
      setElection(null);
      setCandidate(null);
    }
  }, [electionId, candidateId, elections]);

  // Auto-submit when all required data is available
  React.useEffect(() => {
    if (election && candidate && verificationCode && biometricHash && voterId && !isSubmitting) {
      handleSubmitVote();
    }
  }, [election, candidate, verificationCode, biometricHash, voterId, isSubmitting]);

  // Handle vote submission
  const handleSubmitVote = React.useCallback(async () => {
    if (!election || !candidate || !verificationCode || !biometricHash || !voterId) {
      onSubmissionError('Missing required submission data');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate submission
      const validation = validateSubmission(election, candidate, voterId);
      if (!validation.valid) {
        onSubmissionError(validation.message || 'Invalid submission');
        return;
      }

      // Create submission request
      const request = createSubmissionRequest(
        election,
        candidate,
        voterId,
        verificationCode,
        biometricHash
      );

      // Submit vote
      const result = await submitVote(request);

      if (result.success) {
        onSubmissionComplete(result);
      } else {
        onSubmissionError(result.error || 'Submission failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      onSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [election, candidate, verificationCode, biometricHash, voterId, validateSubmission, createSubmissionRequest, submitVote, onSubmissionComplete, onSubmissionError]);

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Show submission status
  const getSubmissionStatus = () => {
    if (isSubmitting || submissionState.isSubmitting) {
      return 'Submitting vote...';
    }

    if (submissionState.submissionStatus) {
      switch (submissionState.submissionStatus.status) {
        case 'pending':
          return 'Vote pending confirmation...';
        case 'processing':
          return 'Processing vote...';
        case 'confirmed':
          return 'Vote confirmed successfully!';
        case 'failed':
          return 'Vote submission failed';
        case 'rejected':
          return 'Vote submission rejected';
        default:
          return 'Unknown status';
      }
    }

    return 'Ready to submit';
  };

  const getStatusColor = () => {
    if (isSubmitting || submissionState.isSubmitting) {
      return '#3b82f6'; // Blue for processing
    }

    if (submissionState.submissionStatus) {
      switch (submissionState.submissionStatus.status) {
        case 'pending':
          return '#f59e0b'; // Orange for pending
        case 'processing':
          return '#3b82f6'; // Blue for processing
        case 'confirmed':
          return '#10b981'; // Green for success
        case 'failed':
          return '#ef4444'; // Red for error
        case 'rejected':
          return '#6b7280'; // Gray for rejected
        default:
          return '#6b7280'; // Gray for unknown
      }
    }

    return '#6b7280'; // Gray for ready
  };

  if (!election || !candidate) {
    return null;
  }

  return React.createElement(View, { style: styles.container },
    React.createElement(View, { style: styles.statusContainer },
      React.createElement(View, { 
        style: [styles.statusIndicator, { backgroundColor: getStatusColor() }] 
      }),
      React.createElement(View, { style: styles.statusContent },
        React.createElement(View, { style: styles.statusText },
          getSubmissionStatus()
        ),
        submissionState.submissionStatus?.transactionHash && React.createElement(View, { style: styles.transactionInfo },
          React.createElement(View, { style: styles.transactionLabel }, 'Transaction:'),
          React.createElement(Text, { style: styles.transactionHash },
            `${submissionState.submissionStatus.transactionHash.substring(0, 10)}...`
          )
        ),
        submissionState.submissionStatus?.blockNumber && React.createElement(View, { style: styles.blockInfo },
          React.createElement(View, { style: styles.blockLabel }, 'Block:'),
          React.createElement(Text, { style: styles.blockNumber },
            submissionState.submissionStatus.blockNumber.toString()
          )
        )
      )
    ),

    submissionState.error && React.createElement(View, { style: styles.errorContainer },
      React.createElement(View, { style: styles.errorText }, submissionState.error),
      submissionState.canRetry && React.createElement(View, { style: styles.retryInfo },
        React.createElement(Text, { style: styles.retryText },
          `Retry attempt ${submissionState.retryCount} of 3`
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  statusContent: {
    flex: 1
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  transactionLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8
  },
  transactionHash: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#3b82f6'
  },
  blockInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  blockLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 8
  },
  blockNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#3b82f6'
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8
  },
  retryInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  retryText: {
    fontSize: 12,
    color: '#6b7280'
  }
});

export default VoteSubmissionIntegration;

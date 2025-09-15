/**
 * Voting Modal Component
 * Secure voting interface with validation and confirmation
 */

import * as React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Election, Contestant } from '../../types/election';
import { formatDate, formatDateTime } from '../../lib/utils';

interface VotingModalProps {
  visible: boolean;
  election: Election | null;
  selectedCandidate: Contestant | null;
  onClose: () => void;
  onVote: (candidateId: string, position?: number) => Promise<{ success: boolean; message?: string }>;
  onSelectCandidate: (candidate: Contestant) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function VotingModal({
  visible,
  election,
  selectedCandidate,
  onClose,
  onVote,
  onSelectCandidate,
  isLoading = false,
  error = null,
  className
}: VotingModalProps) {
  const [step, setStep] = React.useState<'select' | 'confirm' | 'processing' | 'success' | 'error'>('select');
  const [voteError, setVoteError] = React.useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = React.useState(false);

  // Reset modal state when visibility changes
  React.useEffect(() => {
    if (visible) {
      setStep('select');
      setVoteError(null);
      setVoteSuccess(false);
    }
  }, [visible]);

  const handleCandidateSelect = (candidate: Contestant) => {
    onSelectCandidate(candidate);
    setStep('confirm');
  };

  const handleVote = async () => {
    if (!selectedCandidate || !election) return;

    setStep('processing');
    setVoteError(null);

    try {
      const result = await onVote(selectedCandidate.id);
      
      if (result.success) {
        setVoteSuccess(true);
        setStep('success');
        
        // Auto-close after success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setVoteError(result.message || 'Vote failed');
        setStep('error');
      }
    } catch (err) {
      setVoteError(err instanceof Error ? err.message : 'Vote failed');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('select');
    setVoteError(null);
    setVoteSuccess(false);
    onClose();
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select');
    } else if (step === 'error') {
      setStep('confirm');
    }
  };

  if (!election) return null;

  return React.createElement(Modal, {
    visible: visible,
    animationType: 'slide',
    presentationStyle: 'pageSheet',
    onRequestClose: handleClose
  },
    React.createElement(View, { style: styles.container },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, { style: styles.headerContent },
          step !== 'select' && React.createElement(Pressable, { 
            style: styles.backButton, 
            onPress: handleBack 
          },
            React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: '#3b82f6' })
          ),
          React.createElement(View, { style: styles.headerInfo },
            React.createElement(Text, { style: styles.headerTitle }, 'Cast Your Vote'),
            React.createElement(Text, { style: styles.headerSubtitle }, election.title)
          ),
          React.createElement(Pressable, { 
            style: styles.closeButton, 
            onPress: handleClose 
          },
            React.createElement(Ionicons, { name: 'close', size: 24, color: '#6b7280' })
          )
        )
      ),

      // Content
      React.createElement(ScrollView, { style: styles.content },
        step === 'select' && React.createElement(SelectCandidateStep, {
          election,
          candidates: election.contestants,
          onSelectCandidate: handleCandidateSelect
        }),

        step === 'confirm' && selectedCandidate && React.createElement(ConfirmVoteStep, {
          election,
          candidate: selectedCandidate,
          onVote: handleVote,
          onBack: handleBack
        }),

        step === 'processing' && React.createElement(ProcessingStep, {
          election: election,
          candidate: selectedCandidate
        }),

        step === 'success' && React.createElement(SuccessStep, {
          election: election,
          candidate: selectedCandidate,
          onClose: handleClose
        }),

        step === 'error' && React.createElement(ErrorStep, {
          election: election,
          error: voteError || error,
          onRetry: handleVote,
          onBack: handleBack
        })
      )
    )
  );
}

interface StepProps {
  election: Election;
  candidates?: Contestant[];
  candidate?: Contestant | null;
  onSelectCandidate?: (candidate: Contestant) => void;
  onVote?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

function SelectCandidateStep({ election, candidates, onSelectCandidate }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.stepHeader },
      React.createElement(Ionicons, { name: 'person', size: 32, color: '#3b82f6' }),
      React.createElement(Text, { style: styles.stepTitle }, 'Select Your Candidate'),
      React.createElement(Text, { style: styles.stepDescription },
        'Choose the candidate you want to vote for in this election.'
      )
    ),

    React.createElement(View, { style: styles.electionInfo },
      React.createElement(Text, { style: styles.electionTitle }, election.title),
      React.createElement(Text, { style: styles.electionDescription }, election.description),
      React.createElement(View, { style: styles.electionMeta },
        React.createElement(View, { style: styles.metaItem },
          React.createElement(Ionicons, { name: 'calendar', size: 16, color: '#6b7280' }),
          React.createElement(Text, { style: styles.metaText },
            `${formatDate(election.start_date)} - ${formatDate(election.end_date)}`
          )
        ),
        React.createElement(View, { style: styles.metaItem },
          React.createElement(Ionicons, { name: 'people', size: 16, color: '#6b7280' }),
          React.createElement(Text, { style: styles.metaText },
            `${candidates?.length || 0} candidates`
          )
        )
      )
    ),

    React.createElement(View, { style: styles.candidatesList },
      candidates?.map((candidate) => 
        React.createElement(Pressable, {
          key: candidate.id,
          style: styles.candidateItem,
          onPress: () => onSelectCandidate?.(candidate)
        },
          React.createElement(View, { style: styles.candidateAvatar },
            React.createElement(Text, { style: styles.candidateAvatarText }, candidate.name.charAt(0))
          ),
          React.createElement(View, { style: styles.candidateInfo },
            React.createElement(Text, { style: styles.candidateName }, candidate.name),
            React.createElement(Text, { style: styles.candidateParty }, candidate.party),
            React.createElement(Text, { style: styles.candidatePosition }, candidate.position)
          ),
          React.createElement(View, { style: styles.candidateVotes },
            React.createElement(Text, { style: styles.candidateVoteCount }, candidate.votes.toLocaleString()),
            React.createElement(Text, { style: styles.candidateVoteLabel }, 'votes')
          ),
          React.createElement(Ionicons, { name: 'chevron-forward', size: 20, color: '#9ca3af' })
        )
      )
    )
  );
}

function ConfirmVoteStep({ election, candidate, onVote, onBack }: StepProps) {
  if (!candidate) return null;

  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.stepHeader },
      React.createElement(Ionicons, { name: 'checkmark-circle', size: 32, color: '#10b981' }),
      React.createElement(Text, { style: styles.stepTitle }, 'Confirm Your Vote'),
      React.createElement(Text, { style: styles.stepDescription },
        'Please review your selection before casting your vote.'
      )
    ),

    React.createElement(View, { style: styles.confirmationCard },
      React.createElement(Text, { style: styles.confirmationTitle }, 'You are voting for:'),
      React.createElement(View, { style: styles.selectedCandidate },
        React.createElement(View, { style: styles.selectedCandidateAvatar },
          React.createElement(Text, { style: styles.selectedCandidateAvatarText }, candidate.name.charAt(0))
        ),
        React.createElement(View, { style: styles.selectedCandidateInfo },
          React.createElement(Text, { style: styles.selectedCandidateName }, candidate.name),
          React.createElement(Text, { style: styles.selectedCandidateParty }, candidate.party),
          React.createElement(Text, { style: styles.selectedCandidatePosition }, candidate.position)
        )
      ),
      React.createElement(View, { style: styles.electionDetails },
        React.createElement(Text, { style: styles.electionDetailsTitle }, 'Election Details:'),
        React.createElement(Text, { style: styles.electionDetailsText }, election.title),
        React.createElement(Text, { style: styles.electionDetailsText }, election.description)
      )
    ),

    React.createElement(View, { style: styles.warningBox },
      React.createElement(Ionicons, { name: 'warning', size: 20, color: '#f59e0b' }),
      React.createElement(Text, { style: styles.warningText },
        'Once you cast your vote, it cannot be changed. Please ensure you have selected the correct candidate.'
      )
    ),

    React.createElement(View, { style: styles.actionButtons },
      React.createElement(Pressable, { 
        style: styles.backButtonAction, 
        onPress: onBack 
      },
        React.createElement(Text, { style: styles.backButtonText }, 'Back')
      ),
      React.createElement(Pressable, { 
        style: styles.voteButton, 
        onPress: onVote 
      },
        React.createElement(View, { style: styles.voteButtonContent },
          React.createElement(Ionicons, { name: 'checkmark-circle', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.voteButtonText }, 'Cast Vote')
        )
      )
    )
  );
}

function ProcessingStep({ candidate }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.processingContent },
      React.createElement(ActivityIndicator, { size: 'large', color: '#3b82f6' }),
      React.createElement(Text, { style: styles.processingTitle }, 'Processing Your Vote'),
      React.createElement(Text, { style: styles.processingDescription },
        `Voting for ${candidate?.name}...`
      ),
      React.createElement(Text, { style: styles.processingNote },
        'Please wait while we process your vote securely.'
      )
    )
  );
}

function SuccessStep({ candidate, onClose }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.successContent },
      React.createElement(Ionicons, { name: 'checkmark-circle', size: 64, color: '#10b981' }),
      React.createElement(Text, { style: styles.successTitle }, 'Vote Cast Successfully!'),
      React.createElement(Text, { style: styles.successDescription },
        `Your vote for ${candidate?.name} has been recorded.`
      ),
      React.createElement(Text, { style: styles.successNote },
        'Thank you for participating in the democratic process.'
      )
    )
  );
}

function ErrorStep({ error, onRetry, onBack }: StepProps) {
  return React.createElement(View, { style: styles.stepContainer },
    React.createElement(View, { style: styles.errorContent },
      React.createElement(Ionicons, { name: 'alert-circle', size: 64, color: '#ef4444' }),
      React.createElement(Text, { style: styles.errorTitle }, 'Vote Failed'),
      React.createElement(Text, { style: styles.errorDescription }, error || 'An error occurred while processing your vote.'),
      React.createElement(View, { style: styles.errorActions },
        React.createElement(Pressable, { 
          style: styles.retryButton, 
          onPress: onRetry 
        },
          React.createElement(Text, { style: styles.retryButtonText }, 'Try Again')
        ),
        React.createElement(Pressable, { 
          style: styles.backButtonAction, 
          onPress: onBack 
        },
          React.createElement(Text, { style: styles.backButtonText }, 'Back')
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backButton: {
    padding: 8
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2
  },
  closeButton: {
    padding: 8
  },
  content: {
    flex: 1
  },
  stepContainer: {
    padding: 16
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22
  },
  electionInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  electionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20
  },
  electionMeta: {
    gap: 8
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280'
  },
  candidatesList: {
    gap: 12
  },
  candidateItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  candidateAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280'
  },
  candidateInfo: {
    flex: 1
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  candidateParty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2
  },
  candidatePosition: {
    fontSize: 12,
    color: '#9ca3af'
  },
  candidateVotes: {
    alignItems: 'flex-end'
  },
  candidateVoteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  candidateVoteLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  confirmationCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16
  },
  selectedCandidate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8
  },
  selectedCandidateAvatar: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedCandidateAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white'
  },
  selectedCandidateInfo: {
    flex: 1
  },
  selectedCandidateName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  selectedCandidateParty: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2
  },
  selectedCandidatePosition: {
    fontSize: 14,
    color: '#9ca3af'
  },
  electionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16
  },
  electionDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  electionDetailsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  backButtonAction: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  },
  voteButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  voteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  processingContent: {
    alignItems: 'center',
    paddingVertical: 48
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  processingDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8
  },
  processingNote: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center'
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 48
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8
  },
  successDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center'
  },
  successNote: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center'
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 48
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8
  },
  errorDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center'
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  }
});

export default VotingModal;
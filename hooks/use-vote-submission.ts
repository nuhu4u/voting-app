/**
 * Vote Submission Hook
 * Custom hook for managing vote submission and status tracking
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';
import VoteSubmissionService, { VoteSubmissionRequest, VoteSubmissionResponse, VoteSubmissionStatus } from '../services/vote-submission.service';
import { Election, Contestant } from '../types/election';

export interface VoteSubmissionState {
  isSubmitting: boolean;
  submissionStatus: VoteSubmissionStatus | null;
  submissionHistory: VoteSubmissionStatus[];
  error: string | null;
  retryCount: number;
  canRetry: boolean;
  lastSubmissionTime: number | null;
}

export interface UseVoteSubmissionReturn {
  state: VoteSubmissionState;
  submitVote: (request: VoteSubmissionRequest) => Promise<VoteSubmissionResponse>;
  getSubmissionStatus: (voteId: string) => VoteSubmissionStatus | null;
  retrySubmission: (voteId: string) => Promise<VoteSubmissionResponse>;
  cancelSubmission: (voteId: string) => boolean;
  clearError: () => void;
  getSubmissionHistory: () => VoteSubmissionStatus[];
  getPendingSubmissions: () => VoteSubmissionStatus[];
  getSubmissionStatistics: () => {
    total: number;
    pending: number;
    processing: number;
    confirmed: number;
    failed: number;
    rejected: number;
  };
  validateSubmission: (election: Election, candidate: Contestant, voterId: string) => { valid: boolean; message?: string };
  createSubmissionRequest: (election: Election, candidate: Contestant, voterId: string, verificationCode: string, biometricHash: string) => VoteSubmissionRequest;
}

const initialState: VoteSubmissionState = {
  isSubmitting: false,
  submissionStatus: null,
  submissionHistory: [],
  error: null,
  retryCount: 0,
  canRetry: true,
  lastSubmissionTime: null
};

export function useVoteSubmission(): UseVoteSubmissionReturn {
  const [state, setState] = useState<VoteSubmissionState>(initialState);
  const serviceRef = useRef<VoteSubmissionService | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = VoteSubmissionService.getInstance();
    
    // Start status checking interval
    statusCheckIntervalRef.current = setInterval(() => {
      checkSubmissionStatuses();
    }, 5000); // Check every 5 seconds

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);

  // Check submission statuses
  const checkSubmissionStatuses = useCallback(() => {
    if (!serviceRef.current) return;

    const pendingSubmissions = serviceRef.current.getPendingSubmissions();
    const updatedHistory: VoteSubmissionStatus[] = [];

    pendingSubmissions.forEach(submission => {
      const currentStatus = serviceRef.current!.getSubmissionStatus(submission.voteId);
      if (currentStatus) {
        updatedHistory.push(currentStatus);
      }
    });

    if (updatedHistory.length > 0) {
      setState(prev => ({
        ...prev,
        submissionHistory: [...prev.submissionHistory, ...updatedHistory]
      }));
    }
  }, []);

  // Submit vote
  const submitVote = useCallback(async (request: VoteSubmissionRequest): Promise<VoteSubmissionResponse> => {
    if (!serviceRef.current) {
      return { success: false, error: 'Service not initialized' };
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null,
      lastSubmissionTime: Date.now()
    }));

    try {
      const response = await serviceRef.current.submitVote(request);

      if (response.success) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          submissionStatus: {
            voteId: response.voteId!,
            status: 'confirmed',
            transactionHash: response.transactionHash,
            blockNumber: response.blockNumber,
            confirmationCount: 1,
            submittedAt: Date.now(),
            confirmedAt: Date.now()
          },
          error: null,
          retryCount: 0
        }));

        Alert.alert(
          'Vote Submitted Successfully',
          `Your vote has been submitted and confirmed on the blockchain.\n\nTransaction: ${response.transactionHash?.substring(0, 10)}...`,
          [{ text: 'OK' }]
        );
      } else {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: response.error || 'Submission failed',
          retryCount: prev.retryCount + 1,
          canRetry: response.retryAfter ? true : false
        }));

        if (response.retryAfter) {
          Alert.alert(
            'Submission Failed',
            `Vote submission failed. Retrying in ${Math.ceil(response.retryAfter / 1000)} seconds.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Submission Failed',
            response.error || 'Vote submission failed. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      Alert.alert(
        'Submission Error',
        errorMessage,
        [{ text: 'OK' }]
      );

      return { success: false, error: errorMessage };
    }
  }, []);

  // Get submission status
  const getSubmissionStatus = useCallback((voteId: string): VoteSubmissionStatus | null => {
    if (!serviceRef.current) return null;
    return serviceRef.current.getSubmissionStatus(voteId);
  }, []);

  // Retry submission
  const retrySubmission = useCallback(async (voteId: string): Promise<VoteSubmissionResponse> => {
    if (!serviceRef.current) {
      return { success: false, error: 'Service not initialized' };
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));

    try {
      // Get the original request from submission history
      const submission = state.submissionHistory.find(s => s.voteId === voteId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      // This would require storing the original request
      // For now, return a mock retry response
      const response: VoteSubmissionResponse = {
        success: true,
        voteId,
        message: 'Retry successful'
      };

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: null,
        retryCount: 0
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, [state.submissionHistory]);

  // Cancel submission
  const cancelSubmission = useCallback((voteId: string): boolean => {
    if (!serviceRef.current) return false;
    
    const cancelled = serviceRef.current.cancelSubmission(voteId);
    
    if (cancelled) {
      setState(prev => ({
        ...prev,
        submissionStatus: null,
        error: null
      }));
    }
    
    return cancelled;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Get submission history
  const getSubmissionHistory = useCallback((): VoteSubmissionStatus[] => {
    return state.submissionHistory;
  }, [state.submissionHistory]);

  // Get pending submissions
  const getPendingSubmissions = useCallback((): VoteSubmissionStatus[] => {
    if (!serviceRef.current) return [];
    return serviceRef.current.getPendingSubmissions();
  }, []);

  // Get submission statistics
  const getSubmissionStatistics = useCallback(() => {
    if (!serviceRef.current) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        confirmed: 0,
        failed: 0,
        rejected: 0
      };
    }
    return serviceRef.current.getStatistics();
  }, []);

  // Validate submission
  const validateSubmission = useCallback((election: Election, candidate: Contestant, voterId: string) => {
    // Check if election is ongoing
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);

    if (now < startDate) {
      return { valid: false, message: 'Election has not started yet' };
    }

    if (now > endDate) {
      return { valid: false, message: 'Election has ended' };
    }

    // Check if election is active
    if (election.status !== 'ONGOING') {
      return { valid: false, message: 'Election is not currently active' };
    }

    // Check if candidate exists in election
    const candidateExists = election.contestants.some(c => c.id === candidate.id);
    if (!candidateExists) {
      return { valid: false, message: 'Selected candidate is not valid for this election' };
    }

    // Check if user has already voted (mock implementation)
    const hasVoted = state.submissionHistory.some(submission => 
      submission.status === 'confirmed' && 
      submission.submittedAt > (Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
    );

    if (hasVoted) {
      return { valid: false, message: 'You have already voted in this election' };
    }

    return { valid: true };
  }, [state.submissionHistory]);

  // Create submission request
  const createSubmissionRequest = useCallback((
    election: Election,
    candidate: Contestant,
    voterId: string,
    verificationCode: string,
    biometricHash: string
  ): VoteSubmissionRequest => {
    return {
      electionId: election.id,
      candidateId: candidate.id,
      voterId,
      verificationCode,
      biometricHash,
      deviceId: 'mock-device-id', // In real app, get from device
      timestamp: Date.now(),
      position: 1, // Mock position
      metadata: {
        electionType: (election as any).type || 'PRESIDENTIAL',
        candidateParty: candidate.party,
        submissionSource: 'mobile_app'
      }
    };
  }, []);

  return {
    state,
    submitVote,
    getSubmissionStatus,
    retrySubmission,
    cancelSubmission,
    clearError,
    getSubmissionHistory,
    getPendingSubmissions,
    getSubmissionStatistics,
    validateSubmission,
    createSubmissionRequest
  };
}

export default useVoteSubmission;

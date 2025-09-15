/**
 * Vote Confirmation Hook
 * Custom hook for managing vote confirmation and verification
 */

import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { Election, Contestant } from '../types/election';

export interface ConfirmationState {
  isConfirming: boolean;
  verificationCode: string | null;
  biometricVerified: boolean;
  confirmationStep: 'verify' | 'biometric' | 'processing' | 'success' | 'error';
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

export interface ConfirmationResult {
  success: boolean;
  message?: string;
  transactionHash?: string;
  confirmationId?: string;
  error?: string;
}

export interface UseVoteConfirmationReturn {
  state: ConfirmationState;
  generateVerificationCode: () => string;
  verifyBiometric: () => Promise<boolean>;
  confirmVote: (electionId: string, candidateId: string, verificationCode: string) => Promise<ConfirmationResult>;
  resetConfirmation: () => void;
  retryConfirmation: () => void;
  validateConfirmation: (election: Election, candidate: Contestant) => { valid: boolean; message?: string };
  getConfirmationProgress: () => { step: number; totalSteps: number; progress: number };
}

const initialState: ConfirmationState = {
  isConfirming: false,
  verificationCode: null,
  biometricVerified: false,
  confirmationStep: 'verify',
  error: null,
  retryCount: 0,
  maxRetries: 3
};

export function useVoteConfirmation(): UseVoteConfirmationReturn {
  const [state, setState] = useState<ConfirmationState>(initialState);
  const confirmationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate verification code
  const generateVerificationCode = useCallback(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setState(prev => ({
      ...prev,
      verificationCode: code,
      error: null
    }));
    return code;
  }, []);

  // Verify biometric
  const verifyBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, confirmationStep: 'biometric' }));

      // Simulate biometric verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock biometric verification (90% success rate)
      const isVerified = Math.random() > 0.1;

      if (isVerified) {
        setState(prev => ({
          ...prev,
          biometricVerified: true,
          confirmationStep: 'verify',
          error: null
        }));

        Alert.alert(
          'Biometric Verified',
          'Your identity has been successfully verified.',
          [{ text: 'OK' }]
        );

        return true;
      } else {
        setState(prev => ({
          ...prev,
          biometricVerified: false,
          confirmationStep: 'verify',
          error: 'Biometric verification failed'
        }));

        Alert.alert(
          'Verification Failed',
          'Biometric verification failed. Please try again.',
          [{ text: 'OK' }]
        );

        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        biometricVerified: false,
        confirmationStep: 'verify',
        error: 'Biometric verification error'
      }));

      Alert.alert(
        'Verification Error',
        'An error occurred during biometric verification.',
        [{ text: 'OK' }]
      );

      return false;
    }
  }, []);

  // Confirm vote
  const confirmVote = useCallback(async (
    electionId: string,
    candidateId: string,
    verificationCode: string
  ): Promise<ConfirmationResult> => {
    setState(prev => ({
      ...prev,
      isConfirming: true,
      confirmationStep: 'processing',
      error: null
    }));

    try {
      // Validate verification code
      if (!state.verificationCode || verificationCode !== state.verificationCode) {
        throw new Error('Invalid verification code');
      }

      // Validate biometric verification
      if (!state.biometricVerified) {
        throw new Error('Biometric verification required');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock blockchain confirmation
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockConfirmationId = `confirm_${Date.now()}_${candidateId}`;

      // Simulate confirmation success (95% success rate)
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        const result: ConfirmationResult = {
          success: true,
          message: 'Vote confirmed successfully',
          transactionHash: mockTransactionHash,
          confirmationId: mockConfirmationId
        };

        setState(prev => ({
          ...prev,
          isConfirming: false,
          confirmationStep: 'success',
          error: null,
          retryCount: 0
        }));

        Alert.alert(
          'Vote Confirmed',
          `Your vote has been successfully confirmed and recorded on the blockchain.\n\nTransaction: ${mockTransactionHash.substring(0, 10)}...`,
          [{ text: 'OK' }]
        );

        return result;
      } else {
        throw new Error('Confirmation failed due to network issues');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Confirmation failed';
      
      const result: ConfirmationResult = {
        success: false,
        message: errorMessage,
        error: errorMessage
      };

      setState(prev => ({
        ...prev,
        isConfirming: false,
        confirmationStep: 'error',
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      Alert.alert(
        'Confirmation Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      return result;
    }
  }, [state.verificationCode, state.biometricVerified]);

  // Reset confirmation
  const resetConfirmation = useCallback(() => {
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }

    setState(initialState);
  }, []);

  // Retry confirmation
  const retryConfirmation = useCallback(() => {
    if (state.retryCount >= state.maxRetries) {
      Alert.alert(
        'Maximum Retries Reached',
        'You have reached the maximum number of retry attempts. Please try again later.',
        [{ text: 'OK' }]
      );
      return;
    }

    setState(prev => ({
      ...prev,
      confirmationStep: 'verify',
      error: null,
      biometricVerified: false,
      verificationCode: null
    }));
  }, [state.retryCount, state.maxRetries]);

  // Validate confirmation
  const validateConfirmation = useCallback((election: Election, candidate: Contestant) => {
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
    const hasVoted = false; // Mock: assume user hasn't voted

    if (hasVoted) {
      return { valid: false, message: 'You have already voted in this election' };
    }

    return { valid: true };
  }, []);

  // Get confirmation progress
  const getConfirmationProgress = useCallback(() => {
    const stepMap = {
      'verify': 1,
      'biometric': 2,
      'processing': 3,
      'success': 4,
      'error': 3
    };

    const currentStep = stepMap[state.confirmationStep] || 1;
    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return {
      step: currentStep,
      totalSteps,
      progress
    };
  }, [state.confirmationStep]);

  return {
    state,
    generateVerificationCode,
    verifyBiometric,
    confirmVote,
    resetConfirmation,
    retryConfirmation,
    validateConfirmation,
    getConfirmationProgress
  };
}

export default useVoteConfirmation;

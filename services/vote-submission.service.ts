/**
 * Vote Submission Service
 * Handles secure vote submission to blockchain and backend systems
 */

import { Alert } from 'react-native';
import { Election, Contestant, Vote } from '../types/election';

export interface VoteSubmissionRequest {
  electionId: string;
  candidateId: string;
  voterId: string;
  verificationCode: string;
  biometricHash: string;
  deviceId: string;
  timestamp: number;
  position?: number;
  metadata?: Record<string, any>;
}

export interface VoteSubmissionResponse {
  success: boolean;
  voteId?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmationId?: string;
  message?: string;
  error?: string;
  retryAfter?: number;
}

export interface VoteSubmissionStatus {
  voteId: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'rejected';
  transactionHash?: string;
  blockNumber?: number;
  confirmationCount?: number;
  error?: string;
  submittedAt: number;
  confirmedAt?: number;
}

export class VoteSubmissionService {
  private static instance: VoteSubmissionService;
  private submissionQueue: Map<string, VoteSubmissionRequest> = new Map();
  private statusCache: Map<string, VoteSubmissionStatus> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  private constructor() {}

  static getInstance(): VoteSubmissionService {
    if (!VoteSubmissionService.instance) {
      VoteSubmissionService.instance = new VoteSubmissionService();
    }
    return VoteSubmissionService.instance;
  }

  /**
   * Submit vote to blockchain and backend
   */
  async submitVote(request: VoteSubmissionRequest): Promise<VoteSubmissionResponse> {
    const submissionId = this.generateSubmissionId(request);
    
    try {
      // Add to submission queue
      this.submissionQueue.set(submissionId, request);
      
      // Initialize status
      this.statusCache.set(submissionId, {
        voteId: submissionId,
        status: 'pending',
        submittedAt: Date.now()
      });

      // Validate submission
      const validation = await this.validateSubmission(request);
      if (!validation.valid) {
        throw new Error(validation.message || 'Invalid vote submission');
      }

      // Update status to processing
      this.updateStatus(submissionId, 'processing');

      // Submit to blockchain
      const blockchainResult = await this.submitToBlockchain(request);
      
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Blockchain submission failed');
      }

      // Submit to backend
      const backendResult = await this.submitToBackend(request, blockchainResult.transactionHash!);
      
      if (!backendResult.success) {
        throw new Error(backendResult.error || 'Backend submission failed');
      }

      // Update status to confirmed
      this.updateStatus(submissionId, 'confirmed', {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        confirmationCount: 1,
        confirmedAt: Date.now()
      });

      // Remove from queue
      this.submissionQueue.delete(submissionId);
      this.retryAttempts.delete(submissionId);

      return {
        success: true,
        voteId: submissionId,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        confirmationId: backendResult.confirmationId,
        message: 'Vote submitted successfully'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Vote submission failed';
      
      // Update status to failed
      this.updateStatus(submissionId, 'failed', { error: errorMessage });
      
      // Check if we should retry
      const retryCount = this.retryAttempts.get(submissionId) || 0;
      if (retryCount < this.maxRetries) {
        this.retryAttempts.set(submissionId, retryCount + 1);
        
        // Schedule retry
        setTimeout(() => {
          this.retrySubmission(submissionId);
        }, this.retryDelay * (retryCount + 1));
        
        return {
          success: false,
          error: errorMessage,
          retryAfter: this.retryDelay * (retryCount + 1)
        };
      }

      // Remove from queue after max retries
      this.submissionQueue.delete(submissionId);
      this.retryAttempts.delete(submissionId);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Retry failed submission
   */
  private async retrySubmission(submissionId: string): Promise<void> {
    const request = this.submissionQueue.get(submissionId);
    if (!request) return;

    try {
      const result = await this.submitVote(request);
      if (result.success) {
        console.log(`Retry successful for submission ${submissionId}`);
      }
    } catch (error) {
      console.error(`Retry failed for submission ${submissionId}:`, error);
    }
  }

  /**
   * Validate vote submission
   */
  private async validateSubmission(request: VoteSubmissionRequest): Promise<{ valid: boolean; message?: string }> {
    // Check required fields
    if (!request.electionId || !request.candidateId || !request.voterId) {
      return { valid: false, message: 'Missing required fields' };
    }

    if (!request.verificationCode || request.verificationCode.length !== 6) {
      return { valid: false, message: 'Invalid verification code' };
    }

    if (!request.biometricHash || !request.deviceId) {
      return { valid: false, message: 'Missing security credentials' };
    }

    // Check timestamp (not too old)
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    if (now - request.timestamp > maxAge) {
      return { valid: false, message: 'Submission expired' };
    }

    // Check if user has already voted (mock implementation)
    const hasVoted = await this.checkExistingVote(request.electionId, request.voterId);
    if (hasVoted) {
      return { valid: false, message: 'User has already voted in this election' };
    }

    return { valid: true };
  }

  /**
   * Submit to blockchain
   */
  private async submitToBlockchain(request: VoteSubmissionRequest): Promise<VoteSubmissionResponse> {
    try {
      // Simulate blockchain submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock blockchain transaction
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const blockNumber = Math.floor(Math.random() * 1000000) + 1000000;

      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        return {
          success: true,
          transactionHash,
          blockNumber,
          message: 'Blockchain submission successful'
        };
      } else {
        throw new Error('Blockchain network error');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Blockchain submission failed'
      };
    }
  }

  /**
   * Submit to backend
   */
  private async submitToBackend(request: VoteSubmissionRequest, transactionHash: string): Promise<VoteSubmissionResponse> {
    try {
      // Simulate backend submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock backend API call
      const confirmationId = `confirm_${Date.now()}_${request.candidateId}`;

      // Simulate 98% success rate
      const isSuccess = Math.random() > 0.02;

      if (isSuccess) {
        return {
          success: true,
          confirmationId,
          message: 'Backend submission successful'
        };
      } else {
        throw new Error('Backend service unavailable');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backend submission failed'
      };
    }
  }

  /**
   * Check if user has already voted
   */
  private async checkExistingVote(electionId: string, voterId: string): Promise<boolean> {
    // Mock implementation - in real app, check database
    await new Promise(resolve => setTimeout(resolve, 100));
    return false; // Mock: assume user hasn't voted
  }

  /**
   * Get submission status
   */
  getSubmissionStatus(voteId: string): VoteSubmissionStatus | null {
    return this.statusCache.get(voteId) || null;
  }

  /**
   * Get all pending submissions
   */
  getPendingSubmissions(): VoteSubmissionStatus[] {
    return Array.from(this.statusCache.values()).filter(
      status => status.status === 'pending' || status.status === 'processing'
    );
  }

  /**
   * Cancel submission
   */
  cancelSubmission(voteId: string): boolean {
    if (this.submissionQueue.has(voteId)) {
      this.submissionQueue.delete(voteId);
      this.retryAttempts.delete(voteId);
      this.updateStatus(voteId, 'rejected');
      return true;
    }
    return false;
  }

  /**
   * Update submission status
   */
  private updateStatus(voteId: string, status: VoteSubmissionStatus['status'], updates?: Partial<VoteSubmissionStatus>): void {
    const currentStatus = this.statusCache.get(voteId);
    if (currentStatus) {
      this.statusCache.set(voteId, {
        ...currentStatus,
        status,
        ...updates
      });
    }
  }

  /**
   * Generate unique submission ID
   */
  private generateSubmissionId(request: VoteSubmissionRequest): string {
    const timestamp = request.timestamp.toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `vote_${timestamp}_${random}`;
  }

  /**
   * Clear old submissions
   */
  clearOldSubmissions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.statusCache.forEach((status, voteId) => {
      if (now - status.submittedAt > maxAge) {
        toDelete.push(voteId);
      }
    });

    toDelete.forEach(voteId => {
      this.statusCache.delete(voteId);
      this.submissionQueue.delete(voteId);
      this.retryAttempts.delete(voteId);
    });
  }

  /**
   * Get submission statistics
   */
  getStatistics(): {
    total: number;
    pending: number;
    processing: number;
    confirmed: number;
    failed: number;
    rejected: number;
  } {
    const stats = {
      total: 0,
      pending: 0,
      processing: 0,
      confirmed: 0,
      failed: 0,
      rejected: 0
    };

    this.statusCache.forEach(status => {
      stats.total++;
      stats[status.status]++;
    });

    return stats;
  }
}

export default VoteSubmissionService;

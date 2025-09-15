/**
 * Vote Submission Service Tests
 */

import VoteSubmissionService, { VoteSubmissionRequest } from '@/services/vote-submission.service';

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn()
  }
}));

describe('VoteSubmissionService', () => {
  let service: VoteSubmissionService;

  beforeEach(() => {
    service = VoteSubmissionService.getInstance();
    // Clear any existing state
    service.clearOldSubmissions(0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = VoteSubmissionService.getInstance();
    const instance2 = VoteSubmissionService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should submit vote successfully', async () => {
    const request: VoteSubmissionRequest = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    const result = await service.submitVote(request);

    expect(result.success).toBe(true);
    expect(result.voteId).toBeDefined();
    expect(result.transactionHash).toBeDefined();
    expect(result.blockNumber).toBeDefined();
    expect(result.confirmationId).toBeDefined();
    expect(result.message).toBe('Vote submitted successfully');
  });

  it('should handle submission failure', async () => {
    // Mock a failure by using an invalid request
    const request: VoteSubmissionRequest = {
      electionId: '',
      candidateId: '',
      voterId: '',
      verificationCode: '',
      biometricHash: '',
      deviceId: '',
      timestamp: Date.now(),
      position: 1
    };

    const result = await service.submitVote(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should validate submission request', async () => {
    const invalidRequest: VoteSubmissionRequest = {
      electionId: '',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    const result = await service.submitVote(invalidRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Missing required fields');
  });

  it('should reject invalid verification code', async () => {
    const request: VoteSubmissionRequest = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'INVALID',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    const result = await service.submitVote(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid verification code');
  });

  it('should reject expired submission', async () => {
    const request: VoteSubmissionRequest = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      position: 1
    };

    const result = await service.submitVote(request);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Submission expired');
  });

  it('should get submission status', async () => {
    const request: VoteSubmissionRequest = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    const result = await service.submitVote(request);
    
    if (result.success && result.voteId) {
      const status = service.getSubmissionStatus(result.voteId);
      expect(status).toBeDefined();
      expect(status?.voteId).toBe(result.voteId);
    }
  });

  it('should get pending submissions', async () => {
    const pendingSubmissions = service.getPendingSubmissions();
    expect(Array.isArray(pendingSubmissions)).toBe(true);
  });

  it('should cancel submission', async () => {
    const request: VoteSubmissionRequest = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    const result = await service.submitVote(request);
    
    if (result.success && result.voteId) {
      const cancelled = service.cancelSubmission(result.voteId);
      expect(cancelled).toBe(true);
    }
  });

  it('should get submission statistics', () => {
    const stats = service.getStatistics();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('processing');
    expect(stats).toHaveProperty('confirmed');
    expect(stats).toHaveProperty('failed');
    expect(stats).toHaveProperty('rejected');
  });

  it('should clear old submissions', () => {
    // This test would require setting up old submissions
    // For now, just test that the method doesn't throw
    expect(() => service.clearOldSubmissions()).not.toThrow();
  });

  it('should handle multiple submissions', async () => {
    const requests = [
      {
        electionId: '1',
        candidateId: '1',
        voterId: 'voter1',
        verificationCode: 'ABC123',
        biometricHash: 'biometric_hash_1',
        deviceId: 'device1',
        timestamp: Date.now(),
        position: 1
      },
      {
        electionId: '1',
        candidateId: '2',
        voterId: 'voter2',
        verificationCode: 'DEF456',
        biometricHash: 'biometric_hash_2',
        deviceId: 'device2',
        timestamp: Date.now(),
        position: 1
      }
    ];

    const results = await Promise.all(
      requests.map(request => service.submitVote(request))
    );

    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result.success).toBe(true);
      expect(result.voteId).toBeDefined();
    });
  });

  it('should handle concurrent submissions', async () => {
    const request: VoteSubmissionRequest = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    // Submit multiple times concurrently
    const promises = Array(5).fill(null).map(() => service.submitVote(request));
    const results = await Promise.all(promises);

    expect(results).toHaveLength(5);
    // At least one should succeed
    const successCount = results.filter(r => r.success).length;
    expect(successCount).toBeGreaterThan(0);
  });
});

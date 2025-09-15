/**
 * Vote Submission Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useVoteSubmission } from '@/hooks/use-vote-submission';
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

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn()
  }
}));

describe('useVoteSubmission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVoteSubmission());

    expect(result.current.state.isSubmitting).toBe(false);
    expect(result.current.state.submissionStatus).toBeNull();
    expect(result.current.state.submissionHistory).toEqual([]);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.retryCount).toBe(0);
    expect(result.current.state.canRetry).toBe(true);
    expect(result.current.state.lastSubmissionTime).toBeNull();
  });

  it('should submit vote successfully', async () => {
    const { result } = renderHook(() => useVoteSubmission());

    const request = {
      electionId: '1',
      candidateId: '1',
      voterId: 'voter123',
      verificationCode: 'ABC123',
      biometricHash: 'biometric_hash_123',
      deviceId: 'device123',
      timestamp: Date.now(),
      position: 1
    };

    let submissionResult;
    await act(async () => {
      submissionResult = await result.current.submitVote(request);
    });

    expect(submissionResult?.success).toBe(true);
    expect(submissionResult?.voteId).toBeDefined();
    expect(submissionResult?.transactionHash).toBeDefined();
    expect(submissionResult?.blockNumber).toBeDefined();
    expect(submissionResult?.confirmationId).toBeDefined();

    expect(result.current.state.isSubmitting).toBe(false);
    expect(result.current.state.submissionStatus).toBeDefined();
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.retryCount).toBe(0);
  });

  it('should handle submission failure', async () => {
    const { result } = renderHook(() => useVoteSubmission());

    const invalidRequest = {
      electionId: '',
      candidateId: '',
      voterId: '',
      verificationCode: '',
      biometricHash: '',
      deviceId: '',
      timestamp: Date.now(),
      position: 1
    };

    let submissionResult;
    await act(async () => {
      submissionResult = await result.current.submitVote(invalidRequest);
    });

    expect(submissionResult?.success).toBe(false);
    expect(submissionResult?.error).toBeDefined();

    expect(result.current.state.isSubmitting).toBe(false);
    expect(result.current.state.error).toBeDefined();
    expect(result.current.state.retryCount).toBe(1);
  });

  it('should get submission status', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const status = result.current.getSubmissionStatus('test-vote-id');
    expect(status).toBeNull(); // No submission with this ID
  });

  it('should retry submission', async () => {
    const { result } = renderHook(() => useVoteSubmission());

    // First, add a submission to history
    act(() => {
      result.current.state.submissionHistory.push({
        voteId: 'test-vote-id',
        status: 'failed',
        submittedAt: Date.now(),
        error: 'Test error'
      });
    });

    let retryResult;
    await act(async () => {
      retryResult = await result.current.retrySubmission('test-vote-id');
    });

    expect(retryResult?.success).toBe(true);
    expect(result.current.state.isSubmitting).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it('should cancel submission', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const cancelled = result.current.cancelSubmission('test-vote-id');
    expect(cancelled).toBe(false); // No submission with this ID
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useVoteSubmission());

    // Set an error
    act(() => {
      result.current.state.error = 'Test error';
    });

    expect(result.current.state.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.state.error).toBeNull();
  });

  it('should get submission history', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const history = result.current.getSubmissionHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('should get pending submissions', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const pending = result.current.getPendingSubmissions();
    expect(Array.isArray(pending)).toBe(true);
  });

  it('should get submission statistics', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const stats = result.current.getSubmissionStatistics();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('processing');
    expect(stats).toHaveProperty('confirmed');
    expect(stats).toHaveProperty('failed');
    expect(stats).toHaveProperty('rejected');
  });

  it('should validate submission for ongoing election', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const validation = result.current.validateSubmission(mockElection, mockCandidate, 'voter123');
    expect(validation.valid).toBe(true);
  });

  it('should reject submission for upcoming election', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const upcomingElection = {
      ...mockElection,
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-12-31T23:59:59Z',
      status: 'UPCOMING' as const
    };

    const validation = result.current.validateSubmission(upcomingElection, mockCandidate, 'voter123');
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election has not started yet');
  });

  it('should reject submission for ended election', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const endedElection = {
      ...mockElection,
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-12-31T23:59:59Z',
      status: 'COMPLETED' as const
    };

    const validation = result.current.validateSubmission(endedElection, mockCandidate, 'voter123');
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election has ended');
  });

  it('should reject submission for inactive election', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const inactiveElection = {
      ...mockElection,
      status: 'CANCELLED' as const
    };

    const validation = result.current.validateSubmission(inactiveElection, mockCandidate, 'voter123');
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election is not currently active');
  });

  it('should reject submission for invalid candidate', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const invalidCandidate = {
      ...mockCandidate,
      id: '999'
    };

    const validation = result.current.validateSubmission(mockElection, invalidCandidate, 'voter123');
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Selected candidate is not valid for this election');
  });

  it('should create submission request', () => {
    const { result } = renderHook(() => useVoteSubmission());

    const request = result.current.createSubmissionRequest(
      mockElection,
      mockCandidate,
      'voter123',
      'ABC123',
      'biometric_hash_123'
    );

    expect(request.electionId).toBe('1');
    expect(request.candidateId).toBe('1');
    expect(request.voterId).toBe('voter123');
    expect(request.verificationCode).toBe('ABC123');
    expect(request.biometricHash).toBe('biometric_hash_123');
    expect(request.deviceId).toBe('mock-device-id');
    expect(request.timestamp).toBeDefined();
    expect(request.position).toBe(1);
    expect(request.metadata).toBeDefined();
  });

  it('should handle multiple submissions', async () => {
    const { result } = renderHook(() => useVoteSubmission());

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
      requests.map(request => 
        act(async () => result.current.submitVote(request))
      )
    );

    expect(results).toHaveLength(2);
    results.forEach(result => {
      expect(result?.success).toBe(true);
      expect(result?.voteId).toBeDefined();
    });
  });
});

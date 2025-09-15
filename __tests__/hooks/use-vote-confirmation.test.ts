/**
 * Vote Confirmation Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useVoteConfirmation } from '@/hooks/use-vote-confirmation';
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

describe('useVoteConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    expect(result.current.state.isConfirming).toBe(false);
    expect(result.current.state.verificationCode).toBeNull();
    expect(result.current.state.biometricVerified).toBe(false);
    expect(result.current.state.confirmationStep).toBe('verify');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.retryCount).toBe(0);
    expect(result.current.state.maxRetries).toBe(3);
  });

  it('should generate verification code', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    let code;
    act(() => {
      code = result.current.generateVerificationCode();
    });

    expect(code).toBeDefined();
    expect(code).toHaveLength(6);
    expect(typeof code).toBe('string');
    expect(result.current.state.verificationCode).toBe(code);
    expect(result.current.state.error).toBeNull();
  });

  it('should verify biometric successfully', async () => {
    const { result } = renderHook(() => useVoteConfirmation());

    let verified;
    await act(async () => {
      verified = await result.current.verifyBiometric();
    });

    expect(typeof verified).toBe('boolean');
    expect(result.current.state.confirmationStep).toBe('verify');
  });

  it('should confirm vote successfully', async () => {
    const { result } = renderHook(() => useVoteConfirmation());

    // Set up state for successful confirmation
    act(() => {
      result.current.generateVerificationCode();
    });

    // Mock biometric verification
    await act(async () => {
      await result.current.verifyBiometric();
    });

    let confirmationResult;
    await act(async () => {
      confirmationResult = await result.current.confirmVote('1', '1', result.current.state.verificationCode!);
    });

    expect(confirmationResult?.success).toBe(true);
    expect(confirmationResult?.message).toBe('Vote confirmed successfully');
    expect(confirmationResult?.transactionHash).toBeDefined();
    expect(confirmationResult?.confirmationId).toBeDefined();

    expect(result.current.state.isConfirming).toBe(false);
    expect(result.current.state.confirmationStep).toBe('success');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.retryCount).toBe(0);
  });

  it('should handle confirmation failure', async () => {
    const { result } = renderHook(() => useVoteConfirmation());

    // Set up state for failed confirmation
    act(() => {
      result.current.generateVerificationCode();
    });

    let confirmationResult;
    await act(async () => {
      confirmationResult = await result.current.confirmVote('1', '1', 'INVALID_CODE');
    });

    expect(confirmationResult?.success).toBe(false);
    expect(confirmationResult?.message).toBe('Invalid verification code');

    expect(result.current.state.isConfirming).toBe(false);
    expect(result.current.state.confirmationStep).toBe('error');
    expect(result.current.state.error).toBe('Invalid verification code');
    expect(result.current.state.retryCount).toBe(1);
  });

  it('should reset confirmation', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    // Set some state
    act(() => {
      result.current.generateVerificationCode();
    });

    expect(result.current.state.verificationCode).toBeDefined();

    act(() => {
      result.current.resetConfirmation();
    });

    expect(result.current.state.verificationCode).toBeNull();
    expect(result.current.state.biometricVerified).toBe(false);
    expect(result.current.state.confirmationStep).toBe('verify');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.retryCount).toBe(0);
  });

  it('should retry confirmation', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    // Set error state
    act(() => {
      result.current.state.error = 'Test error';
      result.current.state.confirmationStep = 'error';
      result.current.state.retryCount = 1;
    });

    act(() => {
      result.current.retryConfirmation();
    });

    expect(result.current.state.confirmationStep).toBe('verify');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.biometricVerified).toBe(false);
    expect(result.current.state.verificationCode).toBeNull();
  });

  it('should not retry when max retries reached', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    // Set max retries reached
    act(() => {
      result.current.state.retryCount = 3;
      result.current.state.maxRetries = 3;
    });

    act(() => {
      result.current.retryConfirmation();
    });

    // Should not change state when max retries reached
    expect(result.current.state.retryCount).toBe(3);
  });

  it('should validate confirmation for ongoing election', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    const validation = result.current.validateConfirmation(mockElection, mockCandidate);
    expect(validation.valid).toBe(true);
  });

  it('should reject confirmation for upcoming election', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    const upcomingElection = {
      ...mockElection,
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-12-31T23:59:59Z',
      status: 'UPCOMING' as const
    };

    const validation = result.current.validateConfirmation(upcomingElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election has not started yet');
  });

  it('should reject confirmation for ended election', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    const endedElection = {
      ...mockElection,
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-12-31T23:59:59Z',
      status: 'COMPLETED' as const
    };

    const validation = result.current.validateConfirmation(endedElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election has ended');
  });

  it('should reject confirmation for inactive election', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    const inactiveElection = {
      ...mockElection,
      status: 'CANCELLED' as const
    };

    const validation = result.current.validateConfirmation(inactiveElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election is not currently active');
  });

  it('should reject confirmation for invalid candidate', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    const invalidCandidate = {
      ...mockCandidate,
      id: '999'
    };

    const validation = result.current.validateConfirmation(mockElection, invalidCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Selected candidate is not valid for this election');
  });

  it('should get confirmation progress', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    const progress = result.current.getConfirmationProgress();
    expect(progress.step).toBe(1);
    expect(progress.totalSteps).toBe(4);
    expect(progress.progress).toBe(25);
  });

  it('should update progress for different steps', () => {
    const { result } = renderHook(() => useVoteConfirmation());

    // Test different steps
    const steps = ['verify', 'biometric', 'processing', 'success', 'error'] as const;
    const expectedProgress = [25, 50, 75, 100, 75];

    steps.forEach((step, index) => {
      act(() => {
        result.current.state.confirmationStep = step;
      });

      const progress = result.current.getConfirmationProgress();
      expect(progress.progress).toBe(expectedProgress[index]);
    });
  });
});

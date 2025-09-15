/**
 * Voting Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useVoting } from '@/hooks/use-voting';
import { Election, Contestant } from '@/types/election';

// Mock election data
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

describe('useVoting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useVoting());

    expect(result.current.state.isVoting).toBe(false);
    expect(result.current.state.selectedCandidate).toBeNull();
    expect(result.current.state.voteHistory).toEqual([]);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.canVote).toBe(true);
  });

  it('should select candidate', () => {
    const { result } = renderHook(() => useVoting());

    act(() => {
      result.current.selectCandidate(mockCandidate);
    });

    expect(result.current.state.selectedCandidate).toEqual(mockCandidate);
    expect(result.current.state.error).toBeNull();
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useVoting());

    act(() => {
      result.current.selectCandidate(mockCandidate);
    });

    expect(result.current.state.selectedCandidate).toEqual(mockCandidate);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.state.selectedCandidate).toBeNull();
    expect(result.current.state.error).toBeNull();
  });

  it('should validate vote for ongoing election', () => {
    const { result } = renderHook(() => useVoting());

    const validation = result.current.validateVote(mockElection, mockCandidate);
    expect(validation.valid).toBe(true);
  });

  it('should reject vote for upcoming election', () => {
    const { result } = renderHook(() => useVoting());

    const upcomingElection = {
      ...mockElection,
      start_date: '2025-01-01T00:00:00Z',
      end_date: '2025-12-31T23:59:59Z',
      status: 'UPCOMING' as const
    };

    const validation = result.current.validateVote(upcomingElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election has not started yet');
  });

  it('should reject vote for ended election', () => {
    const { result } = renderHook(() => useVoting());

    const endedElection = {
      ...mockElection,
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2023-12-31T23:59:59Z',
      status: 'COMPLETED' as const
    };

    const validation = result.current.validateVote(endedElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election has ended');
  });

  it('should reject vote for inactive election', () => {
    const { result } = renderHook(() => useVoting());

    const inactiveElection = {
      ...mockElection,
      status: 'CANCELLED' as const
    };

    const validation = result.current.validateVote(inactiveElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Election is not currently active');
  });

  it('should reject vote for invalid candidate', () => {
    const { result } = renderHook(() => useVoting());

    const invalidCandidate = {
      ...mockCandidate,
      id: '999'
    };

    const validation = result.current.validateVote(mockElection, invalidCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Selected candidate is not valid for this election');
  });

  it('should check if user can vote for election', () => {
    const { result } = renderHook(() => useVoting());

    const canVote = result.current.canVoteForElection(mockElection);
    expect(canVote).toBe(true);
  });

  it('should not allow voting for inactive election', () => {
    const { result } = renderHook(() => useVoting());

    const inactiveElection = {
      ...mockElection,
      status: 'CANCELLED' as const
    };

    const canVote = result.current.canVoteForElection(inactiveElection);
    expect(canVote).toBe(false);
  });

  it('should cast vote successfully', async () => {
    const { result } = renderHook(() => useVoting());

    let voteResponse;
    await act(async () => {
      voteResponse = await result.current.castVote('1', '1');
    });

    expect(voteResponse?.success).toBe(true);
    expect(voteResponse?.message).toBe('Vote cast successfully');
    expect(voteResponse?.voteId).toBeDefined();
    expect(voteResponse?.transactionHash).toBeDefined();
    expect(voteResponse?.blockNumber).toBeDefined();

    expect(result.current.state.isVoting).toBe(false);
    expect(result.current.state.voteHistory).toHaveLength(1);
    expect(result.current.state.lastVoteTime).toBeGreaterThan(0);
  });

  it('should handle vote failure', async () => {
    const { result } = renderHook(() => useVoting());

    // Mock a failed vote by throwing an error
    const originalCastVote = result.current.castVote;
    jest.spyOn(result.current, 'castVote').mockImplementation(async () => {
      throw new Error('Network error');
    });

    let voteResponse;
    await act(async () => {
      voteResponse = await result.current.castVote('1', '1');
    });

    expect(voteResponse?.success).toBe(false);
    expect(voteResponse?.message).toBe('Network error');

    expect(result.current.state.isVoting).toBe(false);
    expect(result.current.state.error).toBe('Network error');
    expect(result.current.state.voteHistory).toHaveLength(1);
  });

  it('should get vote history', () => {
    const { result } = renderHook(() => useVoting());

    // Add some votes to history
    act(() => {
      result.current.state.voteHistory.push({
        success: true,
        message: 'Vote 1',
        voteId: 'vote1'
      });
      result.current.state.voteHistory.push({
        success: false,
        message: 'Vote 2 failed',
        error: 'Error'
      });
    });

    const history = result.current.getVoteHistory();
    expect(history).toHaveLength(2);
    expect(history[0].success).toBe(true);
    expect(history[1].success).toBe(false);
  });

  it('should clear vote history', () => {
    const { result } = renderHook(() => useVoting());

    // Add some votes to history
    act(() => {
      result.current.state.voteHistory.push({
        success: true,
        message: 'Vote 1',
        voteId: 'vote1'
      });
    });

    expect(result.current.state.voteHistory).toHaveLength(1);

    act(() => {
      result.current.clearVoteHistory();
    });

    expect(result.current.state.voteHistory).toHaveLength(0);
  });

  it('should get voting progress', () => {
    const { result } = renderHook(() => useVoting());

    const progress = result.current.getVotingProgress(mockElection);
    expect(progress.totalVotes).toBe(6500000);
    expect(progress.userVoted).toBe(false);
    expect(progress.progress).toBe(0);
  });

  it('should show progress as 100% when user has voted', () => {
    const { result } = renderHook(() => useVoting());

    // Simulate user having voted
    act(() => {
      result.current.state.voteHistory.push({
        success: true,
        message: 'Vote cast',
        voteId: 'vote1'
      });
    });

    const progress = result.current.getVotingProgress(mockElection);
    expect(progress.userVoted).toBe(true);
    expect(progress.progress).toBe(100);
  });

  it('should respect cooldown period', () => {
    const { result } = renderHook(() => useVoting());

    // Set last vote time to recent
    act(() => {
      result.current.state.lastVoteTime = Date.now() - 2 * 60 * 1000; // 2 minutes ago
    });

    const validation = result.current.validateVote(mockElection, mockCandidate);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe('Please wait before voting again');
  });

  it('should allow voting after cooldown period', () => {
    const { result } = renderHook(() => useVoting());

    // Set last vote time to past cooldown
    act(() => {
      result.current.state.lastVoteTime = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    });

    const validation = result.current.validateVote(mockElection, mockCandidate);
    expect(validation.valid).toBe(true);
  });
});

import { renderHook, act } from '@testing-library/react-native';
import { useVoteHistory } from '@/hooks/use-vote-history';
import { dashboardService } from '@/lib/api/dashboard-service';

// Mock the dashboard service
jest.mock('@/lib/api/dashboard-service', () => ({
  dashboardService: {
    getVoteHistory: jest.fn(),
  },
}));

const mockDashboardService = dashboardService as jest.Mocked<typeof dashboardService>;

describe('useVoteHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch vote history on mount', async () => {
    const mockVoteData = [
      {
        _id: '1',
        election_title: 'Governorship Election 2025',
        candidate_name: 'Adebayo Ogundimu',
        party_name: 'All Progressives Congress',
        party_acronym: 'APC',
        running_mate: 'Dr. Fatima Abdullahi',
        vote_timestamp: '2025-09-12T21:39:37.000Z',
        vote_position: 2,
        transaction_hash: '0x8d7885e4a3551e60',
      },
    ];

    mockDashboardService.getVoteHistory.mockResolvedValue({
      success: true,
      data: mockVoteData,
    });

    const { result } = renderHook(() => useVoteHistory());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.voteHistory).toHaveLength(1);
    expect(result.current.voteHistory[0].election.title).toBe('Governorship Election 2025');
  });

  it('should handle API errors', async () => {
    mockDashboardService.getVoteHistory.mockResolvedValue({
      success: false,
      error: 'API Error',
    });

    const { result } = renderHook(() => useVoteHistory());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('API Error');
    expect(result.current.voteHistory).toHaveLength(0);
  });

  it('should handle network errors', async () => {
    mockDashboardService.getVoteHistory.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useVoteHistory());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network Error');
    expect(result.current.voteHistory).toHaveLength(0);
  });

  it('should refresh vote history when refreshVoteHistory is called', async () => {
    const mockVoteData = [
      {
        _id: '1',
        election_title: 'Test Election',
        candidate_name: 'Test Candidate',
        party_name: 'Test Party',
        party_acronym: 'TP',
        running_mate: 'Test Running Mate',
        vote_timestamp: '2025-09-12T21:39:37.000Z',
        vote_position: 1,
        transaction_hash: '0xtest123',
      },
    ];

    mockDashboardService.getVoteHistory.mockResolvedValue({
      success: true,
      data: mockVoteData,
    });

    const { result } = renderHook(() => useVoteHistory());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockDashboardService.getVoteHistory).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refreshVoteHistory();
    });

    expect(mockDashboardService.getVoteHistory).toHaveBeenCalledTimes(2);
  });
});

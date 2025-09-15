/**
 * Election Details Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useElectionDetails } from '@/hooks/use-election-details';

// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: jest.fn(),
  writable: true
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  },
  writable: true
});

describe('useElectionDetails', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    expect(result.current.election).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.stats).toBeNull();
    expect(result.current.activeTab).toBe('overview');
  });

  it('should load election details', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.election).toBeTruthy();
    expect(result.current.election?.title).toBe('Presidential Election 2023');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set active tab', () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    act(() => {
      result.current.setActiveTab('candidates');
    });

    expect(result.current.activeTab).toBe('candidates');
  });

  it('should refresh election', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    await act(async () => {
      await result.current.refreshElection();
    });

    expect(result.current.election).toBeTruthy();
  });

  it('should bookmark election', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const initialBookmarked = result.current.election?.isBookmarked;

    await act(async () => {
      await result.current.bookmarkElection();
    });

    expect(result.current.election?.isBookmarked).toBe(!initialBookmarked);
  });

  it('should star election', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const initialStarred = result.current.election?.isStarred;

    await act(async () => {
      await result.current.starElection();
    });

    expect(result.current.election?.isStarred).toBe(!initialStarred);
  });

  it('should share election', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    await act(async () => {
      await result.current.shareElection();
    });

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Presidential Election 2023',
      text: 'Election for the President of Nigeria - Choose your next leader',
      url: '/elections/1'
    });
  });

  it('should view election', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const initialViews = result.current.stats?.totalViews || 0;

    await act(async () => {
      await result.current.viewElection();
    });

    expect(result.current.stats?.totalViews).toBe(initialViews + 1);
  });

  it('should get election analytics', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const analytics = result.current.getElectionAnalytics();

    expect(analytics).toBeTruthy();
    expect(analytics?.election).toBeTruthy();
    expect(analytics?.stats).toBeTruthy();
    expect(analytics?.participationRate).toBe(85);
    expect(analytics?.totalCandidates).toBe(4);
    expect(analytics?.totalVotes).toBe(15000000);
  });

  it('should export election data', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = jest.fn().mockReturnValue('blob:url');
    const mockRevokeObjectURL = jest.fn();
    const mockClick = jest.fn();
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });
    Object.defineProperty(document, 'createElement', {
      value: () => ({
        href: '',
        download: '',
        click: mockClick
      })
    });
    Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
    Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

    act(() => {
      result.current.exportElectionData();
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should check voting permissions correctly', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.canVote).toBe(true);
    expect(result.current.canViewResults).toBe(true);
    expect(result.current.isElectionActive).toBe(true);
    expect(result.current.isElectionUpcoming).toBe(false);
    expect(result.current.isElectionCompleted).toBe(false);
  });

  it('should calculate time correctly', async () => {
    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.timeUntilStart).toBeNull(); // Election has started
    expect(result.current.timeUntilEnd).toBeTruthy(); // Election hasn't ended
  });

  it('should handle share errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    navigator.share = jest.fn().mockRejectedValue(new Error('Share failed'));

    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    await act(async () => {
      try {
        await result.current.shareElection();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(navigator.share).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle bookmark errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    await act(async () => {
      try {
        await result.current.bookmarkElection();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.election?.isBookmarked).toBe(true);

    consoleSpy.mockRestore();
  });

  it('should handle star errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useElectionDetails('1'));

    // Load election first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    await act(async () => {
      try {
        await result.current.starElection();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.election?.isStarred).toBe(true);

    consoleSpy.mockRestore();
  });
});

/**
 * Candidates Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useCandidates } from '@/hooks/use-candidates';

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

describe('useCandidates', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    expect(result.current.candidates).toEqual([]);
    expect(result.current.filteredCandidates).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.filters).toEqual({
      searchQuery: '',
      party: '',
      position: '',
      isActive: null,
      hasPicture: null
    });
    expect(result.current.sortOptions).toEqual({
      field: 'votes',
      order: 'desc'
    });
  });

  it('should load candidates', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.candidates).toHaveLength(6);
    expect(result.current.candidates[0].name).toBe('John Doe');
    expect(result.current.isLoading).toBe(false);
  });

  it('should filter candidates by search query', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    act(() => {
      result.current.setFilters({ searchQuery: 'John' });
    });

    expect(result.current.filteredCandidates).toHaveLength(1);
    expect(result.current.filteredCandidates[0].name).toBe('John Doe');
  });

  it('should filter candidates by party', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    act(() => {
      result.current.setFilters({ party: 'Progressive' });
    });

    expect(result.current.filteredCandidates).toHaveLength(2);
    expect(result.current.filteredCandidates.every(c => 
      c.party.includes('Progressive')
    )).toBe(true);
  });

  it('should filter candidates by position', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    act(() => {
      result.current.setFilters({ position: 'President' });
    });

    expect(result.current.filteredCandidates).toHaveLength(4);
    expect(result.current.filteredCandidates.every(c => 
      c.position === 'President'
    )).toBe(true);
  });

  it('should sort candidates by votes descending', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    act(() => {
      result.current.setSortOptions({ field: 'votes', order: 'desc' });
    });

    const sorted = result.current.filteredCandidates;
    expect(sorted[0].votes).toBeGreaterThanOrEqual(sorted[1].votes);
    expect(sorted[1].votes).toBeGreaterThanOrEqual(sorted[2].votes);
  });

  it('should sort candidates by name ascending', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    act(() => {
      result.current.setSortOptions({ field: 'name', order: 'asc' });
    });

    const sorted = result.current.filteredCandidates;
    expect(sorted[0].name).toBe('David Brown');
    expect(sorted[1].name).toBe('Jane Smith');
  });

  it('should clear filters', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    act(() => {
      result.current.setFilters({ searchQuery: 'John', party: 'Progressive' });
    });

    expect(result.current.filters.searchQuery).toBe('John');
    expect(result.current.filters.party).toBe('Progressive');

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      searchQuery: '',
      party: '',
      position: '',
      isActive: null,
      hasPicture: null
    });
  });

  it('should get candidate by ID', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const candidate = result.current.getCandidateById('1');
    expect(candidate).toBeTruthy();
    expect(candidate?.name).toBe('John Doe');

    const nonExistent = result.current.getCandidateById('999');
    expect(nonExistent).toBeNull();
  });

  it('should get candidates by party', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const progressiveCandidates = result.current.getCandidatesByParty('Progressive');
    expect(progressiveCandidates).toHaveLength(2);
    expect(progressiveCandidates.every(c => 
      c.party.includes('Progressive')
    )).toBe(true);
  });

  it('should get candidates by position', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const presidents = result.current.getCandidatesByPosition('President');
    expect(presidents).toHaveLength(4);
    expect(presidents.every(c => c.position === 'President')).toBe(true);
  });

  it('should get top candidates', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const top3 = result.current.getTopCandidates(3);
    expect(top3).toHaveLength(3);
    expect(top3[0].name).toBe('John Doe'); // Highest votes
    expect(top3[0].votes).toBeGreaterThan(top3[1].votes);
  });

  it('should search candidates', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const searchResults = result.current.searchCandidates('John');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('John Doe');
  });

  it('should vote for candidate', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const initialVotes = result.current.candidates[0].votes;

    await act(async () => {
      const voteResult = await result.current.voteForCandidate('1');
      expect(voteResult.success).toBe(true);
    });

    expect(result.current.candidates[0].votes).toBe(initialVotes + 1);
  });

  it('should share candidate', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const candidate = result.current.candidates[0];

    await act(async () => {
      await result.current.shareCandidate(candidate);
    });

    expect(navigator.share).toHaveBeenCalledWith({
      title: `${candidate.name} - ${candidate.position}`,
      text: `Vote for ${candidate.name} for ${candidate.position} in the ${candidate.party}`,
      url: `/candidates/${candidate.id}`
    });
  });

  it('should bookmark candidate', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    await act(async () => {
      await result.current.bookmarkCandidate('1');
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should report candidate', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    await act(async () => {
      await result.current.reportCandidate('1', 'Inappropriate content');
    });

    // Should not throw error
    expect(true).toBe(true);
  });

  it('should calculate stats correctly', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    const stats = result.current.stats;
    expect(stats).toBeTruthy();
    expect(stats?.totalCandidates).toBe(6);
    expect(stats?.totalVotes).toBe(20300000);
    expect(stats?.averageVotes).toBe(3383333.33);
    expect(stats?.topCandidate?.name).toBe('John Doe');
    expect(stats?.partyDistribution['Progressive Party']).toBe(2);
    expect(stats?.positionDistribution['President']).toBe(4);
    expect(stats?.activeCandidates).toBe(4);
    expect(stats?.inactiveCandidates).toBe(2);
  });

  it('should refresh candidates', async () => {
    const { result } = renderHook(() => useCandidates('election-1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.candidates).toHaveLength(6);

    await act(async () => {
      await result.current.refreshCandidates();
    });

    expect(result.current.candidates).toHaveLength(6);
  });
});

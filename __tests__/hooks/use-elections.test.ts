/**
 * Elections Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useElections, 
  useElectionSearch, 
  useElectionFavorites 
} from '@/hooks/use-elections';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useElections', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useElections('1'));

    expect(result.current.elections).toEqual([]);
    expect(result.current.filteredElections).toEqual([]);
    expect(result.current.stats).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load elections data', async () => {
    const { result } = renderHook(() => useElections('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.elections).toHaveLength(4);
    expect(result.current.stats).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.elections[0].title).toBe('Presidential Election 2023');
  });

  it('should filter elections by status', () => {
    const { result } = renderHook(() => useElections('1'));

    // Wait for data to load
    act(() => {
      result.current.elections = [
        { id: '1', status: 'active' } as any,
        { id: '2', status: 'upcoming' } as any,
        { id: '3', status: 'completed' } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        status: ['active']
      });
    });

    expect(result.current.filteredElections).toHaveLength(1);
    expect(result.current.filteredElections[0].status).toBe('active');
  });

  it('should filter elections by category', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', category: 'Presidential' } as any,
        { id: '2', category: 'Senate' } as any,
        { id: '3', category: 'Presidential' } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        category: ['Presidential']
      });
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.category === 'Presidential')).toBe(true);
  });

  it('should filter elections by voting status', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', hasVoted: true } as any,
        { id: '2', hasVoted: false } as any,
        { id: '3', hasVoted: true } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        hasVoted: true
      });
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.hasVoted === true)).toBe(true);
  });

  it('should search elections by title', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', title: 'Presidential Election' } as any,
        { id: '2', title: 'Senate Election' } as any,
        { id: '3', title: 'Presidential Vote' } as any
      ];
    });

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => 
      e.title.toLowerCase().includes('presidential')
    )).toBe(true);
  });

  it('should sort elections by title', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', title: 'Z Election' } as any,
        { id: '2', title: 'A Election' } as any,
        { id: '3', title: 'M Election' } as any
      ];
    });

    act(() => {
      result.current.setSort({ field: 'title', direction: 'asc' });
    });

    expect(result.current.filteredElections[0].title).toBe('A Election');
    expect(result.current.filteredElections[2].title).toBe('Z Election');
  });

  it('should sort elections by start date', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', startDate: '2023-03-01T00:00:00Z' } as any,
        { id: '2', startDate: '2023-01-01T00:00:00Z' } as any,
        { id: '3', startDate: '2023-02-01T00:00:00Z' } as any
      ];
    });

    act(() => {
      result.current.setSort({ field: 'startDate', direction: 'asc' });
    });

    expect(result.current.filteredElections[0].id).toBe('2');
    expect(result.current.filteredElections[2].id).toBe('1');
  });

  it('should vote in election', async () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', hasVoted: false, participationRate: 50 } as any
      ];
    });

    await act(async () => {
      await result.current.voteInElection('1');
    });

    expect(result.current.elections[0].hasVoted).toBe(true);
    expect(result.current.elections[0].participationRate).toBe(51);
  });

  it('should get election by ID', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', title: 'Election 1' } as any,
        { id: '2', title: 'Election 2' } as any
      ];
    });

    const election = result.current.getElectionById('1');
    expect(election?.title).toBe('Election 1');
  });

  it('should get elections by status', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', status: 'active' } as any,
        { id: '2', status: 'upcoming' } as any,
        { id: '3', status: 'active' } as any
      ];
    });

    const activeElections = result.current.getElectionsByStatus('active');
    expect(activeElections).toHaveLength(2);
    expect(activeElections.every(e => e.status === 'active')).toBe(true);
  });

  it('should get elections by category', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.elections = [
        { id: '1', category: 'Presidential' } as any,
        { id: '2', category: 'Senate' } as any,
        { id: '3', category: 'Presidential' } as any
      ];
    });

    const presidentialElections = result.current.getElectionsByCategory('Presidential');
    expect(presidentialElections).toHaveLength(2);
    expect(presidentialElections.every(e => e.category === 'Presidential')).toBe(true);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useElections('1'));

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        status: ['active'],
        category: ['Presidential']
      });
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.status).toEqual([]);
    expect(result.current.filters.category).toEqual([]);
  });

  it('should refresh elections', async () => {
    const { result } = renderHook(() => useElections('1'));

    await act(async () => {
      await result.current.refreshElections();
    });

    expect(result.current.elections).toHaveLength(4);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useElectionSearch', () => {
  const mockElections = [
    { id: '1', title: 'Presidential Election', description: 'Vote for president' } as any,
    { id: '2', title: 'Senate Election', description: 'Vote for senate' } as any,
    { id: '3', title: 'House Election', description: 'Vote for house' } as any
  ];

  it('should initialize with empty search', () => {
    const { result } = renderHook(() => useElectionSearch(mockElections));

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('should search elections by title', async () => {
    const { result } = renderHook(() => useElectionSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].title).toBe('Presidential Election');
    });
  });

  it('should search elections by description', async () => {
    const { result } = renderHook(() => useElectionSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('senate');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].title).toBe('Senate Election');
    });
  });

  it('should clear search results when query is empty', async () => {
    const { result } = renderHook(() => useElectionSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
    });

    act(() => {
      result.current.setSearchQuery('');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toEqual([]);
    });
  });

  it('should show searching state during search', async () => {
    const { result } = renderHook(() => useElectionSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    expect(result.current.isSearching).toBe(true);

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });
});

describe('useElectionFavorites', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useElectionFavorites('1'));

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load favorites from storage', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['1', '2']));

    const { result } = renderHook(() => useElectionFavorites('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.favorites).toEqual(['1', '2']);
  });

  it('should add election to favorites', async () => {
    const { result } = renderHook(() => useElectionFavorites('1'));

    await act(async () => {
      await result.current.addToFavorites('1');
    });

    expect(result.current.favorites).toContain('1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'election-favorites-1',
      JSON.stringify(['1'])
    );
  });

  it('should remove election from favorites', async () => {
    const { result } = renderHook(() => useElectionFavorites('1'));

    // Add first
    act(() => {
      result.current.favorites = ['1', '2'];
    });

    await act(async () => {
      await result.current.removeFromFavorites('1');
    });

    expect(result.current.favorites).toEqual(['2']);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'election-favorites-1',
      JSON.stringify(['2'])
    );
  });

  it('should check if election is favorite', () => {
    const { result } = renderHook(() => useElectionFavorites('1'));

    act(() => {
      result.current.favorites = ['1', '2'];
    });

    expect(result.current.isFavorite('1')).toBe(true);
    expect(result.current.isFavorite('3')).toBe(false);
  });

  it('should toggle favorite status', async () => {
    const { result } = renderHook(() => useElectionFavorites('1'));

    // Initially not favorite
    expect(result.current.isFavorite('1')).toBe(false);

    // Toggle to add
    await act(async () => {
      await result.current.toggleFavorite('1');
    });

    expect(result.current.isFavorite('1')).toBe(true);

    // Toggle to remove
    await act(async () => {
      await result.current.toggleFavorite('1');
    });

    expect(result.current.isFavorite('1')).toBe(false);
  });

  it('should handle storage errors gracefully', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useElectionFavorites('1'));

    await act(async () => {
      await result.current.addToFavorites('1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to add to favorites:', expect.any(Error));
    expect(result.current.favorites).toContain('1'); // Should still update state

    consoleSpy.mockRestore();
  });
});

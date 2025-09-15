/**
 * Elections List Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useElectionsList, 
  useElectionsSearch, 
  useElectionsFavorites 
} from '@/hooks/use-elections-list';

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

describe('useElectionsList', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    expect(result.current.elections).toEqual([]);
    expect(result.current.filteredElections).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load elections data', async () => {
    const { result } = renderHook(() => useElectionsList('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.elections).toHaveLength(5);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.elections[0].title).toBe('Presidential Election 2023');
  });

  it('should filter elections by status', () => {
    const { result } = renderHook(() => useElectionsList('1'));

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
    const { result } = renderHook(() => useElectionsList('1'));

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

  it('should filter elections by bookmarked status', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', isBookmarked: true } as any,
        { id: '2', isBookmarked: false } as any,
        { id: '3', isBookmarked: true } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        isBookmarked: true
      });
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.isBookmarked === true)).toBe(true);
  });

  it('should filter elections by starred status', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', isStarred: true } as any,
        { id: '2', isStarred: false } as any,
        { id: '3', isStarred: true } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        isStarred: true
      });
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.isStarred === true)).toBe(true);
  });

  it('should search elections by title', () => {
    const { result } = renderHook(() => useElectionsList('1'));

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

  it('should search elections by tags', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', tags: ['presidential', 'national'] } as any,
        { id: '2', tags: ['senate', 'state'] } as any,
        { id: '3', tags: ['presidential', 'local'] } as any
      ];
    });

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => 
      e.tags.some(tag => tag.toLowerCase().includes('presidential'))
    )).toBe(true);
  });

  it('should sort elections by title', () => {
    const { result } = renderHook(() => useElectionsList('1'));

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

  it('should sort elections by participation rate', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', participationRate: 30 } as any,
        { id: '2', participationRate: 80 } as any,
        { id: '3', participationRate: 50 } as any
      ];
    });

    act(() => {
      result.current.setSort({ field: 'participation', direction: 'desc' });
    });

    expect(result.current.filteredElections[0].participationRate).toBe(80);
    expect(result.current.filteredElections[2].participationRate).toBe(30);
  });

  it('should sort elections by priority', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', priority: 'low' } as any,
        { id: '2', priority: 'high' } as any,
        { id: '3', priority: 'medium' } as any
      ];
    });

    act(() => {
      result.current.setSort({ field: 'priority', direction: 'desc' });
    });

    expect(result.current.filteredElections[0].priority).toBe('high');
    expect(result.current.filteredElections[1].priority).toBe('medium');
    expect(result.current.filteredElections[2].priority).toBe('low');
  });

  it('should bookmark election', async () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', isBookmarked: false } as any
      ];
    });

    await act(async () => {
      await result.current.bookmarkElection('1');
    });

    expect(result.current.elections[0].isBookmarked).toBe(true);
  });

  it('should star election', async () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', isStarred: false } as any
      ];
    });

    await act(async () => {
      await result.current.starElection('1');
    });

    expect(result.current.elections[0].isStarred).toBe(true);
  });

  it('should share election', async () => {
    const { result } = renderHook(() => useElectionsList('1'));

    const mockElection = { id: '1', title: 'Test Election', description: 'Test Description' } as any;

    await act(async () => {
      await result.current.shareElection(mockElection);
    });

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Test Election',
      text: 'Test Description',
      url: '/elections/1'
    });
  });

  it('should get election by ID', () => {
    const { result } = renderHook(() => useElectionsList('1'));

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
    const { result } = renderHook(() => useElectionsList('1'));

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

  it('should get bookmarked elections', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', isBookmarked: true } as any,
        { id: '2', isBookmarked: false } as any,
        { id: '3', isBookmarked: true } as any
      ];
    });

    const bookmarkedElections = result.current.getBookmarkedElections();
    expect(bookmarkedElections).toHaveLength(2);
    expect(bookmarkedElections.every(e => e.isBookmarked === true)).toBe(true);
  });

  it('should get starred elections', () => {
    const { result } = renderHook(() => useElectionsList('1'));

    act(() => {
      result.current.elections = [
        { id: '1', isStarred: true } as any,
        { id: '2', isStarred: false } as any,
        { id: '3', isStarred: true } as any
      ];
    });

    const starredElections = result.current.getStarredElections();
    expect(starredElections).toHaveLength(2);
    expect(starredElections.every(e => e.isStarred === true)).toBe(true);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useElectionsList('1'));

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
    const { result } = renderHook(() => useElectionsList('1'));

    await act(async () => {
      await result.current.refreshElections();
    });

    expect(result.current.elections).toHaveLength(5);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useElectionsSearch', () => {
  const mockElections = [
    { id: '1', title: 'Presidential Election', description: 'Vote for president', tags: ['presidential'] } as any,
    { id: '2', title: 'Senate Election', description: 'Vote for senate', tags: ['senate'] } as any,
    { id: '3', title: 'House Election', description: 'Vote for house', tags: ['house'] } as any
  ];

  it('should initialize with empty search', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('should search elections by title', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].title).toBe('Presidential Election');
    });
  });

  it('should search elections by description', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('senate');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].title).toBe('Senate Election');
    });
  });

  it('should search elections by tags', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('house');
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
      expect(result.current.searchResults[0].title).toBe('House Election');
    });
  });

  it('should clear search results when query is empty', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

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
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    expect(result.current.isSearching).toBe(true);

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });
  });
});

describe('useElectionsFavorites', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useElectionsFavorites('1'));

    expect(result.current.bookmarkedElections).toEqual([]);
    expect(result.current.starredElections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should load favorites from storage', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['1', '2']));

    const { result } = renderHook(() => useElectionsFavorites('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.bookmarkedElections).toEqual(['1', '2']);
  });

  it('should toggle bookmark', async () => {
    const { result } = renderHook(() => useElectionsFavorites('1'));

    await act(async () => {
      await result.current.toggleBookmark('1');
    });

    expect(result.current.bookmarkedElections).toContain('1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-bookmarked-1',
      JSON.stringify(['1'])
    );
  });

  it('should toggle star', async () => {
    const { result } = renderHook(() => useElectionsFavorites('1'));

    await act(async () => {
      await result.current.toggleStar('1');
    });

    expect(result.current.starredElections).toContain('1');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-starred-1',
      JSON.stringify(['1'])
    );
  });

  it('should check if election is bookmarked', () => {
    const { result } = renderHook(() => useElectionsFavorites('1'));

    act(() => {
      result.current.bookmarkedElections = ['1', '2'];
    });

    expect(result.current.isBookmarked('1')).toBe(true);
    expect(result.current.isBookmarked('3')).toBe(false);
  });

  it('should check if election is starred', () => {
    const { result } = renderHook(() => useElectionsFavorites('1'));

    act(() => {
      result.current.starredElections = ['1', '2'];
    });

    expect(result.current.isStarred('1')).toBe(true);
    expect(result.current.isStarred('3')).toBe(false);
  });

  it('should handle storage errors gracefully', async () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useElectionsFavorites('1'));

    await act(async () => {
      await result.current.toggleBookmark('1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle bookmark:', expect.any(Error));
    expect(result.current.bookmarkedElections).toContain('1'); // Should still update state

    consoleSpy.mockRestore();
  });
});

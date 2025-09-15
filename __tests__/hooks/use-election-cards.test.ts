/**
 * Election Cards Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useElectionCards } from '@/hooks/use-election-cards';

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

describe('useElectionCards', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useElectionCards());

    expect(result.current.elections).toEqual([]);
    expect(result.current.filteredElections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.searchQuery).toBe('');
  });

  it('should load elections data', async () => {
    const { result } = renderHook(() => useElectionCards());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.elections).toHaveLength(5);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.elections[0].title).toBe('Presidential Election 2023');
  });

  it('should filter elections by status', () => {
    const { result } = renderHook(() => useElectionCards());

    // Wait for data to load
    act(() => {
      result.current.elections = [
        { id: '1', status: 'active' } as any,
        { id: '2', status: 'upcoming' } as any,
        { id: '3', status: 'completed' } as any
      ];
    });

    act(() => {
      result.current.updateFilter('status', ['active']);
    });

    expect(result.current.filteredElections).toHaveLength(1);
    expect(result.current.filteredElections[0].status).toBe('active');
  });

  it('should filter elections by category', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', category: 'Presidential' } as any,
        { id: '2', category: 'Senate' } as any,
        { id: '3', category: 'Presidential' } as any
      ];
    });

    act(() => {
      result.current.updateFilter('category', ['Presidential']);
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.category === 'Presidential')).toBe(true);
  });

  it('should filter elections by bookmarked status', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', isBookmarked: true } as any,
        { id: '2', isBookmarked: false } as any,
        { id: '3', isBookmarked: true } as any
      ];
    });

    act(() => {
      result.current.updateFilter('isBookmarked', true);
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.isBookmarked === true)).toBe(true);
  });

  it('should filter elections by starred status', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', isStarred: true } as any,
        { id: '2', isStarred: false } as any,
        { id: '3', isStarred: true } as any
      ];
    });

    act(() => {
      result.current.updateFilter('isStarred', true);
    });

    expect(result.current.filteredElections).toHaveLength(2);
    expect(result.current.filteredElections.every(e => e.isStarred === true)).toBe(true);
  });

  it('should search elections by title', () => {
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', title: 'Z Election' } as any,
        { id: '2', title: 'A Election' } as any,
        { id: '3', title: 'M Election' } as any
      ];
    });

    act(() => {
      result.current.updateViewOption('sortBy', 'title');
      result.current.updateViewOption('sortDirection', 'asc');
    });

    expect(result.current.filteredElections[0].title).toBe('A Election');
    expect(result.current.filteredElections[2].title).toBe('Z Election');
  });

  it('should sort elections by participation rate', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', participationRate: 30 } as any,
        { id: '2', participationRate: 80 } as any,
        { id: '3', participationRate: 50 } as any
      ];
    });

    act(() => {
      result.current.updateViewOption('sortBy', 'participation');
      result.current.updateViewOption('sortDirection', 'desc');
    });

    expect(result.current.filteredElections[0].participationRate).toBe(80);
    expect(result.current.filteredElections[2].participationRate).toBe(30);
  });

  it('should sort elections by priority', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', priority: 'low' } as any,
        { id: '2', priority: 'high' } as any,
        { id: '3', priority: 'medium' } as any
      ];
    });

    act(() => {
      result.current.updateViewOption('sortBy', 'priority');
      result.current.updateViewOption('sortDirection', 'desc');
    });

    expect(result.current.filteredElections[0].priority).toBe('high');
    expect(result.current.filteredElections[1].priority).toBe('medium');
    expect(result.current.filteredElections[2].priority).toBe('low');
  });

  it('should bookmark election', async () => {
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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
    const { result } = renderHook(() => useElectionCards());

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

  it('should get card statistics', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', status: 'active', isBookmarked: true, isStarred: false } as any,
        { id: '2', status: 'upcoming', isBookmarked: false, isStarred: true } as any,
        { id: '3', status: 'completed', isBookmarked: true, isStarred: true } as any
      ];
    });

    const stats = result.current.getCardStats();
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(1);
    expect(stats.upcoming).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.bookmarked).toBe(2);
    expect(stats.starred).toBe(2);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.updateFilter('status', ['active']);
      result.current.updateFilter('category', ['Presidential']);
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.status).toEqual([]);
    expect(result.current.filters.category).toEqual([]);
  });

  it('should refresh elections', async () => {
    const { result } = renderHook(() => useElectionCards());

    await act(async () => {
      await result.current.refreshElections();
    });

    expect(result.current.elections).toHaveLength(5);
    expect(result.current.isLoading).toBe(false);
  });

  it('should save view preferences to localStorage', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.updateViewOption('variant', 'compact');
      result.current.updateViewOption('columns', 2);
    });

    act(() => {
      result.current.saveViewPreferences();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'election-cards-view-preferences',
      expect.stringContaining('compact')
    );
  });

  it('should load view preferences from localStorage', () => {
    const savedPreferences = {
      variant: 'compact',
      columns: 2,
      showActions: true,
      showStats: true,
      showRequirements: false,
      showTags: true,
      sortBy: 'title',
      sortDirection: 'asc'
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));

    const { result } = renderHook(() => useElectionCards());

    expect(result.current.viewOptions.variant).toBe('compact');
    expect(result.current.viewOptions.columns).toBe(2);
  });

  it('should export elections as JSON', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', title: 'Test Election', category: 'Test' } as any
      ];
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
      result.current.exportElections('json');
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should export elections as CSV', () => {
    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.elections = [
        { id: '1', title: 'Test Election', category: 'Test' } as any
      ];
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
      result.current.exportElections('csv');
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useElectionCards());

    act(() => {
      result.current.saveViewPreferences();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to save view preferences:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should handle share errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    navigator.share = jest.fn().mockRejectedValue(new Error('Share failed'));

    const { result } = renderHook(() => useElectionCards());

    const mockElection = { id: '1', title: 'Test Election', description: 'Test Description' } as any;

    await act(async () => {
      try {
        await result.current.shareElection(mockElection);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(navigator.share).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

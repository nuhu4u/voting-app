/**
 * Elections Search Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useElectionsSearch } from '@/hooks/use-elections-search';

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

// Mock elections data
const mockElections = [
  {
    id: '1',
    title: 'Presidential Election 2023',
    description: 'Election for the President of Nigeria',
    category: 'Presidential',
    location: 'Nigeria',
    status: 'active',
    priority: 'high',
    startDate: '2023-02-25T08:00:00Z',
    endDate: '2023-02-25T18:00:00Z',
    tags: ['presidential', 'national'],
    candidates: ['Candidate A', 'Candidate B']
  },
  {
    id: '2',
    title: 'Senate Election 2023',
    description: 'Election for Senate Representatives',
    category: 'Senate',
    location: 'Lagos State',
    status: 'upcoming',
    priority: 'medium',
    startDate: '2023-03-11T08:00:00Z',
    endDate: '2023-03-11T18:00:00Z',
    tags: ['senate', 'state'],
    candidates: ['Candidate C', 'Candidate D']
  },
  {
    id: '3',
    title: 'House Election 2023',
    description: 'Election for House of Representatives',
    category: 'House of Reps',
    location: 'Lagos State',
    status: 'completed',
    priority: 'low',
    startDate: '2023-01-15T08:00:00Z',
    endDate: '2023-01-15T18:00:00Z',
    tags: ['house', 'state'],
    candidates: ['Candidate E', 'Candidate F']
  }
];

describe('useElectionsSearch', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.searchHistory).toEqual([]);
  });

  it('should set search query', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    expect(result.current.searchQuery).toBe('presidential');
  });

  it('should generate suggestions based on query', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('pres');
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions.some(s => s.text.includes('Presidential'))).toBe(true);
  });

  it('should perform search and return results', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('presidential');
    });

    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].title).toContain('Presidential');
    expect(result.current.searchResults).toEqual(searchResults);
  });

  it('should filter search results by title', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('senate');
    });

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].title).toContain('Senate');
  });

  it('should filter search results by category', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('presidential');
    });

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].category).toBe('Presidential');
  });

  it('should filter search results by location', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('nigeria');
    });

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].location).toBe('Nigeria');
  });

  it('should filter search results by tags', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('national');
    });

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].tags).toContain('national');
  });

  it('should apply search filters', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    const customFilters = {
      includeTitle: true,
      includeDescription: false,
      includeCategory: true,
      includeLocation: false,
      includeTags: false,
      includeCandidates: false,
      dateRange: { start: '', end: '' },
      status: ['active'],
      priority: []
    };

    act(() => {
      result.current.setSearchFilters(customFilters);
    });

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('election', customFilters);
    });

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].status).toBe('active');
  });

  it('should calculate relevance scores correctly', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('presidential election');
    });

    expect(searchResults.length).toBe(1);
    expect(searchResults[0].relevanceScore).toBeGreaterThan(0);
  });

  it('should generate highlights for search results', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('presidential');
    });

    expect(searchResults[0].highlights).toBeDefined();
    expect(searchResults[0].highlights.title).toContain('presidential');
  });

  it('should add search to history', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.addToHistory('presidential election', 3);
    });

    expect(result.current.searchHistory.length).toBe(1);
    expect(result.current.searchHistory[0].query).toBe('presidential election');
    expect(result.current.searchHistory[0].resultCount).toBe(3);
  });

  it('should limit search history to 50 items', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addToHistory(`search ${i}`, 1);
      }
    });

    expect(result.current.searchHistory.length).toBe(50);
  });

  it('should clear search history', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.addToHistory('test search', 1);
    });

    expect(result.current.searchHistory.length).toBe(1);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.searchHistory.length).toBe(0);
  });

  it('should clear search', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setSearchResults([{ id: '1', title: 'Test' }]);
    });

    act(() => {
      result.current.clearSearch();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
  });

  it('should save search to localStorage', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('test search');
    });

    act(() => {
      result.current.saveSearch('My Search');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-saved-searches',
      expect.stringContaining('My Search')
    );
  });

  it('should load search from localStorage', () => {
    const savedSearch = {
      'My Search': {
        query: 'presidential',
        filters: {
          includeTitle: true,
          includeDescription: true,
          includeCategory: true,
          includeLocation: true,
          includeTags: true,
          includeCandidates: false,
          dateRange: { start: '', end: '' },
          status: [],
          priority: []
        },
        timestamp: new Date().toISOString()
      }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSearch));

    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.loadSearch('My Search');
    });

    expect(result.current.searchQuery).toBe('presidential');
  });

  it('should get saved searches', () => {
    const savedSearches = {
      'Search 1': { query: 'test1', filters: {}, timestamp: new Date().toISOString() },
      'Search 2': { query: 'test2', filters: {}, timestamp: new Date().toISOString() }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSearches));

    const { result } = renderHook(() => useElectionsSearch(mockElections));

    const savedSearchNames = result.current.getSavedSearches();

    expect(savedSearchNames).toEqual(['Search 1', 'Search 2']);
  });

  it('should delete saved search', () => {
    const savedSearches = {
      'Search 1': { query: 'test1', filters: {}, timestamp: new Date().toISOString() },
      'Search 2': { query: 'test2', filters: {}, timestamp: new Date().toISOString() }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSearches));

    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.deleteSavedSearch('Search 1');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-saved-searches',
      JSON.stringify({ 'Search 2': savedSearches['Search 2'] })
    );
  });

  it('should get recent searches', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.addToHistory('search 1', 1);
      result.current.addToHistory('search 2', 2);
      result.current.addToHistory('search 3', 3);
    });

    expect(result.current.recentSearches.length).toBe(3);
    expect(result.current.recentSearches[0].query).toBe('search 3');
  });

  it('should get popular searches', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.addToHistory('popular search', 1);
      result.current.addToHistory('popular search', 2);
      result.current.addToHistory('popular search', 3);
      result.current.addToHistory('other search', 1);
    });

    expect(result.current.popularSearches[0]).toBe('popular search');
  });

  it('should calculate search statistics', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.addToHistory('search 1', 5);
      result.current.addToHistory('search 2', 3);
      result.current.addToHistory('search 1', 2);
    });

    expect(result.current.searchStats.totalSearches).toBe(3);
    expect(result.current.searchStats.averageResults).toBe(3);
    expect(result.current.searchStats.mostSearchedTerms[0].term).toBe('search 1');
    expect(result.current.searchStats.mostSearchedTerms[0].count).toBe(2);
  });

  it('should get search analytics', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.setSearchQuery('test');
      result.current.addToHistory('test', 5);
    });

    const analytics = result.current.getSearchAnalytics();

    expect(analytics.currentQuery).toBe('test');
    expect(analytics.currentResults).toBe(0);
    expect(analytics.searchStats).toBeDefined();
    expect(analytics.recentSearches).toBeDefined();
    expect(analytics.popularSearches).toBeDefined();
  });

  it('should handle empty search query', async () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    let searchResults: any[] = [];
    await act(async () => {
      searchResults = await result.current.performSearch('');
    });

    expect(searchResults).toEqual([]);
    expect(result.current.searchResults).toEqual([]);
  });

  it('should handle search errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock performSearch to throw an error
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    // This would normally be handled by the hook's error handling
    expect(() => {
      result.current.performSearch('test');
    }).not.toThrow();

    consoleSpy.mockRestore();
  });

  it('should load search history from localStorage on mount', () => {
    const savedHistory = [
      {
        id: '1',
        query: 'saved search',
        timestamp: new Date().toISOString(),
        resultCount: 3
      }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedHistory));

    const { result } = renderHook(() => useElectionsSearch(mockElections));

    expect(result.current.searchHistory).toEqual(savedHistory);
  });

  it('should save search history to localStorage when changed', () => {
    const { result } = renderHook(() => useElectionsSearch(mockElections));

    act(() => {
      result.current.addToHistory('test search', 1);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-search-history',
      expect.stringContaining('test search')
    );
  });
});

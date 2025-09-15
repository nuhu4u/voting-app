/**
 * Elections Filter Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useElectionsFilters } from '@/hooks/use-elections-filters';

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
    status: 'active',
    category: 'Presidential',
    location: 'Nigeria',
    votingMethod: 'hybrid',
    securityLevel: 'maximum',
    priority: 'high',
    hasVoted: false,
    isBookmarked: true,
    isStarred: false,
    startDate: '2023-02-25T08:00:00Z',
    endDate: '2023-02-25T18:00:00Z',
    tags: ['presidential', 'national']
  },
  {
    id: '2',
    title: 'Senate Election 2023',
    status: 'upcoming',
    category: 'Senate',
    location: 'Lagos State',
    votingMethod: 'online',
    securityLevel: 'enhanced',
    priority: 'medium',
    hasVoted: false,
    isBookmarked: false,
    isStarred: true,
    startDate: '2023-03-11T08:00:00Z',
    endDate: '2023-03-11T18:00:00Z',
    tags: ['senate', 'state']
  },
  {
    id: '3',
    title: 'House Election 2023',
    status: 'completed',
    category: 'House of Reps',
    location: 'Lagos State',
    votingMethod: 'online',
    securityLevel: 'enhanced',
    priority: 'low',
    hasVoted: true,
    isBookmarked: false,
    isStarred: false,
    startDate: '2023-01-15T08:00:00Z',
    endDate: '2023-01-15T18:00:00Z',
    tags: ['house', 'state']
  }
];

describe('useElectionsFilters', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useElectionsFilters());

    expect(result.current.filters).toEqual({
      status: [],
      category: [],
      location: [],
      votingMethod: [],
      securityLevel: [],
      priority: [],
      hasVoted: null,
      isBookmarked: null,
      isStarred: null,
      dateRange: { start: '', end: '' },
      tags: []
    });
  });

  it('should initialize with custom filters', () => {
    const initialFilters = {
      status: ['active'],
      category: ['Presidential']
    };

    const { result } = renderHook(() => useElectionsFilters(initialFilters));

    expect(result.current.filters.status).toEqual(['active']);
    expect(result.current.filters.category).toEqual(['Presidential']);
  });

  it('should update specific filter', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('status', ['active', 'upcoming']);
    });

    expect(result.current.filters.status).toEqual(['active', 'upcoming']);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useElectionsFilters({
      status: ['active'],
      category: ['Presidential']
    }));

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      status: [],
      category: [],
      location: [],
      votingMethod: [],
      securityLevel: [],
      priority: [],
      hasVoted: null,
      isBookmarked: null,
      isStarred: null,
      dateRange: { start: '', end: '' },
      tags: []
    });
  });

  it('should reset filters to initial state', () => {
    const initialFilters = {
      status: ['active'],
      category: ['Presidential']
    };

    const { result } = renderHook(() => useElectionsFilters(initialFilters));

    act(() => {
      result.current.updateFilter('status', ['completed']);
      result.current.updateFilter('category', ['Senate']);
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters.status).toEqual(['active']);
    expect(result.current.filters.category).toEqual(['Presidential']);
  });

  it('should apply filters to elections', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('status', ['active']);
    });

    const filteredElections = result.current.applyFilters(mockElections);

    expect(filteredElections).toHaveLength(1);
    expect(filteredElections[0].status).toBe('active');
  });

  it('should filter by multiple criteria', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('status', ['active', 'upcoming']);
      result.current.updateFilter('location', ['Nigeria']);
    });

    const filteredElections = result.current.applyFilters(mockElections);

    expect(filteredElections).toHaveLength(1);
    expect(filteredElections[0].status).toBe('active');
    expect(filteredElections[0].location).toBe('Nigeria');
  });

  it('should filter by boolean values', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('hasVoted', true);
    });

    const filteredElections = result.current.applyFilters(mockElections);

    expect(filteredElections).toHaveLength(1);
    expect(filteredElections[0].hasVoted).toBe(true);
  });

  it('should filter by date range', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('dateRange', {
        start: '2023-02-01',
        end: '2023-03-31'
      });
    });

    const filteredElections = result.current.applyFilters(mockElections);

    expect(filteredElections).toHaveLength(2);
    expect(filteredElections.every(e => 
      new Date(e.startDate) >= new Date('2023-02-01') &&
      new Date(e.endDate) <= new Date('2023-03-31')
    )).toBe(true);
  });

  it('should filter by tags', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('tags', ['presidential']);
    });

    const filteredElections = result.current.applyFilters(mockElections);

    expect(filteredElections).toHaveLength(1);
    expect(filteredElections[0].tags).toContain('presidential');
  });

  it('should get filter statistics', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('status', ['active']);
    });

    const stats = result.current.getFilterStats(mockElections);

    expect(stats.totalElections).toBe(3);
    expect(stats.filteredElections).toBe(1);
    expect(stats.activeFilters).toBe(1);
    expect(stats.filterBreakdown.status).toEqual({
      active: 1,
      upcoming: 1,
      completed: 1
    });
  });

  it('should get available options from elections', () => {
    const { result } = renderHook(() => useElectionsFilters());

    const options = result.current.getAvailableOptions(mockElections);

    expect(options.status).toHaveLength(3);
    expect(options.status.find(opt => opt.value === 'active')).toBeTruthy();
    expect(options.category).toHaveLength(3);
    expect(options.location).toHaveLength(2);
    expect(options.votingMethod).toHaveLength(2);
    expect(options.securityLevel).toHaveLength(2);
    expect(options.priority).toHaveLength(3);
    expect(options.tags).toHaveLength(4);
  });

  it('should check if filter is active', () => {
    const { result } = renderHook(() => useElectionsFilters());

    expect(result.current.isFilterActive('status')).toBe(false);

    act(() => {
      result.current.updateFilter('status', ['active']);
    });

    expect(result.current.isFilterActive('status')).toBe(true);
  });

  it('should get active filters count', () => {
    const { result } = renderHook(() => useElectionsFilters());

    expect(result.current.getActiveFiltersCount()).toBe(0);

    act(() => {
      result.current.updateFilter('status', ['active']);
      result.current.updateFilter('category', ['Presidential']);
    });

    expect(result.current.getActiveFiltersCount()).toBe(2);
  });

  it('should get filter chips', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('status', ['active']);
      result.current.updateFilter('category', ['Presidential']);
      result.current.updateFilter('hasVoted', true);
    });

    const chips = result.current.getFilterChips();

    expect(chips).toHaveLength(3);
    expect(chips.find(chip => chip.key === 'status-active')).toBeTruthy();
    expect(chips.find(chip => chip.key === 'category-Presidential')).toBeTruthy();
    expect(chips.find(chip => chip.key === 'hasVoted')).toBeTruthy();
  });

  it('should save filters to localStorage', () => {
    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.updateFilter('status', ['active']);
    });

    act(() => {
      result.current.saveFilters('My Filter');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-saved-filters',
      expect.stringContaining('My Filter')
    );
  });

  it('should load filters from localStorage', () => {
    const savedFilters = {
      'My Filter': {
        filters: { status: ['active'], category: ['Presidential'] },
        timestamp: new Date().toISOString()
      }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFilters));

    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.loadFilters('My Filter');
    });

    expect(result.current.filters.status).toEqual(['active']);
    expect(result.current.filters.category).toEqual(['Presidential']);
  });

  it('should get saved filter names', () => {
    const savedFilters = {
      'Filter 1': { filters: {}, timestamp: new Date().toISOString() },
      'Filter 2': { filters: {}, timestamp: new Date().toISOString() }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFilters));

    const { result } = renderHook(() => useElectionsFilters());

    const savedFilterNames = result.current.getSavedFilters();

    expect(savedFilterNames).toEqual(['Filter 1', 'Filter 2']);
  });

  it('should delete saved filters', () => {
    const savedFilters = {
      'Filter 1': { filters: {}, timestamp: new Date().toISOString() },
      'Filter 2': { filters: {}, timestamp: new Date().toISOString() }
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedFilters));

    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.deleteSavedFilters('Filter 1');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'elections-saved-filters',
      JSON.stringify({ 'Filter 2': savedFilters['Filter 2'] })
    );
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useElectionsFilters());

    act(() => {
      result.current.loadFilters('NonExistent');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load filters:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should count elections correctly in filter breakdown', () => {
    const { result } = renderHook(() => useElectionsFilters());

    const stats = result.current.getFilterStats(mockElections);

    expect(stats.filterBreakdown.status.active).toBe(1);
    expect(stats.filterBreakdown.status.upcoming).toBe(1);
    expect(stats.filterBreakdown.status.completed).toBe(1);
    expect(stats.filterBreakdown.category.Presidential).toBe(1);
    expect(stats.filterBreakdown.category.Senate).toBe(1);
    expect(stats.filterBreakdown.category['House of Reps']).toBe(1);
  });

  it('should handle empty elections array', () => {
    const { result } = renderHook(() => useElectionsFilters());

    const filteredElections = result.current.applyFilters([]);
    const stats = result.current.getFilterStats([]);
    const options = result.current.getAvailableOptions([]);

    expect(filteredElections).toEqual([]);
    expect(stats.totalElections).toBe(0);
    expect(stats.filteredElections).toBe(0);
    expect(options.status).toEqual([]);
  });
});

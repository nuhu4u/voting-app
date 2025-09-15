/**
 * Elections Filter Logic Hook
 * Advanced filtering logic for elections
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface FilterState {
  status: string[];
  category: string[];
  location: string[];
  votingMethod: string[];
  securityLevel: string[];
  priority: string[];
  hasVoted: boolean | null;
  isBookmarked: boolean | null;
  isStarred: boolean | null;
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

export interface FilterStats {
  totalElections: number;
  filteredElections: number;
  activeFilters: number;
  filterBreakdown: {
    status: Record<string, number>;
    category: Record<string, number>;
    location: Record<string, number>;
    votingMethod: Record<string, number>;
    securityLevel: Record<string, number>;
    priority: Record<string, number>;
  };
}

export interface UseElectionsFiltersReturn {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  updateFilter: (key: keyof FilterState, value: any) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  applyFilters: (elections: any[]) => any[];
  getFilterStats: (elections: any[]) => FilterStats;
  getAvailableOptions: (elections: any[]) => {
    status: FilterOption[];
    category: FilterOption[];
    location: FilterOption[];
    votingMethod: FilterOption[];
    securityLevel: FilterOption[];
    priority: FilterOption[];
    tags: FilterOption[];
  };
  isFilterActive: (key: keyof FilterState) => boolean;
  getActiveFiltersCount: () => number;
  getFilterChips: () => Array<{ key: string; label: string; value: string; onRemove: () => void }>;
  saveFilters: (name: string) => void;
  loadFilters: (name: string) => void;
  getSavedFilters: () => string[];
  deleteSavedFilters: (name: string) => void;
}

const defaultFilters: FilterState = {
  status: [],
  category: [],
  location: [],
  votingMethod: [],
  securityLevel: [],
  priority: [],
  hasVoted: null,
  isBookmarked: null,
  isStarred: null,
  dateRange: {
    start: '',
    end: ''
  },
  tags: []
};

/**
 * Main Elections Filter Hook
 */
export function useElectionsFilters(initialFilters?: Partial<FilterState>): UseElectionsFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters
  });

  // Update a specific filter
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters({
      ...defaultFilters,
      ...initialFilters
    });
  }, [initialFilters]);

  // Apply filters to elections array
  const applyFilters = useCallback((elections: any[]) => {
    return elections.filter(election => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(election.status)) {
        return false;
      }

      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(election.category)) {
        return false;
      }

      // Location filter
      if (filters.location.length > 0 && !filters.location.includes(election.location)) {
        return false;
      }

      // Voting method filter
      if (filters.votingMethod.length > 0 && !filters.votingMethod.includes(election.votingMethod)) {
        return false;
      }

      // Security level filter
      if (filters.securityLevel.length > 0 && !filters.securityLevel.includes(election.securityLevel)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(election.priority)) {
        return false;
      }

      // Has voted filter
      if (filters.hasVoted !== null && election.hasVoted !== filters.hasVoted) {
        return false;
      }

      // Bookmarked filter
      if (filters.isBookmarked !== null && election.isBookmarked !== filters.isBookmarked) {
        return false;
      }

      // Starred filter
      if (filters.isStarred !== null && election.isStarred !== filters.isStarred) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start) {
        const electionStartDate = new Date(election.startDate);
        const filterStartDate = new Date(filters.dateRange.start);
        if (electionStartDate < filterStartDate) {
          return false;
        }
      }

      if (filters.dateRange.end) {
        const electionEndDate = new Date(election.endDate);
        const filterEndDate = new Date(filters.dateRange.end);
        if (electionEndDate > filterEndDate) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          election.tags && election.tags.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Get filter statistics
  const getFilterStats = useCallback((elections: any[]): FilterStats => {
    const filteredElections = applyFilters(elections);
    
    const filterBreakdown = {
      status: {} as Record<string, number>,
      category: {} as Record<string, number>,
      location: {} as Record<string, number>,
      votingMethod: {} as Record<string, number>,
      securityLevel: {} as Record<string, number>,
      priority: {} as Record<string, number>
    };

    // Count elections by each filter category
    elections.forEach(election => {
      // Status breakdown
      if (election.status) {
        filterBreakdown.status[election.status] = (filterBreakdown.status[election.status] || 0) + 1;
      }

      // Category breakdown
      if (election.category) {
        filterBreakdown.category[election.category] = (filterBreakdown.category[election.category] || 0) + 1;
      }

      // Location breakdown
      if (election.location) {
        filterBreakdown.location[election.location] = (filterBreakdown.location[election.location] || 0) + 1;
      }

      // Voting method breakdown
      if (election.votingMethod) {
        filterBreakdown.votingMethod[election.votingMethod] = (filterBreakdown.votingMethod[election.votingMethod] || 0) + 1;
      }

      // Security level breakdown
      if (election.securityLevel) {
        filterBreakdown.securityLevel[election.securityLevel] = (filterBreakdown.securityLevel[election.securityLevel] || 0) + 1;
      }

      // Priority breakdown
      if (election.priority) {
        filterBreakdown.priority[election.priority] = (filterBreakdown.priority[election.priority] || 0) + 1;
      }
    });

    const activeFilters = Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      } else if (typeof value === 'object' && value !== null) {
        return count + (Object.values(value).some(v => v !== '') ? 1 : 0);
      } else {
        return count + (value !== null && value !== '' ? 1 : 0);
      }
    }, 0);

    return {
      totalElections: elections.length,
      filteredElections: filteredElections.length,
      activeFilters,
      filterBreakdown
    };
  }, [filters, applyFilters]);

  // Get available filter options from elections data
  const getAvailableOptions = useCallback((elections: any[]) => {
    const options = {
      status: [] as FilterOption[],
      category: [] as FilterOption[],
      location: [] as FilterOption[],
      votingMethod: [] as FilterOption[],
      securityLevel: [] as FilterOption[],
      priority: [] as FilterOption[],
      tags: [] as FilterOption[]
    };

    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};
    const votingMethodCounts: Record<string, number> = {};
    const securityLevelCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    // Count occurrences of each filter value
    elections.forEach(election => {
      // Status
      if (election.status) {
        statusCounts[election.status] = (statusCounts[election.status] || 0) + 1;
      }

      // Category
      if (election.category) {
        categoryCounts[election.category] = (categoryCounts[election.category] || 0) + 1;
      }

      // Location
      if (election.location) {
        locationCounts[election.location] = (locationCounts[election.location] || 0) + 1;
      }

      // Voting method
      if (election.votingMethod) {
        votingMethodCounts[election.votingMethod] = (votingMethodCounts[election.votingMethod] || 0) + 1;
      }

      // Security level
      if (election.securityLevel) {
        securityLevelCounts[election.securityLevel] = (securityLevelCounts[election.securityLevel] || 0) + 1;
      }

      // Priority
      if (election.priority) {
        priorityCounts[election.priority] = (priorityCounts[election.priority] || 0) + 1;
      }

      // Tags
      if (election.tags && Array.isArray(election.tags)) {
        election.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert counts to options
    options.status = Object.entries(statusCounts).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count,
      color: getStatusColor(value)
    }));

    options.category = Object.entries(categoryCounts).map(([value, count]) => ({
      value,
      label: value,
      count,
      color: getCategoryColor(value)
    }));

    options.location = Object.entries(locationCounts).map(([value, count]) => ({
      value,
      label: value,
      count,
      color: getLocationColor(value)
    }));

    options.votingMethod = Object.entries(votingMethodCounts).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count,
      color: getVotingMethodColor(value)
    }));

    options.securityLevel = Object.entries(securityLevelCounts).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count,
      color: getSecurityLevelColor(value)
    }));

    options.priority = Object.entries(priorityCounts).map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count,
      color: getPriorityColor(value)
    }));

    options.tags = Object.entries(tagCounts).map(([value, count]) => ({
      value,
      label: value,
      count,
      color: getTagColor(value)
    }));

    return options;
  }, []);

  // Check if a specific filter is active
  const isFilterActive = useCallback((key: keyof FilterState): boolean => {
    const value = filters[key];
    if (Array.isArray(value)) {
      return value.length > 0;
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '');
    } else {
      return value !== null && value !== '';
    }
  }, [filters]);

  // Get count of active filters
  const getActiveFiltersCount = useCallback((): number => {
    return Object.keys(filters).reduce((count, key) => {
      const value = filters[key as keyof FilterState];
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      } else if (typeof value === 'object' && value !== null) {
        return count + (Object.values(value).some(v => v !== '') ? 1 : 0);
      } else {
        return count + (value !== null && value !== '' ? 1 : 0);
      }
    }, 0);
  }, [filters]);

  // Get filter chips for display
  const getFilterChips = useCallback(() => {
    const chips: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];

    // Status chips
    filters.status.forEach(status => {
      chips.push({
        key: `status-${status}`,
        label: `Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        value: status,
        onRemove: () => updateFilter('status', filters.status.filter(s => s !== status))
      });
    });

    // Category chips
    filters.category.forEach(category => {
      chips.push({
        key: `category-${category}`,
        label: `Category: ${category}`,
        value: category,
        onRemove: () => updateFilter('category', filters.category.filter(c => c !== category))
      });
    });

    // Location chips
    filters.location.forEach(location => {
      chips.push({
        key: `location-${location}`,
        label: `Location: ${location}`,
        value: location,
        onRemove: () => updateFilter('location', filters.location.filter(l => l !== location))
      });
    });

    // Voting method chips
    filters.votingMethod.forEach(method => {
      chips.push({
        key: `method-${method}`,
        label: `Method: ${method.charAt(0).toUpperCase() + method.slice(1)}`,
        value: method,
        onRemove: () => updateFilter('votingMethod', filters.votingMethod.filter(m => m !== method))
      });
    });

    // Security level chips
    filters.securityLevel.forEach(level => {
      chips.push({
        key: `security-${level}`,
        label: `Security: ${level.charAt(0).toUpperCase() + level.slice(1)}`,
        value: level,
        onRemove: () => updateFilter('securityLevel', filters.securityLevel.filter(s => s !== level))
      });
    });

    // Priority chips
    filters.priority.forEach(priority => {
      chips.push({
        key: `priority-${priority}`,
        label: `Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
        value: priority,
        onRemove: () => updateFilter('priority', filters.priority.filter(p => p !== priority))
      });
    });

    // Boolean filters
    if (filters.hasVoted !== null) {
      chips.push({
        key: 'hasVoted',
        label: `Voted: ${filters.hasVoted ? 'Yes' : 'No'}`,
        value: filters.hasVoted.toString(),
        onRemove: () => updateFilter('hasVoted', null)
      });
    }

    if (filters.isBookmarked !== null) {
      chips.push({
        key: 'isBookmarked',
        label: `Bookmarked: ${filters.isBookmarked ? 'Yes' : 'No'}`,
        value: filters.isBookmarked.toString(),
        onRemove: () => updateFilter('isBookmarked', null)
      });
    }

    if (filters.isStarred !== null) {
      chips.push({
        key: 'isStarred',
        label: `Starred: ${filters.isStarred ? 'Yes' : 'No'}`,
        value: filters.isStarred.toString(),
        onRemove: () => updateFilter('isStarred', null)
      });
    }

    // Date range chips
    if (filters.dateRange.start || filters.dateRange.end) {
      chips.push({
        key: 'dateRange',
        label: `Date: ${filters.dateRange.start || 'Start'} - ${filters.dateRange.end || 'End'}`,
        value: `${filters.dateRange.start}-${filters.dateRange.end}`,
        onRemove: () => updateFilter('dateRange', { start: '', end: '' })
      });
    }

    // Tags chips
    filters.tags.forEach(tag => {
      chips.push({
        key: `tag-${tag}`,
        label: `Tag: ${tag}`,
        value: tag,
        onRemove: () => updateFilter('tags', filters.tags.filter(t => t !== tag))
      });
    });

    return chips;
  }, [filters, updateFilter]);

  // Save filters to localStorage
  const saveFilters = useCallback((name: string) => {
    try {
      const savedFilters = JSON.parse(localStorage.getItem('elections-saved-filters') || '{}');
      savedFilters[name] = {
        filters,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('elections-saved-filters', JSON.stringify(savedFilters));
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }, [filters]);

  // Load filters from localStorage
  const loadFilters = useCallback((name: string) => {
    try {
      const savedFilters = JSON.parse(localStorage.getItem('elections-saved-filters') || '{}');
      const savedFilter = savedFilters[name];
      if (savedFilter && savedFilter.filters) {
        setFilters(savedFilter.filters);
      }
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  }, []);

  // Get list of saved filter names
  const getSavedFilters = useCallback((): string[] => {
    try {
      const savedFilters = JSON.parse(localStorage.getItem('elections-saved-filters') || '{}');
      return Object.keys(savedFilters);
    } catch (error) {
      console.error('Failed to get saved filters:', error);
      return [];
    }
  }, []);

  // Delete saved filters
  const deleteSavedFilters = useCallback((name: string) => {
    try {
      const savedFilters = JSON.parse(localStorage.getItem('elections-saved-filters') || '{}');
      delete savedFilters[name];
      localStorage.setItem('elections-saved-filters', JSON.stringify(savedFilters));
    } catch (error) {
      console.error('Failed to delete saved filters:', error);
    }
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    resetFilters,
    applyFilters,
    getFilterStats,
    getAvailableOptions,
    isFilterActive,
    getActiveFiltersCount,
    getFilterChips,
    saveFilters,
    loadFilters,
    getSavedFilters,
    deleteSavedFilters
  };
}

// Helper functions for color coding
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'green',
    upcoming: 'blue',
    completed: 'gray',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Presidential': 'purple',
    'Senate': 'blue',
    'House of Reps': 'green',
    'Governor': 'yellow',
    'State Assembly': 'orange'
  };
  return colors[category] || 'gray';
}

function getLocationColor(location: string): string {
  const colors: Record<string, string> = {
    'Nigeria': 'purple',
    'Lagos State': 'blue',
    'Abuja': 'green',
    'Kano State': 'yellow'
  };
  return colors[location] || 'gray';
}

function getVotingMethodColor(method: string): string {
  const colors: Record<string, string> = {
    'online': 'blue',
    'hybrid': 'green',
    'offline': 'gray'
  };
  return colors[method] || 'gray';
}

function getSecurityLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'standard': 'gray',
    'enhanced': 'yellow',
    'maximum': 'red'
  };
  return colors[level] || 'gray';
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'high': 'red',
    'medium': 'yellow',
    'low': 'green'
  };
  return colors[priority] || 'gray';
}

function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    'presidential': 'purple',
    'national': 'blue',
    'state': 'green',
    'local': 'orange',
    '2023': 'gray'
  };
  return colors[tag] || 'gray';
}

export default useElectionsFilters;

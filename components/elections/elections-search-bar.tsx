/**
 * Elections Search Bar Component
 * Integrated search bar with suggestions and history
 */

import * as React from 'react';
import { useElectionsSearch } from '@/hooks/use-elections-search';
import { 
  SearchInput, 
  SearchSuggestions, 
  SearchHistory, 
  SearchFilters, 
  SearchResults 
} from './elections-search';

export interface ElectionsSearchBarProps {
  elections: any[];
  onSearchResults: (results: any[]) => void;
  onElectionSelect?: (election: any) => void;
  placeholder?: string;
  showFilters?: boolean;
  showHistory?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

export interface SearchBarStatsProps {
  totalResults: number;
  searchQuery: string;
  searchTime: number;
  className?: string;
}

export interface SearchBarActionsProps {
  onSaveSearch: () => void;
  onClearSearch: () => void;
  onExportResults: () => void;
  canSave: boolean;
  canExport: boolean;
  className?: string;
}

/**
 * Search Bar Stats Component
 */
export function SearchBarStats({
  totalResults,
  searchQuery,
  searchTime,
  className = ''
}: SearchBarStatsProps) {
  if (!searchQuery) return null;

  return React.createElement('div', {
    className: `flex items-center justify-between p-3 bg-gray-50 rounded-lg ${className}`
  },
    React.createElement('div', { className: 'flex items-center space-x-4' },
      React.createElement('span', {
        className: 'text-sm text-gray-600'
      }, `${totalResults} result${totalResults !== 1 ? 's' : ''} found`),
      React.createElement('span', {
        className: 'text-xs text-gray-500'
      }, `in ${searchTime}ms`)
    ),
    React.createElement('div', { className: 'text-sm text-gray-600' },
      React.createElement('span', {}, 'for "'),
      React.createElement('span', {
        className: 'font-medium text-gray-900'
      }, searchQuery),
      React.createElement('span', {}, '"')
    )
  );
}

/**
 * Search Bar Actions Component
 */
export function SearchBarActions({
  onSaveSearch,
  onClearSearch,
  onExportResults,
  canSave,
  canExport,
  className = ''
}: SearchBarActionsProps) {
  return React.createElement('div', {
    className: `flex items-center space-x-2 ${className}`
  },
    canSave && React.createElement('button', {
      onClick: onSaveSearch,
      className: 'flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12'
        })
      ),
      React.createElement('span', {}, 'Save Search')
    ),
    canExport && React.createElement('button', {
      onClick: onExportResults,
      className: 'flex items-center space-x-1 px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        })
      ),
      React.createElement('span', {}, 'Export')
    ),
    React.createElement('button', {
      onClick: onClearSearch,
      className: 'flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M6 18L18 6M6 6l12 12'
        })
      ),
      React.createElement('span', {}, 'Clear')
    )
  );
}

/**
 * Main Elections Search Bar Component
 */
export function ElectionsSearchBar({
  elections,
  onSearchResults,
  onElectionSelect,
  placeholder = 'Search elections...',
  showFilters = true,
  showHistory = true,
  showSuggestions = true,
  className = ''
}: ElectionsSearchBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalResults,
    isSearching,
    searchFilters,
    setSearchFilters,
    suggestions,
    searchHistory,
    recentSearches,
    searchStats,
    performSearch,
    addToHistory,
    clearHistory,
    clearSearch,
    saveSearch,
    getSavedSearches
  } = useElectionsSearch(elections);

  const [searchTime, setSearchTime] = React.useState(0);
  const [showSuggestionsList, setShowSuggestionsList] = React.useState(false);
  const [showHistoryList, setShowHistoryList] = React.useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = React.useState(false);

  // Handle search
  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      onSearchResults([]);
      return;
    }

    const startTime = Date.now();
    const results = await performSearch(query, searchFilters);
    const endTime = Date.now();
    
    setSearchTime(endTime - startTime);
    onSearchResults(results);
    
    // Add to history
    addToHistory(query, results.length);
  }, [performSearch, searchFilters, onSearchResults, addToHistory]);

  // Handle suggestion select
  const handleSuggestionSelect = React.useCallback((suggestion: any) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
    setShowSuggestionsList(false);
  }, [handleSearch]);

  // Handle history select
  const handleHistorySelect = React.useCallback((history: any) => {
    setSearchQuery(history.query);
    handleSearch(history.query);
    setShowHistoryList(false);
  }, [handleSearch]);

  // Handle search query change
  const handleSearchQueryChange = React.useCallback((query: string) => {
    setSearchQuery(query);
    setShowSuggestionsList(query.length > 0 && showSuggestions);
  }, [showSuggestions]);

  // Handle clear search
  const handleClearSearch = React.useCallback(() => {
    clearSearch();
    onSearchResults([]);
    setShowSuggestionsList(false);
    setShowHistoryList(false);
  }, [clearSearch, onSearchResults]);

  // Handle save search
  const handleSaveSearch = React.useCallback(() => {
    if (searchQuery.trim()) {
      const searchName = prompt('Enter a name for this search:');
      if (searchName) {
        saveSearch(searchName);
      }
    }
  }, [searchQuery, saveSearch]);

  // Handle export results
  const handleExportResults = React.useCallback(() => {
    if (searchResults.length === 0) return;

    const exportData = {
      query: searchQuery,
      timestamp: new Date().toISOString(),
      totalResults: totalResults,
      results: searchResults.map(result => ({
        title: result.title,
        description: result.description,
        category: result.category,
        location: result.location,
        status: result.status,
        priority: result.priority,
        startDate: result.startDate,
        endDate: result.endDate,
        tags: result.tags
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elections-search-${searchQuery.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [searchQuery, searchResults, totalResults]);

  // Handle election select
  const handleElectionSelect = React.useCallback((election: any) => {
    onElectionSelect?.(election);
  }, [onElectionSelect]);

  return React.createElement('div', { className: `space-y-4 ${className}` },
    // Search Input
    React.createElement(SearchInput, {
      value: searchQuery,
      onChange: handleSearchQueryChange,
      onSearch: handleSearch,
      onClear: handleClearSearch,
      placeholder,
      isSearching,
      showSuggestions: showSuggestionsList,
      suggestions,
      onSuggestionSelect: handleSuggestionSelect
    }),

    // Search Actions
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      React.createElement('div', { className: 'flex items-center space-x-2' },
        showHistory && React.createElement('button', {
          onClick: () => setShowHistoryList(!showHistoryList),
          className: 'flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
        },
          React.createElement('svg', {
            className: 'w-4 h-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
            })
          ),
          React.createElement('span', {}, 'History'),
          searchHistory.length > 0 && React.createElement('span', {
            className: 'ml-1 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full'
          }, searchHistory.length)
        ),
        showFilters && React.createElement('button', {
          onClick: () => setShowFiltersPanel(!showFiltersPanel),
          className: 'flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors'
        },
          React.createElement('svg', {
            className: 'w-4 h-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z'
            })
          ),
          React.createElement('span', {}, 'Filters')
        )
      ),
      searchQuery && React.createElement(SearchBarActions, {
        onSaveSearch: handleSaveSearch,
        onClearSearch: handleClearSearch,
        onExportResults: handleExportResults,
        canSave: searchQuery.trim().length > 0,
        canExport: searchResults.length > 0
      })
    ),

    // Search History
    showHistory && React.createElement(SearchHistory, {
      history: recentSearches,
      onHistorySelect: handleHistorySelect,
      onClearHistory: clearHistory,
      isVisible: showHistoryList
    }),

    // Search Filters
    showFilters && React.createElement(SearchFilters, {
      filters: searchFilters,
      onFiltersChange: setSearchFilters,
      isVisible: showFiltersPanel,
      onToggle: () => setShowFiltersPanel(!showFiltersPanel)
    }),

    // Search Stats
    searchQuery && React.createElement(SearchBarStats, {
      totalResults,
      searchQuery,
      searchTime
    }),

    // Search Results
    searchQuery && React.createElement(SearchResults, {
      results: searchResults,
      totalResults,
      isSearching,
      searchQuery,
      onLoadMore: undefined, // Can be implemented for pagination
      hasMore: false // Can be implemented for pagination
    })
  );
}

export default ElectionsSearchBar;

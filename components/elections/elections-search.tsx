/**
 * Elections Search Components
 * Advanced search functionality for elections
 */

import * as React from 'react';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'election' | 'category' | 'location' | 'tag' | 'candidate';
  electionId?: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultCount: number;
}

export interface SearchFilters {
  includeTitle: boolean;
  includeDescription: boolean;
  includeCategory: boolean;
  includeLocation: boolean;
  includeTags: boolean;
  includeCandidates: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  priority: string[];
}

export interface ElectionsSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (query: string, filters?: SearchFilters) => void;
  suggestions: SearchSuggestion[];
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  searchHistory: SearchHistory[];
  onHistorySelect: (history: SearchHistory) => void;
  onClearHistory: () => void;
  isSearching: boolean;
  searchResults: any[];
  totalResults: number;
  searchFilters: SearchFilters;
  onSearchFiltersChange: (filters: SearchFilters) => void;
  onClearSearch: () => void;
  placeholder?: string;
  className?: string;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  isSearching?: boolean;
  showSuggestions?: boolean;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  onClearSuggestions: () => void;
  isVisible: boolean;
  className?: string;
}

export interface SearchHistoryProps {
  history: SearchHistory[];
  onHistorySelect: (history: SearchHistory) => void;
  onClearHistory: () => void;
  isVisible: boolean;
  className?: string;
}

export interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export interface SearchResultsProps {
  results: any[];
  totalResults: number;
  isSearching: boolean;
  searchQuery: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

/**
 * Search Input Component
 */
export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search elections...',
  isSearching = false,
  showSuggestions = true,
  suggestions = [],
  onSuggestionSelect,
  className = ''
}: SearchInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = React.useState(false);

  const handleInputChange = (e: any) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestionsList(newValue.length > 0 && showSuggestions);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      onSearch(value);
      setShowSuggestionsList(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setShowSuggestionsList(false);
  };

  const handleClear = () => {
    onChange('');
    onClear();
    setShowSuggestionsList(false);
  };

  return React.createElement('div', { className: `relative ${className}` },
    // Search Input
    React.createElement('div', { className: 'relative' },
      React.createElement('div', { className: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none' },
        React.createElement('svg', {
          className: `h-5 w-5 text-gray-400 ${isSearching ? 'animate-spin' : ''}`,
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          isSearching 
            ? React.createElement('circle', {
                className: 'opacity-25',
                cx: '12',
                cy: '12',
                r: '10',
                strokeWidth: '4'
              })
            : React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              })
        )
      ),
      React.createElement('input', {
        type: 'text',
        value,
        onChange: handleInputChange,
        onKeyPress: handleKeyPress,
        onFocus: () => setIsFocused(true),
        onBlur: () => setTimeout(() => setIsFocused(false), 200),
        placeholder,
        className: `block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
          isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`
      }),
      value && React.createElement('button', {
        onClick: handleClear,
        className: 'absolute inset-y-0 right-0 pr-3 flex items-center'
      },
        React.createElement('svg', {
          className: 'h-5 w-5 text-gray-400 hover:text-gray-600',
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
        )
      )
    ),

    // Search Suggestions
    showSuggestionsList && suggestions.length > 0 && React.createElement('div', {
      className: 'absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden'
    },
      React.createElement('div', { className: 'py-1' },
        suggestions.map((suggestion) => 
          React.createElement('button', {
            key: suggestion.id,
            onClick: () => handleSuggestionClick(suggestion),
            className: 'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3'
          },
            suggestion.icon && React.createElement('div', { className: 'flex-shrink-0' }, suggestion.icon),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('p', {
                className: 'text-sm font-medium text-gray-900 truncate'
              }, suggestion.text),
              React.createElement('p', {
                className: 'text-xs text-gray-500 capitalize'
              }, suggestion.type)
            ),
            suggestion.count && React.createElement('span', {
              className: 'flex-shrink-0 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full'
            }, suggestion.count)
          )
        )
      )
    )
  );
}

/**
 * Search Suggestions Component
 */
export function SearchSuggestions({
  suggestions,
  onSuggestionSelect,
  onClearSuggestions,
  isVisible,
  className = ''
}: SearchSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return React.createElement('div', {
    className: `bg-white border border-gray-300 rounded-lg shadow-lg ${className}`
  },
    React.createElement('div', {
      className: 'flex items-center justify-between p-3 border-b border-gray-200'
    },
      React.createElement('h4', {
        className: 'text-sm font-medium text-gray-700'
      }, 'Suggestions'),
      React.createElement('button', {
        onClick: onClearSuggestions,
        className: 'text-xs text-gray-500 hover:text-gray-700'
      }, 'Clear')
    ),
    React.createElement('div', { className: 'max-h-60 overflow-y-auto' },
      suggestions.map((suggestion) => 
        React.createElement('button', {
          key: suggestion.id,
          onClick: () => onSuggestionSelect(suggestion),
          className: 'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3'
        },
          suggestion.icon && React.createElement('div', { className: 'flex-shrink-0' }, suggestion.icon),
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', {
              className: 'text-sm font-medium text-gray-900'
            }, suggestion.text),
            React.createElement('p', {
              className: 'text-xs text-gray-500 capitalize'
            }, suggestion.type)
          ),
          suggestion.count && React.createElement('span', {
            className: 'flex-shrink-0 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full'
          }, suggestion.count)
        )
      )
    )
  );
}

/**
 * Search History Component
 */
export function SearchHistory({
  history,
  onHistorySelect,
  onClearHistory,
  isVisible,
  className = ''
}: SearchHistoryProps) {
  if (!isVisible || history.length === 0) {
    return null;
  }

  return React.createElement('div', {
    className: `bg-white border border-gray-300 rounded-lg shadow-lg ${className}`
  },
    React.createElement('div', {
      className: 'flex items-center justify-between p-3 border-b border-gray-200'
    },
      React.createElement('h4', {
        className: 'text-sm font-medium text-gray-700'
      }, 'Recent Searches'),
      React.createElement('button', {
        onClick: onClearHistory,
        className: 'text-xs text-red-600 hover:text-red-800'
      }, 'Clear All')
    ),
    React.createElement('div', { className: 'max-h-60 overflow-y-auto' },
      history.map((item) => 
        React.createElement('button', {
          key: item.id,
          onClick: () => onHistorySelect(item),
          className: 'w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between'
        },
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('p', {
              className: 'text-sm font-medium text-gray-900 truncate'
            }, item.query),
            React.createElement('p', {
              className: 'text-xs text-gray-500'
            }, `${item.resultCount} results • ${new Date(item.timestamp).toLocaleDateString()}`)
          ),
          React.createElement('svg', {
            className: 'w-4 h-4 text-gray-400',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M9 5l7 7-7 7'
            })
          )
        )
      )
    )
  );
}

/**
 * Search Filters Component
 */
export function SearchFilters({
  filters,
  onFiltersChange,
  isVisible,
  onToggle,
  className = ''
}: SearchFiltersProps) {
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  if (!isVisible) {
    return null;
  }

  return React.createElement('div', {
    className: `bg-white border border-gray-300 rounded-lg shadow-lg p-4 ${className}`
  },
    React.createElement('div', {
      className: 'flex items-center justify-between mb-4'
    },
      React.createElement('h4', {
        className: 'text-sm font-medium text-gray-700'
      }, 'Search Filters'),
      React.createElement('button', {
        onClick: onToggle,
        className: 'text-gray-400 hover:text-gray-600'
      },
        React.createElement('svg', {
          className: 'w-5 h-5',
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
        )
      )
    ),

    React.createElement('div', { className: 'space-y-4' },
      // Search Scope
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('label', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Search In'),
        React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
          ['includeTitle', 'includeDescription', 'includeCategory', 'includeLocation', 'includeTags', 'includeCandidates'].map((key) => 
            React.createElement('label', {
              key,
              className: 'flex items-center space-x-2'
            },
              React.createElement('input', {
                type: 'checkbox',
                checked: filters[key as keyof SearchFilters] as boolean,
                onChange: (e: any) => handleFilterChange(key as keyof SearchFilters, e.target.checked),
                className: 'rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              }),
              React.createElement('span', {
                className: 'text-sm text-gray-700'
              }, key.replace('include', '').replace(/([A-Z])/g, ' $1').trim())
            )
          )
        )
      ),

      // Date Range
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('label', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Date Range'),
        React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
          React.createElement('input', {
            type: 'date',
            value: filters.dateRange.start,
            onChange: (e: any) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              start: e.target.value
            }),
            className: 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          }),
          React.createElement('input', {
            type: 'date',
            value: filters.dateRange.end,
            onChange: (e: any) => handleFilterChange('dateRange', {
              ...filters.dateRange,
              end: e.target.value
            }),
            className: 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          })
        )
      ),

      // Status Filter
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('label', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Status'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          ['active', 'upcoming', 'completed', 'cancelled'].map((status) => 
            React.createElement('button', {
              key: status,
              onClick: () => {
                const newStatus = filters.status.includes(status)
                  ? filters.status.filter(s => s !== status)
                  : [...filters.status, status];
                handleFilterChange('status', newStatus);
              },
              className: `px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.status.includes(status)
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`
            }, status.charAt(0).toUpperCase() + status.slice(1))
          )
        )
      ),

      // Priority Filter
      React.createElement('div', { className: 'space-y-2' },
        React.createElement('label', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Priority'),
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          ['high', 'medium', 'low'].map((priority) => 
            React.createElement('button', {
              key: priority,
              onClick: () => {
                const newPriority = filters.priority.includes(priority)
                  ? filters.priority.filter(p => p !== priority)
                  : [...filters.priority, priority];
                handleFilterChange('priority', newPriority);
              },
              className: `px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.priority.includes(priority)
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`
            }, priority.charAt(0).toUpperCase() + priority.slice(1))
          )
        )
      )
    )
  );
}

/**
 * Search Results Component
 */
export function SearchResults({
  results,
  totalResults,
  isSearching,
  searchQuery,
  onLoadMore,
  hasMore = false,
  className = ''
}: SearchResultsProps) {
  if (isSearching) {
    return React.createElement('div', {
      className: `flex items-center justify-center py-8 ${className}`
    },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', {
          className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'
        }),
        React.createElement('p', {
          className: 'text-gray-600'
        }, 'Searching...')
      )
    );
  }

  if (results.length === 0 && searchQuery) {
    return React.createElement('div', {
      className: `text-center py-8 ${className}`
    },
      React.createElement('div', { className: 'text-gray-400 mb-4' },
        React.createElement('svg', {
          className: 'w-12 h-12 mx-auto',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          })
        )
      ),
      React.createElement('h3', {
        className: 'text-lg font-medium text-gray-900 mb-2'
      }, 'No results found'),
      React.createElement('p', {
        className: 'text-gray-600'
      }, `No elections found for "${searchQuery}"`)
    );
  }

  return React.createElement('div', { className: `space-y-4 ${className}` },
    // Results Header
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      React.createElement('h3', {
        className: 'text-lg font-medium text-gray-900'
      }, `Search Results (${totalResults})`),
      searchQuery && React.createElement('p', {
        className: 'text-sm text-gray-600'
      }, `for "${searchQuery}"`)
    ),

    // Results List
    React.createElement('div', { className: 'space-y-2' },
      results.map((result, index) => 
        React.createElement('div', {
          key: result.id || index,
          className: 'p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
        },
          React.createElement('h4', {
            className: 'text-lg font-medium text-gray-900 mb-2'
          }, result.title),
          React.createElement('p', {
            className: 'text-gray-600 mb-2'
          }, result.description),
          React.createElement('div', {
            className: 'flex items-center space-x-4 text-sm text-gray-500'
          },
            React.createElement('span', {}, result.category),
            React.createElement('span', {}, result.location),
            React.createElement('span', {
              className: `px-2 py-1 rounded-full text-xs ${
                result.status === 'active' ? 'bg-green-100 text-green-800' :
                result.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                result.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`
            }, result.status)
          )
        )
      )
    ),

    // Load More Button
    hasMore && onLoadMore && React.createElement('div', {
      className: 'text-center pt-4'
    },
      React.createElement('button', {
        onClick: onLoadMore,
        className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      }, 'Load More Results')
    )
  );
}

/**
 * Main Elections Search Component
 */
export function ElectionsSearch({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  suggestions,
  onSuggestionSelect,
  searchHistory,
  onHistorySelect,
  onClearHistory,
  isSearching,
  searchResults,
  totalResults,
  searchFilters,
  onSearchFiltersChange,
  onClearSearch,
  placeholder = 'Search elections...',
  className = ''
}: ElectionsSearchProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  const handleSearch = (query: string) => {
    onSearch(query, searchFilters);
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
  };

  const handleHistorySelect = (history: SearchHistory) => {
    onHistorySelect(history);
    setShowHistory(false);
  };

  return React.createElement('div', { className: `space-y-4 ${className}` },
    // Search Input
    React.createElement(SearchInput, {
      value: searchQuery,
      onChange: onSearchQueryChange,
      onSearch: handleSearch,
      onClear: onClearSearch,
      placeholder,
      isSearching,
      showSuggestions: showSuggestions,
      suggestions,
      onSuggestionSelect: handleSuggestionSelect
    }),

    // Search Actions
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      React.createElement('div', { className: 'flex items-center space-x-2' },
        React.createElement('button', {
          onClick: () => setShowHistory(!showHistory),
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
          React.createElement('span', {}, 'History')
        ),
        React.createElement('button', {
          onClick: () => setShowFilters(!showFilters),
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
      searchQuery && React.createElement('button', {
        onClick: onClearSearch,
        className: 'px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors'
      }, 'Clear Search')
    ),

    // Search History
    React.createElement(SearchHistory, {
      history: searchHistory,
      onHistorySelect: handleHistorySelect,
      onClearHistory,
      isVisible: showHistory
    }),

    // Search Filters
    React.createElement(SearchFilters, {
      filters: searchFilters,
      onFiltersChange: onSearchFiltersChange,
      isVisible: showFilters,
      onToggle: () => setShowFilters(!showFilters)
    }),

    // Search Results
    searchQuery && React.createElement(SearchResults, {
      results: searchResults,
      totalResults,
      isSearching,
      searchQuery
    })
  );
}

export default ElectionsSearch;

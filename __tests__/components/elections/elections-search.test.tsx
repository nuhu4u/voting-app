/**
 * Elections Search Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  SearchInput, 
  SearchSuggestions, 
  SearchHistory, 
  SearchFilters, 
  SearchResults, 
  ElectionsSearch 
} from '@/components/elections/elections-search';

// Mock search data
const mockSuggestions = [
  {
    id: '1',
    text: 'Presidential Election 2023',
    type: 'election' as const,
    electionId: '1',
    count: 1
  },
  {
    id: '2',
    text: 'Presidential',
    type: 'category' as const,
    count: 2
  },
  {
    id: '3',
    text: 'Nigeria',
    type: 'location' as const,
    count: 5
  }
];

const mockSearchHistory = [
  {
    id: '1',
    query: 'presidential election',
    timestamp: '2023-01-01T00:00:00Z',
    resultCount: 3
  },
  {
    id: '2',
    query: 'senate',
    timestamp: '2023-01-02T00:00:00Z',
    resultCount: 5
  }
];

const mockSearchFilters = {
  includeTitle: true,
  includeDescription: true,
  includeCategory: true,
  includeLocation: true,
  includeTags: true,
  includeCandidates: false,
  dateRange: {
    start: '',
    end: ''
  },
  status: [],
  priority: []
};

const mockSearchResults = [
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
    relevanceScore: 10,
    matchedFields: ['title'],
    highlights: {
      title: 'Presidential Election 2023'
    }
  }
];

describe('SearchInput', () => {
  const mockProps = {
    value: 'presidential',
    onChange: jest.fn(),
    onSearch: jest.fn(),
    onClear: jest.fn(),
    placeholder: 'Search elections...'
  };

  it('should render search input with value', () => {
    const { getByDisplayValue } = render(
      React.createElement(SearchInput, mockProps)
    );

    expect(getByDisplayValue('presidential')).toBeTruthy();
  });

  it('should call onChange when input changes', () => {
    const { container } = render(
      React.createElement(SearchInput, mockProps)
    );

    const input = container.querySelector('input');
    fireEvent.change(input!, { target: { value: 'senate' } });

    expect(mockProps.onChange).toHaveBeenCalledWith('senate');
  });

  it('should call onSearch when Enter key is pressed', () => {
    const { container } = render(
      React.createElement(SearchInput, mockProps)
    );

    const input = container.querySelector('input');
    fireEvent.keyPress(input!, { key: 'Enter' });

    expect(mockProps.onSearch).toHaveBeenCalledWith('presidential');
  });

  it('should show clear button when value exists', () => {
    const { container } = render(
      React.createElement(SearchInput, mockProps)
    );

    const clearButton = container.querySelector('button');
    expect(clearButton).toBeTruthy();
  });

  it('should call onClear when clear button is clicked', () => {
    const { container } = render(
      React.createElement(SearchInput, mockProps)
    );

    const clearButton = container.querySelector('button');
    fireEvent.press(clearButton!);

    expect(mockProps.onClear).toHaveBeenCalled();
  });

  it('should show suggestions when provided', () => {
    const { getByText } = render(
      React.createElement(SearchInput, {
        ...mockProps,
        showSuggestions: true,
        suggestions: mockSuggestions
      })
    );

    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Nigeria')).toBeTruthy();
  });

  it('should call onSuggestionSelect when suggestion is clicked', () => {
    const onSuggestionSelect = jest.fn();
    const { getByText } = render(
      React.createElement(SearchInput, {
        ...mockProps,
        showSuggestions: true,
        suggestions: mockSuggestions,
        onSuggestionSelect
      })
    );

    const suggestion = getByText('Presidential Election 2023');
    fireEvent.press(suggestion);

    expect(onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('should show loading spinner when searching', () => {
    const { container } = render(
      React.createElement(SearchInput, {
        ...mockProps,
        isSearching: true
      })
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });
});

describe('SearchSuggestions', () => {
  const mockProps = {
    suggestions: mockSuggestions,
    onSuggestionSelect: jest.fn(),
    onClearSuggestions: jest.fn(),
    isVisible: true
  };

  it('should render suggestions when visible', () => {
    const { getByText } = render(
      React.createElement(SearchSuggestions, mockProps)
    );

    expect(getByText('Suggestions')).toBeTruthy();
    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Presidential')).toBeTruthy();
    expect(getByText('Nigeria')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      React.createElement(SearchSuggestions, {
        ...mockProps,
        isVisible: false
      })
    );

    expect(queryByText('Suggestions')).toBeFalsy();
  });

  it('should not render when no suggestions', () => {
    const { queryByText } = render(
      React.createElement(SearchSuggestions, {
        ...mockProps,
        suggestions: []
      })
    );

    expect(queryByText('Suggestions')).toBeFalsy();
  });

  it('should call onSuggestionSelect when suggestion is clicked', () => {
    const { getByText } = render(
      React.createElement(SearchSuggestions, mockProps)
    );

    const suggestion = getByText('Presidential Election 2023');
    fireEvent.press(suggestion);

    expect(mockProps.onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('should call onClearSuggestions when clear button is clicked', () => {
    const { getByText } = render(
      React.createElement(SearchSuggestions, mockProps)
    );

    const clearButton = getByText('Clear');
    fireEvent.press(clearButton);

    expect(mockProps.onClearSuggestions).toHaveBeenCalled();
  });

  it('should display suggestion counts', () => {
    const { getByText } = render(
      React.createElement(SearchSuggestions, mockProps)
    );

    expect(getByText('2')).toBeTruthy(); // Presidential count
    expect(getByText('5')).toBeTruthy(); // Nigeria count
  });
});

describe('SearchHistory', () => {
  const mockProps = {
    history: mockSearchHistory,
    onHistorySelect: jest.fn(),
    onClearHistory: jest.fn(),
    isVisible: true
  };

  it('should render history when visible', () => {
    const { getByText } = render(
      React.createElement(SearchHistory, mockProps)
    );

    expect(getByText('Recent Searches')).toBeTruthy();
    expect(getByText('presidential election')).toBeTruthy();
    expect(getByText('senate')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      React.createElement(SearchHistory, {
        ...mockProps,
        isVisible: false
      })
    );

    expect(queryByText('Recent Searches')).toBeFalsy();
  });

  it('should not render when no history', () => {
    const { queryByText } = render(
      React.createElement(SearchHistory, {
        ...mockProps,
        history: []
      })
    );

    expect(queryByText('Recent Searches')).toBeFalsy();
  });

  it('should call onHistorySelect when history item is clicked', () => {
    const { getByText } = render(
      React.createElement(SearchHistory, mockProps)
    );

    const historyItem = getByText('presidential election');
    fireEvent.press(historyItem);

    expect(mockProps.onHistorySelect).toHaveBeenCalledWith(mockSearchHistory[0]);
  });

  it('should call onClearHistory when clear button is clicked', () => {
    const { getByText } = render(
      React.createElement(SearchHistory, mockProps)
    );

    const clearButton = getByText('Clear All');
    fireEvent.press(clearButton);

    expect(mockProps.onClearHistory).toHaveBeenCalled();
  });

  it('should display result counts and dates', () => {
    const { getByText } = render(
      React.createElement(SearchHistory, mockProps)
    );

    expect(getByText('3 results')).toBeTruthy();
    expect(getByText('5 results')).toBeTruthy();
  });
});

describe('SearchFilters', () => {
  const mockProps = {
    filters: mockSearchFilters,
    onFiltersChange: jest.fn(),
    isVisible: true,
    onToggle: jest.fn()
  };

  it('should render filters when visible', () => {
    const { getByText } = render(
      React.createElement(SearchFilters, mockProps)
    );

    expect(getByText('Search Filters')).toBeTruthy();
    expect(getByText('Search In')).toBeTruthy();
    expect(getByText('Date Range')).toBeTruthy();
    expect(getByText('Status')).toBeTruthy();
    expect(getByText('Priority')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      React.createElement(SearchFilters, {
        ...mockProps,
        isVisible: false
      })
    );

    expect(queryByText('Search Filters')).toBeFalsy();
  });

  it('should call onToggle when close button is clicked', () => {
    const { container } = render(
      React.createElement(SearchFilters, mockProps)
    );

    const closeButton = container.querySelector('button');
    fireEvent.press(closeButton!);

    expect(mockProps.onToggle).toHaveBeenCalled();
  });

  it('should call onFiltersChange when checkboxes are changed', () => {
    const { container } = render(
      React.createElement(SearchFilters, mockProps)
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    fireEvent.change(checkboxes[0], { target: { checked: false } });

    expect(mockProps.onFiltersChange).toHaveBeenCalled();
  });

  it('should call onFiltersChange when date inputs are changed', () => {
    const { container } = render(
      React.createElement(SearchFilters, mockProps)
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2023-01-01' } });

    expect(mockProps.onFiltersChange).toHaveBeenCalled();
  });

  it('should call onFiltersChange when status buttons are clicked', () => {
    const { getByText } = render(
      React.createElement(SearchFilters, mockProps)
    );

    const activeButton = getByText('Active');
    fireEvent.press(activeButton);

    expect(mockProps.onFiltersChange).toHaveBeenCalled();
  });
});

describe('SearchResults', () => {
  const mockProps = {
    results: mockSearchResults,
    totalResults: 1,
    isSearching: false,
    searchQuery: 'presidential'
  };

  it('should render search results', () => {
    const { getByText } = render(
      React.createElement(SearchResults, mockProps)
    );

    expect(getByText('Search Results (1)')).toBeTruthy();
    expect(getByText('for "presidential"')).toBeTruthy();
    expect(getByText('Presidential Election 2023')).toBeTruthy();
    expect(getByText('Election for the President of Nigeria')).toBeTruthy();
  });

  it('should show loading state when searching', () => {
    const { getByText } = render(
      React.createElement(SearchResults, {
        ...mockProps,
        isSearching: true
      })
    );

    expect(getByText('Searching...')).toBeTruthy();
  });

  it('should show no results message when no results', () => {
    const { getByText } = render(
      React.createElement(SearchResults, {
        ...mockProps,
        results: [],
        totalResults: 0
      })
    );

    expect(getByText('No results found')).toBeTruthy();
    expect(getByText('No elections found for "presidential"')).toBeTruthy();
  });

  it('should show load more button when hasMore is true', () => {
    const onLoadMore = jest.fn();
    const { getByText } = render(
      React.createElement(SearchResults, {
        ...mockProps,
        onLoadMore,
        hasMore: true
      })
    );

    const loadMoreButton = getByText('Load More Results');
    expect(loadMoreButton).toBeTruthy();

    fireEvent.press(loadMoreButton);
    expect(onLoadMore).toHaveBeenCalled();
  });
});

describe('ElectionsSearch', () => {
  const mockProps = {
    searchQuery: 'presidential',
    onSearchQueryChange: jest.fn(),
    onSearch: jest.fn(),
    suggestions: mockSuggestions,
    onSuggestionSelect: jest.fn(),
    searchHistory: mockSearchHistory,
    onHistorySelect: jest.fn(),
    onClearHistory: jest.fn(),
    isSearching: false,
    searchResults: mockSearchResults,
    totalResults: 1,
    searchFilters: mockSearchFilters,
    onSearchFiltersChange: jest.fn(),
    onClearSearch: jest.fn()
  };

  it('should render search component', () => {
    const { getByDisplayValue, getByText } = render(
      React.createElement(ElectionsSearch, mockProps)
    );

    expect(getByDisplayValue('presidential')).toBeTruthy();
    expect(getByText('History')).toBeTruthy();
    expect(getByText('Filters')).toBeTruthy();
  });

  it('should call onSearch when search is performed', () => {
    const { container } = render(
      React.createElement(ElectionsSearch, mockProps)
    );

    const input = container.querySelector('input');
    fireEvent.keyPress(input!, { key: 'Enter' });

    expect(mockProps.onSearch).toHaveBeenCalledWith('presidential', mockSearchFilters);
  });

  it('should call onSuggestionSelect when suggestion is selected', () => {
    const { getByText } = render(
      React.createElement(ElectionsSearch, mockProps)
    );

    const suggestion = getByText('Presidential Election 2023');
    fireEvent.press(suggestion);

    expect(mockProps.onSuggestionSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('should call onHistorySelect when history item is selected', () => {
    const { getByText } = render(
      React.createElement(ElectionsSearch, mockProps)
    );

    const historyButton = getByText('History');
    fireEvent.press(historyButton);

    const historyItem = getByText('presidential election');
    fireEvent.press(historyItem);

    expect(mockProps.onHistorySelect).toHaveBeenCalledWith(mockSearchHistory[0]);
  });

  it('should call onClearSearch when clear button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionsSearch, mockProps)
    );

    const clearButton = getByText('Clear Search');
    fireEvent.press(clearButton);

    expect(mockProps.onClearSearch).toHaveBeenCalled();
  });

  it('should show search results when query exists', () => {
    const { getByText } = render(
      React.createElement(ElectionsSearch, mockProps)
    );

    expect(getByText('Search Results (1)')).toBeTruthy();
    expect(getByText('Presidential Election 2023')).toBeTruthy();
  });
});

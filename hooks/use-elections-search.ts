/**
 * Elections Search Logic Hook
 * Advanced search functionality for elections
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

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

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  tags: string[];
  candidates?: string[];
  relevanceScore: number;
  matchedFields: string[];
  highlights: {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    tags?: string[];
  };
}

export interface UseElectionsSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  totalResults: number;
  isSearching: boolean;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  suggestions: SearchSuggestion[];
  searchHistory: SearchHistory[];
  recentSearches: SearchHistory[];
  popularSearches: string[];
  searchStats: {
    totalSearches: number;
    averageResults: number;
    mostSearchedTerms: Array<{ term: string; count: number }>;
    searchTrends: Array<{ date: string; searches: number }>;
  };
  performSearch: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  getSuggestions: (query: string) => SearchSuggestion[];
  addToHistory: (query: string, resultCount: number) => void;
  clearHistory: () => void;
  clearSearch: () => void;
  saveSearch: (name: string) => void;
  loadSearch: (name: string) => void;
  getSavedSearches: () => string[];
  deleteSavedSearch: (name: string) => void;
  getSearchAnalytics: () => any;
}

const defaultSearchFilters: SearchFilters = {
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

/**
 * Main Elections Search Hook
 */
export function useElectionsSearch(elections: any[] = []): UseElectionsSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('elections-search-history');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elections-search-history', JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [searchHistory]);

  // Generate suggestions based on elections data
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Election title suggestions
    elections.forEach(election => {
      if (election.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          id: `election-${election.id}`,
          text: election.title,
          type: 'election',
          electionId: election.id,
          count: 1,
          icon: React.createElement('div', {
            className: 'w-2 h-2 bg-blue-500 rounded-full'
          })
        });
      }
    });

    // Category suggestions
    const categories = [...new Set(elections.map(e => e.category))];
    categories.forEach(category => {
      if (category.toLowerCase().includes(queryLower)) {
        const count = elections.filter(e => e.category === category).length;
        suggestions.push({
          id: `category-${category}`,
          text: category,
          type: 'category',
          count,
          icon: React.createElement('div', {
            className: 'w-2 h-2 bg-green-500 rounded-full'
          })
        });
      }
    });

    // Location suggestions
    const locations = [...new Set(elections.map(e => e.location))];
    locations.forEach(location => {
      if (location.toLowerCase().includes(queryLower)) {
        const count = elections.filter(e => e.location === location).length;
        suggestions.push({
          id: `location-${location}`,
          text: location,
          type: 'location',
          count,
          icon: React.createElement('div', {
            className: 'w-2 h-2 bg-purple-500 rounded-full'
          })
        });
      }
    });

    // Tag suggestions
    const allTags = elections.flatMap(e => e.tags || []);
    const uniqueTags = [...new Set(allTags)];
    uniqueTags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        const count = allTags.filter(t => t === tag).length;
        suggestions.push({
          id: `tag-${tag}`,
          text: tag,
          type: 'tag',
          count,
          icon: React.createElement('div', {
            className: 'w-2 h-2 bg-yellow-500 rounded-full'
          })
        });
      }
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );

    return uniqueSuggestions.slice(0, 10);
  }, [elections]);

  // Get suggestions for current query
  const getSuggestions = useCallback((query: string): SearchSuggestion[] => {
    return generateSuggestions(query);
  }, [generateSuggestions]);

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const newSuggestions = getSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, getSuggestions]);

  // Calculate relevance score for search results
  const calculateRelevanceScore = useCallback((election: any, query: string, filters: SearchFilters): number => {
    const queryLower = query.toLowerCase();
    let score = 0;
    const matchedFields: string[] = [];

    // Title match (highest weight)
    if (filters.includeTitle && election.title?.toLowerCase().includes(queryLower)) {
      score += 10;
      matchedFields.push('title');
    }

    // Exact title match (even higher weight)
    if (filters.includeTitle && election.title?.toLowerCase() === queryLower) {
      score += 20;
    }

    // Description match
    if (filters.includeDescription && election.description?.toLowerCase().includes(queryLower)) {
      score += 5;
      matchedFields.push('description');
    }

    // Category match
    if (filters.includeCategory && election.category?.toLowerCase().includes(queryLower)) {
      score += 8;
      matchedFields.push('category');
    }

    // Location match
    if (filters.includeLocation && election.location?.toLowerCase().includes(queryLower)) {
      score += 6;
      matchedFields.push('location');
    }

    // Tags match
    if (filters.includeTags && election.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) {
      score += 4;
      matchedFields.push('tags');
    }

    // Candidates match
    if (filters.includeCandidates && election.candidates?.some((candidate: string) => 
      candidate.toLowerCase().includes(queryLower)
    )) {
      score += 3;
      matchedFields.push('candidates');
    }

    // Status filter bonus
    if (filters.status.length > 0 && filters.status.includes(election.status)) {
      score += 2;
    }

    // Priority filter bonus
    if (filters.priority.length > 0 && filters.priority.includes(election.priority)) {
      score += 1;
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const electionStart = new Date(election.startDate);
      const electionEnd = new Date(election.endDate);
      
      if (filters.dateRange.start) {
        const filterStart = new Date(filters.dateRange.start);
        if (electionStart >= filterStart) score += 1;
      }
      
      if (filters.dateRange.end) {
        const filterEnd = new Date(filters.dateRange.end);
        if (electionEnd <= filterEnd) score += 1;
      }
    }

    return score;
  }, []);

  // Generate highlights for search results
  const generateHighlights = useCallback((election: any, query: string, filters: SearchFilters) => {
    const queryLower = query.toLowerCase();
    const highlights: any = {};

    if (filters.includeTitle && election.title?.toLowerCase().includes(queryLower)) {
      highlights.title = election.title.replace(
        new RegExp(`(${query})`, 'gi'),
        '<mark class="bg-yellow-200">$1</mark>'
      );
    }

    if (filters.includeDescription && election.description?.toLowerCase().includes(queryLower)) {
      highlights.description = election.description.replace(
        new RegExp(`(${query})`, 'gi'),
        '<mark class="bg-yellow-200">$1</mark>'
      );
    }

    if (filters.includeCategory && election.category?.toLowerCase().includes(queryLower)) {
      highlights.category = election.category.replace(
        new RegExp(`(${query})`, 'gi'),
        '<mark class="bg-yellow-200">$1</mark>'
      );
    }

    if (filters.includeLocation && election.location?.toLowerCase().includes(queryLower)) {
      highlights.location = election.location.replace(
        new RegExp(`(${query})`, 'gi'),
        '<mark class="bg-yellow-200">$1</mark>'
      );
    }

    if (filters.includeTags && election.tags) {
      highlights.tags = election.tags.map((tag: string) => 
        tag.toLowerCase().includes(queryLower)
          ? tag.replace(new RegExp(`(${query})`, 'gi'), '<mark class="bg-yellow-200">$1</mark>')
          : tag
      );
    }

    return highlights;
  }, []);

  // Perform search
  const performSearch = useCallback(async (query: string, filters: SearchFilters = searchFilters): Promise<SearchResult[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);

    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const queryLower = query.toLowerCase();
      const results: SearchResult[] = [];

      elections.forEach(election => {
        const relevanceScore = calculateRelevanceScore(election, query, filters);
        
        if (relevanceScore > 0) {
          const highlights = generateHighlights(election, query, filters);
          
          results.push({
            id: election.id,
            title: election.title,
            description: election.description,
            category: election.category,
            location: election.location,
            status: election.status,
            priority: election.priority,
            startDate: election.startDate,
            endDate: election.endDate,
            tags: election.tags || [],
            candidates: election.candidates || [],
            relevanceScore,
            matchedFields: [],
            highlights
          });
        }
      });

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [elections, searchFilters, calculateRelevanceScore, generateHighlights]);

  // Add search to history
  const addToHistory = useCallback((query: string, resultCount: number) => {
    if (!query.trim()) return;

    const newHistoryItem: SearchHistory = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date().toISOString(),
      resultCount
    };

    setSearchHistory(prev => {
      // Remove existing entry if it exists
      const filtered = prev.filter(item => item.query !== query.trim());
      // Add new entry at the beginning
      return [newHistoryItem, ...filtered].slice(0, 50); // Keep only last 50 searches
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Clear current search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
  }, []);

  // Save search
  const saveSearch = useCallback((name: string) => {
    try {
      const savedSearches = JSON.parse(localStorage.getItem('elections-saved-searches') || '{}');
      savedSearches[name] = {
        query: searchQuery,
        filters: searchFilters,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('elections-saved-searches', JSON.stringify(savedSearches));
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }, [searchQuery, searchFilters]);

  // Load search
  const loadSearch = useCallback((name: string) => {
    try {
      const savedSearches = JSON.parse(localStorage.getItem('elections-saved-searches') || '{}');
      const savedSearch = savedSearches[name];
      if (savedSearch) {
        setSearchQuery(savedSearch.query);
        setSearchFilters(savedSearch.filters);
        performSearch(savedSearch.query, savedSearch.filters);
      }
    } catch (error) {
      console.error('Failed to load search:', error);
    }
  }, [performSearch]);

  // Get saved searches
  const getSavedSearches = useCallback((): string[] => {
    try {
      const savedSearches = JSON.parse(localStorage.getItem('elections-saved-searches') || '{}');
      return Object.keys(savedSearches);
    } catch (error) {
      console.error('Failed to get saved searches:', error);
      return [];
    }
  }, []);

  // Delete saved search
  const deleteSavedSearch = useCallback((name: string) => {
    try {
      const savedSearches = JSON.parse(localStorage.getItem('elections-saved-searches') || '{}');
      delete savedSearches[name];
      localStorage.setItem('elections-saved-searches', JSON.stringify(savedSearches));
    } catch (error) {
      console.error('Failed to delete saved search:', error);
    }
  }, []);

  // Get recent searches (last 10)
  const recentSearches = useMemo(() => {
    return searchHistory.slice(0, 10);
  }, [searchHistory]);

  // Get popular searches
  const popularSearches = useMemo(() => {
    const searchCounts: Record<string, number> = {};
    searchHistory.forEach(item => {
      searchCounts[item.query] = (searchCounts[item.query] || 0) + 1;
    });

    return Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);
  }, [searchHistory]);

  // Get search statistics
  const searchStats = useMemo(() => {
    const totalSearches = searchHistory.length;
    const averageResults = totalSearches > 0 
      ? searchHistory.reduce((sum, item) => sum + item.resultCount, 0) / totalSearches 
      : 0;

    const searchCounts: Record<string, number> = {};
    searchHistory.forEach(item => {
      searchCounts[item.query] = (searchCounts[item.query] || 0) + 1;
    });

    const mostSearchedTerms = Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([term, count]) => ({ term, count }));

    // Group searches by date for trends
    const trendsMap: Record<string, number> = {};
    searchHistory.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      trendsMap[date] = (trendsMap[date] || 0) + 1;
    });

    const searchTrends = Object.entries(trendsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30) // Last 30 days
      .map(([date, searches]) => ({ date, searches }));

    return {
      totalSearches,
      averageResults: Math.round(averageResults),
      mostSearchedTerms,
      searchTrends
    };
  }, [searchHistory]);

  // Get search analytics
  const getSearchAnalytics = useCallback(() => {
    return {
      searchStats,
      recentSearches,
      popularSearches,
      currentQuery: searchQuery,
      currentResults: searchResults.length,
      currentFilters: searchFilters
    };
  }, [searchStats, recentSearches, popularSearches, searchQuery, searchResults.length, searchFilters]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalResults: searchResults.length,
    isSearching,
    searchFilters,
    setSearchFilters,
    suggestions,
    searchHistory,
    recentSearches,
    popularSearches,
    searchStats,
    performSearch,
    getSuggestions,
    addToHistory,
    clearHistory,
    clearSearch,
    saveSearch,
    loadSearch,
    getSavedSearches,
    deleteSavedSearch,
    getSearchAnalytics
  };
}

export default useElectionsSearch;

/**
 * Elections List Hooks
 * Custom hooks for elections list management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  totalCandidates: number;
  totalVoters: number;
  hasVoted: boolean;
  imageUrl?: string;
  category: string;
  location: string;
  requirements: string[];
  votingMethod: 'online' | 'hybrid' | 'offline';
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  blockchainHash?: string;
  resultsAvailable: boolean;
  participationRate: number;
  isBookmarked: boolean;
  isStarred: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ElectionsListFilters {
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

export interface ElectionsListSort {
  field: 'date' | 'title' | 'participation' | 'priority' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface UseElectionsListReturn {
  elections: Election[];
  filteredElections: Election[];
  isLoading: boolean;
  error: string | null;
  filters: ElectionsListFilters;
  sort: ElectionsListSort;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  setFilters: (filters: ElectionsListFilters) => void;
  setSort: (sort: ElectionsListSort) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  clearFilters: () => void;
  refreshElections: () => Promise<void>;
  bookmarkElection: (electionId: string) => Promise<void>;
  starElection: (electionId: string) => Promise<void>;
  shareElection: (election: Election) => Promise<void>;
  getElectionById: (id: string) => Election | null;
  getElectionsByStatus: (status: string) => Election[];
  getElectionsByCategory: (category: string) => Election[];
  getBookmarkedElections: () => Election[];
  getStarredElections: () => Election[];
}

/**
 * Main Elections List Hook
 */
export function useElectionsList(userId?: string): UseElectionsListReturn {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ElectionsListFilters>({
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
  });
  const [sort, setSort] = useState<ElectionsListSort>({
    field: 'date',
    direction: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock elections data
  const mockElections: Election[] = [
    {
      id: '1',
      title: 'Presidential Election 2023',
      description: 'Election for the President of Nigeria',
      startDate: '2023-02-25T08:00:00Z',
      endDate: '2023-02-25T18:00:00Z',
      status: 'completed',
      totalCandidates: 4,
      totalVoters: 15000000,
      hasVoted: true,
      category: 'Presidential',
      location: 'Nigeria',
      requirements: ['Valid Voter ID', 'NIN'],
      votingMethod: 'hybrid',
      securityLevel: 'maximum',
      blockchainHash: '0x1234567890abcdef',
      resultsAvailable: true,
      participationRate: 85,
      isBookmarked: true,
      isStarred: false,
      priority: 'high',
      tags: ['presidential', 'national', '2023'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-02-25T18:00:00Z'
    },
    {
      id: '2',
      title: 'Senate Election 2023',
      description: 'Election for Senate Representatives',
      startDate: '2023-03-11T08:00:00Z',
      endDate: '2023-03-11T18:00:00Z',
      status: 'upcoming',
      totalCandidates: 8,
      totalVoters: 5000000,
      hasVoted: false,
      category: 'Senate',
      location: 'Lagos State',
      requirements: ['Valid Voter ID', 'NIN'],
      votingMethod: 'online',
      securityLevel: 'enhanced',
      resultsAvailable: false,
      participationRate: 0,
      isBookmarked: false,
      isStarred: true,
      priority: 'medium',
      tags: ['senate', 'state', '2023'],
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    },
    {
      id: '3',
      title: 'House of Representatives 2023',
      description: 'Election for House of Representatives',
      startDate: '2023-01-15T08:00:00Z',
      endDate: '2023-01-15T18:00:00Z',
      status: 'completed',
      totalCandidates: 12,
      totalVoters: 8000000,
      hasVoted: true,
      category: 'House of Reps',
      location: 'Lagos State',
      requirements: ['Valid Voter ID', 'NIN'],
      votingMethod: 'online',
      securityLevel: 'enhanced',
      blockchainHash: '0xabcdef1234567890',
      resultsAvailable: true,
      participationRate: 78,
      isBookmarked: false,
      isStarred: false,
      priority: 'medium',
      tags: ['house', 'state', '2023'],
      createdAt: '2022-12-01T00:00:00Z',
      updatedAt: '2023-01-15T18:00:00Z'
    },
    {
      id: '4',
      title: 'Governor Election 2023',
      description: 'Election for State Governor',
      startDate: '2023-04-15T08:00:00Z',
      endDate: '2023-04-15T18:00:00Z',
      status: 'active',
      totalCandidates: 6,
      totalVoters: 3000000,
      hasVoted: false,
      category: 'Governor',
      location: 'Lagos State',
      requirements: ['Valid Voter ID', 'NIN', 'State Residency'],
      votingMethod: 'hybrid',
      securityLevel: 'maximum',
      resultsAvailable: false,
      participationRate: 45,
      isBookmarked: true,
      isStarred: true,
      priority: 'high',
      tags: ['governor', 'state', '2023'],
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-04-15T08:00:00Z'
    },
    {
      id: '5',
      title: 'State Assembly Election 2023',
      description: 'Election for State Assembly Members',
      startDate: '2023-05-20T08:00:00Z',
      endDate: '2023-05-20T18:00:00Z',
      status: 'upcoming',
      totalCandidates: 15,
      totalVoters: 2000000,
      hasVoted: false,
      category: 'State Assembly',
      location: 'Lagos State',
      requirements: ['Valid Voter ID', 'NIN'],
      votingMethod: 'offline',
      securityLevel: 'standard',
      resultsAvailable: false,
      participationRate: 0,
      isBookmarked: false,
      isStarred: false,
      priority: 'low',
      tags: ['assembly', 'state', '2023'],
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2023-03-01T00:00:00Z'
    }
  ];

  // Load elections
  const loadElections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setElections(mockElections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load elections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter elections
  const filteredElections = useMemo(() => {
    let filtered = [...elections];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(election =>
        election.title.toLowerCase().includes(query) ||
        election.description.toLowerCase().includes(query) ||
        election.category.toLowerCase().includes(query) ||
        election.location.toLowerCase().includes(query) ||
        election.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(election => filters.status.includes(election.status));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(election => filters.category.includes(election.category));
    }

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(election => filters.location.includes(election.location));
    }

    // Voting method filter
    if (filters.votingMethod.length > 0) {
      filtered = filtered.filter(election => filters.votingMethod.includes(election.votingMethod));
    }

    // Security level filter
    if (filters.securityLevel.length > 0) {
      filtered = filtered.filter(election => filters.securityLevel.includes(election.securityLevel));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(election => filters.priority.includes(election.priority));
    }

    // Has voted filter
    if (filters.hasVoted !== null) {
      filtered = filtered.filter(election => election.hasVoted === filters.hasVoted);
    }

    // Bookmarked filter
    if (filters.isBookmarked !== null) {
      filtered = filtered.filter(election => election.isBookmarked === filters.isBookmarked);
    }

    // Starred filter
    if (filters.isStarred !== null) {
      filtered = filtered.filter(election => election.isStarred === filters.isStarred);
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(election => new Date(election.startDate) >= new Date(filters.dateRange.start));
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(election => new Date(election.endDate) <= new Date(filters.dateRange.end));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(election => 
        filters.tags.some(tag => election.tags.includes(tag))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case 'date':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'participation':
          aValue = a.participationRate;
          bValue = b.participationRate;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [elections, filters, searchQuery, sort]);

  // Bookmark election
  const bookmarkElection = useCallback(async (electionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setElections(prev => prev.map(election => 
        election.id === electionId 
          ? { ...election, isBookmarked: !election.isBookmarked }
          : election
      ));
    } catch (err) {
      throw new Error('Failed to bookmark election');
    }
  }, []);

  // Star election
  const starElection = useCallback(async (electionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setElections(prev => prev.map(election => 
        election.id === electionId 
          ? { ...election, isStarred: !election.isStarred }
          : election
      ));
    } catch (err) {
      throw new Error('Failed to star election');
    }
  }, []);

  // Share election
  const shareElection = useCallback(async (election: Election) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, this would use the native sharing API
      if (navigator.share) {
        await navigator.share({
          title: election.title,
          text: election.description,
          url: `/elections/${election.id}`
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `${election.title}\n${election.description}\n/elections/${election.id}`
        );
      }
    } catch (err) {
      throw new Error('Failed to share election');
    }
  }, []);

  // Get election by ID
  const getElectionById = useCallback((id: string) => {
    return elections.find(election => election.id === id) || null;
  }, [elections]);

  // Get elections by status
  const getElectionsByStatus = useCallback((status: string) => {
    return elections.filter(election => election.status === status);
  }, [elections]);

  // Get elections by category
  const getElectionsByCategory = useCallback((category: string) => {
    return elections.filter(election => election.category === category);
  }, [elections]);

  // Get bookmarked elections
  const getBookmarkedElections = useCallback(() => {
    return elections.filter(election => election.isBookmarked);
  }, [elections]);

  // Get starred elections
  const getStarredElections = useCallback(() => {
    return elections.filter(election => election.isStarred);
  }, [elections]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
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
    });
  }, []);

  // Refresh elections
  const refreshElections = useCallback(async () => {
    await loadElections();
  }, [loadElections]);

  // Load elections on mount
  useEffect(() => {
    loadElections();
  }, [loadElections]);

  return {
    elections,
    filteredElections,
    isLoading,
    error,
    filters,
    sort,
    searchQuery,
    viewMode,
    setFilters,
    setSort,
    setSearchQuery,
    setViewMode,
    clearFilters,
    refreshElections,
    bookmarkElection,
    starElection,
    shareElection,
    getElectionById,
    getElectionsByStatus,
    getElectionsByCategory,
    getBookmarkedElections,
    getStarredElections
  };
}

/**
 * Elections Search Hook
 */
export function useElectionsSearch(elections: Election[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Election[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchElections = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = elections.filter(election =>
        election.title.toLowerCase().includes(query.toLowerCase()) ||
        election.description.toLowerCase().includes(query.toLowerCase()) ||
        election.category.toLowerCase().includes(query.toLowerCase()) ||
        election.location.toLowerCase().includes(query.toLowerCase()) ||
        election.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [elections]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchElections(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchElections]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching
  };
}

/**
 * Elections Favorites Hook
 */
export function useElectionsFavorites(userId?: string) {
  const [bookmarkedElections, setBookmarkedElections] = useState<string[]>([]);
  const [starredElections, setStarredElections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage for demo
      const bookmarked = localStorage.getItem(`elections-bookmarked-${userId}`);
      const starred = localStorage.getItem(`elections-starred-${userId}`);
      
      setBookmarkedElections(bookmarked ? JSON.parse(bookmarked) : []);
      setStarredElections(starred ? JSON.parse(starred) : []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const toggleBookmark = useCallback(async (electionId: string) => {
    try {
      const newBookmarked = bookmarkedElections.includes(electionId)
        ? bookmarkedElections.filter(id => id !== electionId)
        : [...bookmarkedElections, electionId];
      
      setBookmarkedElections(newBookmarked);
      localStorage.setItem(`elections-bookmarked-${userId}`, JSON.stringify(newBookmarked));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  }, [bookmarkedElections, userId]);

  const toggleStar = useCallback(async (electionId: string) => {
    try {
      const newStarred = starredElections.includes(electionId)
        ? starredElections.filter(id => id !== electionId)
        : [...starredElections, electionId];
      
      setStarredElections(newStarred);
      localStorage.setItem(`elections-starred-${userId}`, JSON.stringify(newStarred));
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  }, [starredElections, userId]);

  const isBookmarked = useCallback((electionId: string) => {
    return bookmarkedElections.includes(electionId);
  }, [bookmarkedElections]);

  const isStarred = useCallback((electionId: string) => {
    return starredElections.includes(electionId);
  }, [starredElections]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    bookmarkedElections,
    starredElections,
    isLoading,
    toggleBookmark,
    toggleStar,
    isBookmarked,
    isStarred
  };
}

export default useElectionsList;

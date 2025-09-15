/**
 * Elections Hooks
 * Custom hooks for election management
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
  createdAt: string;
  updatedAt: string;
}

export interface ElectionFilters {
  status: string[];
  category: string[];
  location: string[];
  votingMethod: string[];
  securityLevel: string[];
  hasVoted: boolean | null;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ElectionSort {
  field: 'title' | 'startDate' | 'endDate' | 'totalCandidates' | 'participationRate';
  direction: 'asc' | 'desc';
}

export interface ElectionStats {
  totalElections: number;
  activeElections: number;
  upcomingElections: number;
  completedElections: number;
  totalVotes: number;
  participationRate: number;
  averageCandidates: number;
}

export interface UseElectionsReturn {
  elections: Election[];
  filteredElections: Election[];
  stats: ElectionStats | null;
  isLoading: boolean;
  error: string | null;
  filters: ElectionFilters;
  sort: ElectionSort;
  searchQuery: string;
  setFilters: (filters: ElectionFilters) => void;
  setSort: (sort: ElectionSort) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  refreshElections: () => Promise<void>;
  voteInElection: (electionId: string) => Promise<void>;
  getElectionById: (id: string) => Election | null;
  getElectionsByStatus: (status: string) => Election[];
  getElectionsByCategory: (category: string) => Election[];
}

/**
 * Main Elections Hook
 */
export function useElections(userId?: string): UseElectionsReturn {
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<ElectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ElectionFilters>({
    status: [],
    category: [],
    location: [],
    votingMethod: [],
    securityLevel: [],
    hasVoted: null,
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [sort, setSort] = useState<ElectionSort>({
    field: 'startDate',
    direction: 'asc'
  });
  const [searchQuery, setSearchQuery] = useState('');

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
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-04-15T08:00:00Z'
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

      // Calculate stats
      const electionStats: ElectionStats = {
        totalElections: mockElections.length,
        activeElections: mockElections.filter(e => e.status === 'active').length,
        upcomingElections: mockElections.filter(e => e.status === 'upcoming').length,
        completedElections: mockElections.filter(e => e.status === 'completed').length,
        totalVotes: mockElections.reduce((sum, e) => sum + (e.hasVoted ? 1 : 0), 0),
        participationRate: mockElections.reduce((sum, e) => sum + e.participationRate, 0) / mockElections.length,
        averageCandidates: mockElections.reduce((sum, e) => sum + e.totalCandidates, 0) / mockElections.length
      };
      setStats(electionStats);
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
        election.location.toLowerCase().includes(query)
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

    // Has voted filter
    if (filters.hasVoted !== null) {
      filtered = filtered.filter(election => election.hasVoted === filters.hasVoted);
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(election => new Date(election.startDate) >= new Date(filters.dateRange.start));
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(election => new Date(election.endDate) <= new Date(filters.dateRange.end));
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      if (sort.field === 'startDate' || sort.field === 'endDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [elections, filters, sort, searchQuery]);

  // Vote in election
  const voteInElection = useCallback(async (electionId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setElections(prev => prev.map(election => 
        election.id === electionId 
          ? { ...election, hasVoted: true, participationRate: election.participationRate + 1 }
          : election
      ));
    } catch (err) {
      throw new Error('Failed to vote in election');
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

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: [],
      category: [],
      location: [],
      votingMethod: [],
      securityLevel: [],
      hasVoted: null,
      dateRange: {
        start: '',
        end: ''
      }
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
    stats,
    isLoading,
    error,
    filters,
    sort,
    searchQuery,
    setFilters,
    setSort,
    setSearchQuery,
    clearFilters,
    refreshElections,
    voteInElection,
    getElectionById,
    getElectionsByStatus,
    getElectionsByCategory
  };
}

/**
 * Election Search Hook
 */
export function useElectionSearch(elections: Election[]) {
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
        election.location.toLowerCase().includes(query.toLowerCase())
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
 * Election Favorites Hook
 */
export function useElectionFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load from localStorage for demo
      const stored = localStorage.getItem(`election-favorites-${userId}`);
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addToFavorites = useCallback(async (electionId: string) => {
    try {
      const newFavorites = [...favorites, electionId];
      setFavorites(newFavorites);
      
      // Save to localStorage for demo
      localStorage.setItem(`election-favorites-${userId}`, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  }, [favorites, userId]);

  const removeFromFavorites = useCallback(async (electionId: string) => {
    try {
      const newFavorites = favorites.filter(id => id !== electionId);
      setFavorites(newFavorites);
      
      // Save to localStorage for demo
      localStorage.setItem(`election-favorites-${userId}`, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  }, [favorites, userId]);

  const isFavorite = useCallback((electionId: string) => {
    return favorites.includes(electionId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (electionId: string) => {
    if (isFavorite(electionId)) {
      await removeFromFavorites(electionId);
    } else {
      await addToFavorites(electionId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  };
}

export default useElections;

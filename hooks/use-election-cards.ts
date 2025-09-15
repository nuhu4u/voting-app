/**
 * Election Card Hooks
 * Custom hooks for election card management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface ElectionCardData {
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

export interface CardViewOptions {
  variant: 'default' | 'compact' | 'detailed' | 'minimal';
  columns: 1 | 2 | 3 | 4;
  showActions: boolean;
  showStats: boolean;
  showRequirements: boolean;
  showTags: boolean;
  sortBy: 'date' | 'title' | 'participation' | 'priority' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}

export interface CardFilters {
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

export interface UseElectionCardsReturn {
  elections: ElectionCardData[];
  filteredElections: ElectionCardData[];
  viewOptions: CardViewOptions;
  setViewOptions: (options: CardViewOptions) => void;
  updateViewOption: (key: keyof CardViewOptions, value: any) => void;
  filters: CardFilters;
  setFilters: (filters: CardFilters) => void;
  updateFilter: (key: keyof CardFilters, value: any) => void;
  clearFilters: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshElections: () => Promise<void>;
  bookmarkElection: (electionId: string) => Promise<void>;
  starElection: (electionId: string) => Promise<void>;
  shareElection: (election: ElectionCardData) => Promise<void>;
  getElectionById: (id: string) => ElectionCardData | null;
  getElectionsByStatus: (status: string) => ElectionCardData[];
  getElectionsByCategory: (category: string) => ElectionCardData[];
  getBookmarkedElections: () => ElectionCardData[];
  getStarredElections: () => ElectionCardData[];
  getCardStats: () => {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
    bookmarked: number;
    starred: number;
  };
  exportElections: (format: 'json' | 'csv') => void;
  saveViewPreferences: () => void;
  loadViewPreferences: () => void;
}

const defaultViewOptions: CardViewOptions = {
  variant: 'default',
  columns: 3,
  showActions: true,
  showStats: true,
  showRequirements: false,
  showTags: true,
  sortBy: 'date',
  sortDirection: 'desc'
};

const defaultFilters: CardFilters = {
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
 * Main Election Cards Hook
 */
export function useElectionCards(initialElections: ElectionCardData[] = []): UseElectionCardsReturn {
  const [elections, setElections] = useState<ElectionCardData[]>(initialElections);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewOptions, setViewOptions] = useState<CardViewOptions>(defaultViewOptions);
  const [filters, setFilters] = useState<CardFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock elections data
  const mockElections: ElectionCardData[] = [
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
      
      switch (viewOptions.sortBy) {
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

      if (aValue < bValue) return viewOptions.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return viewOptions.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [elections, filters, searchQuery, viewOptions.sortBy, viewOptions.sortDirection]);

  // Update view option
  const updateViewOption = useCallback((key: keyof CardViewOptions, value: any) => {
    setViewOptions(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update filter
  const updateFilter = useCallback((key: keyof CardFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

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
  const shareElection = useCallback(async (election: ElectionCardData) => {
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

  // Get card statistics
  const getCardStats = useCallback(() => {
    return {
      total: elections.length,
      active: elections.filter(e => e.status === 'active').length,
      upcoming: elections.filter(e => e.status === 'upcoming').length,
      completed: elections.filter(e => e.status === 'completed').length,
      bookmarked: elections.filter(e => e.isBookmarked).length,
      starred: elections.filter(e => e.isStarred).length
    };
  }, [elections]);

  // Export elections
  const exportElections = useCallback((format: 'json' | 'csv') => {
    const data = filteredElections.map(election => ({
      title: election.title,
      description: election.description,
      category: election.category,
      location: election.location,
      status: election.status,
      priority: election.priority,
      startDate: election.startDate,
      endDate: election.endDate,
      totalCandidates: election.totalCandidates,
      totalVoters: election.totalVoters,
      participationRate: election.participationRate,
      votingMethod: election.votingMethod,
      securityLevel: election.securityLevel,
      tags: election.tags.join(', ')
    }));

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elections-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `elections-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [filteredElections]);

  // Save view preferences
  const saveViewPreferences = useCallback(() => {
    try {
      localStorage.setItem('election-cards-view-preferences', JSON.stringify(viewOptions));
    } catch (error) {
      console.error('Failed to save view preferences:', error);
    }
  }, [viewOptions]);

  // Load view preferences
  const loadViewPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem('election-cards-view-preferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setViewOptions({ ...defaultViewOptions, ...preferences });
      }
    } catch (error) {
      console.error('Failed to load view preferences:', error);
    }
  }, []);

  // Refresh elections
  const refreshElections = useCallback(async () => {
    await loadElections();
  }, [loadElections]);

  // Load elections on mount
  useEffect(() => {
    if (elections.length === 0) {
      loadElections();
    }
  }, [elections.length, loadElections]);

  // Load view preferences on mount
  useEffect(() => {
    loadViewPreferences();
  }, [loadViewPreferences]);

  // Save view preferences when they change
  useEffect(() => {
    saveViewPreferences();
  }, [saveViewPreferences]);

  return {
    elections,
    filteredElections,
    viewOptions,
    setViewOptions,
    updateViewOption,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    refreshElections,
    bookmarkElection,
    starElection,
    shareElection,
    getElectionById,
    getElectionsByStatus,
    getElectionsByCategory,
    getBookmarkedElections,
    getStarredElections,
    getCardStats,
    exportElections,
    saveViewPreferences,
    loadViewPreferences
  };
}

export default useElectionCards;

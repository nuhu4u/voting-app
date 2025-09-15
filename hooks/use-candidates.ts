/**
 * Candidates Hook
 * Custom hooks for candidate management and interactions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Contestant } from '../types/election';

export interface CandidateFilters {
  searchQuery: string;
  party: string;
  position: string;
  isActive: boolean | null;
  hasPicture: boolean | null;
}

export interface CandidateSortOptions {
  field: 'name' | 'votes' | 'party' | 'position';
  order: 'asc' | 'desc';
}

export interface CandidateStats {
  totalCandidates: number;
  totalVotes: number;
  averageVotes: number;
  topCandidate: Contestant | null;
  partyDistribution: Record<string, number>;
  positionDistribution: Record<string, number>;
  activeCandidates: number;
  inactiveCandidates: number;
}

export interface UseCandidatesReturn {
  candidates: Contestant[];
  filteredCandidates: Contestant[];
  isLoading: boolean;
  error: string | null;
  filters: CandidateFilters;
  sortOptions: CandidateSortOptions;
  stats: CandidateStats | null;
  setFilters: (filters: Partial<CandidateFilters>) => void;
  setSortOptions: (options: Partial<CandidateSortOptions>) => void;
  clearFilters: () => void;
  refreshCandidates: () => Promise<void>;
  getCandidateById: (id: string) => Contestant | null;
  getCandidatesByParty: (party: string) => Contestant[];
  getCandidatesByPosition: (position: string) => Contestant[];
  getTopCandidates: (limit: number) => Contestant[];
  searchCandidates: (query: string) => Contestant[];
  voteForCandidate: (candidateId: string) => Promise<{ success: boolean; message?: string }>;
  shareCandidate: (candidate: Contestant) => Promise<void>;
  bookmarkCandidate: (candidateId: string) => Promise<void>;
  reportCandidate: (candidateId: string, reason: string) => Promise<void>;
}

const defaultFilters: CandidateFilters = {
  searchQuery: '',
  party: '',
  position: '',
  isActive: null,
  hasPicture: null
};

const defaultSortOptions: CandidateSortOptions = {
  field: 'votes',
  order: 'desc'
};

export function useCandidates(electionId: string): UseCandidatesReturn {
  const [candidates, setCandidates] = useState<Contestant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<CandidateFilters>(defaultFilters);
  const [sortOptions, setSortOptionsState] = useState<CandidateSortOptions>(defaultSortOptions);

  // Mock candidate data
  const mockCandidates: Contestant[] = [
    {
      id: '1',
      name: 'John Doe',
      party: 'Progressive Party',
      party_acronym: 'PP',
      position: 'President',
      votes: 6500000,
      picture: null
    },
    {
      id: '2',
      name: 'Jane Smith',
      party: 'Democratic Alliance',
      party_acronym: 'DA',
      position: 'President',
      votes: 4200000,
      picture: null
    },
    {
      id: '3',
      name: 'Mike Johnson',
      party: 'Green Party',
      party_acronym: 'GP',
      position: 'President',
      votes: 2800000,
      picture: null
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      party: 'Unity Party',
      party_acronym: 'UP',
      position: 'President',
      votes: 1500000,
      picture: null
    },
    {
      id: '5',
      name: 'David Brown',
      party: 'Progressive Party',
      party_acronym: 'PP',
      position: 'Vice President',
      votes: 3200000,
      picture: null
    },
    {
      id: '6',
      name: 'Lisa Davis',
      party: 'Democratic Alliance',
      party_acronym: 'DA',
      position: 'Vice President',
      votes: 2100000,
      picture: null
    }
  ];

  // Load candidates
  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCandidates(mockCandidates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  }, [electionId]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.party.toLowerCase().includes(query) ||
        candidate.party_acronym.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query)
      );
    }

    // Party filter
    if (filters.party) {
      filtered = filtered.filter(candidate =>
        candidate.party.toLowerCase().includes(filters.party.toLowerCase()) ||
        candidate.party_acronym.toLowerCase().includes(filters.party.toLowerCase())
      );
    }

    // Position filter
    if (filters.position) {
      filtered = filtered.filter(candidate =>
        candidate.position.toLowerCase().includes(filters.position.toLowerCase())
      );
    }

    // Active filter
    if (filters.isActive !== null) {
      filtered = filtered.filter(candidate => {
        // Mock active status based on votes
        const isActive = candidate.votes > 1000000;
        return filters.isActive ? isActive : !isActive;
      });
    }

    // Picture filter
    if (filters.hasPicture !== null) {
      filtered = filtered.filter(candidate =>
        filters.hasPicture ? !!candidate.picture : !candidate.picture
      );
    }

    return filtered;
  }, [candidates, filters]);

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    const sorted = [...filteredCandidates];
    
    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOptions.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'votes':
          aValue = a.votes;
          bValue = b.votes;
          break;
        case 'party':
          aValue = a.party.toLowerCase();
          bValue = b.party.toLowerCase();
          break;
        case 'position':
          aValue = a.position.toLowerCase();
          bValue = b.position.toLowerCase();
          break;
        default:
          aValue = a.votes;
          bValue = b.votes;
      }

      if (sortOptions.order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return sorted;
  }, [filteredCandidates, sortOptions]);

  // Calculate stats
  const stats = useMemo((): CandidateStats | null => {
    if (candidates.length === 0) return null;

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    const averageVotes = totalVotes / candidates.length;
    const topCandidate = candidates.reduce((top, candidate) => 
      candidate.votes > top.votes ? candidate : top
    );

    const partyDistribution = candidates.reduce((acc, candidate) => {
      acc[candidate.party] = (acc[candidate.party] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const positionDistribution = candidates.reduce((acc, candidate) => {
      acc[candidate.position] = (acc[candidate.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeCandidates = candidates.filter(candidate => candidate.votes > 1000000).length;
    const inactiveCandidates = candidates.length - activeCandidates;

    return {
      totalCandidates: candidates.length,
      totalVotes,
      averageVotes,
      topCandidate,
      partyDistribution,
      positionDistribution,
      activeCandidates,
      inactiveCandidates
    };
  }, [candidates]);

  // Set filters
  const setFilters = useCallback((newFilters: Partial<CandidateFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Set sort options
  const setSortOptions = useCallback((newOptions: Partial<CandidateSortOptions>) => {
    setSortOptionsState(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Refresh candidates
  const refreshCandidates = useCallback(async () => {
    await loadCandidates();
  }, [loadCandidates]);

  // Get candidate by ID
  const getCandidateById = useCallback((id: string) => {
    return candidates.find(candidate => candidate.id === id) || null;
  }, [candidates]);

  // Get candidates by party
  const getCandidatesByParty = useCallback((party: string) => {
    return candidates.filter(candidate =>
      candidate.party.toLowerCase().includes(party.toLowerCase()) ||
      candidate.party_acronym.toLowerCase().includes(party.toLowerCase())
    );
  }, [candidates]);

  // Get candidates by position
  const getCandidatesByPosition = useCallback((position: string) => {
    return candidates.filter(candidate =>
      candidate.position.toLowerCase().includes(position.toLowerCase())
    );
  }, [candidates]);

  // Get top candidates
  const getTopCandidates = useCallback((limit: number) => {
    return [...candidates]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, limit);
  }, [candidates]);

  // Search candidates
  const searchCandidates = useCallback((query: string) => {
    const searchQuery = query.toLowerCase();
    return candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchQuery) ||
      candidate.party.toLowerCase().includes(searchQuery) ||
      candidate.party_acronym.toLowerCase().includes(searchQuery) ||
      candidate.position.toLowerCase().includes(searchQuery)
    );
  }, [candidates]);

  // Vote for candidate
  const voteForCandidate = useCallback(async (candidateId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update candidate votes
      setCandidates(prev => prev.map(candidate =>
        candidate.id === candidateId
          ? { ...candidate, votes: candidate.votes + 1 }
          : candidate
      ));

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to vote' 
      };
    }
  }, []);

  // Share candidate
  const shareCandidate = useCallback(async (candidate: Contestant) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${candidate.name} - ${candidate.position}`,
          text: `Vote for ${candidate.name} for ${candidate.position} in the ${candidate.party}`,
          url: `/candidates/${candidate.id}`
        });
      } else {
        await navigator.clipboard.writeText(
          `${candidate.name} - ${candidate.position}\n${candidate.party}\n/candidates/${candidate.id}`
        );
      }
    } catch (err) {
      throw new Error('Failed to share candidate');
    }
  }, []);

  // Bookmark candidate
  const bookmarkCandidate = useCallback(async (candidateId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      // In a real app, this would save to local storage or API
    } catch (err) {
      throw new Error('Failed to bookmark candidate');
    }
  }, []);

  // Report candidate
  const reportCandidate = useCallback(async (candidateId: string, reason: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, this would send a report to the backend
    } catch (err) {
      throw new Error('Failed to report candidate');
    }
  }, []);

  // Load candidates on mount
  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  return {
    candidates,
    filteredCandidates: sortedCandidates,
    isLoading,
    error,
    filters,
    sortOptions,
    stats,
    setFilters,
    setSortOptions,
    clearFilters,
    refreshCandidates,
    getCandidateById,
    getCandidatesByParty,
    getCandidatesByPosition,
    getTopCandidates,
    searchCandidates,
    voteForCandidate,
    shareCandidate,
    bookmarkCandidate,
    reportCandidate
  };
}

export default useCandidates;

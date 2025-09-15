/**
 * Voting History Hooks
 * Custom hooks for voting history management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface VotingRecord {
  id: string;
  electionId: string;
  electionTitle: string;
  electionCategory: string;
  candidateId: string;
  candidateName: string;
  candidateParty: string;
  voteDate: string;
  voteTime: string;
  votingMethod: 'online' | 'hybrid' | 'offline';
  location: string;
  pollingUnit: string;
  status: 'confirmed' | 'pending' | 'rejected';
  blockchainHash: string;
  transactionId: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  voteWeight: number;
  isSecretBallot: boolean;
  auditTrail: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VotingStats {
  totalVotes: number;
  successfulVotes: number;
  failedVotes: number;
  averageVoteTime: number;
  participationRate: number;
  favoriteCategory: string;
  mostVotedParty: string;
  votingStreak: number;
  lastVoteDate: string;
  totalElectionsParticipated: number;
}

export interface HistoryFilters {
  electionCategory: string[];
  votingMethod: string[];
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  candidateParty: string[];
}

export interface UseVotingHistoryReturn {
  votingRecords: VotingRecord[];
  filteredRecords: VotingRecord[];
  stats: VotingStats | null;
  isLoading: boolean;
  error: string | null;
  filters: HistoryFilters;
  searchQuery: string;
  setFilters: (filters: HistoryFilters) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  refreshHistory: () => Promise<void>;
  downloadHistory: () => void;
  getRecordById: (id: string) => VotingRecord | null;
  getRecordsByElection: (electionId: string) => VotingRecord[];
  getRecordsByCandidate: (candidateId: string) => VotingRecord[];
  getRecordsByDateRange: (start: string, end: string) => VotingRecord[];
}

/**
 * Main Voting History Hook
 */
export function useVotingHistory(userId?: string): UseVotingHistoryReturn {
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [stats, setStats] = useState<VotingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    electionCategory: [],
    votingMethod: [],
    status: [],
    dateRange: {
      start: '',
      end: ''
    },
    candidateParty: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock voting records data
  const mockVotingRecords: VotingRecord[] = [
    {
      id: '1',
      electionId: '1',
      electionTitle: 'Presidential Election 2023',
      electionCategory: 'Presidential',
      candidateId: 'c1',
      candidateName: 'John Doe',
      candidateParty: 'Progressive Party',
      voteDate: '2023-02-25',
      voteTime: '10:30 AM',
      votingMethod: 'hybrid',
      location: 'Lagos State',
      pollingUnit: 'PU 001',
      status: 'confirmed',
      blockchainHash: '0x1234567890abcdef1234567890abcdef12345678',
      transactionId: 'tx_1234567890abcdef',
      verificationStatus: 'verified',
      voteWeight: 1,
      isSecretBallot: true,
      auditTrail: ['Vote cast', 'Blockchain verified', 'Transaction confirmed'],
      createdAt: '2023-02-25T10:30:00Z',
      updatedAt: '2023-02-25T10:30:00Z'
    },
    {
      id: '2',
      electionId: '2',
      electionTitle: 'Senate Election 2023',
      electionCategory: 'Senate',
      candidateId: 'c2',
      candidateName: 'Jane Smith',
      candidateParty: 'Democratic Alliance',
      voteDate: '2023-01-15',
      voteTime: '2:15 PM',
      votingMethod: 'online',
      location: 'Lagos State',
      pollingUnit: 'PU 002',
      status: 'confirmed',
      blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      transactionId: 'tx_abcdef1234567890',
      verificationStatus: 'verified',
      voteWeight: 1,
      isSecretBallot: true,
      auditTrail: ['Vote cast', 'Blockchain verified', 'Transaction confirmed'],
      createdAt: '2023-01-15T14:15:00Z',
      updatedAt: '2023-01-15T14:15:00Z'
    },
    {
      id: '3',
      electionId: '3',
      electionTitle: 'House of Representatives 2023',
      electionCategory: 'House of Reps',
      candidateId: 'c3',
      candidateName: 'Mike Johnson',
      candidateParty: 'Conservative Party',
      voteDate: '2023-01-10',
      voteTime: '9:45 AM',
      votingMethod: 'online',
      location: 'Lagos State',
      pollingUnit: 'PU 003',
      status: 'confirmed',
      blockchainHash: '0x9876543210fedcba9876543210fedcba98765432',
      transactionId: 'tx_9876543210fedcba',
      verificationStatus: 'verified',
      voteWeight: 1,
      isSecretBallot: true,
      auditTrail: ['Vote cast', 'Blockchain verified', 'Transaction confirmed'],
      createdAt: '2023-01-10T09:45:00Z',
      updatedAt: '2023-01-10T09:45:00Z'
    },
    {
      id: '4',
      electionId: '4',
      electionTitle: 'Governor Election 2023',
      electionCategory: 'Governor',
      candidateId: 'c4',
      candidateName: 'Sarah Wilson',
      candidateParty: 'Progressive Party',
      voteDate: '2023-03-20',
      voteTime: '11:20 AM',
      votingMethod: 'offline',
      location: 'Lagos State',
      pollingUnit: 'PU 004',
      status: 'pending',
      blockchainHash: '0x5555555555555555555555555555555555555555',
      transactionId: 'tx_5555555555555555',
      verificationStatus: 'pending',
      voteWeight: 1,
      isSecretBallot: true,
      auditTrail: ['Vote cast', 'Pending verification'],
      createdAt: '2023-03-20T11:20:00Z',
      updatedAt: '2023-03-20T11:20:00Z'
    }
  ];

  // Load voting history
  const loadVotingHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVotingRecords(mockVotingRecords);

      // Calculate stats
      const totalVotes = mockVotingRecords.length;
      const successfulVotes = mockVotingRecords.filter(r => r.status === 'confirmed').length;
      const failedVotes = mockVotingRecords.filter(r => r.status === 'rejected').length;
      const averageVoteTime = 3.5; // Mock average vote time in minutes
      const participationRate = 85; // Mock participation rate
      
      // Calculate favorite category
      const categoryCounts = mockVotingRecords.reduce((acc, record) => {
        acc[record.electionCategory] = (acc[record.electionCategory] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const favoriteCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      // Calculate most voted party
      const partyCounts = mockVotingRecords.reduce((acc, record) => {
        acc[record.candidateParty] = (acc[record.candidateParty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const mostVotedParty = Object.entries(partyCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      const votingStreak = 7; // Mock voting streak
      const lastVoteDate = mockVotingRecords.sort((a, b) => 
        new Date(b.voteDate).getTime() - new Date(a.voteDate).getTime()
      )[0]?.voteDate || new Date().toISOString();
      const totalElectionsParticipated = new Set(mockVotingRecords.map(r => r.electionId)).size;

      const votingStats: VotingStats = {
        totalVotes,
        successfulVotes,
        failedVotes,
        averageVoteTime,
        participationRate,
        favoriteCategory,
        mostVotedParty,
        votingStreak,
        lastVoteDate,
        totalElectionsParticipated
      };
      setStats(votingStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voting history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = [...votingRecords];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.electionTitle.toLowerCase().includes(query) ||
        record.candidateName.toLowerCase().includes(query) ||
        record.candidateParty.toLowerCase().includes(query) ||
        record.electionCategory.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.electionCategory.length > 0) {
      filtered = filtered.filter(record => 
        filters.electionCategory.includes(record.electionCategory)
      );
    }

    // Voting method filter
    if (filters.votingMethod.length > 0) {
      filtered = filtered.filter(record => 
        filters.votingMethod.includes(record.votingMethod)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => 
        filters.status.includes(record.status)
      );
    }

    // Party filter
    if (filters.candidateParty.length > 0) {
      filtered = filtered.filter(record => 
        filters.candidateParty.includes(record.candidateParty)
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      filtered = filtered.filter(record => 
        new Date(record.voteDate) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(record => 
        new Date(record.voteDate) <= new Date(filters.dateRange.end)
      );
    }

    return filtered;
  }, [votingRecords, filters, searchQuery]);

  // Download history
  const downloadHistory = useCallback(() => {
    const historyData = {
      records: votingRecords,
      stats: stats,
      exportedAt: new Date().toISOString(),
      totalRecords: votingRecords.length
    };

    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voting-history-${userId || 'user'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [votingRecords, stats, userId]);

  // Get record by ID
  const getRecordById = useCallback((id: string) => {
    return votingRecords.find(record => record.id === id) || null;
  }, [votingRecords]);

  // Get records by election
  const getRecordsByElection = useCallback((electionId: string) => {
    return votingRecords.filter(record => record.electionId === electionId);
  }, [votingRecords]);

  // Get records by candidate
  const getRecordsByCandidate = useCallback((candidateId: string) => {
    return votingRecords.filter(record => record.candidateId === candidateId);
  }, [votingRecords]);

  // Get records by date range
  const getRecordsByDateRange = useCallback((start: string, end: string) => {
    return votingRecords.filter(record => {
      const recordDate = new Date(record.voteDate);
      return recordDate >= new Date(start) && recordDate <= new Date(end);
    });
  }, [votingRecords]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      electionCategory: [],
      votingMethod: [],
      status: [],
      dateRange: {
        start: '',
        end: ''
      },
      candidateParty: []
    });
  }, []);

  // Refresh history
  const refreshHistory = useCallback(async () => {
    await loadVotingHistory();
  }, [loadVotingHistory]);

  // Load history on mount
  useEffect(() => {
    loadVotingHistory();
  }, [loadVotingHistory]);

  return {
    votingRecords,
    filteredRecords,
    stats,
    isLoading,
    error,
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    clearFilters,
    refreshHistory,
    downloadHistory,
    getRecordById,
    getRecordsByElection,
    getRecordsByCandidate,
    getRecordsByDateRange
  };
}

/**
 * Voting Analytics Hook
 */
export function useVotingAnalytics(votingRecords: VotingRecord[]) {
  const analytics = useMemo(() => {
    const totalVotes = votingRecords.length;
    const successfulVotes = votingRecords.filter(r => r.status === 'confirmed').length;
    const failedVotes = votingRecords.filter(r => r.status === 'rejected').length;
    const pendingVotes = votingRecords.filter(r => r.status === 'pending').length;

    // Category breakdown
    const categoryBreakdown = votingRecords.reduce((acc, record) => {
      acc[record.electionCategory] = (acc[record.electionCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Party breakdown
    const partyBreakdown = votingRecords.reduce((acc, record) => {
      acc[record.candidateParty] = (acc[record.candidateParty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Method breakdown
    const methodBreakdown = votingRecords.reduce((acc, record) => {
      acc[record.votingMethod] = (acc[record.votingMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly voting pattern
    const monthlyPattern = votingRecords.reduce((acc, record) => {
      const month = new Date(record.voteDate).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Voting frequency
    const votingFrequency = votingRecords.length / 12; // votes per month (assuming 12 months of data)

    return {
      totalVotes,
      successfulVotes,
      failedVotes,
      pendingVotes,
      successRate: totalVotes > 0 ? (successfulVotes / totalVotes) * 100 : 0,
      categoryBreakdown,
      partyBreakdown,
      methodBreakdown,
      monthlyPattern,
      votingFrequency
    };
  }, [votingRecords]);

  return analytics;
}

/**
 * Voting Trends Hook
 */
export function useVotingTrends(votingRecords: VotingRecord[]) {
  const trends = useMemo(() => {
    // Sort records by date
    const sortedRecords = [...votingRecords].sort((a, b) => 
      new Date(a.voteDate).getTime() - new Date(b.voteDate).getTime()
    );

    // Calculate voting streak
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedRecords.length; i++) {
      if (sortedRecords[i].status === 'confirmed') {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    currentStreak = tempStreak;

    // Calculate voting consistency (votes per month)
    const monthlyVotes = sortedRecords.reduce((acc, record) => {
      const month = new Date(record.voteDate).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const months = Object.keys(monthlyVotes).length;
    const averageVotesPerMonth = months > 0 ? sortedRecords.length / months : 0;

    // Calculate most active voting period
    const hourlyVotes = sortedRecords.reduce((acc, record) => {
      const hour = new Date(`2000-01-01T${record.voteTime}`).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostActiveHour = Object.entries(hourlyVotes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;

    return {
      currentStreak,
      maxStreak,
      averageVotesPerMonth,
      mostActiveHour,
      monthlyVotes,
      hourlyVotes
    };
  }, [votingRecords]);

  return trends;
}

export default useVotingHistory;

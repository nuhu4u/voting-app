/**
 * Election Details Hook
 * Custom hooks for election detail management
 */

import { useState, useEffect, useCallback } from 'react';

export interface ElectionDetailData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  electionType: string;
  totalVotes: number;
  totalCandidates: number;
  contestants: CandidateData[];
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
  electionStats?: {
    totalRegisteredVoters: number;
    totalVotesCast: number;
    electionTurnoutPercentage: number;
    averageVotingTime: number;
    peakVotingHour: number;
    demographicBreakdown: {
      ageGroups: Record<string, number>;
      genderDistribution: Record<string, number>;
      locationDistribution: Record<string, number>;
    };
  };
}

export interface CandidateData {
  id: string;
  name: string;
  party: string;
  partyAcronym: string;
  position: string;
  picture?: string;
  votes: number;
  percentage: number;
  bio: string;
  manifesto: string;
  qualifications: string[];
  experience: string[];
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ElectionDetailStats {
  totalViews: number;
  uniqueViewers: number;
  averageViewTime: number;
  shareCount: number;
  bookmarkCount: number;
  lastViewed: string;
}

export interface UseElectionDetailsReturn {
  election: ElectionDetailData | null;
  isLoading: boolean;
  error: string | null;
  stats: ElectionDetailStats | null;
  activeTab: 'overview' | 'candidates' | 'results' | 'analytics';
  setActiveTab: (tab: 'overview' | 'candidates' | 'results' | 'analytics') => void;
  refreshElection: () => Promise<void>;
  bookmarkElection: () => Promise<void>;
  starElection: () => Promise<void>;
  shareElection: () => Promise<void>;
  viewElection: () => Promise<void>;
  getElectionAnalytics: () => any;
  exportElectionData: () => void;
  canVote: boolean;
  canViewResults: boolean;
  timeUntilStart: number | null;
  timeUntilEnd: number | null;
  isElectionActive: boolean;
  isElectionUpcoming: boolean;
  isElectionCompleted: boolean;
}

/**
 * Main Election Details Hook
 */
export function useElectionDetails(electionId: string): UseElectionDetailsReturn {
  const [election, setElection] = useState<ElectionDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ElectionDetailStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'results' | 'analytics'>('overview');

  // Mock election data
  const mockElection: ElectionDetailData = {
    id: electionId,
    title: 'Presidential Election 2023',
    description: 'Election for the President of Nigeria - Choose your next leader',
    startDate: '2023-02-25T08:00:00Z',
    endDate: '2023-02-25T18:00:00Z',
    status: 'active',
    electionType: 'Presidential',
    totalVotes: 15000000,
    totalCandidates: 4,
    contestants: [
      {
        id: '1',
        name: 'John Doe',
        party: 'Progressive Party',
        partyAcronym: 'PP',
        position: 'President',
        votes: 6500000,
        percentage: 43.3,
        bio: 'Experienced leader with 20 years in public service',
        manifesto: 'Building a better Nigeria for all citizens',
        qualifications: ['PhD in Political Science', 'Former Governor'],
        experience: ['Governor (2015-2023)', 'Senator (2010-2015)'],
        socialMedia: {
          twitter: '@johndoe',
          facebook: 'johndoeofficial',
          website: 'johndoe2023.com'
        },
        isVerified: true,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-02-25T08:00:00Z'
      },
      {
        id: '2',
        name: 'Jane Smith',
        party: 'Democratic Alliance',
        partyAcronym: 'DA',
        position: 'President',
        votes: 4200000,
        percentage: 28.0,
        bio: 'Business leader and philanthropist',
        manifesto: 'Economic growth and social justice',
        qualifications: ['MBA from Harvard', 'Former CEO'],
        experience: ['CEO TechCorp (2010-2023)', 'Board Member (2005-2010)'],
        socialMedia: {
          twitter: '@janesmith',
          instagram: 'janesmith2023',
          website: 'janesmith2023.com'
        },
        isVerified: true,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-02-25T08:00:00Z'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        party: 'Green Party',
        partyAcronym: 'GP',
        position: 'President',
        votes: 2800000,
        percentage: 18.7,
        bio: 'Environmental activist and former minister',
        manifesto: 'Sustainable development and climate action',
        qualifications: ['PhD in Environmental Science', 'Former Minister'],
        experience: ['Environment Minister (2015-2023)', 'NGO Director (2010-2015)'],
        socialMedia: {
          twitter: '@mikejohnson',
          facebook: 'mikejohnson2023',
          website: 'mikejohnson2023.com'
        },
        isVerified: true,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-02-25T08:00:00Z'
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        party: 'Unity Party',
        partyAcronym: 'UP',
        position: 'President',
        votes: 1500000,
        percentage: 10.0,
        bio: 'Youth advocate and community organizer',
        manifesto: 'Empowering youth and building bridges',
        qualifications: ['Masters in Social Work', 'Community Leader'],
        experience: ['Youth Minister (2020-2023)', 'NGO Founder (2015-2020)'],
        socialMedia: {
          twitter: '@sarahwilson',
          instagram: 'sarahwilson2023',
          website: 'sarahwilson2023.com'
        },
        isVerified: true,
        isActive: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-02-25T08:00:00Z'
      }
    ],
    requirements: ['Valid Voter ID', 'NIN', '18+ years old'],
    votingMethod: 'hybrid',
    securityLevel: 'maximum',
    blockchainHash: '0x1234567890abcdef',
    resultsAvailable: true,
    participationRate: 85,
    isBookmarked: false,
    isStarred: false,
    priority: 'high',
    tags: ['presidential', 'national', '2023'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-02-25T08:00:00Z',
    electionStats: {
      totalRegisteredVoters: 20000000,
      totalVotesCast: 15000000,
      electionTurnoutPercentage: 75,
      averageVotingTime: 3.5,
      peakVotingHour: 14,
      demographicBreakdown: {
        ageGroups: {
          '18-25': 25,
          '26-35': 30,
          '36-45': 25,
          '46-55': 15,
          '56+': 5
        },
        genderDistribution: {
          'male': 52,
          'female': 48
        },
        locationDistribution: {
          'Lagos': 20,
          'Kano': 15,
          'Rivers': 12,
          'Kaduna': 10,
          'Others': 43
        }
      }
    }
  };

  // Load election details
  const loadElectionDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setElection(mockElection);
      
      // Load stats
      setStats({
        totalViews: 125000,
        uniqueViewers: 85000,
        averageViewTime: 4.2,
        shareCount: 2500,
        bookmarkCount: 1200,
        lastViewed: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load election details');
    } finally {
      setIsLoading(false);
    }
  }, [electionId]);

  // Refresh election
  const refreshElection = useCallback(async () => {
    await loadElectionDetails();
  }, [loadElectionDetails]);

  // Bookmark election
  const bookmarkElection = useCallback(async () => {
    if (!election) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setElection(prev => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked
      } : null);
    } catch (err) {
      throw new Error('Failed to bookmark election');
    }
  }, [election]);

  // Star election
  const starElection = useCallback(async () => {
    if (!election) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setElection(prev => prev ? {
        ...prev,
        isStarred: !prev.isStarred
      } : null);
    } catch (err) {
      throw new Error('Failed to star election');
    }
  }, [election]);

  // Share election
  const shareElection = useCallback(async () => {
    if (!election) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (navigator.share) {
        await navigator.share({
          title: election.title,
          text: election.description,
          url: `/elections/${election.id}`
        });
      } else {
        await navigator.clipboard.writeText(
          `${election.title}\n${election.description}\n/elections/${election.id}`
        );
      }
    } catch (err) {
      throw new Error('Failed to share election');
    }
  }, [election]);

  // View election
  const viewElection = useCallback(async () => {
    if (!election) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setStats(prev => prev ? {
        ...prev,
        totalViews: prev.totalViews + 1,
        lastViewed: new Date().toISOString()
      } : null);
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  }, [election]);

  // Get election analytics
  const getElectionAnalytics = useCallback(() => {
    if (!election) return null;

    return {
      election,
      stats,
      participationRate: election.participationRate,
      totalCandidates: election.totalCandidates,
      totalVotes: election.totalVotes,
      topCandidate: election.contestants.sort((a, b) => b.votes - a.votes)[0],
      averageVotesPerCandidate: election.totalVotes / election.totalCandidates,
      timeRemaining: timeUntilEnd,
      isActive: isElectionActive
    };
  }, [election, stats]);

  // Export election data
  const exportElectionData = useCallback(() => {
    if (!election) return;

    const exportData = {
      election,
      stats,
      analytics: getElectionAnalytics(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-${election.id}-details-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [election, stats, getElectionAnalytics]);

  // Calculate time until start/end
  const now = new Date().getTime();
  const startTime = election ? new Date(election.startDate).getTime() : 0;
  const endTime = election ? new Date(election.endDate).getTime() : 0;

  const timeUntilStart = startTime > now ? Math.max(0, startTime - now) : null;
  const timeUntilEnd = endTime > now ? Math.max(0, endTime - now) : null;

  // Election status checks
  const isElectionActive = election?.status === 'active';
  const isElectionUpcoming = election?.status === 'upcoming';
  const isElectionCompleted = election?.status === 'completed';

  // Voting permissions
  const canVote = isElectionActive && election !== null;
  const canViewResults = election?.resultsAvailable || isElectionCompleted;

  // Load election details on mount
  useEffect(() => {
    loadElectionDetails();
  }, [loadElectionDetails]);

  return {
    election,
    isLoading,
    error,
    stats,
    activeTab,
    setActiveTab,
    refreshElection,
    bookmarkElection,
    starElection,
    shareElection,
    viewElection,
    getElectionAnalytics,
    exportElectionData,
    canVote,
    canViewResults,
    timeUntilStart,
    timeUntilEnd,
    isElectionActive,
    isElectionUpcoming,
    isElectionCompleted
  };
}

export default useElectionDetails;

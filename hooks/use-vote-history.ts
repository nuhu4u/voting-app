import { useState, useEffect } from 'react';
import { dashboardService } from '@/lib/api/dashboard-service';

export interface VoteHistoryItem {
  id: string;
  election: {
    title: string;
    candidate: string;
    party: string;
    partyAcronym: string;
    runningMate: string;
    votedOn: string;
    votePosition: number;
    blockchainTx: string;
  };
}

export const useVoteHistory = () => {
  const [voteHistory, setVoteHistory] = useState<VoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoteHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getVoteHistory();
      
      if (response.success && response.data) {
        // Transform the API data to match our component structure
        const transformedHistory: VoteHistoryItem[] = response.data.map((vote: any) => ({
          id: vote._id,
          election: {
            title: vote.election_title || 'Election',
            candidate: vote.candidate_name || 'Unknown Candidate',
            party: vote.party_name || 'Unknown Party',
            partyAcronym: vote.party_acronym || 'UNK',
            runningMate: vote.running_mate || 'No Running Mate',
            votedOn: new Date(vote.vote_timestamp).toLocaleString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            }),
            votePosition: vote.vote_position || 0,
            blockchainTx: vote.transaction_hash ? 
              `${vote.transaction_hash.substring(0, 10)}...${vote.transaction_hash.substring(vote.transaction_hash.length - 8)}` : 
              'N/A',
          },
        }));
        
        setVoteHistory(transformedHistory);
      } else {
        setError(response.error || 'Failed to fetch vote history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshVoteHistory = () => {
    fetchVoteHistory();
  };

  useEffect(() => {
    fetchVoteHistory();
  }, []);

  return {
    voteHistory,
    loading,
    error,
    refreshVoteHistory,
  };
};

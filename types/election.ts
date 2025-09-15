// Election related types
export interface Election {
  _id: string;
  id: string;
  title: string;
  description: string;
  election_type: ElectionType;
  start_date: string;
  end_date: string;
  status: ElectionStatus;
  state_id?: string;
  lga_id?: string;
  ward_id?: string;
  polling_unit_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  contract_address?: string;
  total_votes: number;
  contestants: Contestant[];
  electionStats?: ElectionStats;
}

export interface Contestant {
  id: string;
  name: string;
  party: string;
  party_acronym: string;
  picture?: string;
  position: string;
  running_mate?: string;
  votes: number;
}

export interface ElectionStats {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  nonVoters: number;
  electionTurnoutPercentage: number;
}

export type ElectionType = 
  | 'PRESIDENTIAL' 
  | 'GUBERNATORIAL' 
  | 'HOUSE_OF_ASSEMBLY' 
  | 'SENATORIAL' 
  | 'HOUSE_OF_REPS' 
  | 'LOCAL_GOVERNMENT';

export type ElectionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Vote {
  _id: string;
  voter_id: string;
  election_id: string;
  candidate_id: string;
  sequential_position: number;
  vote_timestamp: string;
  status: VoteStatus;
  transaction_hash?: string;
  block_number?: number;
  created_at: string;
  updated_at: string;
}

export type VoteStatus = 'pending' | 'success' | 'failed' | 'pending_chain';

export interface ElectionFilter {
  state?: string;
  type?: ElectionType;
  status?: ElectionStatus;
  search?: string;
  sortBy?: string;
}

export interface ElectionResults {
  election_id: string;
  title: string;
  total_votes: number;
  candidates: Contestant[];
  last_updated: string;
  is_final: boolean;
}

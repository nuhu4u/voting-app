// Blockchain related types
export interface BlockchainTransaction {
  id: string;
  transaction_hash: string;
  hash?: string;
  block_number: number;
  blockNumber?: number;
  gas_used: number;
  gasUsed?: number;
  gas_price: string;
  gasPrice?: string;
  gas_limit?: number;
  gasLimit?: number;
  status: TransactionStatus;
  confirmations: number;
  timestamp: string;
  type?: string;
  description?: string;
  value?: number;
  fromAddress?: string;
  toAddress?: string;
  nonce?: number;
  electionId?: string;
}

export interface VoteVerification {
  voter_id: string;
  election_id: string;
  candidate_id: string;
  transaction_hash: string;
  block_number: number;
  is_valid: boolean;
  verification_timestamp: string;
}

export interface ElectionStatus {
  contract_address: string;
  is_active: boolean;
  total_voters: number;
  total_votes: number;
  election_status: string;
  blockchain_network: string;
  last_block_number: number;
}

export interface SmartContractInfo {
  address: string;
  abi: any[];
  network: string;
  deployed_at: string;
  version: string;
}

export interface BlockchainMetrics {
  total_transactions: number;
  average_gas_price: string;
  average_confirmation_time: number;
  network_congestion: 'low' | 'medium' | 'high';
}

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

export interface GasEstimate {
  gas_limit: number;
  gas_price: string;
  total_cost: string;
}

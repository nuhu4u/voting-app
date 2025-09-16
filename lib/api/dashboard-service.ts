import { apiConfig } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';

export interface DashboardData {
  voterInfo: {
    name: string;
    user_unique_id: string;
    wallet_address: string;
    email: string;
    nin_verified: boolean;
    first_name: string;
    last_name: string;
    geographicData: {
      pollingUnit: string;
      pollingUnitCode: string;
      ward: string;
      wardCode: string;
      lgaOfResidence: string;
      lgaCode: string;
      stateOfResidence: string;
      stateCode: string;
    };
  };
  activeElections: Election[];
  myVotes: Vote[];
  stats: {
    totalRegisteredVoters: number;
    totalVotesCast: number;
    nonVoters: number;
    turnoutPercentage: number;
  };
}

export interface Election {
  id: string;
  title: string;
  election_type: string;
  status: string;
  start_date: string;
  end_date: string;
  contract_address?: string;
  contestants: Contestant[];
  total_votes: number;
}

export interface Contestant {
  id: string;
  name: string;
  party: string;
  running_mate?: string;
  votes: number;
  mongoId?: string;
}

export interface Vote {
  _id: string;
  election_id: string;
  candidate_id: string;
  vote_position?: number;
  sequential_position?: number;
  vote_timestamp: string;
  transaction_hash?: string;
  blockchain_block_number?: number;
  blockchain_gas_used?: string;
  created_at: string;
}

class DashboardService {
  private async getAuthHeaders() {
    try {
      // Get token directly from auth store
      const { token } = useAuthStore.getState();
      
      console.log('🔐 DashboardService: Token from auth store:', token ? 'Found' : 'Not found');
      console.log('🔐 DashboardService: Token length:', token?.length || 0);
      console.log('🔐 DashboardService: Token value:', token);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`,
      };
      
      console.log('🔐 DashboardService: Headers:', headers);
      return headers;
    } catch (error) {
      console.error('Error getting auth headers:', error);
      return {
        'Content-Type': 'application/json',
        'Authorization': '',
      };
    }
  }

  async getDashboardData(): Promise<{ success: boolean; data?: DashboardData; error?: string }> {
    try {
      console.log('📊 DashboardService: Fetching dashboard data...');
      
      // Use direct API configuration
      const apiBaseUrl = apiConfig.baseUrl;
      console.log('📊 DashboardService: Using API URL:', apiBaseUrl);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiBaseUrl}/dashboard/voter`, {
        method: 'GET',
        headers,
      });

      console.log('📊 DashboardService: Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 DashboardService: Response data:', data);

      if (data.success) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to fetch dashboard data',
        };
      }
    } catch (error) {
      console.error('❌ DashboardService: Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async refreshElectionData(): Promise<{ success: boolean; data?: Election[]; error?: string }> {
    try {
      console.log('🔄 DashboardService: Refreshing election data...');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiConfig.baseUrl}/elections/active`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.log('⚠️ DashboardService: Elections endpoint returned:', response.status, response.statusText);
        // Return empty array but don't treat as error
        return {
          success: true,
          data: [],
        };
      }

      const data = await response.json();
      console.log('🗳️ DashboardService: Election data:', data);

      return {
        success: true,
        data: data.elections || data || [],
      };
    } catch (error) {
      console.error('❌ DashboardService: Error refreshing elections:', error);
      return {
        success: true, // Don't fail the whole app for elections
        data: [],
      };
    }
  }

  async getVoteHistory(): Promise<{ success: boolean; data?: Vote[]; error?: string }> {
    try {
      console.log('📜 DashboardService: Fetching vote history...');
      
      // Get vote history from dashboard data instead of separate endpoint
      // This avoids permission issues with /votes/my-votes endpoint
      const dashboardResponse = await this.getDashboardData();
      
      if (dashboardResponse.success && dashboardResponse.data) {
        const voteHistory = dashboardResponse.data.myVotes || [];
        console.log('📜 DashboardService: Vote history from dashboard:', voteHistory);
        
        return {
          success: true,
          data: voteHistory,
        };
      } else {
        console.log('⚠️ DashboardService: Dashboard data not available, using empty vote history');
        return {
          success: true,
          data: [],
        };
      }
    } catch (error) {
      console.error('❌ DashboardService: Error fetching vote history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getElectionStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('📈 DashboardService: Fetching election stats...');
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${apiConfig.baseUrl}/dashboard/stats`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.log('⚠️ DashboardService: Stats endpoint returned:', response.status, response.statusText);
        // Try to get stats from dashboard data instead
        const dashboardResponse = await this.getDashboardData();
        if (dashboardResponse.success && dashboardResponse.data?.stats) {
          return {
            success: true,
            data: dashboardResponse.data.stats,
          };
        }
        // Return empty stats if no data available
        return {
          success: true,
          data: {
            totalRegisteredVoters: 0,
            totalVotesCast: 0,
            nonVoters: 0,
            turnoutPercentage: 0,
          },
        };
      }

      const data = await response.json();
      console.log('📈 DashboardService: Stats data:', data);

      return {
        success: true,
        data: data.stats || data,
      };
    } catch (error) {
      console.error('❌ DashboardService: Error fetching stats:', error);
      return {
        success: true, // Don't fail the whole app for stats
        data: {
          totalRegisteredVoters: 0,
          totalVotesCast: 0,
          nonVoters: 0,
          turnoutPercentage: 0,
        },
      };
    }
  }
}

export const dashboardService = new DashboardService();

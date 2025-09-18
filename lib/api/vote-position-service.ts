/**
 * Vote Position API Service
 * Handles vote position tracking API calls
 */

import { API_BASE_URL } from '@/lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VotePositionData {
  statistics: {
    total_votes: number;
    registered_voters: number;
    non_voters: number;
  };
}

export interface UserVotePositionData {
  user: {
    id: string;
    name: string;
    voter_id: string;
    wallet_address: string;
  };
  vote: {
    position: number;
    timestamp: string;
    transaction_hash: string;
    blockchain_block_number: number;
    blockchain_gas_used: number;
    candidate_id: string;
    candidate_name?: string;
    candidate_party?: string;
  };
  geographic_data: {
    polling_unit: string;
    ward: string;
    lga: string;
    state: string;
  };
}

export interface VotePositionResponse {
  success: boolean;
  message: string;
  data?: VotePositionData;
}

export interface UserVotePositionResponse {
  success: boolean;
  message: string;
  data?: UserVotePositionData;
}

class VotePositionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Get token from storage or auth store
    const token = await this.getStoredToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async getStoredToken(): Promise<string> {
    // Get token from AsyncStorage
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token || '';
    } catch (error) {
      console.error('Error getting stored token:', error);
      return '';
    }
  }

  /**
   * Get vote position data for an election
   */
  async getVotePositionData(electionId: string): Promise<VotePositionResponse> {
    try {
      console.log('🔍 VotePositionService: Fetching vote position data for election:', electionId);
      console.log('🔍 VotePositionService: API URL:', `${this.baseUrl}/vote-position/${electionId}`);
      
      const headers = await this.getAuthHeaders();
      console.log('🔍 VotePositionService: Headers:', headers);
      
      const response = await fetch(`${this.baseUrl}/vote-position/${electionId}`, {
        method: 'GET',
        headers,
      });

      console.log('🔍 VotePositionService: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ VotePositionService: API error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch vote position data`);
      }
      
      const data = await response.json();
      console.log('🔍 VotePositionService: Response data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Backend returned unsuccessful response');
      }

      if (!data.data) {
        throw new Error('No data returned from backend');
      }

      // Transform the vote position data to match our interface
      const statistics = {
        total_votes: data.data?.statistics?.total_votes || 0,
        registered_voters: data.data?.statistics?.registered_voters || 0,
        non_voters: data.data?.statistics?.non_voters || 0,
        turnout_percentage: data.data?.statistics?.turnout_percentage || 0,
      };

      console.log('✅ VotePositionService: Transformed statistics:', statistics);

      return {
        success: true,
        message: 'Vote position data fetched successfully',
        data: { statistics },
      };
    } catch (error) {
      console.error('❌ VotePositionService.getVotePositionData error:', error);
      throw error; // Re-throw to be handled by caller
    }
  }

  /**
   * Get user's vote position data for an election
   */
  async getUserVotePositionData(electionId: string, userId: string): Promise<UserVotePositionResponse> {
    try {
      console.log('🔍 VotePositionService: Fetching user vote position data for election:', electionId, 'user:', userId);
      
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/vote-position/${electionId}/user/${userId}`, {
        method: 'GET',
        headers,
      });

      console.log('🔍 VotePositionService: User position response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            message: 'User has not voted in this election',
          };
        }
        const errorData = await response.json();
        console.error('❌ VotePositionService: User position API error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch user vote position data`);
      }

      const data = await response.json();
      console.log('🔍 VotePositionService: User position response data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Backend returned unsuccessful response for user data');
      }

      if (!data.data) {
        throw new Error('No user data returned from backend');
      }

      // Transform the data to ensure it has the correct structure
      const transformedData = {
        user: {
          id: data.data?.user?.id || userId,
          name: data.data?.user?.name || 'Unknown User',
          voter_id: data.data?.user?.voter_id || '',
          wallet_address: data.data?.user?.wallet_address || '',
        },
        vote: {
          position: data.data?.vote?.position || 0,
          timestamp: data.data?.vote?.timestamp || '',
          transaction_hash: data.data?.vote?.transaction_hash || '',
          blockchain_block_number: data.data?.vote?.blockchain_block_number || 0,
          blockchain_gas_used: data.data?.vote?.blockchain_gas_used || 0,
          candidate_id: data.data?.vote?.candidate_id || '',
          candidate_name: data.data?.vote?.candidate_name || '',
          candidate_party: data.data?.vote?.candidate_party || '',
        },
        geographic_data: {
          polling_unit: data.data?.geographic_data?.polling_unit || '',
          ward: data.data?.geographic_data?.ward || '',
          lga: data.data?.geographic_data?.lga || '',
          state: data.data?.geographic_data?.state || '',
        },
      };

      console.log('✅ VotePositionService: Transformed user data:', transformedData);

      return {
        success: true,
        message: 'User vote position data fetched successfully',
        data: transformedData,
      };
    } catch (error) {
      console.error('❌ VotePositionService.getUserVotePositionData error:', error);
      throw error; // Re-throw to be handled by caller
    }
  }

  /**
   * Get vote position data for a specific electoral level
   */
  async getVotePositionByLevel(electionId: string, level: string): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/vote-position/${electionId}/level/${level}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch level position data',
        };
      }

      return {
        success: true,
        message: 'Level position data fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('VotePositionService.getVotePositionByLevel error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get position tracking data for all levels
   */
  async getPositionTrackingData(electionId: string): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/position-tracking/${electionId}/levels`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch position tracking data',
        };
      }

      return {
        success: true,
        message: 'Position tracking data fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('VotePositionService.getPositionTrackingData error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get position data for a specific level with detailed statistics
   */
  async getLevelPositionData(
    electionId: string, 
    level: 'polling_unit' | 'ward' | 'lga' | 'state' | 'national'
  ): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/position-tracking/${electionId}/level/${level}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch level position data',
        };
      }

      return {
        success: true,
        message: 'Level position data fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('VotePositionService.getLevelPositionData error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get vote position statistics
   */
  async getVotePositionStats(electionId: string): Promise<VotePositionResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/vote-position/${electionId}/stats`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch vote position statistics',
        };
      }

      return {
        success: true,
        message: 'Vote position statistics fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('VotePositionService.getVotePositionStats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const votePositionService = new VotePositionService();
export default votePositionService;

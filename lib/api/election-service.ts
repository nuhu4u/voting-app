/**
 * Election API Service
 * Handles election-related API calls
 */

import { API_BASE_URL } from '@/lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Election {
  id: string;
  title: string;
  election_type: string;
  status: string;
  total_votes: number;
  start_date: string;
  end_date: string;
  description?: string;
  wallet_address?: string;
}

export interface ElectionResponse {
  success: boolean;
  message: string;
  data?: Election[];
}

class ElectionService {
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
   * Get all elections
   */
  async getElections(): Promise<ElectionResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/elections`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch elections',
        };
      }

      return {
        success: true,
        message: 'Elections fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('ElectionService.getElections error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get a specific election by ID
   */
  async getElectionById(electionId: string): Promise<ElectionResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/elections/${electionId}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch election',
        };
      }

      return {
        success: true,
        message: 'Election fetched successfully',
        data: [data.data], // Wrap in array for consistency
      };
    } catch (error) {
      console.error('ElectionService.getElectionById error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get active elections
   */
  async getActiveElections(): Promise<ElectionResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/elections/active`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch active elections',
        };
      }

      return {
        success: true,
        message: 'Active elections fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('ElectionService.getActiveElections error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const electionService = new ElectionService();
export default electionService;

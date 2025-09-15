import { API_BASE_URL } from '@/lib/config';

export interface ElectionData {
  _id: string;
  title: string;
  status: 'ONGOING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  total_votes: number;
  contestants: Array<{
    name: string;
    votes: number;
    party?: string;
    party_acronym?: string;
  }>;
}

export interface HomepageStats {
  total_registered_voters: number;
  total_polling_units: number;
  total_lgas: number;
  total_states: number;
  voter_growth_percentage: number;
}

export interface HomepageData {
  elections: ElectionData[];
  stats: HomepageStats;
  last_updated: string;
}

class HomepageService {
  private baseUrl = `${API_BASE_URL}/api/homepage`;

  async getHomepageData(): Promise<HomepageData> {
    try {
      const response = await fetch(`${this.baseUrl}/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      // Return mock data as fallback
      return this.getMockData();
    }
  }

  async getActiveElections(): Promise<ElectionData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/elections/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.elections || [];
    } catch (error) {
      console.error('Error fetching active elections:', error);
      return this.getMockElections();
    }
  }

  async getElectionStats(): Promise<HomepageStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching election stats:', error);
      return this.getMockStats();
    }
  }

  private getMockData(): HomepageData {
    return {
      elections: this.getMockElections(),
      stats: this.getMockStats(),
      last_updated: new Date().toISOString(),
    };
  }

  private getMockElections(): ElectionData[] {
    return [
      {
        _id: '1',
        title: 'Senatorial Election 2025',
        status: 'ONGOING',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_votes: 0,
        contestants: [
          { name: 'Adebayo Ogundimu', votes: 0, party: 'APC', party_acronym: 'APC' },
          { name: 'Sarah Johnson', votes: 0, party: 'PDP', party_acronym: 'PDP' },
          { name: 'Michael Adebayo', votes: 0, party: 'LP', party_acronym: 'LP' },
          { name: 'Fatima Ibrahim', votes: 0, party: 'NNPP', party_acronym: 'NNPP' }
        ]
      },
      {
        _id: '2',
        title: 'Governorship Election 2025',
        status: 'ONGOING',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_votes: 3,
        contestants: [
          { name: 'Adebayo Ogundimu', votes: 2, party: 'APC', party_acronym: 'APC' },
          { name: 'Sarah Johnson', votes: 1, party: 'PDP', party_acronym: 'PDP' },
          { name: 'Michael Adebayo', votes: 0, party: 'LP', party_acronym: 'LP' },
          { name: 'Fatima Ibrahim', votes: 0, party: 'NNPP', party_acronym: 'NNPP' }
        ]
      }
    ];
  }

  private getMockStats(): HomepageStats {
    return {
      total_registered_voters: 84004084,
      total_polling_units: 176846,
      total_lgas: 774,
      total_states: 37, // 36 states + FCT
      voter_growth_percentage: 2.1,
    };
  }
}

export const homepageService = new HomepageService();

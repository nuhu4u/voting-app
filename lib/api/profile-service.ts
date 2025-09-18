/**
 * Profile API Service
 * Handles profile-related API calls
 */

import { API_BASE_URL } from '@/lib/config';
import { User } from '@/types/auth';

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  nin?: string;
  address?: string;
  state_id?: string;
  lga_id?: string;
  ward_id?: string;
  polling_unit_id?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
}

export interface ProfileStats {
  totalVotes: number;
  electionsParticipated: number;
  accountAge: number;
  lastLogin: string;
  verificationScore: number;
  profileCompleteness: number;
}

export interface ProfileStatsResponse {
  success: boolean;
  message: string;
  data?: ProfileStats;
}

class ProfileService {
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
    // This would typically get the token from AsyncStorage or auth store
    // For now, we'll return a placeholder
    return 'your-token-here';
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch profile',
        };
      }

      return {
        success: true,
        message: 'Profile fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('ProfileService.getProfile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: ProfileUpdateData): Promise<ProfileResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to update profile',
        };
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('ProfileService.updateProfile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(): Promise<ProfileStatsResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile/stats`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to fetch profile stats',
        };
      }

      return {
        success: true,
        message: 'Profile stats fetched successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('ProfileService.getProfileStats error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(imageUri: string): Promise<{ success: boolean; message: string; imageUrl?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await fetch(`${this.baseUrl}/profile/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': headers.Authorization,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to upload image',
        };
      }

      return {
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: data.data.imageUrl,
      };
    } catch (error) {
      console.error('ProfileService.uploadProfileImage error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to change password',
        };
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('ProfileService.changePassword error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Download profile data
   */
  async downloadProfile(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/profile/export`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Failed to download profile',
        };
      }

      return {
        success: true,
        message: 'Profile data downloaded successfully',
        data: data.data,
      };
    } catch (error) {
      console.error('ProfileService.downloadProfile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const profileService = new ProfileService();
export default profileService;

/**
 * Biometric Service
 * Handles biometric registration and verification for mobile app
 */

import { apiConfig } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';

export interface BiometricRegistrationData {
  fingerprintData: string;
  consent: boolean;
}

export interface BiometricVerificationData {
  fingerprintData: string;
  electionId: string;
}

export interface BiometricStatus {
  biometric_registered: boolean;
  biometric_status: 'pending' | 'registered' | 'locked' | 'disabled';
  biometric_registered_at: string | null;
  biometric_consent: boolean;
  biometric_failed_attempts: number;
}

export interface BiometricResponse {
  success: boolean;
  message: string;
  data?: any;
}

class BiometricService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Register user's biometric fingerprint
   */
  async registerBiometric(data: BiometricRegistrationData): Promise<BiometricResponse> {
    try {
      console.log('🔐 Registering biometric...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/biometric/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: Failed to register biometric`);
      }

      console.log('✅ Biometric registered successfully');
      return result;
    } catch (error) {
      console.error('❌ BiometricService.registerBiometric error:', error);
      throw error;
    }
  }

  /**
   * Verify biometric for voting
   */
  async verifyBiometric(data: BiometricVerificationData): Promise<BiometricResponse> {
    try {
      console.log('🔐 Verifying biometric for voting...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/biometric/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: Failed to verify biometric`);
      }

      console.log('✅ Biometric verified successfully');
      return result;
    } catch (error) {
      console.error('❌ BiometricService.verifyBiometric error:', error);
      throw error;
    }
  }

  /**
   * Get biometric registration status
   */
  async getBiometricStatus(): Promise<BiometricStatus> {
    try {
      console.log('🔍 Getting biometric status...');
      
      const response = await fetch(`${this.baseUrl}/biometric/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: Failed to get biometric status`);
      }

      console.log('✅ Biometric status retrieved:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ BiometricService.getBiometricStatus error:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate fingerprints
   */
  async checkDuplicateFingerprint(fingerprintData: string): Promise<{ is_duplicate: boolean; fingerprint_hash: string }> {
    try {
      console.log('🔍 Checking for duplicate fingerprint...');
      
      const response = await fetch(`${this.baseUrl}/biometric/check-duplicate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ fingerprintData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: Failed to check duplicate fingerprint`);
      }

      console.log('✅ Duplicate check completed:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ BiometricService.checkDuplicateFingerprint error:', error);
      throw error;
    }
  }
}

export const biometricService = new BiometricService();

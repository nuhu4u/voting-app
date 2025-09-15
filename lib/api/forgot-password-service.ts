/**
 * Forgot Password API Service
 * Handles password reset flow
 */

import { authService } from './auth-service';

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

class ForgotPasswordService {
  /**
   * Send OTP to email for password reset
   */
  async sendOtp(email: string) {
    return authService.forgotPassword(email);
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, otp: string) {
    // In a real implementation, this would verify the OTP
    // For now, we'll simulate verification
    return new Promise((resolve) => {
      setTimeout(() => {
        if (otp === '123456') {
          resolve({
            success: true,
            message: 'OTP verified successfully',
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid OTP code',
          });
        }
      }, 1000);
    });
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(data: ResetPasswordData) {
    return authService.resetPassword(data.email, data.otp, data.newPassword);
  }

  /**
   * Resend OTP
   */
  async resendOtp(email: string) {
    return authService.forgotPassword(email);
  }
}

// Export singleton instance
export const forgotPasswordService = new ForgotPasswordService();
export default forgotPasswordService;

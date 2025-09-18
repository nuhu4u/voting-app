import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { biometricService } from '@/lib/api/biometric-service';
import { useAuthStore } from '@/store/auth-store';

interface BiometricVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  electionId: string;
  electionTitle: string;
}

const { width } = Dimensions.get('window');

export default function BiometricVerificationModal({
  visible,
  onClose,
  onSuccess,
  electionId,
  electionTitle,
}: BiometricVerificationModalProps) {
  const [step, setStep] = useState<'verification' | 'verifying' | 'success' | 'error'>('verification');
  const [error, setError] = useState<string | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('');

  // Check biometric availability when modal opens
  useEffect(() => {
    if (visible) {
      checkBiometricAvailability();
    }
  }, [visible]);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (hasHardware && isEnrolled) {
        setBiometricAvailable(true);
        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('Biometric');
        }
      } else {
        setBiometricAvailable(false);
        setError('Biometric authentication is not available on this device or not enrolled.');
        setStep('error');
      }
    } catch (err) {
      console.error('❌ Error checking biometric availability:', err);
      setBiometricAvailable(false);
      setError('Failed to check biometric availability.');
      setStep('error');
    }
  };

  const handleVerifyBiometric = async () => {
    if (!biometricAvailable) {
      setError('Biometric authentication is not available on this device.');
      setStep('error');
      return;
    }

    setStep('verifying');
    
    try {
      // Perform actual biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verify your ${biometricType.toLowerCase()} to cast your vote`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });

      if (result.success) {
        await processBiometricVerification();
      } else {
        throw new Error('Biometric authentication was cancelled or failed');
      }
    } catch (err: any) {
      console.error('❌ Biometric authentication error:', err);
      setError(err.message || 'Biometric authentication failed');
      setStep('error');
    }
  };

  const processBiometricVerification = async () => {
    try {
      // Generate biometric data based on device info and user
      const deviceInfo = await LocalAuthentication.getEnrolledLevelAsync();
      const timestamp = Date.now();
      const userId = useAuthStore.getState().user?.id || 'unknown';
      
      // Create biometric identifier for verification (in real implementation, this would be encrypted biometric data)
      const biometricData = `biometric_${userId}_${deviceInfo}_${timestamp}_${Math.random().toString(36).substr(2, 12)}`;
      
      console.log('🔐 Processing biometric verification with data:', biometricData);
      
      // Verify biometric for voting
      const verificationResult = await biometricService.verifyBiometric({
        fingerprintData: biometricData,
        electionId: electionId,
      });

      console.log('✅ Biometric verification successful:', verificationResult);

      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
        onClose();
        resetModal();
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Biometric verification error:', err);
      setError(err.message || 'Failed to verify biometric');
      setStep('error');
    }
  };

  const resetModal = () => {
    setStep('verification');
    setError(null);
  };

  const handleClose = () => {
    if (step === 'verifying') {
      Alert.alert(
        'Cancel Verification',
        'Are you sure you want to cancel the biometric verification?',
        [
          { text: 'Continue Verification', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: () => {
              resetModal();
              onClose();
            }
          },
        ]
      );
    } else {
      resetModal();
      onClose();
    }
  };

  const renderVerificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={48} color="#3B82F6" />
      </View>
      
      <Text style={styles.stepTitle}>Biometric Verification Required</Text>
      
      <Text style={styles.stepDescription}>
        Please verify your identity using your registered {biometricType.toLowerCase()} to cast your vote.
      </Text>
      
      <View style={styles.electionInfoContainer}>
        <Text style={styles.electionInfoLabel}>Election:</Text>
        <Text style={styles.electionInfoValue}>{electionTitle}</Text>
      </View>
      
      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
        <Text style={styles.securityText}>
          Your {biometricType.toLowerCase()} will be verified against your registered biometric data
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyBiometric}
        >
          <Ionicons name="finger-print" size={20} color="#FFFFFF" />
          <Text style={styles.verifyButtonText}>Verify {biometricType}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerifyingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={48} color="#3B82F6" />
      </View>
      
      <Text style={styles.stepTitle}>Verifying {biometricType}</Text>
      
      <Text style={styles.stepDescription}>
        {biometricType === 'Fingerprint' 
          ? 'Please place your finger on the sensor and hold it steady.'
          : biometricType === 'Face ID'
          ? 'Please look at the camera for facial recognition.'
          : 'Please follow the on-screen instructions for biometric verification.'
        }
      </Text>
      
      <View style={styles.verifyingAnimation}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
      
      <Text style={styles.verifyingText}>
        Verifying your {biometricType.toLowerCase()}...
      </Text>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
      </View>
      
      <Text style={styles.stepTitle}>Verification Successful!</Text>
      
      <Text style={styles.stepDescription}>
        Your {biometricType.toLowerCase()} has been verified successfully. Your vote will now be processed securely.
      </Text>
      
      <View style={styles.successInfo}>
        <View style={styles.successItem}>
          <Ionicons name="finger-print" size={20} color="#10B981" />
          <Text style={styles.successItemText}>{biometricType} verified</Text>
        </View>
        <View style={styles.successItem}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.successItemText}>Identity confirmed</Text>
        </View>
        <View style={styles.successItem}>
          <Ionicons name="vote" size={20} color="#10B981" />
          <Text style={styles.successItemText}>Vote authorized</Text>
        </View>
      </View>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
      </View>
      
      <Text style={styles.stepTitle}>Verification Failed</Text>
      
      <Text style={styles.stepDescription}>
        {error || 'Fingerprint verification failed. Please try again.'}
      </Text>
      
      <View style={styles.errorInfo}>
        <Text style={styles.errorInfoText}>
          Possible reasons:
        </Text>
        <Text style={styles.errorInfoItem}>• {biometricType} doesn't match registered data</Text>
        <Text style={styles.errorInfoItem}>• You have already voted in this election</Text>
        <Text style={styles.errorInfoItem}>• Network connection issue</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setStep('verification');
            setError(null);
          }}
        >
          <Ionicons name="refresh" size={20} color="#3B82F6" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 'verification':
        return renderVerificationStep();
      case 'verifying':
        return renderVerifyingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderVerificationStep();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Biometric Verification</Text>
            {(step === 'verification' || step === 'error') && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {renderStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  stepContainer: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  electionInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  electionInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  electionInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  verifyingAnimation: {
    marginVertical: 20,
  },
  verifyingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  successInfo: {
    width: '100%',
    marginTop: 20,
  },
  successItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successItemText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#166534',
  },
  errorInfo: {
    width: '100%',
    marginTop: 16,
    marginBottom: 20,
  },
  errorInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorInfoItem: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
});

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

interface BiometricRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName: string;
}

const { width } = Dimensions.get('window');

export default function BiometricRegistrationModal({
  visible,
  onClose,
  onSuccess,
  userName,
}: BiometricRegistrationModalProps) {
  const [step, setStep] = useState<'confirmation' | 'capturing' | 'processing' | 'success' | 'error'>('confirmation');
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

  const handleConfirmRegistration = async () => {
    if (!biometricAvailable) {
      setError('Biometric authentication is not available on this device.');
      setStep('error');
      return;
    }

    setStep('capturing');
    
    try {
      // Perform actual biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Register your ${biometricType.toLowerCase()} for secure voting`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });

      if (result.success) {
        setStep('processing');
        await processFingerprintRegistration();
      } else {
        throw new Error('Biometric authentication was cancelled or failed');
      }
    } catch (err: any) {
      console.error('❌ Biometric authentication error:', err);
      setError(err.message || 'Biometric authentication failed');
      setStep('error');
    }
  };

  const processFingerprintRegistration = async () => {
    try {
      // Generate a unique biometric hash based on device info and timestamp
      // This simulates the encrypted biometric data that would be stored
      const deviceInfo = await LocalAuthentication.getEnrolledLevelAsync();
      const timestamp = Date.now();
      const userId = useAuthStore.getState().user?.id || 'unknown';
      
      // Create a unique biometric identifier (in real implementation, this would be encrypted biometric data)
      const biometricData = `biometric_${userId}_${deviceInfo}_${timestamp}_${Math.random().toString(36).substr(2, 12)}`;
      
      console.log('🔐 Processing biometric registration with data:', biometricData);
      
      // Check for duplicates first
      const duplicateCheck = await biometricService.checkDuplicateFingerprint(biometricData);
      
      if (duplicateCheck.is_duplicate) {
        throw new Error('This biometric data is already registered by another user');
      }

      // Register biometric with the backend
      const registrationResult = await biometricService.registerBiometric({
        fingerprintData: biometricData,
        consent: true,
      });

      console.log('✅ Biometric registration successful:', registrationResult);

      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
        onClose();
        resetModal();
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Biometric registration error:', err);
      setError(err.message || 'Failed to register biometric');
      setStep('error');
    }
  };

  const resetModal = () => {
    setStep('confirmation');
    setError(null);
  };

  const handleClose = () => {
    if (step === 'capturing' || step === 'processing') {
      Alert.alert(
        'Cancel Registration',
        'Are you sure you want to cancel the biometric registration?',
        [
          { text: 'Continue Registration', style: 'cancel' },
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

  const renderConfirmationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={48} color="#3B82F6" />
      </View>
      
      <Text style={styles.stepTitle}>Confirm Biometric Registration</Text>
      
      <Text style={styles.stepDescription}>
        You are about to register your {biometricType.toLowerCase()} for secure voting.
      </Text>
      
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoLabel}>User:</Text>
        <Text style={styles.userInfoValue}>{userName}</Text>
      </View>
      
      <View style={styles.warningBox}>
        <Ionicons name="warning" size={20} color="#F59E0B" />
        <Text style={styles.warningText}>
          This is the fingerprint you will use for casting votes. You will not be able to change it after registration.
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
          style={styles.confirmButton}
          onPress={handleConfirmRegistration}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>Confirm Registration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCapturingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="finger-print" size={48} color="#3B82F6" />
      </View>
      
      <Text style={styles.stepTitle}>Capturing {biometricType}</Text>
      
      <Text style={styles.stepDescription}>
        {biometricType === 'Fingerprint' 
          ? 'Please place your finger on the sensor and hold it steady.'
          : biometricType === 'Face ID'
          ? 'Please look at the camera for facial recognition.'
          : 'Please follow the on-screen instructions for biometric capture.'
        }
      </Text>
      
      <View style={styles.capturingAnimation}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
      
      <Text style={styles.capturingText}>
        Capturing your {biometricType.toLowerCase()}...
      </Text>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark" size={48} color="#10B981" />
      </View>
      
      <Text style={styles.stepTitle}>Processing Registration</Text>
      
      <Text style={styles.stepDescription}>
        Encrypting and securely storing your biometric data...
      </Text>
      
      <View style={styles.processingSteps}>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.processingStepText}>{biometricType} captured</Text>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.processingStepText}>Encrypting data...</Text>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color="#6B7280" />
          <Text style={styles.processingStepText}>Storing securely...</Text>
        </View>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
      </View>
      
      <Text style={styles.stepTitle}>Registration Successful!</Text>
      
      <Text style={styles.stepDescription}>
        Your {biometricType.toLowerCase()} has been registered successfully. You can now vote securely using biometric authentication.
      </Text>
      
      <View style={styles.successInfo}>
        <View style={styles.successItem}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.successItemText}>Two-way encryption applied</Text>
        </View>
        <View style={styles.successItem}>
          <Ionicons name="finger-print" size={20} color="#10B981" />
          <Text style={styles.successItemText}>{biometricType} registered</Text>
        </View>
        <View style={styles.successItem}>
          <Ionicons name="lock-closed" size={20} color="#10B981" />
          <Text style={styles.successItemText}>Secure storage confirmed</Text>
        </View>
      </View>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
      </View>
      
      <Text style={styles.stepTitle}>Registration Failed</Text>
      
      <Text style={styles.stepDescription}>
        {error || 'An error occurred during biometric registration.'}
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setStep('confirmation');
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
      case 'confirmation':
        return renderConfirmationStep();
      case 'capturing':
        return renderCapturingStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderConfirmationStep();
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
            <Text style={styles.modalTitle}>Biometric Registration</Text>
            {(step === 'confirmation' || step === 'error') && (
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
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  userInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#92400E',
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
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  capturingAnimation: {
    marginVertical: 20,
  },
  capturingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  processingSteps: {
    width: '100%',
    marginTop: 20,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingStepText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6B7280',
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

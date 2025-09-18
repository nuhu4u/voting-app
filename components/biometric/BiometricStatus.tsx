import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { biometricService, BiometricStatus } from '@/lib/api/biometric-service';

interface BiometricStatusProps {
  onStatusChange?: (status: BiometricStatus) => void;
  onRegisterPress?: () => void;
}

export default function BiometricStatusComponent({ onStatusChange, onRegisterPress }: BiometricStatusProps) {
  const [status, setStatus] = useState<BiometricStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const biometricStatus = await biometricService.getBiometricStatus();
      setStatus(biometricStatus);
      onStatusChange?.(biometricStatus);
    } catch (err: any) {
      console.error('❌ Error loading biometric status:', err);
      setError(err.message || 'Failed to load biometric status');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBiometric = () => {
    if (onRegisterPress) {
      onRegisterPress();
    } else {
      Alert.alert(
        '🔐 Register Biometric Fingerprint',
        'This will register your fingerprint for secure voting. You will only be able to vote using this fingerprint. Do you want to proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Register',
            style: 'default',
            onPress: () => {
              // This will be handled by the parent component
              console.log('User confirmed biometric registration');
            },
          },
        ]
      );
    }
  };

  const getStatusIcon = () => {
    if (loading) return 'hourglass-outline';
    if (error) return 'alert-circle-outline';
    if (status?.biometric_registered) return 'checkmark-circle';
    return 'finger-print-outline';
  };

  const getStatusColor = () => {
    if (loading) return '#6B7280';
    if (error) return '#EF4444';
    if (status?.biometric_registered) return '#10B981';
    return '#F59E0B';
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error loading status';
    if (status?.biometric_registered) return 'Authorized to Vote';
    return 'Pending Registration';
  };

  const getStatusDescription = () => {
    if (loading) return 'Checking biometric status...';
    if (error) return 'Unable to load biometric status';
    if (status?.biometric_registered) {
      return `Registered on ${status.biometric_registered_at ? new Date(status.biometric_registered_at).toLocaleDateString() : 'Unknown date'}`;
    }
    return 'Biometric fingerprint required for voting';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="finger-print" size={24} color="#3B82F6" />
          <Text style={styles.title}>Biometric Security</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading biometric status...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Warning Message */}
      {!status?.biometric_registered && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text style={styles.warningText}>
            ⚠️ Important: You must register your fingerprint to vote in elections
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="finger-print" size={24} color="#3B82F6" />
        <Text style={styles.title}>Biometric Security</Text>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <Ionicons 
              name={getStatusIcon()} 
              size={32} 
              color={getStatusColor()} 
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            <Text style={styles.statusDescription}>
              {getStatusDescription()}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {!status?.biometric_registered && (
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterBiometric}
          >
            <Ionicons name="finger-print" size={20} color="#FFFFFF" />
            <Text style={styles.registerButtonText}>Register Fingerprint</Text>
          </TouchableOpacity>
        )}

        {/* Success Message */}
        {status?.biometric_registered && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.successText}>
              Your fingerprint is registered and you can vote securely
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadBiometricStatus}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>🔒 Security Features</Text>
        <Text style={styles.securityText}>
          • Two-way encryption (RSA-2048 + AES-256-GCM)
        </Text>
        <Text style={styles.securityText}>
          • Duplicate fingerprint prevention
        </Text>
        <Text style={styles.securityText}>
          • One-time registration only
        </Text>
        <Text style={styles.securityText}>
          • Required for all voting operations
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  successText: {
    flex: 1,
    marginLeft: 8,
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  securityInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
});

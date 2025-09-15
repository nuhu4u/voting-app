import React, { useState } from 'react';
import { View, Text, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Loading } from '@/components/ui';
import { Contestant, Election } from '@/types/election';
import { formatDateTime } from '@/lib/utils';

interface VoteConfirmationProps {
  election: Election;
  candidate: Contestant;
  onConfirm: () => void;
  onCancel: () => void;
  isVisible: boolean;
  isLoading?: boolean;
}

export function VoteConfirmation({
  election,
  candidate,
  onConfirm,
  onCancel,
  isVisible,
  isLoading = false
}: VoteConfirmationProps) {
  const handleConfirm = () => {
    Alert.alert(
      'Confirm Vote',
      `Are you sure you want to vote for ${candidate.name} in ${election.title}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Vote', style: 'default', onPress: onConfirm }
      ]
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="person" size={32} color="#3b82f6" />
            </View>
            
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Your Vote
            </Text>
            <Text className="text-gray-600 text-center">
              Please review your selection before submitting
            </Text>
          </View>

          {/* Election Info */}
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="font-medium text-gray-900 mb-2">
              {election.title}
            </Text>
            <Text className="text-sm text-gray-600">
              {election.description}
            </Text>
          </View>

          {/* Candidate Info */}
          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <View className="flex-row items-center space-x-3">
              <View className="w-12 h-12 bg-blue-200 rounded-full items-center justify-center">
                <Text className="text-lg font-semibold text-blue-800">
                  {candidate.name.charAt(0)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {candidate.name}
                </Text>
                <Text className="text-sm text-gray-600">
                  {candidate.party} ({candidate.party_acronym})
                </Text>
                <Text className="text-sm text-gray-500">
                  {candidate.position}
                </Text>
              </View>
            </View>
          </View>

          {/* Vote Details */}
          <View className="space-y-2 mb-6">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Vote Date</Text>
              <Text className="font-medium text-gray-900">
                {formatDateTime(new Date().toISOString())}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Election Type</Text>
              <Text className="font-medium text-gray-900">
                {election.election_type}
              </Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Status</Text>
              <Text className="font-medium text-green-600">
                {election.status}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            <Button
              onPress={handleConfirm}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <Loading text="Processing..." />
                </View>
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Confirm Vote</Text>
                </View>
              )}
            </Button>
            
            <Button
              onPress={onCancel}
              variant="outline"
              disabled={isLoading}
              className="w-full"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </Button>
          </View>

          {/* Security Notice */}
          <View className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <View className="flex-row items-start space-x-2">
              <Ionicons name="shield-checkmark" size={16} color="#f59e0b" />
              <Text className="text-xs text-yellow-800 flex-1">
                Your vote is encrypted and secure. Once submitted, it cannot be changed.
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

interface BiometricConfirmationProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  candidateName: string;
}

export function BiometricConfirmation({
  visible,
  onSuccess,
  onCancel,
  candidateName
}: BiometricConfirmationProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    
    // Simulate biometric authentication
    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess();
    }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="finger-print" size={32} color="#10b981" />
            </View>
            
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Biometric Authentication
            </Text>
            <Text className="text-gray-600 text-center">
              Use your fingerprint or face to confirm your vote for {candidateName}
            </Text>
          </View>

          {isAuthenticating ? (
            <View className="items-center py-4">
              <Loading text="Authenticating..." />
            </View>
          ) : (
            <View className="space-y-3">
              <Button onPress={handleAuthenticate} className="w-full">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="finger-print" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Authenticate</Text>
                </View>
              </Button>
              
              <Button onPress={onCancel} variant="outline" className="w-full">
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </Button>
            </View>
          )}
        </Card>
      </View>
    </Modal>
  );
}

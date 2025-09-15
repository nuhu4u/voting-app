import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading } from '@/components/ui';

interface VotingProgressProps {
  step: 'validating' | 'encrypting' | 'submitting' | 'confirming' | 'complete' | 'error';
  message?: string;
  progress?: number;
  error?: string;
  onComplete?: () => void;
}

export function VotingProgress({ 
  step, 
  message, 
  progress = 0, 
  error, 
  onComplete 
}: VotingProgressProps) {
  const [animatedProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();

    if (step === 'complete' && onComplete) {
      setTimeout(onComplete, 2000);
    }
  }, [progress, step, onComplete]);

  const getStepInfo = () => {
    switch (step) {
      case 'validating':
        return {
          icon: 'checkmark-circle',
          color: '#3b82f6',
          title: 'Validating Vote',
          description: 'Verifying your eligibility and vote data...'
        };
      case 'encrypting':
        return {
          icon: 'lock-closed',
          color: '#8b5cf6',
          title: 'Encrypting Vote',
          description: 'Securing your vote with encryption...'
        };
      case 'submitting':
        return {
          icon: 'cloud-upload',
          color: '#f59e0b',
          title: 'Submitting Vote',
          description: 'Sending your vote to the blockchain...'
        };
      case 'confirming':
        return {
          icon: 'shield-checkmark',
          color: '#10b981',
          title: 'Confirming Vote',
          description: 'Waiting for blockchain confirmation...'
        };
      case 'complete':
        return {
          icon: 'checkmark-circle',
          color: '#10b981',
          title: 'Vote Complete',
          description: 'Your vote has been successfully recorded!'
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          title: 'Vote Failed',
          description: error || 'An error occurred while processing your vote.'
        };
      default:
        return {
          icon: 'hourglass',
          color: '#6b7280',
          title: 'Processing',
          description: 'Please wait...'
        };
    }
  };

  const stepInfo = getStepInfo();
  const isComplete = step === 'complete';
  const isError = step === 'error';

  return (
    <Card className="p-6">
      <View className="items-center">
        {/* Icon */}
        <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
          isComplete ? 'bg-green-100' : isError ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          <Ionicons 
            name={stepInfo.icon as any} 
            size={32} 
            color={stepInfo.color} 
          />
        </View>

        {/* Title */}
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          {stepInfo.title}
        </Text>

        {/* Description */}
        <Text className="text-gray-600 text-center mb-6">
          {message || stepInfo.description}
        </Text>

        {/* Progress Bar */}
        {!isComplete && !isError && (
          <View className="w-full mb-4">
            <View className="w-full bg-gray-200 rounded-full h-2">
              <Animated.View
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: animatedProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                }}
              />
            </View>
            <Text className="text-sm text-gray-500 text-center mt-2">
              {Math.round(progress)}% complete
            </Text>
          </View>
        )}

        {/* Loading Spinner */}
        {!isComplete && !isError && (
          <Loading text="Processing..." />
        )}

        {/* Success Message */}
        {isComplete && (
          <View className="items-center">
            <Text className="text-green-600 font-medium text-center">
              Your vote has been successfully recorded and is now part of the blockchain.
            </Text>
          </View>
        )}

        {/* Error Message */}
        {isError && (
          <View className="items-center">
            <Text className="text-red-600 font-medium text-center mb-4">
              {error || 'An error occurred while processing your vote.'}
            </Text>
            <Text className="text-sm text-gray-500 text-center">
              Please try again or contact support if the problem persists.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

interface VotingStepsProps {
  currentStep: number;
  steps: string[];
  className?: string;
}

export function VotingSteps({ currentStep, steps, className }: VotingStepsProps) {
  return (
    <View className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        // const isUpcoming = index > currentStep;

        return (
          <View key={index} className="flex-row items-center space-x-4">
            {/* Step Number */}
            <View className={`w-8 h-8 rounded-full items-center justify-center ${
              isCompleted 
                ? 'bg-green-500' 
                : isActive 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
            }`}>
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text className={`text-sm font-medium ${
                  isActive ? 'text-white' : 'text-gray-600'
                }`}>
                  {index + 1}
                </Text>
              )}
            </View>

            {/* Step Text */}
            <Text className={`flex-1 ${
              isCompleted 
                ? 'text-green-600 font-medium' 
                : isActive 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-500'
            }`}>
              {step}
            </Text>

            {/* Status Icon */}
            {isActive && (
              <Ionicons name="hourglass" size={16} color="#3b82f6" />
            )}
          </View>
        );
      })}
    </View>
  );
}

interface VoteStatusProps {
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  className?: string;
}

export function VoteStatus({ 
  status, 
  transactionHash, 
  blockNumber, 
  className 
}: VoteStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: 'time',
          color: '#f59e0b',
          text: 'Vote Pending',
          description: 'Your vote is waiting to be processed'
        };
      case 'processing':
        return {
          icon: 'sync',
          color: '#3b82f6',
          text: 'Processing Vote',
          description: 'Your vote is being processed on the blockchain'
        };
      case 'confirmed':
        return {
          icon: 'checkmark-circle',
          color: '#10b981',
          text: 'Vote Confirmed',
          description: 'Your vote has been confirmed on the blockchain'
        };
      case 'failed':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          text: 'Vote Failed',
          description: 'Your vote could not be processed'
        };
      default:
        return {
          icon: 'help-circle',
          color: '#6b7280',
          text: 'Unknown Status',
          description: 'Status unknown'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`p-4 ${className}`}>
      <View className="flex-row items-center space-x-3">
        <View className={`w-10 h-10 rounded-full items-center justify-center ${
          status === 'confirmed' ? 'bg-green-100' : 
          status === 'failed' ? 'bg-red-100' : 
          'bg-blue-100'
        }`}>
          <Ionicons 
            name={statusInfo.icon as any} 
            size={20} 
            color={statusInfo.color} 
          />
        </View>
        
        <View className="flex-1">
          <Text className={`font-medium ${
            status === 'confirmed' ? 'text-green-600' : 
            status === 'failed' ? 'text-red-600' : 
            'text-blue-600'
          }`}>
            {statusInfo.text}
          </Text>
          <Text className="text-sm text-gray-600">
            {statusInfo.description}
          </Text>
          
          {transactionHash && (
            <Text className="text-xs text-gray-500 mt-1">
              TX: {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
            </Text>
          )}
          
          {blockNumber && (
            <Text className="text-xs text-gray-500">
              Block: {blockNumber}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}

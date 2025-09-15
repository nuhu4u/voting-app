import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'large', 
  color = '#3b82f6', 
  text, 
  className 
}: LoadingProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-4', className)}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="mt-4 text-gray-600 text-center text-sm">
          {text}
        </Text>
      )}
    </View>
  );
}

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 20, 
  color = '#3b82f6', 
  className 
}: LoadingSpinnerProps) {
  return (
    <View className={cn('items-center justify-center', className)}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

interface LoadingSkeletonProps {
  width?: number;
  height?: number;
  className?: string;
}

export function LoadingSkeleton({ 
  width = 200, 
  height = 20, 
  className 
}: LoadingSkeletonProps) {
  return (
    <View 
      className={cn('bg-gray-200 rounded animate-pulse', className)}
      style={{ width, height }}
    />
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  className?: string;
}

export function LoadingOverlay({ 
  visible, 
  text = 'Loading...', 
  className 
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View className={cn(
      'absolute inset-0 bg-black/50 items-center justify-center z-50',
      className
    )}>
      <View className="bg-white rounded-lg p-6 items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-800 font-medium">
          {text}
        </Text>
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function Error({ message, onRetry, className }: ErrorProps) {
  return (
    <View className={cn('flex-1 items-center justify-center p-4', className)}>
      <Ionicons name="alert-circle" size={48} color="#ef4444" />
      <Text className="mt-4 text-red-600 text-center text-lg font-medium">
        Error
      </Text>
      <Text className="mt-2 text-gray-600 text-center text-sm">
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-4 bg-red-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export function ErrorBanner({ 
  message, 
  onDismiss, 
  type = 'error',
  className 
}: ErrorBannerProps) {
  const colors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const iconNames = {
    error: 'alert-circle' as const,
    warning: 'warning' as const,
    info: 'information-circle' as const,
  };

  return (
    <View className={cn(
      'flex-row items-center p-4 border rounded-lg',
      colors[type],
      className
    )}>
      <Ionicons 
        name={iconNames[type]} 
        size={20} 
        color={type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'} 
      />
      <Text className={cn('flex-1 ml-3 text-sm font-medium', textColors[type])}>
        {message}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} className="ml-2">
          <Ionicons name="close" size={20} color="#6b7280" />
        </Pressable>
      )}
    </View>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false });
  };

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || Error;
      return <FallbackComponent message={this.state.error?.message || 'An error occurred'} {...(this.state.error && { error: this.state.error })} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

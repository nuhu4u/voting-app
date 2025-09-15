import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-200 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base',
  };

  return (
    <View
      className={cn(
        'rounded-full items-center justify-center',
        variants[variant],
        sizes[size],
        className
      )}
    >
      <Text className={cn(
        'font-medium',
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      )}>
        {children}
      </Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'pending' | 'success' | 'failed';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    upcoming: { variant: 'info' as const, text: 'Upcoming' },
    ongoing: { variant: 'success' as const, text: 'Ongoing' },
    completed: { variant: 'default' as const, text: 'Completed' },
    cancelled: { variant: 'destructive' as const, text: 'Cancelled' },
    pending: { variant: 'warning' as const, text: 'Pending' },
    success: { variant: 'success' as const, text: 'Success' },
    failed: { variant: 'destructive' as const, text: 'Failed' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} {...(className && { className })}>
      {config.text}
    </Badge>
  );
}

interface ElectionTypeBadgeProps {
  type: 'PRESIDENTIAL' | 'GUBERNATORIAL' | 'HOUSE_OF_ASSEMBLY' | 'SENATORIAL' | 'HOUSE_OF_REPS' | 'LOCAL_GOVERNMENT';
  className?: string;
}

export function ElectionTypeBadge({ type, className }: ElectionTypeBadgeProps) {
  const typeLabels = {
    PRESIDENTIAL: 'Presidential',
    GUBERNATORIAL: 'Gubernatorial',
    HOUSE_OF_ASSEMBLY: 'House of Assembly',
    SENATORIAL: 'Senatorial',
    HOUSE_OF_REPS: 'House of Reps',
    LOCAL_GOVERNMENT: 'Local Government',
  };

  return (
    <Badge variant="secondary" {...(className && { className })}>
      {typeLabels[type]}
    </Badge>
  );
}

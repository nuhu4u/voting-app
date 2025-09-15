import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  width?: number;
  height?: number;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({
  width = 200,
  height = 20,
  className,
  rounded = true,
}: SkeletonProps) {
  return (
    <View
      className={cn(
        'bg-gray-200 animate-pulse',
        rounded && 'rounded',
        className
      )}
      style={{ width, height }}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
}: SkeletonTextProps) {
  return (
    <View className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? 150 : 200}
          {...(lineClassName && { className: lineClassName })}
        />
      ))}
    </View>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <View className={cn('bg-white p-4 rounded-lg border border-gray-200', className)}>
      <View className="flex-row items-center space-x-3 mb-4">
        <Skeleton width={40} height={40} className="rounded-full" />
        <View className="flex-1">
          <Skeleton height={16} width={120} className="mb-2" />
          <Skeleton height={14} width={80} />
        </View>
      </View>
      
      <SkeletonText lines={2} className="mb-4" />
      
      <View className="flex-row justify-between items-center">
        <Skeleton height={20} width={80} />
        <Skeleton height={24} width={60} />
      </View>
    </View>
  );
}

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <View className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} className="flex-row items-center space-x-3 p-3">
          <Skeleton width={40} height={40} className="rounded-full" />
          <View className="flex-1">
            <Skeleton height={16} width={140} className="mb-2" />
            <Skeleton height={14} width={100} />
          </View>
          <Skeleton height={20} width={60} />
        </View>
      ))}
    </View>
  );
}
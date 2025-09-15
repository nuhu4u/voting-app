import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ 
  orientation = 'horizontal', 
  className 
}: SeparatorProps) {
  return (
    <View
      className={cn(
        'bg-gray-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
    />
  );
}
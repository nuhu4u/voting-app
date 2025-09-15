import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = 'md',
  className,
  containerClassName,
}: SwitchProps) {
  const sizes = {
    sm: { width: 32, height: 18, thumb: 14 },
    md: { width: 44, height: 24, thumb: 20 },
    lg: { width: 56, height: 30, thumb: 26 },
  };

  const { width, height, thumb } = sizes[size];

  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'flex-row items-center',
        disabled && 'opacity-50',
        containerClassName
      )}
    >
      <View
        className={cn(
          'rounded-full',
          checked ? 'bg-blue-500' : 'bg-gray-300',
          className
        )}
        style={{ width, height }}
      >
        <View
          className={cn(
            'bg-white rounded-full absolute top-0.5 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
          style={{ 
            width: thumb, 
            height: thumb - 4,
            transform: [{ translateX: checked ? width - thumb - 2 : 2 }]
          }}
        />
      </View>
      
      {label && (
        <Text className={cn(
          'ml-3 text-gray-900',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        )}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
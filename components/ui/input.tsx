import React, { forwardRef } from 'react';
import { TextInput, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: (() => void) | undefined;
  containerClassName?: string;
  inputClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerClassName,
    inputClassName,
    className,
    ...props
  }, ref) => {
    return (
      <View className={cn('w-full', containerClassName)}>
        {label && (
          <Text className="form-label">
            {label}
          </Text>
        )}
        
        <View className="relative">
          {leftIcon && (
            <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <Ionicons 
                name={leftIcon} 
                size={20} 
                color={error ? '#ef4444' : '#6b7280'} 
              />
            </View>
          )}
          
          <TextInput
            ref={ref}
            className={cn(
              'form-input',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              inputClassName,
              className
            )}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          
          {rightIcon && (
            <Pressable
              onPress={onRightIconPress}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            >
              <Ionicons 
                name={rightIcon} 
                size={20} 
                color={error ? '#ef4444' : '#6b7280'} 
              />
            </Pressable>
          )}
        </View>
        
        {error && (
          <Text className="form-error">
            {error}
          </Text>
        )}
        
        {helperText && !error && (
          <Text className="text-gray-500 text-sm mt-1">
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export function SearchInput({
  onClear,
  showClearButton = true,
  value,
  ...props
}: SearchInputProps) {
  return (
    <Input
      leftIcon="search"
      {...(showClearButton && value && { rightIcon: "close" })}
      onRightIconPress={showClearButton && value ? onClear : undefined}
      placeholder="Search..."
      value={value}
      {...props}
    />
  );
}

interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'onRightIconPress' | 'secureTextEntry'> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
  enableToggle?: boolean;
  toggleIconColor?: string;
}

export function PasswordInput({
  showPassword = false,
  onTogglePassword,
  enableToggle = true,
  toggleIconColor,
  ...props
}: PasswordInputProps) {
  const handleToggle = () => {
    if (onTogglePassword) {
      onTogglePassword();
    }
  };

  return (
    <Input
      {...(enableToggle && {
        rightIcon: showPassword ? "eye-off" : "eye",
        onRightIconPress: handleToggle,
      })}
      secureTextEntry={!showPassword}
      {...props}
    />
  );
}

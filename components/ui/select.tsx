import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onValueChange,
  error,
  helperText,
  disabled = false,
  className,
  containerClassName,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  
  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={cn('w-full', containerClassName)}>
      {label && (
        <Text className="form-label">
          {label}
        </Text>
      )}
      
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        className={cn(
          'form-input flex-row items-center justify-between',
          disabled && 'opacity-50',
          error && 'border-red-500',
          className
        )}
      >
        <Text className={cn(
          'flex-1',
          selectedOption ? 'text-gray-900' : 'text-gray-500'
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6b7280" 
        />
      </Pressable>
      
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
      
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center p-4"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-lg w-full max-w-sm max-h-80">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {label || 'Select an option'}
              </Text>
            </View>
            
            <ScrollView className="max-h-60">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    'px-4 py-3 border-b border-gray-100',
                    option.disabled && 'opacity-50',
                    option.value === value && 'bg-blue-50'
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={cn(
                      'flex-1',
                      option.value === value ? 'text-blue-600 font-medium' : 'text-gray-900'
                    )}>
                      {option.label}
                    </Text>
                    
                    {option.value === value && (
                      <Ionicons name="checkmark" size={20} color="#3b82f6" />
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

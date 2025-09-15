import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ModalComponent({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
  className,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className={cn(
          'bg-white rounded-lg w-full',
          sizes[size],
          className
        )}>
          {(title || showCloseButton) && (
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              {title && (
                <Text className="text-lg font-semibold text-gray-900 flex-1">
                  {title}
                </Text>
              )}
              
              {showCloseButton && (
                <Pressable
                  onPress={onClose}
                  className="p-1"
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </Pressable>
              )}
            </View>
          )}
          
          <ScrollView className="max-h-96">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <ModalComponent
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <View className="p-4">
        <Text className="text-gray-600 text-center mb-6">
          {message}
        </Text>
        
        <View className="flex-row space-x-3">
          <Pressable
            onPress={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg"
          >
            <Text className="text-gray-700 font-medium text-center">
              {cancelText}
            </Text>
          </Pressable>
          
          <Pressable
            onPress={handleConfirm}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg',
              variant === 'destructive' 
                ? 'bg-red-500' 
                : 'bg-blue-500'
            )}
          >
            <Text className="text-white font-medium text-center">
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </ModalComponent>
  );
}

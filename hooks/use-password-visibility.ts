/**
 * Custom hook for managing password visibility state
 * Provides consistent password visibility toggle functionality
 */

import { useState, useCallback } from 'react';

export interface UsePasswordVisibilityOptions {
  initialVisible?: boolean;
  onToggle?: (isVisible: boolean) => void;
}

export interface PasswordVisibilityState {
  isVisible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
  icon: 'eye' | 'eye-off';
}

export const usePasswordVisibility = (options: UsePasswordVisibilityOptions = {}) => {
  const { initialVisible = false, onToggle } = options;
  
  const [isVisible, setIsVisible] = useState(initialVisible);

  const toggle = useCallback(() => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    onToggle?.(newVisibility);
  }, [isVisible, onToggle]);

  const show = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true);
      onToggle?.(true);
    }
  }, [isVisible, onToggle]);

  const hide = useCallback(() => {
    if (isVisible) {
      setIsVisible(false);
      onToggle?.(false);
    }
  }, [isVisible, onToggle]);

  const icon = isVisible ? 'eye-off' : 'eye';

  return {
    isVisible,
    toggle,
    show,
    hide,
    icon,
  };
};

// Hook for multiple password fields
export const useMultiplePasswordVisibility = (fieldCount: number = 1) => {
  const [visibilityStates, setVisibilityStates] = useState<boolean[]>(
    new Array(fieldCount).fill(false)
  );

  const toggleField = useCallback((fieldIndex: number) => {
    setVisibilityStates(prev => 
      prev.map((visible, index) => 
        index === fieldIndex ? !visible : visible
      )
    );
  }, []);

  const showField = useCallback((fieldIndex: number) => {
    setVisibilityStates(prev => 
      prev.map((visible, index) => 
        index === fieldIndex ? true : visible
      )
    );
  }, []);

  const hideField = useCallback((fieldIndex: number) => {
    setVisibilityStates(prev => 
      prev.map((visible, index) => 
        index === fieldIndex ? false : visible
      )
    );
  }, []);

  const showAll = useCallback(() => {
    setVisibilityStates(new Array(fieldCount).fill(true));
  }, [fieldCount]);

  const hideAll = useCallback(() => {
    setVisibilityStates(new Array(fieldCount).fill(false));
  }, [fieldCount]);

  const getFieldVisibility = useCallback((fieldIndex: number) => ({
    isVisible: visibilityStates[fieldIndex] || false,
    toggle: () => toggleField(fieldIndex),
    show: () => showField(fieldIndex),
    hide: () => hideField(fieldIndex),
    icon: (visibilityStates[fieldIndex] ? 'eye-off' : 'eye') as 'eye' | 'eye-off',
  }), [visibilityStates, toggleField, showField, hideField]);

  return {
    visibilityStates,
    toggleField,
    showField,
    hideField,
    showAll,
    hideAll,
    getFieldVisibility,
  };
};

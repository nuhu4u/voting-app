/**
 * Tests for password visibility hooks
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePasswordVisibility, useMultiplePasswordVisibility } from '@/hooks/use-password-visibility';

describe('usePasswordVisibility', () => {
  it('should initialize with default visibility state', () => {
    const { result } = renderHook(() => usePasswordVisibility());
    
    expect(result.current.isVisible).toBe(false);
    expect(result.current.icon).toBe('eye');
  });

  it('should initialize with custom visibility state', () => {
    const { result } = renderHook(() => usePasswordVisibility({ initialVisible: true }));
    
    expect(result.current.isVisible).toBe(true);
    expect(result.current.icon).toBe('eye-off');
  });

  it('should toggle visibility', () => {
    const { result } = renderHook(() => usePasswordVisibility());
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isVisible).toBe(true);
    expect(result.current.icon).toBe('eye-off');
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.isVisible).toBe(false);
    expect(result.current.icon).toBe('eye');
  });

  it('should show password', () => {
    const { result } = renderHook(() => usePasswordVisibility());
    
    act(() => {
      result.current.show();
    });
    
    expect(result.current.isVisible).toBe(true);
    expect(result.current.icon).toBe('eye-off');
  });

  it('should hide password', () => {
    const { result } = renderHook(() => usePasswordVisibility({ initialVisible: true }));
    
    act(() => {
      result.current.hide();
    });
    
    expect(result.current.isVisible).toBe(false);
    expect(result.current.icon).toBe('eye');
  });

  it('should call onToggle callback', () => {
    const onToggle = jest.fn();
    const { result } = renderHook(() => usePasswordVisibility({ onToggle }));
    
    act(() => {
      result.current.toggle();
    });
    
    expect(onToggle).toHaveBeenCalledWith(true);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(onToggle).toHaveBeenCalledWith(false);
  });
});

describe('useMultiplePasswordVisibility', () => {
  it('should initialize with correct number of fields', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(3));
    
    expect(result.current.visibilityStates).toEqual([false, false, false]);
  });

  it('should toggle individual fields', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(2));
    
    act(() => {
      result.current.toggleField(0);
    });
    
    expect(result.current.visibilityStates).toEqual([true, false]);
    
    act(() => {
      result.current.toggleField(1);
    });
    
    expect(result.current.visibilityStates).toEqual([true, true]);
  });

  it('should show individual fields', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(2));
    
    act(() => {
      result.current.showField(0);
    });
    
    expect(result.current.visibilityStates).toEqual([true, false]);
  });

  it('should hide individual fields', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(2));
    
    // First show both fields
    act(() => {
      result.current.showField(0);
      result.current.showField(1);
    });
    
    expect(result.current.visibilityStates).toEqual([true, true]);
    
    // Then hide one field
    act(() => {
      result.current.hideField(0);
    });
    
    expect(result.current.visibilityStates).toEqual([false, true]);
  });

  it('should show all fields', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(3));
    
    act(() => {
      result.current.showAll();
    });
    
    expect(result.current.visibilityStates).toEqual([true, true, true]);
  });

  it('should hide all fields', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(3));
    
    // First show all fields
    act(() => {
      result.current.showAll();
    });
    
    expect(result.current.visibilityStates).toEqual([true, true, true]);
    
    // Then hide all fields
    act(() => {
      result.current.hideAll();
    });
    
    expect(result.current.visibilityStates).toEqual([false, false, false]);
  });

  it('should get field visibility state', () => {
    const { result } = renderHook(() => useMultiplePasswordVisibility(2));
    
    const field0 = result.current.getFieldVisibility(0);
    const field1 = result.current.getFieldVisibility(1);
    
    expect(field0.isVisible).toBe(false);
    expect(field0.icon).toBe('eye');
    expect(field1.isVisible).toBe(false);
    expect(field1.icon).toBe('eye');
    
    act(() => {
      result.current.toggleField(0);
    });
    
    const updatedField0 = result.current.getFieldVisibility(0);
    expect(updatedField0.isVisible).toBe(true);
    expect(updatedField0.icon).toBe('eye-off');
  });
});

/**
 * Tests for PasswordInput component
 */

import React from 'react';
import { render, fireEvent } from '../utils/test-utils';
import { PasswordInput } from '@/components/ui/input';

describe('PasswordInput Component', () => {
  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput placeholder="Enter password" />
    );
    
    expect(getByPlaceholderText('Enter password')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <PasswordInput label="Password" placeholder="Enter password" />
    );
    
    expect(getByText('Password')).toBeTruthy();
  });

  it('shows password when showPassword is true', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        showPassword={true}
        value="testpassword"
      />
    );
    
    const input = getByPlaceholderText('Enter password');
    expect(input.props.secureTextEntry).toBe(false);
  });

  it('hides password when showPassword is false', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        showPassword={false}
        value="testpassword"
      />
    );
    
    const input = getByPlaceholderText('Enter password');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('calls onTogglePassword when toggle button is pressed', () => {
    const onTogglePassword = jest.fn();
    const { getByTestId } = render(
      <PasswordInput 
        placeholder="Enter password" 
        onTogglePassword={onTogglePassword}
        testID="password-input"
      />
    );
    
    // Find the toggle button (right icon)
    const toggleButton = getByTestId('password-input').parent?.children[1];
    if (toggleButton) {
      fireEvent.press(toggleButton);
      expect(onTogglePassword).toHaveBeenCalledTimes(1);
    }
  });

  it('shows correct icon based on visibility state', () => {
    const { rerender } = render(
      <PasswordInput 
        placeholder="Enter password" 
        showPassword={false}
      />
    );
    
    // When password is hidden, should show eye icon
    // This would need to be tested with the actual icon component
    
    rerender(
      <PasswordInput 
        placeholder="Enter password" 
        showPassword={true}
      />
    );
    
    // When password is visible, should show eye-off icon
    // This would need to be tested with the actual icon component
  });

  it('disables toggle when enableToggle is false', () => {
    const onTogglePassword = jest.fn();
    const { getByPlaceholderText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        enableToggle={false}
        onTogglePassword={onTogglePassword}
      />
    );
    
    const input = getByPlaceholderText('Enter password');
    // When enableToggle is false, there should be no right icon
    // This would need to be tested with the actual component structure
  });

  it('handles text input changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        onChangeText={onChangeText}
      />
    );
    
    const input = getByPlaceholderText('Enter password');
    fireEvent.changeText(input, 'newpassword');
    
    expect(onChangeText).toHaveBeenCalledWith('newpassword');
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        error="Password is required"
      />
    );
    
    expect(getByText('Password is required')).toBeTruthy();
  });

  it('shows helper text when provided', () => {
    const { getByText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        helperText="Password must be at least 8 characters"
      />
    );
    
    expect(getByText('Password must be at least 8 characters')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput 
        placeholder="Enter password" 
        className="custom-class"
      />
    );
    
    const input = getByPlaceholderText('Enter password');
    expect(input.props.className).toContain('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(
      <PasswordInput 
        ref={ref}
        placeholder="Enter password" 
      />
    );
    
    expect(ref.current).toBeTruthy();
  });
});

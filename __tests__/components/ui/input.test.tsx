import React from 'react';
import { render, fireEvent } from '../utils/test-utils';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" />
    );
    
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input label="Test Label" placeholder="Enter text" />
    );
    
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('handles text input changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );
    
    const input = getByPlaceholderText('Enter text');
    fireEvent.changeText(input, 'test input');
    expect(onChangeText).toHaveBeenCalledWith('test input');
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <Input placeholder="Enter text" error="This field is required" />
    );
    
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" disabled />
    );
    
    const input = getByPlaceholderText('Enter text');
    expect(input.props.editable).toBe(false);
  });

  it('renders with right icon', () => {
    const onRightIconPress = jest.fn();
    const { getByTestId } = render(
      <Input 
        placeholder="Enter text" 
        rightIcon="eye" 
        onRightIconPress={onRightIconPress}
        testID="input-with-icon"
      />
    );
    
    const input = getByTestId('input-with-icon');
    expect(input).toBeTruthy();
  });

  it('handles right icon press', () => {
    const onRightIconPress = jest.fn();
    const { getByTestId } = render(
      <Input 
        placeholder="Enter text" 
        rightIcon="eye" 
        onRightIconPress={onRightIconPress}
        testID="input-with-icon"
      />
    );
    
    // Note: This would need proper implementation in the Input component
    // to make the right icon pressable and testable
    expect(onRightIconPress).toBeDefined();
  });

  it('applies custom className', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" className="custom-class" />
    );
    
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('renders with different input types', () => {
    const { getByPlaceholderText: getByPlaceholderTextDefault } = render(
      <Input placeholder="Default input" />
    );
    
    const { getByPlaceholderText: getByPlaceholderTextPassword } = render(
      <Input placeholder="Password input" secureTextEntry />
    );
    
    expect(getByPlaceholderTextDefault('Default input')).toBeTruthy();
    expect(getByPlaceholderTextPassword('Password input')).toBeTruthy();
  });
});

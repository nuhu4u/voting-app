import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '../utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Button>
        <Text>Test Button</Text>
      </Button>
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { getByText: getByTextDefault } = render(
      <Button>
        <Text>Default</Text>
      </Button>
    );
    
    const { getByText: getByTextOutline } = render(
      <Button variant="outline">
        <Text>Outline</Text>
      </Button>
    );
    
    const { getByText: getByTextGhost } = render(
      <Button variant="ghost">
        <Text>Ghost</Text>
      </Button>
    );
    
    expect(getByTextDefault('Default')).toBeTruthy();
    expect(getByTextOutline('Outline')).toBeTruthy();
    expect(getByTextGhost('Ghost')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { getByText: getByTextSm } = render(
      <Button size="sm">
        <Text>Small</Text>
      </Button>
    );
    
    const { getByText: getByTextLg } = render(
      <Button size="lg">
        <Text>Large</Text>
      </Button>
    );
    
    expect(getByTextSm('Small')).toBeTruthy();
    expect(getByTextLg('Large')).toBeTruthy();
  });

  it('handles onPress events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>
        <Text>Press Me</Text>
      </Button>
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>
        <Text>Disabled</Text>
      </Button>
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { getByText } = render(
      <Button className="custom-class">
        <Text>Custom</Text>
      </Button>
    );
    
    expect(getByText('Custom')).toBeTruthy();
  });

  it('renders with loading state', () => {
    const { getByText } = render(
      <Button loading>
        <Text>Loading</Text>
      </Button>
    );
    
    expect(getByText('Loading')).toBeTruthy();
  });
});

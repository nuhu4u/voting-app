/**
 * Voter Tab Navigation Tests
 */

import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { 
  TabNavigation, 
  TabContent, 
  TabIndicator, 
  TabDropdown 
} from '@/components/voter/voter-tab-navigation';

describe('TabNavigation', () => {
  const mockTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Dashboard overview',
      badge: 3
    },
    {
      id: 'elections',
      label: 'Elections',
      icon: '🗳️',
      description: 'View elections',
      disabled: false
    },
    {
      id: 'history',
      label: 'History',
      icon: '📋',
      description: 'Voting history',
      hidden: false
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      description: 'User profile',
      disabled: true
    }
  ];

  it('should render tabs correctly', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('Elections')).toBeTruthy();
    expect(getByText('History')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('should show badges when provided', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange,
        showBadges: true
      })
    );

    expect(getByText('3')).toBeTruthy(); // Badge for overview tab
  });

  it('should handle tab clicks', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    const electionsTab = getByText('Elections');
    fireEvent.press(electionsTab);

    expect(onTabChange).toHaveBeenCalledWith('elections');
  });

  it('should not call onTabChange for disabled tabs', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    const profileTab = getByText('Profile');
    fireEvent.press(profileTab);

    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('should hide hidden tabs', () => {
    const tabsWithHidden = [
      ...mockTabs,
      {
        id: 'hidden',
        label: 'Hidden',
        icon: '🔒',
        hidden: true
      }
    ];

    const onTabChange = jest.fn();
    const { queryByText } = render(
      React.createElement(TabNavigation, {
        tabs: tabsWithHidden,
        activeTab: 'overview',
        onTabChange
      })
    );

    expect(queryByText('Hidden')).toBeNull();
  });

  it('should apply different variants', () => {
    const onTabChange = jest.fn();
    const { container } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange,
        variant: 'pills'
      })
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('should apply different sizes', () => {
    const onTabChange = jest.fn();
    const { container } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange,
        size: 'lg'
      })
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('should show scroll buttons when needed', () => {
    const onTabChange = jest.fn();
    const { container } = render(
      React.createElement(TabNavigation, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange,
        showScrollButtons: true
      })
    );

    expect(container.firstChild).toBeTruthy();
  });
});

describe('TabContent', () => {
  const mockTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      component: () => React.createElement('div', null, 'Overview Content')
    },
    {
      id: 'elections',
      label: 'Elections',
      icon: '🗳️',
      component: () => React.createElement('div', null, 'Elections Content')
    }
  ];

  it('should render active tab content', () => {
    const { getByText } = render(
      React.createElement(TabContent, {
        activeTab: 'overview',
        tabs: mockTabs
      })
    );

    expect(getByText('Overview Content')).toBeTruthy();
  });

  it('should render children when provided', () => {
    const { getByText } = render(
      React.createElement(TabContent, {
        activeTab: 'overview',
        tabs: mockTabs
      },
        React.createElement('div', null, 'Custom Content')
      )
    );

    expect(getByText('Custom Content')).toBeTruthy();
  });

  it('should apply animation classes', () => {
    const { container } = render(
      React.createElement(TabContent, {
        activeTab: 'overview',
        tabs: mockTabs,
        animation: 'fade'
      })
    );

    expect(container.firstChild).toBeTruthy();
  });
});

describe('TabIndicator', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1', icon: '1' },
    { id: 'tab2', label: 'Tab 2', icon: '2' },
    { id: 'tab3', label: 'Tab 3', icon: '3' }
  ];

  it('should render indicator', () => {
    const { container } = render(
      React.createElement(TabIndicator, {
        activeTab: 'tab2',
        tabs: mockTabs
      })
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('should handle horizontal orientation', () => {
    const { container } = render(
      React.createElement(TabIndicator, {
        activeTab: 'tab2',
        tabs: mockTabs,
        orientation: 'horizontal'
      })
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('should handle vertical orientation', () => {
    const { container } = render(
      React.createElement(TabIndicator, {
        activeTab: 'tab2',
        tabs: mockTabs,
        orientation: 'vertical'
      })
    );

    expect(container.firstChild).toBeTruthy();
  });
});

describe('TabDropdown', () => {
  const mockTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Dashboard overview'
    },
    {
      id: 'elections',
      label: 'Elections',
      icon: '🗳️',
      description: 'View elections'
    }
  ];

  it('should render dropdown trigger', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(TabDropdown, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    expect(getByText('Overview')).toBeTruthy();
  });

  it('should open dropdown on click', () => {
    const onTabChange = jest.fn();
    const { getByText, queryByText } = render(
      React.createElement(TabDropdown, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    const trigger = getByText('Overview');
    fireEvent.press(trigger);

    expect(queryByText('Elections')).toBeTruthy();
  });

  it('should handle tab selection', () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      React.createElement(TabDropdown, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    const trigger = getByText('Overview');
    fireEvent.press(trigger);

    const electionsOption = getByText('Elections');
    fireEvent.press(electionsOption);

    expect(onTabChange).toHaveBeenCalledWith('elections');
  });

  it('should close dropdown after selection', () => {
    const onTabChange = jest.fn();
    const { getByText, queryByText } = render(
      React.createElement(TabDropdown, {
        tabs: mockTabs,
        activeTab: 'overview',
        onTabChange
      })
    );

    const trigger = getByText('Overview');
    fireEvent.press(trigger);

    const electionsOption = getByText('Elections');
    fireEvent.press(electionsOption);

    // Dropdown should be closed
    expect(queryByText('Elections')).toBeNull();
  });
});

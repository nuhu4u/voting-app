/**
 * Voter Tab Navigation Component
 * Advanced tab navigation system for the voter dashboard
 */

import * as React from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
// import { Badge } from '@/components/ui/badge';
// import { ChevronRight, ChevronLeft, MoreHorizontal } from 'lucide-react-native';

// Mock components for now
const View = ({ children, ...props }: any) => React.createElement('div', props, children);
const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
const TouchableOpacity = ({ children, ...props }: any) => React.createElement('button', props, children);
const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
const Animated = {
  View: ({ children, ...props }: any) => React.createElement('div', props, children),
  Value: () => ({ current: 0 }),
  timing: () => ({ start: jest.fn() }),
  spring: () => ({ start: jest.fn() }),
};

const Badge = ({ children, ...props }: any) => React.createElement('span', props, children);

// Mock icons
const ChevronRight = () => React.createElement('span', { className: 'text-gray-400' }, '▶');
const ChevronLeft = () => React.createElement('span', { className: 'text-gray-400' }, '◀');
const MoreHorizontal = () => React.createElement('span', { className: 'text-gray-400' }, '⋯');

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  description?: string;
  badge?: number | string;
  disabled?: boolean;
  hidden?: boolean;
  component?: React.ComponentType;
  href?: string;
  onClick?: () => void;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  showScrollButtons?: boolean;
  showBadges?: boolean;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  disabledTabClassName?: string;
}

export interface TabContentProps {
  activeTab: string;
  tabs: TabItem[];
  children?: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'none';
  transitionDuration?: number;
}

export interface TabIndicatorProps {
  activeTab: string;
  tabs: TabItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Tab Navigation Component
 */
export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  showScrollButtons = true,
  showBadges = true,
  className = '',
  tabClassName = '',
  activeTabClassName = '',
  disabledTabClassName = '',
}: TabNavigationProps) {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Filter visible tabs
  const visibleTabs = tabs.filter(tab => !tab.hidden);

  // Check scroll capabilities
  React.useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [tabs]);

  // Handle scroll
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Get tab classes
  const getTabClasses = (tab: TabItem) => {
    const baseClasses = 'flex items-center space-x-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    };
    const variantClasses = {
      default: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg',
      pills: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full',
      underline: 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300',
      cards: 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md border border-gray-200 rounded-lg'
    };
    const stateClasses = tab.disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : activeTab === tab.id 
        ? 'text-blue-600 bg-blue-50' 
        : '';

    return [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      stateClasses,
      tabClassName,
      activeTab === tab.id ? activeTabClassName : '',
      tab.disabled ? disabledTabClassName : ''
    ].filter(Boolean).join(' ');
  };

  // Get container classes
  const getContainerClasses = () => {
    const baseClasses = 'flex';
    const orientationClasses = orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row space-x-1';
    const variantClasses = {
      default: 'bg-gray-50 p-1 rounded-lg',
      pills: 'bg-gray-50 p-1 rounded-full',
      underline: 'border-b border-gray-200',
      cards: 'space-x-2'
    };

    return [
      baseClasses,
      orientationClasses,
      variantClasses[variant],
      className
    ].join(' ');
  };

  return React.createElement('div', { className: 'relative' },
    // Scroll buttons for horizontal orientation
    orientation === 'horizontal' && showScrollButtons && (
      React.createElement('div', { className: 'flex items-center' },
        // Left scroll button
        canScrollLeft && React.createElement('button', {
          onClick: () => handleScroll('left'),
          className: 'absolute left-0 z-10 p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
        },
          React.createElement(ChevronLeft, null)
        ),

        // Right scroll button
        canScrollRight && React.createElement('button', {
          onClick: () => handleScroll('right'),
          className: 'absolute right-0 z-10 p-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
        },
          React.createElement(ChevronRight, null)
        )
      )
    ),

    // Tabs container
    React.createElement(ScrollView, {
      ref: scrollRef,
      className: getContainerClasses(),
      horizontal: orientation === 'horizontal',
      showsHorizontalScrollIndicator: false,
      onScroll: (event: any) => setScrollPosition(event.nativeEvent.contentOffset.x)
    },
      visibleTabs.map((tab) => 
        React.createElement(TouchableOpacity, {
          key: tab.id,
          onPress: () => !tab.disabled && onTabChange(tab.id),
          disabled: tab.disabled,
          className: getTabClasses(tab)
        },
          // Tab icon
          React.createElement('span', { className: 'text-lg' }, tab.icon),
          
          // Tab content
          React.createElement('div', { className: 'flex flex-col items-start' },
            React.createElement('div', { className: 'flex items-center space-x-2' },
              React.createElement(Text, { className: 'font-medium' }, tab.label),
              showBadges && tab.badge && React.createElement(Badge, {
                className: 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
              }, tab.badge)
            ),
            tab.description && React.createElement(Text, { 
              className: 'text-xs text-gray-500' 
            }, tab.description)
          )
        )
      )
    )
  );
}

/**
 * Tab Content Component
 */
export function TabContent({
  activeTab,
  tabs,
  children,
  className = '',
  animation = 'fade',
  transitionDuration = 300,
}: TabContentProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [previousTab, setPreviousTab] = React.useState<string | null>(null);

  // Handle tab change animation
  React.useEffect(() => {
    if (previousTab && previousTab !== activeTab) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setPreviousTab(activeTab);
      }, transitionDuration);
    } else {
      setPreviousTab(activeTab);
    }
  }, [activeTab, previousTab, transitionDuration]);

  // Get animation classes
  const getAnimationClasses = () => {
    if (animation === 'none') return '';
    
    const baseClasses = 'transition-all duration-300';
    const animationClasses = {
      fade: isAnimating ? 'opacity-0' : 'opacity-100',
      slide: isAnimating ? 'transform translate-x-4 opacity-0' : 'transform translate-x-0 opacity-100'
    };

    return [baseClasses, animationClasses[animation]].join(' ');
  };

  // Find active tab component
  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return React.createElement('div', { 
    className: `tab-content ${getAnimationClasses()} ${className}` 
  },
    // Render children if provided
    children || (
      ActiveComponent ? React.createElement(ActiveComponent, null) : null
    )
  );
}

/**
 * Tab Indicator Component
 */
export function TabIndicator({
  activeTab,
  tabs,
  orientation = 'horizontal',
  className = '',
}: TabIndicatorProps) {
  const [indicatorStyle, setIndicatorStyle] = React.useState({});

  // Calculate indicator position
  React.useEffect(() => {
    const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeTabIndex >= 0) {
      const position = orientation === 'horizontal' 
        ? { left: `${activeTabIndex * 100}%`, width: '100%' }
        : { top: `${activeTabIndex * 100}%`, height: '100%' };
      
      setIndicatorStyle(position);
    }
  }, [activeTab, tabs, orientation]);

  return React.createElement('div', {
    className: `absolute bg-blue-600 transition-all duration-300 ${className}`,
    style: {
      ...indicatorStyle,
      ...(orientation === 'horizontal' 
        ? { height: '2px', bottom: 0 }
        : { width: '2px', left: 0 }
      )
    }
  });
}

/**
 * Tab Dropdown Component
 */
export function TabDropdown({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  return React.createElement('div', { className: `relative ${className}` },
    // Dropdown trigger
    React.createElement('button', {
      onClick: () => setIsOpen(!isOpen),
      className: 'flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
    },
      activeTabConfig && React.createElement(React.Fragment, null,
        React.createElement('span', { className: 'text-lg' }, activeTabConfig.icon),
        React.createElement(Text, { className: 'font-medium' }, activeTabConfig.label)
      ),
      React.createElement(MoreHorizontal, null)
    ),

    // Dropdown menu
    isOpen && React.createElement('div', {
      className: 'absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50'
    },
      tabs.map((tab) => 
        React.createElement('button', {
          key: tab.id,
          onClick: () => {
            onTabChange(tab.id);
            setIsOpen(false);
          },
          className: `w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 ${
            activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
          }`
        },
          React.createElement('span', { className: 'text-lg' }, tab.icon),
          React.createElement('div', { className: 'flex-1' },
            React.createElement(Text, { className: 'font-medium' }, tab.label),
            tab.description && React.createElement(Text, { 
              className: 'text-xs text-gray-500' 
            }, tab.description)
          ),
          tab.badge && React.createElement(Badge, {
            className: 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
          }, tab.badge)
        )
      )
    )
  );
}

/**
 * Tab Navigation Hook
 */
export function useTabNavigation(initialTab: string = 'overview') {
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [tabHistory, setTabHistory] = React.useState<string[]>([initialTab]);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const changeTab = React.useCallback((tabId: string) => {
    if (tabId === activeTab) return;

    setIsTransitioning(true);
    setActiveTab(tabId);
    setTabHistory(prev => [...prev, tabId]);

    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [activeTab]);

  const goBack = React.useCallback(() => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop(); // Remove current tab
      const previousTab = newHistory[newHistory.length - 1];
      
      setIsTransitioning(true);
      setActiveTab(previousTab);
      setTabHistory(newHistory);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [tabHistory]);

  const canGoBack = tabHistory.length > 1;

  return {
    activeTab,
    tabHistory,
    isTransitioning,
    changeTab,
    goBack,
    canGoBack
  };
}

export default TabNavigation;

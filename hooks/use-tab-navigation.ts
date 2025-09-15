/**
 * Tab Navigation Hook
 * Custom hook for managing tab navigation state and behavior
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface TabConfig {
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
  requiresAuth?: boolean;
  permissions?: string[];
  roles?: string[];
}

export interface TabNavigationState {
  activeTab: string;
  tabHistory: string[];
  isTransitioning: boolean;
  tabs: TabConfig[];
  filteredTabs: TabConfig[];
}

export interface TabNavigationActions {
  changeTab: (tabId: string) => void;
  goBack: () => void;
  goForward: () => void;
  reset: () => void;
  addTab: (tab: TabConfig) => void;
  removeTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<TabConfig>) => void;
  setTabs: (tabs: TabConfig[]) => void;
  filterTabs: (predicate: (tab: TabConfig) => boolean) => void;
  clearFilters: () => void;
}

export interface TabNavigationOptions {
  initialTab?: string;
  enableHistory?: boolean;
  maxHistorySize?: number;
  transitionDuration?: number;
  enableKeyboardNavigation?: boolean;
  enableSwipeNavigation?: boolean;
  onTabChange?: (tabId: string, previousTabId: string) => void;
  onTabAdd?: (tab: TabConfig) => void;
  onTabRemove?: (tabId: string) => void;
  onHistoryChange?: (history: string[]) => void;
}

export interface UseTabNavigationReturn extends TabNavigationState, TabNavigationActions {
  canGoBack: boolean;
  canGoForward: boolean;
  previousTab: string | null;
  nextTab: string | null;
  currentTabConfig: TabConfig | null;
  tabCount: number;
  visibleTabCount: number;
}

/**
 * Tab Navigation Hook
 */
export function useTabNavigation(
  initialTabs: TabConfig[] = [],
  options: TabNavigationOptions = {}
): UseTabNavigationReturn {
  const {
    initialTab = initialTabs[0]?.id || 'overview',
    enableHistory = true,
    maxHistorySize = 10,
    transitionDuration = 300,
    enableKeyboardNavigation = true,
    enableSwipeNavigation = false,
    onTabChange,
    onTabAdd,
    onTabRemove,
    onHistoryChange,
  } = options;

  const [tabs, setTabs] = useState<TabConfig[]>(initialTabs);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [tabHistory, setTabHistory] = useState<string[]>([initialTab]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tabFilters, setTabFilters] = useState<((tab: TabConfig) => boolean)[]>([]);

  // Filter tabs based on current filters
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => 
      !tab.hidden && 
      tabFilters.every(filter => filter(tab))
    );
  }, [tabs, tabFilters]);

  // Get current tab configuration
  const currentTabConfig = useMemo(() => {
    return tabs.find(tab => tab.id === activeTab) || null;
  }, [tabs, activeTab]);

  // Navigation state
  const canGoBack = tabHistory.length > 1;
  const canGoForward = false; // Forward navigation not implemented yet
  const previousTab = tabHistory.length > 1 ? tabHistory[tabHistory.length - 2] : null;
  const nextTab = null; // Forward navigation not implemented yet
  const tabCount = tabs.length;
  const visibleTabCount = filteredTabs.length;

  // Change tab
  const changeTab = useCallback((tabId: string) => {
    if (tabId === activeTab) return;

    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;

    const previousTabId = activeTab;
    
    setIsTransitioning(true);
    setActiveTab(tabId);

    // Update history
    if (enableHistory) {
      setTabHistory(prev => {
        const newHistory = [...prev, tabId];
        // Limit history size
        if (newHistory.length > maxHistorySize) {
          return newHistory.slice(-maxHistorySize);
        }
        return newHistory;
      });
    }

    // Call tab change callback
    onTabChange?.(tabId, previousTabId);

    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [activeTab, tabs, enableHistory, maxHistorySize, onTabChange, transitionDuration]);

  // Go back
  const goBack = useCallback(() => {
    if (!canGoBack) return;

    const newHistory = [...tabHistory];
    newHistory.pop(); // Remove current tab
    const previousTabId = newHistory[newHistory.length - 1];
    
    setIsTransitioning(true);
    setActiveTab(previousTabId);
    setTabHistory(newHistory);

    onTabChange?.(previousTabId, activeTab);

    setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [canGoBack, tabHistory, activeTab, onTabChange, transitionDuration]);

  // Go forward (placeholder for future implementation)
  const goForward = useCallback(() => {
    // Forward navigation not implemented yet
    console.warn('Forward navigation not implemented');
  }, []);

  // Reset navigation
  const reset = useCallback(() => {
    setActiveTab(initialTab);
    setTabHistory([initialTab]);
    setIsTransitioning(false);
  }, [initialTab]);

  // Add tab
  const addTab = useCallback((tab: TabConfig) => {
    setTabs(prev => {
      const exists = prev.some(t => t.id === tab.id);
      if (exists) return prev;
      
      const newTabs = [...prev, tab];
      onTabAdd?.(tab);
      return newTabs;
    });
  }, [onTabAdd]);

  // Remove tab
  const removeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      onTabRemove?.(tabId);
      return newTabs;
    });

    // If removed tab was active, switch to first available tab
    if (activeTab === tabId) {
      const availableTabs = tabs.filter(t => t.id !== tabId && !t.hidden && !t.disabled);
      if (availableTabs.length > 0) {
        changeTab(availableTabs[0].id);
      }
    }
  }, [activeTab, tabs, changeTab, onTabRemove]);

  // Update tab
  const updateTab = useCallback((tabId: string, updates: Partial<TabConfig>) => {
    setTabs(prev => 
      prev.map(tab => 
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    );
  }, []);

  // Set tabs
  const setTabsCallback = useCallback((newTabs: TabConfig[]) => {
    setTabs(newTabs);
  }, []);

  // Filter tabs
  const filterTabs = useCallback((predicate: (tab: TabConfig) => boolean) => {
    setTabFilters(prev => [...prev, predicate]);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setTabFilters([]);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (canGoBack) goBack();
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (canGoForward) goForward();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            event.preventDefault();
            const tabIndex = parseInt(event.key) - 1;
            if (tabIndex < filteredTabs.length) {
              changeTab(filteredTabs[tabIndex].id);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNavigation, canGoBack, canGoForward, goBack, goForward, filteredTabs, changeTab]);

  // Swipe navigation (placeholder for future implementation)
  useEffect(() => {
    if (!enableSwipeNavigation) return;

    // Swipe navigation would be implemented here
    // This would require touch event handlers
    console.log('Swipe navigation not implemented yet');
  }, [enableSwipeNavigation]);

  // Notify history changes
  useEffect(() => {
    onHistoryChange?.(tabHistory);
  }, [tabHistory, onHistoryChange]);

  return {
    // State
    activeTab,
    tabHistory,
    isTransitioning,
    tabs,
    filteredTabs,
    
    // Computed properties
    canGoBack,
    canGoForward,
    previousTab,
    nextTab,
    currentTabConfig,
    tabCount,
    visibleTabCount,
    
    // Actions
    changeTab,
    goBack,
    goForward,
    reset,
    addTab,
    removeTab,
    updateTab,
    setTabs: setTabsCallback,
    filterTabs,
    clearFilters,
  };
}

/**
 * Tab Navigation with Authentication Hook
 */
export function useAuthenticatedTabNavigation(
  initialTabs: TabConfig[] = [],
  options: TabNavigationOptions & {
    userRoles?: string[];
    userPermissions?: string[];
  } = {}
) {
  const { userRoles = [], userPermissions = [], ...tabOptions } = options;

  // Filter tabs based on authentication
  const authenticatedTabs = useMemo(() => {
    return initialTabs.filter(tab => {
      // If tab doesn't require auth, show it
      if (!tab.requiresAuth) return true;

      // Check roles
      if (tab.roles && tab.roles.length > 0) {
        const hasRequiredRole = tab.roles.some(role => userRoles.includes(role));
        if (!hasRequiredRole) return false;
      }

      // Check permissions
      if (tab.permissions && tab.permissions.length > 0) {
        const hasRequiredPermission = tab.permissions.some(permission => 
          userPermissions.includes(permission)
        );
        if (!hasRequiredPermission) return false;
      }

      return true;
    });
  }, [initialTabs, userRoles, userPermissions]);

  return useTabNavigation(authenticatedTabs, tabOptions);
}

/**
 * Tab Navigation with Persistence Hook
 */
export function usePersistentTabNavigation(
  initialTabs: TabConfig[] = [],
  options: TabNavigationOptions & {
    storageKey?: string;
    persistHistory?: boolean;
    persistActiveTab?: boolean;
  } = {}
) {
  const { 
    storageKey = 'tab-navigation', 
    persistHistory = true, 
    persistActiveTab = true,
    ...tabOptions 
  } = options;

  // Load persisted state
  const loadPersistedState = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { activeTab, tabHistory } = JSON.parse(stored);
        return { activeTab, tabHistory };
      }
    } catch (error) {
      console.error('Failed to load persisted tab state:', error);
    }
    return null;
  }, [storageKey]);

  // Save state to storage
  const saveState = useCallback((activeTab: string, tabHistory: string[]) => {
    try {
      const state = {
        activeTab: persistActiveTab ? activeTab : undefined,
        tabHistory: persistHistory ? tabHistory : undefined,
      };
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save tab state:', error);
    }
  }, [storageKey, persistHistory, persistActiveTab]);

  // Initialize with persisted state
  const persistedState = loadPersistedState();
  const initialActiveTab = persistedState?.activeTab || tabOptions.initialTab || initialTabs[0]?.id || 'overview';
  const initialTabHistory = persistedState?.tabHistory || [initialActiveTab];

  const tabNavigation = useTabNavigation(initialTabs, {
    ...tabOptions,
    initialTab: initialActiveTab,
  });

  // Override initial state with persisted state
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [tabHistory, setTabHistory] = useState(initialTabHistory);

  // Save state when it changes
  useEffect(() => {
    saveState(activeTab, tabHistory);
  }, [activeTab, tabHistory, saveState]);

  // Override changeTab to update local state
  const changeTab = useCallback((tabId: string) => {
    tabNavigation.changeTab(tabId);
    setActiveTab(tabId);
  }, [tabNavigation]);

  // Override goBack to update local state
  const goBack = useCallback(() => {
    tabNavigation.goBack();
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop();
      setTabHistory(newHistory);
      setActiveTab(newHistory[newHistory.length - 1]);
    }
  }, [tabNavigation, tabHistory]);

  return {
    ...tabNavigation,
    activeTab,
    tabHistory,
    changeTab,
    goBack,
  };
}

export default useTabNavigation;

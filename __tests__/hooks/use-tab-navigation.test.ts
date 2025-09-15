/**
 * Tab Navigation Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useTabNavigation, 
  useAuthenticatedTabNavigation, 
  usePersistentTabNavigation 
} from '@/hooks/use-tab-navigation';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useTabNavigation', () => {
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
    },
    {
      id: 'history',
      label: 'History',
      icon: '📋',
      description: 'Voting history',
      disabled: true
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      description: 'User profile',
      hidden: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    expect(result.current.activeTab).toBe('overview');
    expect(result.current.tabHistory).toEqual(['overview']);
    expect(result.current.isTransitioning).toBe(false);
    expect(result.current.tabs).toEqual(mockTabs);
    expect(result.current.canGoBack).toBe(false);
    expect(result.current.canGoForward).toBe(false);
    expect(result.current.tabCount).toBe(4);
    expect(result.current.visibleTabCount).toBe(3); // Hidden tab excluded
  });

  it('should change tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.changeTab('elections');
    });

    expect(result.current.activeTab).toBe('elections');
    expect(result.current.tabHistory).toEqual(['overview', 'elections']);
    expect(result.current.canGoBack).toBe(true);
  });

  it('should not change to disabled tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.changeTab('history');
    });

    expect(result.current.activeTab).toBe('overview');
    expect(result.current.tabHistory).toEqual(['overview']);
  });

  it('should not change to same tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));
    const onTabChange = jest.fn();

    act(() => {
      result.current.changeTab('overview');
    });

    expect(result.current.activeTab).toBe('overview');
    expect(result.current.tabHistory).toEqual(['overview']);
  });

  it('should go back', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.changeTab('elections');
    });

    act(() => {
      result.current.goBack();
    });

    expect(result.current.activeTab).toBe('overview');
    expect(result.current.tabHistory).toEqual(['overview']);
    expect(result.current.canGoBack).toBe(false);
  });

  it('should not go back when no history', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.goBack();
    });

    expect(result.current.activeTab).toBe('overview');
    expect(result.current.tabHistory).toEqual(['overview']);
  });

  it('should add tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));
    const newTab = {
      id: 'new-tab',
      label: 'New Tab',
      icon: '➕',
      description: 'A new tab'
    };

    act(() => {
      result.current.addTab(newTab);
    });

    expect(result.current.tabs).toContain(newTab);
    expect(result.current.tabCount).toBe(5);
  });

  it('should not add duplicate tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));
    const existingTab = mockTabs[0];

    act(() => {
      result.current.addTab(existingTab);
    });

    expect(result.current.tabCount).toBe(4);
  });

  it('should remove tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.removeTab('elections');
    });

    expect(result.current.tabs).not.toContain(mockTabs[1]);
    expect(result.current.tabCount).toBe(3);
  });

  it('should switch to first available tab when removing active tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.changeTab('elections');
    });

    act(() => {
      result.current.removeTab('elections');
    });

    expect(result.current.activeTab).toBe('overview');
  });

  it('should update tab', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.updateTab('overview', { label: 'Updated Overview' });
    });

    const updatedTab = result.current.tabs.find(tab => tab.id === 'overview');
    expect(updatedTab?.label).toBe('Updated Overview');
  });

  it('should filter tabs', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.filterTabs(tab => tab.id !== 'elections');
    });

    expect(result.current.filteredTabs).not.toContain(mockTabs[1]);
    expect(result.current.visibleTabCount).toBe(2);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs));

    act(() => {
      result.current.filterTabs(tab => tab.id !== 'elections');
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.visibleTabCount).toBe(3);
  });

  it('should reset navigation', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs, { initialTab: 'elections' }));

    act(() => {
      result.current.changeTab('overview');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.activeTab).toBe('elections');
    expect(result.current.tabHistory).toEqual(['elections']);
  });

  it('should call onTabChange callback', () => {
    const onTabChange = jest.fn();
    const { result } = renderHook(() => useTabNavigation(mockTabs, { onTabChange }));

    act(() => {
      result.current.changeTab('elections');
    });

    expect(onTabChange).toHaveBeenCalledWith('elections', 'overview');
  });

  it('should limit history size', () => {
    const { result } = renderHook(() => useTabNavigation(mockTabs, { maxHistorySize: 2 }));

    act(() => {
      result.current.changeTab('elections');
    });

    act(() => {
      result.current.changeTab('overview');
    });

    act(() => {
      result.current.changeTab('elections');
    });

    expect(result.current.tabHistory.length).toBe(2);
  });
});

describe('useAuthenticatedTabNavigation', () => {
  const mockTabs = [
    {
      id: 'public',
      label: 'Public',
      icon: '🌐',
      requiresAuth: false
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: '👑',
      requiresAuth: true,
      roles: ['admin']
    },
    {
      id: 'voter',
      label: 'Voter',
      icon: '🗳️',
      requiresAuth: true,
      roles: ['voter', 'admin']
    },
    {
      id: 'observer',
      label: 'Observer',
      icon: '👁️',
      requiresAuth: true,
      roles: ['observer'],
      permissions: ['view_reports']
    }
  ];

  it('should show all tabs for admin user', () => {
    const { result } = renderHook(() => useAuthenticatedTabNavigation(mockTabs, {
      userRoles: ['admin'],
      userPermissions: ['view_reports']
    }));

    expect(result.current.filteredTabs).toHaveLength(4);
  });

  it('should filter tabs based on roles', () => {
    const { result } = renderHook(() => useAuthenticatedTabNavigation(mockTabs, {
      userRoles: ['voter'],
      userPermissions: []
    }));

    expect(result.current.filteredTabs).toHaveLength(2); // public + voter
    expect(result.current.filteredTabs.find(tab => tab.id === 'admin')).toBeUndefined();
  });

  it('should filter tabs based on permissions', () => {
    const { result } = renderHook(() => useAuthenticatedTabNavigation(mockTabs, {
      userRoles: ['observer'],
      userPermissions: ['view_reports']
    }));

    expect(result.current.filteredTabs).toHaveLength(2); // public + observer
    expect(result.current.filteredTabs.find(tab => tab.id === 'admin')).toBeUndefined();
  });

  it('should show only public tabs for unauthenticated user', () => {
    const { result } = renderHook(() => useAuthenticatedTabNavigation(mockTabs, {
      userRoles: [],
      userPermissions: []
    }));

    expect(result.current.filteredTabs).toHaveLength(1);
    expect(result.current.filteredTabs[0].id).toBe('public');
  });
});

describe('usePersistentTabNavigation', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1', icon: '1' },
    { id: 'tab2', label: 'Tab 2', icon: '2' }
  ];

  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should load persisted state', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      activeTab: 'tab2',
      tabHistory: ['tab1', 'tab2']
    }));

    const { result } = renderHook(() => usePersistentTabNavigation(mockTabs));

    expect(result.current.activeTab).toBe('tab2');
    expect(result.current.tabHistory).toEqual(['tab1', 'tab2']);
  });

  it('should save state changes', () => {
    const { result } = renderHook(() => usePersistentTabNavigation(mockTabs));

    act(() => {
      result.current.changeTab('tab2');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tab-navigation',
      JSON.stringify({
        activeTab: 'tab2',
        tabHistory: ['tab1', 'tab2']
      })
    );
  });

  it('should handle invalid persisted state', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => usePersistentTabNavigation(mockTabs));

    expect(result.current.activeTab).toBe('tab1');
    expect(result.current.tabHistory).toEqual(['tab1']);
  });

  it('should use custom storage key', () => {
    const { result } = renderHook(() => usePersistentTabNavigation(mockTabs, {
      storageKey: 'custom-key'
    }));

    act(() => {
      result.current.changeTab('tab2');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'custom-key',
      expect.any(String)
    );
  });

  it('should not persist when disabled', () => {
    const { result } = renderHook(() => usePersistentTabNavigation(mockTabs, {
      persistActiveTab: false,
      persistHistory: false
    }));

    act(() => {
      result.current.changeTab('tab2');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tab-navigation',
      JSON.stringify({
        activeTab: undefined,
        tabHistory: undefined
      })
    );
  });
});

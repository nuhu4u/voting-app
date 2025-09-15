/**
 * Elections Pagination Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useElectionsPagination } from '@/hooks/use-elections-pagination';

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

describe('useElectionsPagination', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.itemsPerPage).toBe(10);
    expect(result.current.pagination.totalItems).toBe(100);
    expect(result.current.pagination.totalPages).toBe(10);
  });

  it('should initialize with custom options', () => {
    const { result } = renderHook(() => useElectionsPagination(100, {
      initialPage: 2,
      initialItemsPerPage: 25
    }));

    expect(result.current.pagination.currentPage).toBe(2);
    expect(result.current.pagination.itemsPerPage).toBe(25);
    expect(result.current.pagination.totalPages).toBe(4);
  });

  it('should calculate pagination info correctly', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    expect(result.current.paginationInfo.currentPage).toBe(1);
    expect(result.current.paginationInfo.totalPages).toBe(10);
    expect(result.current.paginationInfo.totalItems).toBe(100);
    expect(result.current.paginationInfo.startItem).toBe(1);
    expect(result.current.paginationInfo.endItem).toBe(10);
    expect(result.current.paginationInfo.hasNextPage).toBe(true);
    expect(result.current.paginationInfo.hasPreviousPage).toBe(false);
  });

  it('should set current page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(result.current.pagination.currentPage).toBe(3);
    expect(result.current.paginationInfo.startItem).toBe(21);
    expect(result.current.paginationInfo.endItem).toBe(30);
  });

  it('should not set current page beyond total pages', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(15);
    });

    expect(result.current.pagination.currentPage).toBe(10);
  });

  it('should not set current page below 1', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(0);
    });

    expect(result.current.pagination.currentPage).toBe(1);
  });

  it('should set items per page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setItemsPerPage(25);
    });

    expect(result.current.pagination.itemsPerPage).toBe(25);
    expect(result.current.pagination.totalPages).toBe(4);
    expect(result.current.pagination.currentPage).toBe(1);
  });

  it('should not set items per page beyond max', () => {
    const { result } = renderHook(() => useElectionsPagination(100, {
      maxItemsPerPage: 50
    }));

    act(() => {
      result.current.setItemsPerPage(100);
    });

    expect(result.current.pagination.itemsPerPage).toBe(50);
  });

  it('should set total items', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setTotalItems(200);
    });

    expect(result.current.pagination.totalItems).toBe(200);
    expect(result.current.pagination.totalPages).toBe(20);
  });

  it('should go to next page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.goToNextPage();
    });

    expect(result.current.pagination.currentPage).toBe(2);
  });

  it('should not go to next page if already on last page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(10);
      result.current.goToNextPage();
    });

    expect(result.current.pagination.currentPage).toBe(10);
  });

  it('should go to previous page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(3);
      result.current.goToPreviousPage();
    });

    expect(result.current.pagination.currentPage).toBe(2);
  });

  it('should not go to previous page if already on first page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.goToPreviousPage();
    });

    expect(result.current.pagination.currentPage).toBe(1);
  });

  it('should go to first page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(5);
      result.current.goToFirstPage();
    });

    expect(result.current.pagination.currentPage).toBe(1);
  });

  it('should go to last page', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.goToLastPage();
    });

    expect(result.current.pagination.currentPage).toBe(10);
  });

  it('should check if can go next', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    expect(result.current.canGoNext).toBe(true);

    act(() => {
      result.current.setCurrentPage(10);
    });

    expect(result.current.canGoNext).toBe(false);
  });

  it('should check if can go previous', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    expect(result.current.canGoPrevious).toBe(false);

    act(() => {
      result.current.setCurrentPage(2);
    });

    expect(result.current.canGoPrevious).toBe(true);
  });

  it('should get page items correctly', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    act(() => {
      result.current.setCurrentPage(2);
    });

    const pageItems = result.current.getPageItems(items);

    expect(pageItems).toHaveLength(10);
    expect(pageItems[0].id).toBe(11);
    expect(pageItems[9].id).toBe(20);
  });

  it('should get visible pages correctly', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(5);
    });

    const visiblePages = result.current.getVisiblePages(5);

    expect(visiblePages).toContain(3);
    expect(visiblePages).toContain(4);
    expect(visiblePages).toContain(5);
    expect(visiblePages).toContain(6);
    expect(visiblePages).toContain(7);
  });

  it('should show ellipsis for large page ranges', () => {
    const { result } = renderHook(() => useElectionsPagination(1000));

    act(() => {
      result.current.setCurrentPage(50);
    });

    const visiblePages = result.current.getVisiblePages(5);

    expect(visiblePages).toContain('...');
  });

  it('should reset pagination', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(5);
      result.current.setItemsPerPage(25);
      result.current.resetPagination();
    });

    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.itemsPerPage).toBe(10);
  });

  it('should update pagination with partial updates', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.updatePagination({
        currentPage: 3,
        itemsPerPage: 25
      });
    });

    expect(result.current.pagination.currentPage).toBe(3);
    expect(result.current.pagination.itemsPerPage).toBe(25);
    expect(result.current.pagination.totalPages).toBe(4);
  });

  it('should get pagination stats', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(3);
    });

    const stats = result.current.getPaginationStats();

    expect(stats.totalPages).toBe(10);
    expect(stats.currentPage).toBe(3);
    expect(stats.itemsPerPage).toBe(10);
    expect(stats.totalItems).toBe(100);
    expect(stats.startItem).toBe(21);
    expect(stats.endItem).toBe(30);
    expect(stats.hasNextPage).toBe(true);
    expect(stats.hasPreviousPage).toBe(true);
    expect(stats.pageRange.start).toBe(21);
    expect(stats.pageRange.end).toBe(30);
  });

  it('should export pagination data', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(3);
    });

    const exportedData = result.current.exportPaginationData();

    expect(exportedData.pagination.currentPage).toBe(3);
    expect(exportedData.paginationInfo.currentPage).toBe(3);
    expect(exportedData.timestamp).toBeDefined();
  });

  it('should import pagination data', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    const importData = {
      pagination: {
        currentPage: 5,
        itemsPerPage: 25,
        totalItems: 100,
        totalPages: 4
      }
    };

    act(() => {
      result.current.importPaginationData(importData);
    });

    expect(result.current.pagination.currentPage).toBe(5);
    expect(result.current.pagination.itemsPerPage).toBe(25);
  });

  it('should persist state to localStorage when enabled', () => {
    const { result } = renderHook(() => useElectionsPagination(100, {
      persistState: true,
      storageKey: 'test-pagination'
    }));

    act(() => {
      result.current.setCurrentPage(3);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-pagination',
      expect.stringContaining('"currentPage":3')
    );
  });

  it('should load state from localStorage when enabled', () => {
    const savedState = {
      currentPage: 5,
      itemsPerPage: 25,
      totalItems: 100,
      totalPages: 4
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useElectionsPagination(100, {
      persistState: true,
      storageKey: 'test-pagination'
    }));

    expect(result.current.pagination.currentPage).toBe(5);
    expect(result.current.pagination.itemsPerPage).toBe(25);
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useElectionsPagination(100, {
      persistState: true
    }));

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load pagination state:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should adjust current page when total pages changes', () => {
    const { result } = renderHook(() => useElectionsPagination(100));

    act(() => {
      result.current.setCurrentPage(10);
      result.current.setItemsPerPage(50); // This will reduce total pages to 2
    });

    expect(result.current.pagination.currentPage).toBe(2); // Should adjust to last valid page
  });

  it('should handle zero total items', () => {
    const { result } = renderHook(() => useElectionsPagination(0));

    expect(result.current.paginationInfo.totalPages).toBe(0);
    expect(result.current.paginationInfo.startItem).toBe(0);
    expect(result.current.paginationInfo.endItem).toBe(0);
    expect(result.current.paginationInfo.hasNextPage).toBe(false);
    expect(result.current.paginationInfo.hasPreviousPage).toBe(false);
  });

  it('should handle single page', () => {
    const { result } = renderHook(() => useElectionsPagination(5));

    expect(result.current.paginationInfo.totalPages).toBe(1);
    expect(result.current.paginationInfo.startItem).toBe(1);
    expect(result.current.paginationInfo.endItem).toBe(5);
    expect(result.current.paginationInfo.hasNextPage).toBe(false);
    expect(result.current.paginationInfo.hasPreviousPage).toBe(false);
  });
});

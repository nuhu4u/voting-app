/**
 * Elections Pagination Hook
 * Advanced pagination logic for elections
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  maxItemsPerPage?: number;
  availableItemsPerPage?: number[];
  persistState?: boolean;
  storageKey?: string;
}

export interface UseElectionsPaginationReturn {
  pagination: PaginationState;
  paginationInfo: PaginationInfo;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setTotalItems: (totalItems: number) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  canGoFirst: boolean;
  canGoLast: boolean;
  getPageItems: <T>(items: T[]) => T[];
  getVisiblePages: (maxVisible?: number) => (number | string)[];
  resetPagination: () => void;
  updatePagination: (updates: Partial<PaginationState>) => void;
  getPaginationStats: () => {
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    startItem: number;
    endItem: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    pageRange: { start: number; end: number };
  };
  exportPaginationData: () => any;
  importPaginationData: (data: any) => void;
}

const defaultOptions: PaginationOptions = {
  initialPage: 1,
  initialItemsPerPage: 10,
  maxItemsPerPage: 100,
  availableItemsPerPage: [5, 10, 25, 50, 100],
  persistState: true,
  storageKey: 'elections-pagination-state'
};

/**
 * Main Elections Pagination Hook
 */
export function useElectionsPagination(
  totalItems: number = 0,
  options: PaginationOptions = {}
): UseElectionsPaginationReturn {
  const config = { ...defaultOptions, ...options };
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: config.initialPage!,
    itemsPerPage: config.initialItemsPerPage!,
    totalItems,
    totalPages: Math.ceil(totalItems / config.initialItemsPerPage!)
  });

  // Calculate pagination info
  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    const startItem = totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const endItem = Math.min(pagination.currentPage * pagination.itemsPerPage, totalItems);
    
    return {
      currentPage: pagination.currentPage,
      totalPages,
      totalItems,
      itemsPerPage: pagination.itemsPerPage,
      startItem,
      endItem,
      hasNextPage: pagination.currentPage < totalPages,
      hasPreviousPage: pagination.currentPage > 1
    };
  }, [pagination, totalItems]);

  // Load pagination state from localStorage
  useEffect(() => {
    if (config.persistState) {
      try {
        const saved = localStorage.getItem(config.storageKey!);
        if (saved) {
          const savedState = JSON.parse(saved);
          setPagination(prev => ({
            ...prev,
            ...savedState,
            totalItems // Always use current totalItems
          }));
        }
      } catch (error) {
        console.error('Failed to load pagination state:', error);
      }
    }
  }, [config.persistState, config.storageKey]);

  // Save pagination state to localStorage
  useEffect(() => {
    if (config.persistState) {
      try {
        localStorage.setItem(config.storageKey!, JSON.stringify(pagination));
      } catch (error) {
        console.error('Failed to save pagination state:', error);
      }
    }
  }, [pagination, config.persistState, config.storageKey]);

  // Update total pages when totalItems or itemsPerPage changes
  useEffect(() => {
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages
    }));
  }, [totalItems, pagination.itemsPerPage]);

  // Adjust current page if it's beyond total pages
  useEffect(() => {
    if (pagination.currentPage > paginationInfo.totalPages && paginationInfo.totalPages > 0) {
      setPagination(prev => ({
        ...prev,
        currentPage: paginationInfo.totalPages
      }));
    }
  }, [pagination.currentPage, paginationInfo.totalPages]);

  // Set current page
  const setCurrentPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationInfo.totalPages));
    setPagination(prev => ({
      ...prev,
      currentPage: validPage
    }));
  }, [paginationInfo.totalPages]);

  // Set items per page
  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    const validItemsPerPage = Math.min(itemsPerPage, config.maxItemsPerPage!);
    const totalPages = Math.ceil(totalItems / validItemsPerPage);
    const newCurrentPage = Math.min(pagination.currentPage, totalPages);
    
    setPagination(prev => ({
      ...prev,
      itemsPerPage: validItemsPerPage,
      totalPages,
      currentPage: newCurrentPage
    }));
  }, [totalItems, pagination.currentPage, config.maxItemsPerPage]);

  // Set total items
  const setTotalItems = useCallback((totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    const newCurrentPage = Math.min(pagination.currentPage, totalPages);
    
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: newCurrentPage
    }));
  }, [pagination.itemsPerPage, pagination.currentPage]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  // Go to next page
  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(pagination.currentPage + 1);
    }
  }, [paginationInfo.hasNextPage, pagination.currentPage, setCurrentPage]);

  // Go to previous page
  const goToPreviousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(pagination.currentPage - 1);
    }
  }, [paginationInfo.hasPreviousPage, pagination.currentPage, setCurrentPage]);

  // Go to first page
  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  // Go to last page
  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationInfo.totalPages);
  }, [setCurrentPage, paginationInfo.totalPages]);

  // Check if can go to next page
  const canGoNext = paginationInfo.hasNextPage;

  // Check if can go to previous page
  const canGoPrevious = paginationInfo.hasPreviousPage;

  // Check if can go to first page
  const canGoFirst = pagination.currentPage > 1;

  // Check if can go to last page
  const canGoLast = pagination.currentPage < paginationInfo.totalPages;

  // Get items for current page
  const getPageItems = useCallback(<T>(items: T[]): T[] => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Get visible pages for pagination controls
  const getVisiblePages = useCallback((maxVisible: number = 5): (number | string)[] => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(1, pagination.currentPage - halfVisible);
    let endPage = Math.min(paginationInfo.totalPages, pagination.currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (pagination.currentPage <= halfVisible) {
      endPage = Math.min(paginationInfo.totalPages, maxVisible);
    }
    if (pagination.currentPage > paginationInfo.totalPages - halfVisible) {
      startPage = Math.max(1, paginationInfo.totalPages - maxVisible + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < paginationInfo.totalPages) {
      if (endPage < paginationInfo.totalPages - 1) {
        pages.push('...');
      }
      pages.push(paginationInfo.totalPages);
    }
    
    return pages;
  }, [pagination.currentPage, paginationInfo.totalPages]);

  // Reset pagination to initial state
  const resetPagination = useCallback(() => {
    setPagination({
      currentPage: config.initialPage!,
      itemsPerPage: config.initialItemsPerPage!,
      totalItems,
      totalPages: Math.ceil(totalItems / config.initialItemsPerPage!)
    });
  }, [config.initialPage, config.initialItemsPerPage, totalItems]);

  // Update pagination with partial updates
  const updatePagination = useCallback((updates: Partial<PaginationState>) => {
    setPagination(prev => {
      const newState = { ...prev, ...updates };
      
      // Recalculate totalPages if itemsPerPage or totalItems changed
      if (updates.itemsPerPage || updates.totalItems) {
        newState.totalPages = Math.ceil(newState.totalItems / newState.itemsPerPage);
      }
      
      // Ensure currentPage is within bounds
      if (updates.currentPage) {
        newState.currentPage = Math.max(1, Math.min(newState.currentPage, newState.totalPages));
      }
      
      return newState;
    });
  }, []);

  // Get pagination statistics
  const getPaginationStats = useCallback(() => {
    return {
      totalPages: paginationInfo.totalPages,
      currentPage: paginationInfo.currentPage,
      itemsPerPage: paginationInfo.itemsPerPage,
      totalItems: paginationInfo.totalItems,
      startItem: paginationInfo.startItem,
      endItem: paginationInfo.endItem,
      hasNextPage: paginationInfo.hasNextPage,
      hasPreviousPage: paginationInfo.hasPreviousPage,
      pageRange: {
        start: paginationInfo.startItem,
        end: paginationInfo.endItem
      }
    };
  }, [paginationInfo]);

  // Export pagination data
  const exportPaginationData = useCallback(() => {
    return {
      pagination,
      paginationInfo,
      timestamp: new Date().toISOString()
    };
  }, [pagination, paginationInfo]);

  // Import pagination data
  const importPaginationData = useCallback((data: any) => {
    try {
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to import pagination data:', error);
    }
  }, []);

  return {
    pagination,
    paginationInfo,
    setCurrentPage,
    setItemsPerPage,
    setTotalItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrevious,
    canGoFirst,
    canGoLast,
    getPageItems,
    getVisiblePages,
    resetPagination,
    updatePagination,
    getPaginationStats,
    exportPaginationData,
    importPaginationData
  };
}

export default useElectionsPagination;

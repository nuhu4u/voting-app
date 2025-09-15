/**
 * Elections Pagination Components
 * Advanced pagination system for elections list
 */

import * as React from 'react';

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

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showInfo?: boolean;
  showItemsPerPage?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export interface PaginationInfoProps {
  pagination: PaginationInfo;
  className?: string;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export interface ItemsPerPageSelectorProps {
  currentItemsPerPage: number;
  availableItemsPerPage: number[];
  onItemsPerPageChange: (itemsPerPage: number) => void;
  className?: string;
}

export interface PaginationButtonProps {
  page: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Pagination Button Component
 */
export function PaginationButton({
  page,
  isActive,
  isDisabled,
  onClick,
  children,
  className = ''
}: PaginationButtonProps) {
  const baseClasses = 'px-3 py-2 text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const activeClasses = 'bg-blue-600 text-white border-blue-600';
  const inactiveClasses = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  const disabledClasses = 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed';

  const buttonClasses = isDisabled
    ? `${baseClasses} ${disabledClasses}`
    : isActive
    ? `${baseClasses} ${activeClasses}`
    : `${baseClasses} ${inactiveClasses}`;

  return React.createElement('button', {
    onClick: isDisabled ? undefined : onClick,
    disabled: isDisabled,
    className: `${buttonClasses} ${className}`,
    'aria-label': `Go to page ${page}`,
    'aria-current': isActive ? 'page' : undefined
  }, children);
}

/**
 * Pagination Info Component
 */
export function PaginationInfo({
  pagination,
  className = ''
}: PaginationInfoProps) {
  const { startItem, endItem, totalItems, currentPage, totalPages } = pagination;

  return React.createElement('div', {
    className: `flex items-center text-sm text-gray-700 ${className}`
  },
    React.createElement('span', {},
      `Showing ${startItem} to ${endItem} of ${totalItems.toLocaleString()} results`
    ),
    totalPages > 1 && React.createElement('span', {
      className: 'ml-2 text-gray-500'
    }, `(Page ${currentPage} of ${totalPages})`)
  );
}

/**
 * Items Per Page Selector Component
 */
export function ItemsPerPageSelector({
  currentItemsPerPage,
  availableItemsPerPage,
  onItemsPerPageChange,
  className = ''
}: ItemsPerPageSelectorProps) {
  return React.createElement('div', {
    className: `flex items-center space-x-2 ${className}`
  },
    React.createElement('label', {
      className: 'text-sm text-gray-700'
    }, 'Items per page:'),
    React.createElement('select', {
      value: currentItemsPerPage,
      onChange: (e: any) => onItemsPerPageChange(Number(e.target.value)),
      className: 'px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    },
      availableItemsPerPage.map(items => 
        React.createElement('option', {
          key: items,
          value: items
        }, items)
      )
    )
  );
}

/**
 * Pagination Controls Component
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = ''
}: PaginationControlsProps) {
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
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
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return React.createElement('nav', {
    className: `flex items-center justify-center space-x-1 ${className}`,
    'aria-label': 'Pagination Navigation'
  },
    // First page button
    showFirstLast && React.createElement(PaginationButton, {
      page: 1,
      isActive: false,
      isDisabled: currentPage === 1,
      onClick: () => onPageChange(1),
      className: 'rounded-l-md'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M11 19l-7-7 7-7m8 14l-7-7 7-7'
        })
      )
    ),

    // Previous page button
    showPrevNext && React.createElement(PaginationButton, {
      page: currentPage - 1,
      isActive: false,
      isDisabled: currentPage === 1,
      onClick: () => onPageChange(currentPage - 1),
      className: showFirstLast ? '' : 'rounded-l-md'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M15 19l-7-7 7-7'
        })
      )
    ),

    // Page number buttons
    visiblePages.map((page, index) => 
      typeof page === 'number' 
        ? React.createElement(PaginationButton, {
            key: page,
            page,
            isActive: page === currentPage,
            isDisabled: false,
            onClick: () => onPageChange(page)
          }, page)
        : React.createElement('span', {
            key: `ellipsis-${index}`,
            className: 'px-3 py-2 text-sm text-gray-500'
          }, '...')
    ),

    // Next page button
    showPrevNext && React.createElement(PaginationButton, {
      page: currentPage + 1,
      isActive: false,
      isDisabled: currentPage === totalPages,
      onClick: () => onPageChange(currentPage + 1),
      className: showFirstLast ? '' : 'rounded-r-md'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M9 5l7 7-7 7'
        })
      )
    ),

    // Last page button
    showFirstLast && React.createElement(PaginationButton, {
      page: totalPages,
      isActive: false,
      isDisabled: currentPage === totalPages,
      onClick: () => onPageChange(totalPages),
      className: 'rounded-r-md'
    },
      React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M13 5l7 7-7 7M5 5l7 7-7 7'
        })
      )
    )
  );
}

/**
 * Main Pagination Component
 */
export function ElectionsPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showInfo = true,
  showItemsPerPage = true,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = ''
}: PaginationProps) {
  const pagination: PaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };

  const availableItemsPerPage = [10, 25, 50, 100];

  if (totalPages <= 1) {
    return showInfo ? React.createElement(PaginationInfo, {
      pagination,
      className
    }) : null;
  }

  return React.createElement('div', {
    className: `flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 ${className}`
  },
    // Pagination Info
    showInfo && React.createElement(PaginationInfo, {
      pagination
    }),

    // Pagination Controls
    React.createElement('div', {
      className: 'flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'
    },
      // Items per page selector
      showItemsPerPage && onItemsPerPageChange && React.createElement(ItemsPerPageSelector, {
        currentItemsPerPage: itemsPerPage,
        availableItemsPerPage,
        onItemsPerPageChange: onItemsPerPageChange!
      }),

      // Pagination controls
      React.createElement(PaginationControls, {
        currentPage,
        totalPages,
        onPageChange,
        showFirstLast,
        showPrevNext,
        maxVisiblePages
      })
    )
  );
}

export default ElectionsPagination;

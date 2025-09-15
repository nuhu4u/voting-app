/**
 * Elections Pagination Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  PaginationButton, 
  PaginationInfo, 
  ItemsPerPageSelector, 
  PaginationControls, 
  ElectionsPagination 
} from '@/components/elections/elections-pagination';

// Mock pagination data
const mockPaginationInfo = {
  currentPage: 2,
  totalPages: 10,
  totalItems: 100,
  itemsPerPage: 10,
  startItem: 11,
  endItem: 20,
  hasNextPage: true,
  hasPreviousPage: true
};

describe('PaginationButton', () => {
  const mockProps = {
    page: 1,
    isActive: false,
    isDisabled: false,
    onClick: jest.fn(),
    children: '1'
  };

  it('should render pagination button', () => {
    const { getByText } = render(
      React.createElement(PaginationButton, mockProps)
    );

    expect(getByText('1')).toBeTruthy();
  });

  it('should call onClick when clicked', () => {
    const { getByText } = render(
      React.createElement(PaginationButton, mockProps)
    );

    const button = getByText('1');
    fireEvent.press(button);

    expect(mockProps.onClick).toHaveBeenCalled();
  });

  it('should not call onClick when disabled', () => {
    const { getByText } = render(
      React.createElement(PaginationButton, { ...mockProps, isDisabled: true })
    );

    const button = getByText('1');
    fireEvent.press(button);

    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it('should apply active styles when isActive is true', () => {
    const { container } = render(
      React.createElement(PaginationButton, { ...mockProps, isActive: true })
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('should apply disabled styles when isDisabled is true', () => {
    const { container } = render(
      React.createElement(PaginationButton, { ...mockProps, isDisabled: true })
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-gray-100', 'text-gray-400');
  });

  it('should have correct aria attributes', () => {
    const { container } = render(
      React.createElement(PaginationButton, { ...mockProps, isActive: true })
    );

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('aria-label', 'Go to page 1');
    expect(button).toHaveAttribute('aria-current', 'page');
  });
});

describe('PaginationInfo', () => {
  it('should render pagination info', () => {
    const { getByText } = render(
      React.createElement(PaginationInfo, { pagination: mockPaginationInfo })
    );

    expect(getByText('Showing 11 to 20 of 100 results')).toBeTruthy();
    expect(getByText('(Page 2 of 10)')).toBeTruthy();
  });

  it('should not show page info when only one page', () => {
    const singlePageInfo = { ...mockPaginationInfo, totalPages: 1 };
    const { queryByText } = render(
      React.createElement(PaginationInfo, { pagination: singlePageInfo })
    );

    expect(queryByText('(Page 2 of 10)')).toBeFalsy();
  });
});

describe('ItemsPerPageSelector', () => {
  const mockProps = {
    currentItemsPerPage: 10,
    availableItemsPerPage: [5, 10, 25, 50],
    onItemsPerPageChange: jest.fn()
  };

  it('should render items per page selector', () => {
    const { getByText, container } = render(
      React.createElement(ItemsPerPageSelector, mockProps)
    );

    expect(getByText('Items per page:')).toBeTruthy();
    const select = container.querySelector('select');
    expect(select).toHaveValue('10');
  });

  it('should call onItemsPerPageChange when selection changes', () => {
    const { container } = render(
      React.createElement(ItemsPerPageSelector, mockProps)
    );

    const select = container.querySelector('select');
    fireEvent.change(select!, { target: { value: '25' } });

    expect(mockProps.onItemsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('should render all available options', () => {
    const { container } = render(
      React.createElement(ItemsPerPageSelector, mockProps)
    );

    const select = container.querySelector('select');
    const options = select!.querySelectorAll('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('5');
    expect(options[1]).toHaveValue('10');
    expect(options[2]).toHaveValue('25');
    expect(options[3]).toHaveValue('50');
  });
});

describe('PaginationControls', () => {
  const mockProps = {
    currentPage: 5,
    totalPages: 10,
    onPageChange: jest.fn(),
    showFirstLast: true,
    showPrevNext: true,
    maxVisiblePages: 5
  };

  it('should render pagination controls', () => {
    const { getByText } = render(
      React.createElement(PaginationControls, mockProps)
    );

    expect(getByText('1')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
  });

  it('should call onPageChange when page button is clicked', () => {
    const { getByText } = render(
      React.createElement(PaginationControls, mockProps)
    );

    const pageButton = getByText('6');
    fireEvent.press(pageButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(6);
  });

  it('should show ellipsis when there are many pages', () => {
    const manyPagesProps = { ...mockProps, currentPage: 8, totalPages: 20 };
    const { getByText } = render(
      React.createElement(PaginationControls, manyPagesProps)
    );

    expect(getByText('...')).toBeTruthy();
  });

  it('should disable first and previous buttons on first page', () => {
    const firstPageProps = { ...mockProps, currentPage: 1 };
    const { container } = render(
      React.createElement(PaginationControls, firstPageProps)
    );

    const buttons = container.querySelectorAll('button');
    expect(buttons[0]).toBeDisabled(); // First button
    expect(buttons[1]).toBeDisabled(); // Previous button
  });

  it('should disable last and next buttons on last page', () => {
    const lastPageProps = { ...mockProps, currentPage: 10 };
    const { container } = render(
      React.createElement(PaginationControls, lastPageProps)
    );

    const buttons = container.querySelectorAll('button');
    const lastButton = buttons[buttons.length - 1];
    const nextButton = buttons[buttons.length - 2];
    expect(lastButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should not show first/last buttons when showFirstLast is false', () => {
    const { queryByText } = render(
      React.createElement(PaginationControls, { ...mockProps, showFirstLast: false })
    );

    // Should not show first page (1) or last page (10) buttons
    expect(queryByText('1')).toBeFalsy();
    expect(queryByText('10')).toBeFalsy();
  });

  it('should not show prev/next buttons when showPrevNext is false', () => {
    const { container } = render(
      React.createElement(PaginationControls, { ...mockProps, showPrevNext: false })
    );

    const buttons = container.querySelectorAll('button');
    // Should only have page number buttons, no prev/next
    expect(buttons.length).toBeLessThan(10);
  });
});

describe('ElectionsPagination', () => {
  const mockProps = {
    currentPage: 3,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
    onItemsPerPageChange: jest.fn()
  };

  it('should render pagination component', () => {
    const { getByText } = render(
      React.createElement(ElectionsPagination, mockProps)
    );

    expect(getByText('Showing 21 to 30 of 100 results')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('should not render when totalPages is 1', () => {
    const { queryByText } = render(
      React.createElement(ElectionsPagination, { ...mockProps, totalPages: 1 })
    );

    expect(queryByText('Showing 21 to 30 of 100 results')).toBeTruthy();
    expect(queryByText('3')).toBeFalsy();
  });

  it('should call onPageChange when page is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionsPagination, mockProps)
    );

    const pageButton = getByText('4');
    fireEvent.press(pageButton);

    expect(mockProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('should call onItemsPerPageChange when items per page changes', () => {
    const { container } = render(
      React.createElement(ElectionsPagination, mockProps)
    );

    const select = container.querySelector('select');
    fireEvent.change(select!, { target: { value: '25' } });

    expect(mockProps.onItemsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('should not show items per page selector when onItemsPerPageChange is not provided', () => {
    const { queryByText } = render(
      React.createElement(ElectionsPagination, { ...mockProps, onItemsPerPageChange: undefined })
    );

    expect(queryByText('Items per page:')).toBeFalsy();
  });

  it('should not show pagination info when showInfo is false', () => {
    const { queryByText } = render(
      React.createElement(ElectionsPagination, { ...mockProps, showInfo: false })
    );

    expect(queryByText('Showing 21 to 30 of 100 results')).toBeFalsy();
  });

  it('should not show items per page selector when showItemsPerPage is false', () => {
    const { queryByText } = render(
      React.createElement(ElectionsPagination, { ...mockProps, showItemsPerPage: false })
    );

    expect(queryByText('Items per page:')).toBeFalsy();
  });

  it('should limit visible pages based on maxVisiblePages', () => {
    const { container } = render(
      React.createElement(ElectionsPagination, { ...mockProps, maxVisiblePages: 3 })
    );

    const buttons = container.querySelectorAll('button');
    // Should have limited number of page buttons
    expect(buttons.length).toBeLessThan(10);
  });

  it('should show correct page range for large datasets', () => {
    const largeDatasetProps = {
      ...mockProps,
      currentPage: 50,
      totalPages: 100,
      totalItems: 1000,
      itemsPerPage: 10
    };

    const { getByText } = render(
      React.createElement(ElectionsPagination, largeDatasetProps)
    );

    expect(getByText('Showing 491 to 500 of 1,000 results')).toBeTruthy();
  });
});

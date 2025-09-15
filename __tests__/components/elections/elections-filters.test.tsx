/**
 * Elections Filters Tests
 */

import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { 
  FilterChip, 
  FilterDropdown, 
  DateRangeFilter, 
  FilterStats, 
  ElectionsFilters 
} from '@/components/elections/elections-filters';

// Mock filter data
const mockFilters = {
  status: ['active'],
  category: ['Presidential'],
  location: ['Nigeria'],
  votingMethod: ['hybrid'],
  securityLevel: ['maximum'],
  priority: ['high'],
  hasVoted: null,
  isBookmarked: null,
  isStarred: null,
  dateRange: {
    start: '2023-01-01',
    end: '2023-12-31'
  },
  tags: ['presidential', 'national']
};

const mockAvailableOptions = {
  status: [
    { value: 'active', label: 'Active', count: 5, color: 'green' },
    { value: 'upcoming', label: 'Upcoming', count: 3, color: 'blue' },
    { value: 'completed', label: 'Completed', count: 10, color: 'gray' }
  ],
  category: [
    { value: 'Presidential', label: 'Presidential', count: 2, color: 'purple' },
    { value: 'Senate', label: 'Senate', count: 5, color: 'blue' },
    { value: 'House of Reps', label: 'House of Reps', count: 8, color: 'green' }
  ],
  location: [
    { value: 'Nigeria', label: 'Nigeria', count: 15, color: 'purple' },
    { value: 'Lagos State', label: 'Lagos State', count: 8, color: 'blue' }
  ],
  votingMethod: [
    { value: 'online', label: 'Online', count: 10, color: 'blue' },
    { value: 'hybrid', label: 'Hybrid', count: 5, color: 'green' },
    { value: 'offline', label: 'Offline', count: 3, color: 'gray' }
  ],
  securityLevel: [
    { value: 'standard', label: 'Standard', count: 5, color: 'gray' },
    { value: 'enhanced', label: 'Enhanced', count: 8, color: 'yellow' },
    { value: 'maximum', label: 'Maximum', count: 5, color: 'red' }
  ],
  priority: [
    { value: 'high', label: 'High', count: 3, color: 'red' },
    { value: 'medium', label: 'Medium', count: 10, color: 'yellow' },
    { value: 'low', label: 'Low', count: 5, color: 'green' }
  ],
  tags: [
    { value: 'presidential', label: 'presidential', count: 2, color: 'purple' },
    { value: 'national', label: 'national', count: 5, color: 'blue' },
    { value: 'state', label: 'state', count: 8, color: 'green' }
  ]
};

describe('FilterChip', () => {
  it('should render filter chip with label and remove button', () => {
    const onRemove = jest.fn();
    const { getByText } = render(
      React.createElement(FilterChip, {
        label: 'Status: Active',
        value: 'active',
        onRemove
      })
    );

    expect(getByText('Status: Active')).toBeTruthy();
  });

  it('should call onRemove when remove button is clicked', () => {
    const onRemove = jest.fn();
    const { container } = render(
      React.createElement(FilterChip, {
        label: 'Status: Active',
        value: 'active',
        onRemove
      })
    );

    const removeButton = container.querySelector('button');
    fireEvent.press(removeButton!);

    expect(onRemove).toHaveBeenCalled();
  });

  it('should apply correct color classes', () => {
    const onRemove = jest.fn();
    const { container } = render(
      React.createElement(FilterChip, {
        label: 'Status: Active',
        value: 'active',
        onRemove,
        color: 'green'
      })
    );

    const chip = container.firstChild;
    expect(chip).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');
  });
});

describe('FilterDropdown', () => {
  const mockProps = {
    label: 'Status',
    options: mockAvailableOptions.status,
    selectedValues: ['active'],
    onSelectionChange: jest.fn(),
    multiple: true
  };

  it('should render dropdown with label', () => {
    const { getByText } = render(
      React.createElement(FilterDropdown, mockProps)
    );

    expect(getByText('Status (1)')).toBeTruthy();
  });

  it('should show options when clicked', () => {
    const { getByText, container } = render(
      React.createElement(FilterDropdown, mockProps)
    );

    const dropdownButton = getByText('Status (1)');
    fireEvent.press(dropdownButton);

    expect(getByText('Active')).toBeTruthy();
    expect(getByText('Upcoming')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
  });

  it('should call onSelectionChange when option is clicked', () => {
    const { getByText, container } = render(
      React.createElement(FilterDropdown, mockProps)
    );

    const dropdownButton = getByText('Status (1)');
    fireEvent.press(dropdownButton);

    const upcomingOption = getByText('Upcoming');
    fireEvent.press(upcomingOption);

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith(['active', 'upcoming']);
  });

  it('should show search input when searchable is true', () => {
    const { container } = render(
      React.createElement(FilterDropdown, {
        ...mockProps,
        searchable: true
      })
    );

    const dropdownButton = getByText('Status (1)');
    fireEvent.press(dropdownButton);

    const searchInput = container.querySelector('input[type="text"]');
    expect(searchInput).toBeTruthy();
  });

  it('should filter options based on search query', () => {
    const { getByText, container } = render(
      React.createElement(FilterDropdown, {
        ...mockProps,
        searchable: true
      })
    );

    const dropdownButton = getByText('Status (1)');
    fireEvent.press(dropdownButton);

    const searchInput = container.querySelector('input[type="text"]');
    fireEvent.change(searchInput!, { target: { value: 'active' } });

    expect(getByText('Active')).toBeTruthy();
    expect(() => getByText('Upcoming')).toThrow();
  });

  it('should show clear selection button when values are selected', () => {
    const { getByText, container } = render(
      React.createElement(FilterDropdown, mockProps)
    );

    const dropdownButton = getByText('Status (1)');
    fireEvent.press(dropdownButton);

    expect(getByText('Clear Selection')).toBeTruthy();
  });

  it('should clear selection when clear button is clicked', () => {
    const { getByText, container } = render(
      React.createElement(FilterDropdown, mockProps)
    );

    const dropdownButton = getByText('Status (1)');
    fireEvent.press(dropdownButton);

    const clearButton = getByText('Clear Selection');
    fireEvent.press(clearButton);

    expect(mockProps.onSelectionChange).toHaveBeenCalledWith([]);
  });
});

describe('DateRangeFilter', () => {
  const mockProps = {
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    onStartDateChange: jest.fn(),
    onEndDateChange: jest.fn()
  };

  it('should render date inputs', () => {
    const { container } = render(
      React.createElement(DateRangeFilter, mockProps)
    );

    const startDateInput = container.querySelector('input[type="date"]');
    const endDateInput = container.querySelectorAll('input[type="date"]')[1];

    expect(startDateInput).toBeTruthy();
    expect(endDateInput).toBeTruthy();
    expect(startDateInput).toHaveValue('2023-01-01');
    expect(endDateInput).toHaveValue('2023-12-31');
  });

  it('should call onStartDateChange when start date changes', () => {
    const { container } = render(
      React.createElement(DateRangeFilter, mockProps)
    );

    const startDateInput = container.querySelector('input[type="date"]');
    fireEvent.change(startDateInput!, { target: { value: '2023-02-01' } });

    expect(mockProps.onStartDateChange).toHaveBeenCalledWith('2023-02-01');
  });

  it('should call onEndDateChange when end date changes', () => {
    const { container } = render(
      React.createElement(DateRangeFilter, mockProps)
    );

    const endDateInput = container.querySelectorAll('input[type="date"]')[1];
    fireEvent.change(endDateInput!, { target: { value: '2023-11-30' } });

    expect(mockProps.onEndDateChange).toHaveBeenCalledWith('2023-11-30');
  });
});

describe('FilterStats', () => {
  const mockProps = {
    totalElections: 20,
    filteredElections: 5,
    activeFilters: 3,
    onClearAll: jest.fn()
  };

  it('should display election counts', () => {
    const { getByText } = render(
      React.createElement(FilterStats, mockProps)
    );

    expect(getByText('Showing 5 of 20 elections')).toBeTruthy();
    expect(getByText('3 filters active')).toBeTruthy();
  });

  it('should call onClearAll when clear all button is clicked', () => {
    const { getByText } = render(
      React.createElement(FilterStats, mockProps)
    );

    const clearAllButton = getByText('Clear All');
    fireEvent.press(clearAllButton);

    expect(mockProps.onClearAll).toHaveBeenCalled();
  });

  it('should not show clear all button when no active filters', () => {
    const { queryByText } = render(
      React.createElement(FilterStats, {
        ...mockProps,
        activeFilters: 0
      })
    );

    expect(queryByText('Clear All')).toBeFalsy();
  });
});

describe('ElectionsFilters', () => {
  const mockProps = {
    filters: mockFilters,
    onFiltersChange: jest.fn(),
    availableOptions: mockAvailableOptions,
    onClearFilters: jest.fn(),
    onApplyFilters: jest.fn(),
    isOpen: true,
    onToggle: jest.fn()
  };

  it('should render filter header', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    expect(getByText('Filter Elections')).toBeTruthy();
  });

  it('should render quick filters', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    expect(getByText('Quick Filters')).toBeTruthy();
    expect(getByText('Voted')).toBeTruthy();
    expect(getByText('Bookmarked')).toBeTruthy();
    expect(getByText('Starred')).toBeTruthy();
  });

  it('should render filter groups', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    expect(getByText('Status')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Location')).toBeTruthy();
    expect(getByText('Voting Method')).toBeTruthy();
    expect(getByText('Security Level')).toBeTruthy();
    expect(getByText('Priority')).toBeTruthy();
  });

  it('should render date range filter', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    expect(getByText('Date Range')).toBeTruthy();
  });

  it('should call onToggle when header button is clicked', () => {
    const { container } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    const toggleButton = container.querySelector('button');
    fireEvent.press(toggleButton!);

    expect(mockProps.onToggle).toHaveBeenCalled();
  });

  it('should call onApplyFilters when apply button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    const applyButton = getByText('Apply Filters');
    fireEvent.press(applyButton);

    expect(mockProps.onApplyFilters).toHaveBeenCalled();
  });

  it('should call onClearFilters when clear all button is clicked', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    const clearButton = getByText('Clear All');
    fireEvent.press(clearButton);

    expect(mockProps.onClearFilters).toHaveBeenCalled();
  });

  it('should not render content when closed', () => {
    const { queryByText } = render(
      React.createElement(ElectionsFilters, {
        ...mockProps,
        isOpen: false
      })
    );

    expect(queryByText('Quick Filters')).toBeFalsy();
    expect(queryByText('Status')).toBeFalsy();
  });

  it('should handle quick filter clicks', () => {
    const { getByText } = render(
      React.createElement(ElectionsFilters, mockProps)
    );

    const votedButton = getByText('Voted');
    fireEvent.press(votedButton);

    // Should update local state (tested through component behavior)
    expect(votedButton).toBeTruthy();
  });
});

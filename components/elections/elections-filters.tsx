/**
 * Elections Filter Components
 * Advanced filtering system for elections list
 */

import * as React from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'select' | 'date' | 'range';
  multiple?: boolean;
  searchable?: boolean;
}

export interface ElectionsFiltersProps {
  filters: {
    status: string[];
    category: string[];
    location: string[];
    votingMethod: string[];
    securityLevel: string[];
    priority: string[];
    hasVoted: boolean | null;
    isBookmarked: boolean | null;
    isStarred: boolean | null;
    dateRange: {
      start: string;
      end: string;
    };
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableOptions: {
    status: FilterOption[];
    category: FilterOption[];
    location: FilterOption[];
    votingMethod: FilterOption[];
    securityLevel: FilterOption[];
    priority: FilterOption[];
    tags: FilterOption[];
  };
  onClearFilters: () => void;
  onApplyFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
  color?: string;
  className?: string;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  className?: string;
}

export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
}

export interface FilterStatsProps {
  totalElections: number;
  filteredElections: number;
  activeFilters: number;
  onClearAll: () => void;
  className?: string;
}

/**
 * Filter Chip Component
 */
export function FilterChip({ 
  label, 
  value, 
  onRemove, 
  color = 'blue',
  className = '' 
}: FilterChipProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return React.createElement('div', {
    className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[color as keyof typeof colorClasses]} ${className}`
  },
    React.createElement('span', { className: 'mr-2' }, label),
    React.createElement('button', {
      onClick: onRemove,
      className: 'ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors',
      'aria-label': 'Remove filter'
    },
      React.createElement('svg', {
        className: 'w-3 h-3',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M6 18L18 6M6 6l12 12'
        })
      )
    )
  );
}

/**
 * Filter Dropdown Component
 */
export function FilterDropdown({
  label,
  options,
  selectedValues,
  onSelectionChange,
  multiple = true,
  searchable = false,
  placeholder = 'Select options...',
  className = ''
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onSelectionChange(newValues);
    } else {
      onSelectionChange([optionValue]);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  return React.createElement('div', { className: `relative ${className}` },
    React.createElement('button', {
      onClick: () => setIsOpen(!isOpen),
      className: 'w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between'
    },
      React.createElement('span', { className: 'text-gray-700' },
        selectedValues.length > 0 
          ? `${label} (${selectedValues.length})`
          : label
      ),
      React.createElement('svg', {
        className: `w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`,
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M19 9l-7 7-7-7'
        })
      )
    ),

    isOpen && React.createElement('div', {
      className: 'absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden'
    },
      searchable && React.createElement('div', { className: 'p-2 border-b border-gray-200' },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search options...',
          value: searchQuery,
          onChange: (e: any) => setSearchQuery(e.target.value),
          className: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        })
      ),

      React.createElement('div', { className: 'max-h-48 overflow-y-auto' },
        filteredOptions.map((option) => 
          React.createElement('button', {
            key: option.value,
            onClick: () => handleOptionClick(option.value),
            className: `w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
              selectedValues.includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`
          },
            React.createElement('span', { className: 'flex items-center' },
              React.createElement('span', {}, option.label),
              option.count && React.createElement('span', {
                className: 'ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full'
              }, option.count)
            ),
            selectedValues.includes(option.value) && React.createElement('svg', {
              className: 'w-4 h-4 text-blue-600',
              fill: 'currentColor',
              viewBox: '0 0 20 20'
            },
              React.createElement('path', {
                fillRule: 'evenodd',
                d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
                clipRule: 'evenodd'
              })
            )
          )
        )
      ),

      selectedValues.length > 0 && React.createElement('div', {
        className: 'p-2 border-t border-gray-200'
      },
        React.createElement('button', {
          onClick: handleClear,
          className: 'w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors'
        }, 'Clear Selection')
      )
    )
  );
}

/**
 * Date Range Filter Component
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = ''
}: DateRangeFilterProps) {
  return React.createElement('div', { className: `space-y-4 ${className}` },
    React.createElement('div', { className: 'space-y-2' },
      React.createElement('label', {
        className: 'block text-sm font-medium text-gray-700'
      }, 'Start Date'),
      React.createElement('input', {
        type: 'date',
        value: startDate,
        onChange: (e: any) => onStartDateChange(e.target.value),
        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      })
    ),
    React.createElement('div', { className: 'space-y-2' },
      React.createElement('label', {
        className: 'block text-sm font-medium text-gray-700'
      }, 'End Date'),
      React.createElement('input', {
        type: 'date',
        value: endDate,
        onChange: (e: any) => onEndDateChange(e.target.value),
        className: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      })
    )
  );
}

/**
 * Filter Stats Component
 */
export function FilterStats({
  totalElections,
  filteredElections,
  activeFilters,
  onClearAll,
  className = ''
}: FilterStatsProps) {
  return React.createElement('div', {
    className: `flex items-center justify-between p-4 bg-gray-50 rounded-lg ${className}`
  },
    React.createElement('div', { className: 'flex items-center space-x-4' },
      React.createElement('span', {
        className: 'text-sm text-gray-600'
      }, `Showing ${filteredElections} of ${totalElections} elections`),
      activeFilters > 0 && React.createElement('span', {
        className: 'px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'
      }, `${activeFilters} filter${activeFilters > 1 ? 's' : ''} active`)
    ),
    activeFilters > 0 && React.createElement('button', {
      onClick: onClearAll,
      className: 'px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors'
    }, 'Clear All')
  );
}

/**
 * Main Elections Filters Component
 */
export function ElectionsFilters({
  filters,
  onFiltersChange,
  availableOptions,
  onClearFilters,
  onApplyFilters,
  isOpen,
  onToggle,
  className = ''
}: ElectionsFiltersProps) {
  const [localFilters, setLocalFilters] = React.useState(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleClear = () => {
    const clearedFilters = {
      status: [],
      category: [],
      location: [],
      votingMethod: [],
      securityLevel: [],
      priority: [],
      hasVoted: null,
      isBookmarked: null,
      isStarred: null,
      dateRange: { start: '', end: '' },
      tags: []
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.category.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.votingMethod.length > 0) count++;
    if (filters.securityLevel.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.hasVoted !== null) count++;
    if (filters.isBookmarked !== null) count++;
    if (filters.isStarred !== null) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  const filterGroups: FilterGroup[] = [
    {
      key: 'status',
      label: 'Status',
      options: availableOptions.status,
      type: 'checkbox',
      multiple: true
    },
    {
      key: 'category',
      label: 'Category',
      options: availableOptions.category,
      type: 'checkbox',
      multiple: true,
      searchable: true
    },
    {
      key: 'location',
      label: 'Location',
      options: availableOptions.location,
      type: 'checkbox',
      multiple: true,
      searchable: true
    },
    {
      key: 'votingMethod',
      label: 'Voting Method',
      options: availableOptions.votingMethod,
      type: 'checkbox',
      multiple: true
    },
    {
      key: 'securityLevel',
      label: 'Security Level',
      options: availableOptions.securityLevel,
      type: 'checkbox',
      multiple: true
    },
    {
      key: 'priority',
      label: 'Priority',
      options: availableOptions.priority,
      type: 'checkbox',
      multiple: true
    }
  ];

  return React.createElement('div', { className: `bg-white border border-gray-200 rounded-lg shadow-sm ${className}` },
    // Filter Header
    React.createElement('div', {
      className: 'flex items-center justify-between p-4 border-b border-gray-200'
    },
      React.createElement('h3', {
        className: 'text-lg font-semibold text-gray-900'
      }, 'Filter Elections'),
      React.createElement('button', {
        onClick: onToggle,
        className: 'p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors'
      },
        React.createElement('svg', {
          className: `w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`,
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M19 9l-7 7-7-7'
          })
        )
      )
    ),

    // Filter Content
    isOpen && React.createElement('div', { className: 'p-4 space-y-6' },
      // Quick Filters
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('h4', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Quick Filters'),
        React.createElement('div', {
          className: 'flex flex-wrap gap-2'
        },
          React.createElement('button', {
            onClick: () => handleFilterChange('hasVoted', true),
            className: `px-3 py-1 text-sm rounded-full border transition-colors ${
              localFilters.hasVoted === true
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`
          }, 'Voted'),
          React.createElement('button', {
            onClick: () => handleFilterChange('isBookmarked', true),
            className: `px-3 py-1 text-sm rounded-full border transition-colors ${
              localFilters.isBookmarked === true
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`
          }, 'Bookmarked'),
          React.createElement('button', {
            onClick: () => handleFilterChange('isStarred', true),
            className: `px-3 py-1 text-sm rounded-full border transition-colors ${
              localFilters.isStarred === true
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`
          }, 'Starred')
        )
      ),

      // Filter Groups
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
        filterGroups.map((group) => 
          React.createElement(FilterDropdown, {
            key: group.key,
            label: group.label,
            options: group.options,
            selectedValues: localFilters[group.key as keyof typeof localFilters] as string[],
            onSelectionChange: (values) => handleFilterChange(group.key, values),
            multiple: group.multiple,
            searchable: group.searchable
          })
        )
      ),

      // Date Range Filter
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('h4', {
          className: 'text-sm font-medium text-gray-700'
        }, 'Date Range'),
        React.createElement(DateRangeFilter, {
          startDate: localFilters.dateRange.start,
          endDate: localFilters.dateRange.end,
          onStartDateChange: (date) => handleFilterChange('dateRange', { ...localFilters.dateRange, start: date }),
          onEndDateChange: (date) => handleFilterChange('dateRange', { ...localFilters.dateRange, end: date })
        })
      ),

      // Action Buttons
      React.createElement('div', {
        className: 'flex items-center justify-end space-x-3 pt-4 border-t border-gray-200'
      },
        React.createElement('button', {
          onClick: handleClear,
          className: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
        }, 'Clear All'),
        React.createElement('button', {
          onClick: handleApply,
          className: 'px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
        }, 'Apply Filters')
      )
    )
  );
}

export default ElectionsFilters;

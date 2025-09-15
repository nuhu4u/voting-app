/**
 * Voter Election List Components
 * Election list and management for the voter dashboard
 */

import * as React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Search, Filter, SortAsc, SortDesc, Calendar, Clock, Users, Shield, Vote, Eye, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react-native';

// Mock components for now
const View = ({ children, ...props }: any) => React.createElement('div', props, children);
const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
const TouchableOpacity = ({ children, ...props }: any) => React.createElement('button', props, children);
const Image = ({ ...props }: any) => React.createElement('img', props);
const Alert = { alert: jest.fn() };

const Card = ({ children, ...props }: any) => React.createElement('div', props, children);
const Button = ({ children, ...props }: any) => React.createElement('button', props, children);
const Badge = ({ children, ...props }: any) => React.createElement('span', props, children);
const Input = ({ ...props }: any) => React.createElement('input', props);

// Mock icons
const Search = () => React.createElement('span', { className: 'text-gray-400' }, '🔍');
const Filter = () => React.createElement('span', { className: 'text-gray-400' }, '🔽');
const SortAsc = () => React.createElement('span', { className: 'text-gray-400' }, '↑');
const SortDesc = () => React.createElement('span', { className: 'text-gray-400' }, '↓');
const Calendar = () => React.createElement('span', { className: 'text-gray-400' }, '📅');
const Clock = () => React.createElement('span', { className: 'text-gray-400' }, '🕐');
const Users = () => React.createElement('span', { className: 'text-gray-400' }, '👥');
const Shield = () => React.createElement('span', { className: 'text-gray-400' }, '🛡️');
const Vote = () => React.createElement('span', { className: 'text-gray-400' }, '🗳️');
const Eye = () => React.createElement('span', { className: 'text-gray-400' }, '👁️');
const CheckCircle = () => React.createElement('span', { className: 'text-green-600' }, '✅');
const AlertCircle = () => React.createElement('span', { className: 'text-orange-600' }, '⚠️');
const ExternalLink = () => React.createElement('span', { className: 'text-gray-400' }, '🔗');
const RefreshCw = () => React.createElement('span', { className: 'text-gray-400' }, '🔄');

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  totalCandidates: number;
  totalVoters: number;
  hasVoted: boolean;
  imageUrl?: string;
  category: string;
  location: string;
  requirements: string[];
  votingMethod: 'online' | 'hybrid' | 'offline';
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  blockchainHash?: string;
  resultsAvailable: boolean;
  participationRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ElectionFilters {
  status: string[];
  category: string[];
  location: string[];
  votingMethod: string[];
  securityLevel: string[];
  hasVoted: boolean | null;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface ElectionSort {
  field: 'title' | 'startDate' | 'endDate' | 'totalCandidates' | 'participationRate';
  direction: 'asc' | 'desc';
}

export interface ElectionListProps {
  elections: Election[];
  onElectionSelect: (election: Election) => void;
  onVote: (election: Election) => void;
  onViewResults: (election: Election) => void;
  filters: ElectionFilters;
  onFiltersChange: (filters: ElectionFilters) => void;
  sort: ElectionSort;
  onSortChange: (sort: ElectionSort) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export interface ElectionCardProps {
  election: Election;
  onSelect: (election: Election) => void;
  onVote: (election: Election) => void;
  onViewResults: (election: Election) => void;
  className?: string;
}

export interface ElectionFiltersProps {
  filters: ElectionFilters;
  onFiltersChange: (filters: ElectionFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

/**
 * Election Card Component
 */
export function ElectionCard({
  election,
  onSelect,
  onVote,
  onViewResults,
  className = '',
}: ElectionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'text-red-600';
      case 'enhanced': return 'text-orange-600';
      case 'standard': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isElectionActive = election.status === 'active';
  const isElectionUpcoming = election.status === 'upcoming';
  const isElectionCompleted = election.status === 'completed';
  const canVote = isElectionActive && !election.hasVoted;
  const canViewResults = isElectionCompleted && election.resultsAvailable;

  return React.createElement(Card, {
    className: `p-6 bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`
  },
    React.createElement('div', { className: 'flex flex-col lg:flex-row gap-4' },
      // Election Image/Icon
      React.createElement('div', { className: 'flex-shrink-0' },
        React.createElement('div', { className: 'w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center' },
          React.createElement('span', { className: 'text-2xl text-white' }, '🗳️')
        )
      ),

      // Election Content
      React.createElement('div', { className: 'flex-1 min-w-0' },
        // Header
        React.createElement('div', { className: 'flex items-start justify-between mb-3' },
          React.createElement('div', { className: 'flex-1 min-w-0' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-1 truncate' }, election.title),
            React.createElement('p', { className: 'text-sm text-gray-600 mb-2 line-clamp-2' }, election.description)
          ),
          React.createElement('div', { className: 'flex flex-col items-end space-y-2' },
            React.createElement(Badge, {
              className: `px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(election.status)}`
            }, election.status.charAt(0).toUpperCase() + election.status.slice(1)),
            election.hasVoted && React.createElement(Badge, {
              className: 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'
            },
              React.createElement(CheckCircle, null),
              React.createElement('span', { className: 'ml-1' }, 'Voted')
            )
          )
        ),

        // Election Details
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
              React.createElement(Calendar, null),
              React.createElement('span', null, `Start: ${formatDate(election.startDate)}`)
            ),
            React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
              React.createElement(Clock, null),
              React.createElement('span', null, `End: ${formatDate(election.endDate)}`)
            ),
            React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
              React.createElement(Users, null),
              React.createElement('span', null, `${election.totalCandidates} candidates`)
            )
          ),
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
              React.createElement('span', { className: 'font-medium' }, 'Category:'),
              React.createElement('span', null, election.category)
            ),
            React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
              React.createElement('span', { className: 'font-medium' }, 'Location:'),
              React.createElement('span', null, election.location)
            ),
            React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
              React.createElement('span', { className: 'font-medium' }, 'Participation:'),
              React.createElement('span', null, `${election.participationRate}%`)
            )
          )
        ),

        // Requirements
        React.createElement('div', { className: 'mb-4' },
          React.createElement('p', { className: 'text-xs font-medium text-gray-500 mb-2' }, 'Requirements:'),
          React.createElement('div', { className: 'flex flex-wrap gap-1' },
            election.requirements.map((req, index) => 
              React.createElement(Badge, {
                key: index,
                className: 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
              }, req)
            )
          )
        ),

        // Security and Blockchain Info
        React.createElement('div', { className: 'flex items-center justify-between mb-4' },
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement(Shield, null),
            React.createElement('span', { 
              className: `text-sm font-medium ${getSecurityLevelColor(election.securityLevel)}`
            }, `Security: ${election.securityLevel}`)
          ),
          election.blockchainHash && React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement('span', { className: 'text-xs text-gray-500' }, 'Blockchain:'),
            React.createElement('span', { className: 'text-xs font-mono text-gray-600' }, 
              election.blockchainHash.slice(0, 8) + '...'
            )
          )
        ),

        // Action Buttons
        React.createElement('div', { className: 'flex flex-wrap gap-2' },
          React.createElement(Button, {
            onClick: () => onSelect(election),
            className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
          },
            React.createElement(Eye, null),
            React.createElement('span', null, 'View Details')
          ),
          
          canVote && React.createElement(Button, {
            onClick: () => onVote(election),
            className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
          },
            React.createElement(Vote, null),
            React.createElement('span', null, 'Vote Now')
          ),
          
          canViewResults && React.createElement(Button, {
            onClick: () => onViewResults(election),
            className: 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2'
          },
            React.createElement(ExternalLink, null),
            React.createElement('span', null, 'View Results')
          )
        )
      )
    )
  );
}

/**
 * Election Filters Component
 */
export function ElectionFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className = '',
}: ElectionFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleFilterChange = (key: keyof ElectionFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayFilterChange = (key: keyof ElectionFilters, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    handleFilterChange(key, newArray);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== null && value !== ''
  );

  return React.createElement('div', { className: `space-y-4 ${className}` },
    // Filter Toggle Button
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('button', {
        onClick: () => setIsOpen(!isOpen),
        className: `px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
          hasActiveFilters 
            ? 'border-blue-300 bg-blue-50 text-blue-700' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`
      },
        React.createElement(Filter, null),
        React.createElement('span', null, 'Filters'),
        hasActiveFilters && React.createElement(Badge, {
          className: 'px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
        }, Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v !== null && v !== '').length)
      ),
      hasActiveFilters && React.createElement('button', {
        onClick: onClearFilters,
        className: 'text-sm text-gray-500 hover:text-gray-700'
      }, 'Clear All')
    ),

    // Filter Panel
    isOpen && React.createElement(Card, { className: 'p-4 bg-gray-50 border border-gray-200' },
      React.createElement('div', { className: 'space-y-6' },
        // Status Filter
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Status'),
          React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-2' },
            ['upcoming', 'active', 'completed', 'cancelled'].map(status => 
              React.createElement('label', {
                key: status,
                className: 'flex items-center space-x-2 cursor-pointer'
              },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: filters.status.includes(status),
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    handleArrayFilterChange('status', status, e.target.checked),
                  className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                }),
                React.createElement('span', { className: 'text-sm text-gray-700' }, 
                  status.charAt(0).toUpperCase() + status.slice(1)
                )
              )
            )
          )
        ),

        // Category Filter
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Category'),
          React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-2' },
            ['Presidential', 'Senate', 'House of Reps', 'Governor', 'State Assembly', 'Local Government'].map(category => 
              React.createElement('label', {
                key: category,
                className: 'flex items-center space-x-2 cursor-pointer'
              },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: filters.category.includes(category),
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    handleArrayFilterChange('category', category, e.target.checked),
                  className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                }),
                React.createElement('span', { className: 'text-sm text-gray-700' }, category)
              )
            )
          )
        ),

        // Voting Method Filter
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Voting Method'),
          React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
            ['online', 'hybrid', 'offline'].map(method => 
              React.createElement('label', {
                key: method,
                className: 'flex items-center space-x-2 cursor-pointer'
              },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: filters.votingMethod.includes(method),
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    handleArrayFilterChange('votingMethod', method, e.target.checked),
                  className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                }),
                React.createElement('span', { className: 'text-sm text-gray-700' }, 
                  method.charAt(0).toUpperCase() + method.slice(1)
                )
              )
            )
          )
        ),

        // Security Level Filter
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Security Level'),
          React.createElement('div', { className: 'grid grid-cols-3 gap-2' },
            ['standard', 'enhanced', 'maximum'].map(level => 
              React.createElement('label', {
                key: level,
                className: 'flex items-center space-x-2 cursor-pointer'
              },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: filters.securityLevel.includes(level),
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                    handleArrayFilterChange('securityLevel', level, e.target.checked),
                  className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                }),
                React.createElement('span', { className: 'text-sm text-gray-700' }, 
                  level.charAt(0).toUpperCase() + level.slice(1)
                )
              )
            )
          )
        ),

        // Voting Status Filter
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Voting Status'),
          React.createElement('div', { className: 'space-y-2' },
            React.createElement('label', { className: 'flex items-center space-x-2 cursor-pointer' },
              React.createElement('input', {
                type: 'radio',
                name: 'hasVoted',
                checked: filters.hasVoted === null,
                onChange: () => handleFilterChange('hasVoted', null),
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              }),
              React.createElement('span', { className: 'text-sm text-gray-700' }, 'All Elections')
            ),
            React.createElement('label', { className: 'flex items-center space-x-2 cursor-pointer' },
              React.createElement('input', {
                type: 'radio',
                name: 'hasVoted',
                checked: filters.hasVoted === true,
                onChange: () => handleFilterChange('hasVoted', true),
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              }),
              React.createElement('span', { className: 'text-sm text-gray-700' }, 'Voted')
            ),
            React.createElement('label', { className: 'flex items-center space-x-2 cursor-pointer' },
              React.createElement('input', {
                type: 'radio',
                name: 'hasVoted',
                checked: filters.hasVoted === false,
                onChange: () => handleFilterChange('hasVoted', false),
                className: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
              }),
              React.createElement('span', { className: 'text-sm text-gray-700' }, 'Not Voted')
            )
          )
        ),

        // Date Range Filter
        React.createElement('div', null,
          React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-3' }, 'Date Range'),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, 'Start Date'),
              React.createElement(Input, {
                type: 'date',
                value: filters.dateRange.start,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value }),
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-xs text-gray-500 mb-1' }, 'End Date'),
              React.createElement(Input, {
                type: 'date',
                value: filters.dateRange.end,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
                  handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value }),
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
              })
            )
          )
        )
      )
    )
  );
}

/**
 * Election List Component
 */
export function ElectionList({
  elections,
  onElectionSelect,
  onVote,
  onViewResults,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
  isLoading = false,
  error = null,
  className = '',
}: ElectionListProps) {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleSortChange = (field: ElectionSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction: newDirection });
  };

  if (error) {
    return React.createElement('div', { className: `text-center py-8 ${className}` },
      React.createElement('div', { className: 'mb-4' },
        React.createElement(AlertCircle, null)
      ),
      React.createElement('p', { className: 'text-red-600 mb-4' }, error),
      React.createElement(Button, {
        onClick: () => window.location.reload(),
        className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
      }, 'Try Again')
    );
  }

  if (isLoading) {
    return React.createElement('div', { className: `flex items-center justify-center py-8 ${className}` },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' }),
        React.createElement('p', { className: 'text-gray-600' }, 'Loading elections...')
      )
    );
  }

  if (elections.length === 0) {
    return React.createElement('div', { className: `text-center py-8 ${className}` },
      React.createElement('div', { className: 'mb-4' },
        React.createElement('span', { className: 'text-4xl' }, '🗳️')
      ),
      React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'No Elections Found'),
      React.createElement('p', { className: 'text-gray-600' }, 'There are no elections matching your current filters.')
    );
  }

  return React.createElement('div', { className: `space-y-6 ${className}` },
    // Search and Controls
    React.createElement('div', { className: 'flex flex-col md:flex-row gap-4' },
      // Search
      React.createElement('div', { className: 'flex-1 relative' },
        React.createElement(Input, {
          type: 'text',
          placeholder: 'Search elections...',
          value: searchQuery,
          onChange: handleSearchChange,
          className: 'pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }),
        React.createElement('div', { 
          className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' 
        },
          React.createElement(Search, null)
        )
      ),

      // View Mode Toggle
      React.createElement('div', { className: 'flex border border-gray-300 rounded-lg' },
        React.createElement('button', {
          onClick: () => setViewMode('grid'),
          className: `px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`
        }, 'Grid'),
        React.createElement('button', {
          onClick: () => setViewMode('list'),
          className: `px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`
        }, 'List')
      ),

      // Sort Dropdown
      React.createElement('div', { className: 'relative' },
        React.createElement('select', {
          value: `${sort.field}-${sort.direction}`,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
            const [field, direction] = e.target.value.split('-') as [ElectionSort['field'], ElectionSort['direction']];
            onSortChange({ field, direction });
          },
          className: 'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
        },
          React.createElement('option', { value: 'title-asc' }, 'Title A-Z'),
          React.createElement('option', { value: 'title-desc' }, 'Title Z-A'),
          React.createElement('option', { value: 'startDate-asc' }, 'Start Date (Earliest)'),
          React.createElement('option', { value: 'startDate-desc' }, 'Start Date (Latest)'),
          React.createElement('option', { value: 'participationRate-desc' }, 'Participation Rate (High)'),
          React.createElement('option', { value: 'participationRate-asc' }, 'Participation Rate (Low)')
        )
      )
    ),

    // Elections Grid/List
    React.createElement('div', {
      className: viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
    },
      elections.map((election) => 
        React.createElement(ElectionCard, {
          key: election.id,
          election,
          onSelect: onElectionSelect,
          onVote,
          onViewResults,
          className: viewMode === 'list' ? 'max-w-none' : ''
        })
      )
    )
  );
}

export default {
  ElectionCard,
  ElectionFilters,
  ElectionList
};

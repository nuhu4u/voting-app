/**
 * Elections List Component
 * Enhanced elections list with advanced features
 */

import * as React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Search, Filter, SortAsc, SortDesc, Calendar, Clock, Users, Shield, Vote, Eye, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Star, Bookmark, Share, MoreVertical } from 'lucide-react-native';

// Mock components for now
const View = ({ children, ...props }: any) => React.createElement('div', props, children);
const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
const TouchableOpacity = ({ children, ...props }: any) => React.createElement('button', props, children);
const Image = ({ ...props }: any) => React.createElement('img', props);
const Alert = { alert: (message: string) => console.log('Alert:', message) };

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
const Star = () => React.createElement('span', { className: 'text-gray-400' }, '⭐');
const Bookmark = () => React.createElement('span', { className: 'text-gray-400' }, '🔖');
const Share = () => React.createElement('span', { className: 'text-gray-400' }, '📤');
const MoreVertical = () => React.createElement('span', { className: 'text-gray-400' }, '⋮');

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
  isBookmarked: boolean;
  isStarred: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ElectionsListProps {
  elections: Election[];
  onElectionSelect: (election: Election) => void;
  onVote: (election: Election) => void;
  onViewResults: (election: Election) => void;
  onBookmark: (electionId: string) => void;
  onStar: (electionId: string) => void;
  onShare: (election: Election) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export interface ElectionListItemProps {
  election: Election;
  onSelect: (election: Election) => void;
  onVote: (election: Election) => void;
  onViewResults: (election: Election) => void;
  onBookmark: (electionId: string) => void;
  onStar: (electionId: string) => void;
  onShare: (election: Election) => void;
  className?: string;
}

/**
 * Election List Item Component
 */
export function ElectionListItem({
  election,
  onSelect,
  onVote,
  onViewResults,
  onBookmark,
  onStar,
  onShare,
  className = '',
}: ElectionListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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
    className: `p-6 bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group ${className}`
  },
    React.createElement('div', { className: 'space-y-4' },
      // Header
      React.createElement('div', { className: 'flex items-start justify-between' },
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('div', { className: 'flex items-center space-x-3 mb-2' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 truncate' }, election.title),
            React.createElement(Badge, {
              className: `px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(election.status)}`
            }, election.status.charAt(0).toUpperCase() + election.status.slice(1)),
            election.priority === 'high' && React.createElement(Badge, {
              className: 'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'
            }, 'High Priority')
          ),
          React.createElement('p', { className: 'text-sm text-gray-600 mb-2 line-clamp-2' }, election.description),
          React.createElement('div', { className: 'flex items-center space-x-4 text-xs text-gray-500' },
            React.createElement('div', { className: 'flex items-center space-x-1' },
              React.createElement(Calendar, null),
              React.createElement('span', null, formatDate(election.startDate))
            ),
            React.createElement('div', { className: 'flex items-center space-x-1' },
              React.createElement(Clock, null),
              React.createElement('span', null, formatDate(election.endDate))
            ),
            React.createElement('div', { className: 'flex items-center space-x-1' },
              React.createElement(Users, null),
              React.createElement('span', null, `${election.totalCandidates} candidates`)
            )
          )
        ),
        React.createElement('div', { className: 'flex items-center space-x-2 ml-4' },
          React.createElement(Button, {
            onClick: () => onBookmark(election.id),
            className: `p-2 rounded-lg transition-colors ${
              election.isBookmarked 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'text-gray-400 hover:bg-gray-100'
            }`
          },
            React.createElement(Bookmark, null)
          ),
          React.createElement(Button, {
            onClick: () => onStar(election.id),
            className: `p-2 rounded-lg transition-colors ${
              election.isStarred 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                : 'text-gray-400 hover:bg-gray-100'
            }`
          },
            React.createElement(Star, null)
          ),
          React.createElement(Button, {
            onClick: () => onShare(election),
            className: 'p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors'
          },
            React.createElement(Share, null)
          )
        )
      ),

      // Election Details
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Category'),
            React.createElement('span', { className: 'text-sm text-gray-900' }, election.category)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Location'),
            React.createElement('span', { className: 'text-sm text-gray-900' }, election.location)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Method'),
            React.createElement('span', { className: 'text-sm text-gray-900' }, 
              election.votingMethod.charAt(0).toUpperCase() + election.votingMethod.slice(1)
            )
          )
        ),
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Participation'),
            React.createElement('span', { className: 'text-sm text-gray-900' }, `${election.participationRate}%`)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Security'),
            React.createElement('span', { 
              className: `text-sm font-medium ${getSecurityLevelColor(election.securityLevel)}`
            }, election.securityLevel)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, 'Priority'),
            React.createElement('span', { 
              className: `text-sm font-medium ${getPriorityColor(election.priority)}`
            }, election.priority)
          )
        )
      ),

      // Requirements and Tags
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', null,
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
        election.tags.length > 0 && React.createElement('div', null,
          React.createElement('p', { className: 'text-xs font-medium text-gray-500 mb-2' }, 'Tags:'),
          React.createElement('div', { className: 'flex flex-wrap gap-1' },
            election.tags.map((tag, index) => 
              React.createElement(Badge, {
                key: index,
                className: 'px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
              }, tag)
            )
          )
        )
      ),

      // Blockchain and Verification
      election.blockchainHash && React.createElement('div', { className: 'bg-blue-50 p-3 rounded-lg' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement(Shield, null),
            React.createElement('span', { className: 'text-sm font-medium text-blue-800' }, 'Blockchain Verified')
          ),
          React.createElement('span', { className: 'text-xs font-mono text-blue-600' }, 
            election.blockchainHash.slice(0, 12) + '...'
          )
        )
      ),

      // Action Buttons
      React.createElement('div', { className: 'flex flex-wrap gap-2 pt-2' },
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
        ),

        election.hasVoted && React.createElement(Badge, {
          className: 'px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center space-x-1'
        },
          React.createElement(CheckCircle, null),
          React.createElement('span', null, 'Voted')
        )
      )
    )
  );
}

/**
 * Elections List Component
 */
export function ElectionsList({
  elections,
  onElectionSelect,
  onVote,
  onViewResults,
  onBookmark,
  onStar,
  onShare,
  isLoading = false,
  error = null,
  onRefresh,
  className = '',
}: ElectionsListProps) {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'date' | 'title' | 'participation' | 'priority'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const handleSortChange = (field: 'date' | 'title' | 'participation' | 'priority') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedElections = React.useMemo(() => {
    return [...elections].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'participation':
          aValue = a.participationRate;
          bValue = b.participationRate;
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [elections, sortBy, sortOrder]);

  if (error) {
    return React.createElement('div', { className: `text-center py-8 ${className}` },
      React.createElement('div', { className: 'mb-4' },
        React.createElement(AlertCircle, null)
      ),
      React.createElement('p', { className: 'text-red-600 mb-4' }, error),
      onRefresh && React.createElement(Button, {
        onClick: onRefresh,
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
      React.createElement('p', { className: 'text-gray-600' }, 'There are no elections available at the moment.')
    );
  }

  return React.createElement('div', { className: `space-y-6 ${className}` },
    // Controls
    React.createElement('div', { className: 'flex flex-col md:flex-row gap-4' },
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
          value: `${sortBy}-${sortOrder}`,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
            const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
            setSortBy(field);
            setSortOrder(order);
          },
          className: 'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
        },
          React.createElement('option', { value: 'date-desc' }, 'Date (Newest)'),
          React.createElement('option', { value: 'date-asc' }, 'Date (Oldest)'),
          React.createElement('option', { value: 'title-asc' }, 'Title A-Z'),
          React.createElement('option', { value: 'title-desc' }, 'Title Z-A'),
          React.createElement('option', { value: 'participation-desc' }, 'Participation (High)'),
          React.createElement('option', { value: 'participation-asc' }, 'Participation (Low)'),
          React.createElement('option', { value: 'priority-desc' }, 'Priority (High)'),
          React.createElement('option', { value: 'priority-asc' }, 'Priority (Low)')
        )
      ),

      // Refresh Button
      onRefresh && React.createElement(Button, {
        onClick: onRefresh,
        className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
      },
        React.createElement(RefreshCw, null),
        React.createElement('span', null, 'Refresh')
      )
    ),

    // Elections List
    React.createElement('div', {
      className: viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'space-y-4'
    },
      sortedElections.map((election) => 
        React.createElement(ElectionListItem, {
          key: election.id,
          election,
          onSelect: onElectionSelect,
          onVote,
          onViewResults,
          onBookmark,
          onStar,
          onShare,
          className: viewMode === 'list' ? 'max-w-none' : ''
        })
      )
    )
  );
}

export default {
  ElectionListItem,
  ElectionsList
};

/**
 * Voter Voting History Components
 * Voting history management for the voter dashboard
 */

import * as React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Search, Filter, Calendar, Clock, Users, Shield, Vote, Eye, CheckCircle, AlertCircle, ExternalLink, Download, RefreshCw, TrendingUp, BarChart3, Award, Target } from 'lucide-react-native';

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
const Calendar = () => React.createElement('span', { className: 'text-gray-400' }, '📅');
const Clock = () => React.createElement('span', { className: 'text-gray-400' }, '🕐');
const Users = () => React.createElement('span', { className: 'text-gray-400' }, '👥');
const Shield = () => React.createElement('span', { className: 'text-gray-400' }, '🛡️');
const Vote = () => React.createElement('span', { className: 'text-gray-400' }, '🗳️');
const Eye = () => React.createElement('span', { className: 'text-gray-400' }, '👁️');
const CheckCircle = () => React.createElement('span', { className: 'text-green-600' }, '✅');
const AlertCircle = () => React.createElement('span', { className: 'text-orange-600' }, '⚠️');
const ExternalLink = () => React.createElement('span', { className: 'text-gray-400' }, '🔗');
const Download = () => React.createElement('span', { className: 'text-gray-400' }, '⬇️');
const RefreshCw = () => React.createElement('span', { className: 'text-gray-400' }, '🔄');
const TrendingUp = () => React.createElement('span', { className: 'text-gray-400' }, '📈');
const BarChart3 = () => React.createElement('span', { className: 'text-gray-400' }, '📊');
const Award = () => React.createElement('span', { className: 'text-gray-400' }, '🏆');
const Target = () => React.createElement('span', { className: 'text-gray-400' }, '🎯');

export interface VotingRecord {
  id: string;
  electionId: string;
  electionTitle: string;
  electionCategory: string;
  candidateId: string;
  candidateName: string;
  candidateParty: string;
  voteDate: string;
  voteTime: string;
  votingMethod: 'online' | 'hybrid' | 'offline';
  location: string;
  pollingUnit: string;
  status: 'confirmed' | 'pending' | 'rejected';
  blockchainHash: string;
  transactionId: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  voteWeight: number;
  isSecretBallot: boolean;
  auditTrail: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VotingStats {
  totalVotes: number;
  successfulVotes: number;
  failedVotes: number;
  averageVoteTime: number;
  participationRate: number;
  favoriteCategory: string;
  mostVotedParty: string;
  votingStreak: number;
  lastVoteDate: string;
  totalElectionsParticipated: number;
}

export interface HistoryFilters {
  electionCategory: string[];
  votingMethod: string[];
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  candidateParty: string[];
}

export interface VotingHistoryProps {
  votingRecords: VotingRecord[];
  stats: VotingStats;
  onRecordSelect: (record: VotingRecord) => void;
  onViewElection: (electionId: string) => void;
  onViewCandidate: (candidateId: string) => void;
  onDownloadHistory: () => void;
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export interface VotingRecordCardProps {
  record: VotingRecord;
  onSelect: (record: VotingRecord) => void;
  onViewElection: (electionId: string) => void;
  onViewCandidate: (candidateId: string) => void;
  className?: string;
}

export interface VotingStatsCardProps {
  stats: VotingStats;
  className?: string;
}

/**
 * Voting Record Card Component
 */
export function VotingRecordCard({
  record,
  onSelect,
  onViewElection,
  onViewCandidate,
  className = '',
}: VotingRecordCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const time = timeString;
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: time
    };
  };

  const { date, time } = formatDateTime(record.voteDate, record.voteTime);

  return React.createElement(Card, {
    className: `p-6 bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`
  },
    React.createElement('div', { className: 'space-y-4' },
      // Header
      React.createElement('div', { className: 'flex items-start justify-between' },
        React.createElement('div', { className: 'flex-1' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-1' }, record.electionTitle),
          React.createElement('p', { className: 'text-sm text-gray-600 mb-2' }, record.electionCategory),
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement(Badge, {
              className: `px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`
            }, record.status.charAt(0).toUpperCase() + record.status.slice(1)),
            React.createElement('div', { className: 'flex items-center space-x-1' },
              React.createElement(Shield, null),
              React.createElement('span', { 
                className: `text-xs font-medium ${getVerificationColor(record.verificationStatus)}`
              }, record.verificationStatus)
            )
          )
        ),
        React.createElement('div', { className: 'text-right' },
          React.createElement('div', { className: 'text-sm text-gray-500' }, date),
          React.createElement('div', { className: 'text-sm text-gray-500' }, time)
        )
      ),

      // Candidate Information
      React.createElement('div', { className: 'bg-gray-50 p-4 rounded-lg' },
        React.createElement('h4', { className: 'text-sm font-medium text-gray-700 mb-2' }, 'Voted For'),
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'font-semibold text-gray-900' }, record.candidateName),
            React.createElement('p', { className: 'text-sm text-gray-600' }, record.candidateParty)
          ),
          React.createElement(Button, {
            onClick: () => onViewCandidate(record.candidateId),
            className: 'px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-100'
          }, 'View Candidate')
        )
      ),

      // Voting Details
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
            React.createElement('span', { className: 'font-medium' }, 'Method:'),
            React.createElement('span', null, record.votingMethod.charAt(0).toUpperCase() + record.votingMethod.slice(1))
          ),
          React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
            React.createElement('span', { className: 'font-medium' }, 'Location:'),
            React.createElement('span', null, record.location)
          ),
          React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
            React.createElement('span', { className: 'font-medium' }, 'Polling Unit:'),
            React.createElement('span', null, record.pollingUnit)
          )
        ),
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
            React.createElement('span', { className: 'font-medium' }, 'Vote Weight:'),
            React.createElement('span', null, record.voteWeight)
          ),
          React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
            React.createElement('span', { className: 'font-medium' }, 'Secret Ballot:'),
            React.createElement('span', null, record.isSecretBallot ? 'Yes' : 'No')
          ),
          React.createElement('div', { className: 'flex items-center space-x-2 text-sm text-gray-600' },
            React.createElement('span', { className: 'font-medium' }, 'Transaction ID:'),
            React.createElement('span', { className: 'font-mono text-xs' }, record.transactionId.slice(0, 8) + '...')
          )
        )
      ),

      // Blockchain Information
      React.createElement('div', { className: 'bg-blue-50 p-3 rounded-lg' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement(Shield, null),
            React.createElement('span', { className: 'text-sm font-medium text-blue-800' }, 'Blockchain Verified')
          ),
          React.createElement('span', { className: 'text-xs font-mono text-blue-600' }, 
            record.blockchainHash.slice(0, 12) + '...'
          )
        )
      ),

      // Action Buttons
      React.createElement('div', { className: 'flex justify-end space-x-2' },
        React.createElement(Button, {
          onClick: () => onViewElection(record.electionId),
          className: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2'
        },
          React.createElement(Eye, null),
          React.createElement('span', null, 'View Election')
        ),
        React.createElement(Button, {
          onClick: () => onSelect(record),
          className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
        },
          React.createElement(ExternalLink, null),
          React.createElement('span', null, 'View Details')
        )
      )
    )
  );
}

/**
 * Voting Stats Card Component
 */
export function VotingStatsCard({
  stats,
  className = '',
}: VotingStatsCardProps) {
  return React.createElement(Card, { className: `p-6 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}` },
    React.createElement('div', { className: 'space-y-6' },
      // Header
      React.createElement('div', { className: 'text-center' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-900 mb-2' }, 'Voting Statistics'),
        React.createElement('p', { className: 'text-gray-600' }, 'Your voting participation overview')
      ),

      // Main Stats Grid
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'text-3xl font-bold text-blue-600 mb-1' }, stats.totalVotes),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Total Votes')
        ),
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'text-3xl font-bold text-green-600 mb-1' }, stats.successfulVotes),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Successful')
        ),
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'text-3xl font-bold text-purple-600 mb-1' }, `${stats.participationRate}%`),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Participation')
        ),
        React.createElement('div', { className: 'text-center' },
          React.createElement('div', { className: 'text-3xl font-bold text-orange-600 mb-1' }, stats.votingStreak),
          React.createElement('div', { className: 'text-sm text-gray-600' }, 'Day Streak')
        )
      ),

      // Additional Stats
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 'Average Vote Time'),
            React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, `${stats.averageVoteTime} min`)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 'Favorite Category'),
            React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, stats.favoriteCategory)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 'Most Voted Party'),
            React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, stats.mostVotedParty)
          )
        ),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 'Last Vote'),
            React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, 
              new Date(stats.lastVoteDate).toLocaleDateString()
            )
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 'Elections Participated'),
            React.createElement('span', { className: 'text-sm font-medium text-gray-900' }, stats.totalElectionsParticipated)
          ),
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 'Failed Votes'),
            React.createElement('span', { className: 'text-sm font-medium text-red-600' }, stats.failedVotes)
          )
        )
      )
    )
  );
}

/**
 * Voting History Component
 */
export function VotingHistory({
  votingRecords,
  stats,
  onRecordSelect,
  onViewElection,
  onViewCandidate,
  onDownloadHistory,
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
  isLoading = false,
  error = null,
  className = '',
}: VotingHistoryProps) {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = React.useState<'date' | 'election' | 'candidate'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleSortChange = (field: 'date' | 'election' | 'candidate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedRecords = React.useMemo(() => {
    return [...votingRecords].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.voteDate);
          bValue = new Date(b.voteDate);
          break;
        case 'election':
          aValue = a.electionTitle;
          bValue = b.electionTitle;
          break;
        case 'candidate':
          aValue = a.candidateName;
          bValue = b.candidateName;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [votingRecords, sortBy, sortOrder]);

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
        React.createElement('p', { className: 'text-gray-600' }, 'Loading voting history...')
      )
    );
  }

  return React.createElement('div', { className: `space-y-6 ${className}` },
    // Stats Card
    React.createElement(VotingStatsCard, { stats }),

    // Search and Controls
    React.createElement('div', { className: 'flex flex-col md:flex-row gap-4' },
      // Search
      React.createElement('div', { className: 'flex-1 relative' },
        React.createElement(Input, {
          type: 'text',
          placeholder: 'Search voting history...',
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
          React.createElement('option', { value: 'election-asc' }, 'Election A-Z'),
          React.createElement('option', { value: 'election-desc' }, 'Election Z-A'),
          React.createElement('option', { value: 'candidate-asc' }, 'Candidate A-Z'),
          React.createElement('option', { value: 'candidate-desc' }, 'Candidate Z-A')
        )
      ),

      // Download Button
      React.createElement(Button, {
        onClick: onDownloadHistory,
        className: 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2'
      },
        React.createElement(Download, null),
        React.createElement('span', null, 'Download')
      )
    ),

    // Voting Records
    votingRecords.length === 0 ? 
      React.createElement('div', { className: 'text-center py-8' },
        React.createElement('div', { className: 'mb-4' },
          React.createElement('span', { className: 'text-4xl' }, '🗳️')
        ),
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-2' }, 'No Voting History'),
        React.createElement('p', { className: 'text-gray-600' }, 'You haven\'t voted in any elections yet.')
      ) :
      React.createElement('div', {
        className: viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      },
        sortedRecords.map((record) => 
          React.createElement(VotingRecordCard, {
            key: record.id,
            record,
            onSelect: onRecordSelect,
            onViewElection,
            onViewCandidate,
            className: viewMode === 'list' ? 'max-w-none' : ''
          })
        )
      )
  );
}

export default {
  VotingRecordCard,
  VotingStatsCard,
  VotingHistory
};

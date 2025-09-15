/**
 * Candidate List Component
 * Displays a list of candidates with filtering, sorting, and search capabilities
 */

import * as React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { CandidateCard } from './candidate-card';
import { Contestant } from '../../types/election';

interface CandidateListProps {
  candidates: Contestant[];
  electionStatus: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  onCandidatePress?: (candidate: Contestant) => void;
  onVote?: (candidate: Contestant) => void;
  onViewProfile?: (candidate: Contestant) => void;
  onShare?: (candidate: Contestant) => void;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  sortBy?: 'name' | 'votes' | 'party';
  sortOrder?: 'asc' | 'desc';
  filterBy?: string;
  searchQuery?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  showVoteButton?: boolean;
  showVoteCount?: boolean;
  className?: string;
}

export function CandidateList({
  candidates,
  electionStatus,
  onCandidatePress,
  onVote,
  onViewProfile,
  onShare,
  variant = 'default',
  sortBy = 'votes',
  sortOrder = 'desc',
  filterBy,
  searchQuery,
  isLoading = false,
  onRefresh,
  showVoteButton = true,
  showVoteCount = true,
  className
}: CandidateListProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  // Filter and sort candidates
  const processedCandidates = React.useMemo(() => {
    let filtered = candidates;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.party.toLowerCase().includes(query) ||
        candidate.party_acronym.toLowerCase().includes(query) ||
        candidate.position.toLowerCase().includes(query)
      );
    }

    // Apply party filter
    if (filterBy) {
      filtered = filtered.filter(candidate =>
        candidate.party.toLowerCase().includes(filterBy.toLowerCase()) ||
        candidate.party_acronym.toLowerCase().includes(filterBy.toLowerCase())
      );
    }

    // Sort candidates
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'votes':
          aValue = a.votes;
          bValue = b.votes;
          break;
        case 'party':
          aValue = a.party.toLowerCase();
          bValue = b.party.toLowerCase();
          break;
        default:
          aValue = a.votes;
          bValue = b.votes;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [candidates, searchQuery, filterBy, sortBy, sortOrder]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  }, [onRefresh]);

  const renderCandidate = ({ item }: { item: Contestant }) => {
    return React.createElement(CandidateCard, {
      key: item.id,
      candidate: item,
      electionStatus,
      onPress: onCandidatePress,
      onVote: onVote,
      onViewProfile: onViewProfile,
      onShare: onShare,
      variant,
      showVoteButton,
      showVoteCount
    });
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return React.createElement(View, { style: styles.emptyState },
        React.createElement(Text, { style: styles.emptyTitle }, 'Loading candidates...')
      );
    }

    if (searchQuery || filterBy) {
      return React.createElement(View, { style: styles.emptyState },
        React.createElement(Text, { style: styles.emptyTitle }, 'No candidates found'),
        React.createElement(Text, { style: styles.emptyMessage }, 
          'Try adjusting your search or filter criteria.')
      );
    }

    return React.createElement(View, { style: styles.emptyState },
      React.createElement(Text, { style: styles.emptyTitle }, 'No candidates registered'),
      React.createElement(Text, { style: styles.emptyMessage }, 
        'No candidates have been registered for this election yet.')
    );
  };

  const renderHeader = () => {
    if (processedCandidates.length === 0) return null;

    return React.createElement(View, { style: styles.header },
      React.createElement(Text, { style: styles.headerTitle }, 
        `${processedCandidates.length} candidate${processedCandidates.length === 1 ? '' : 's'}`
      ),
      React.createElement(Text, { style: styles.headerSubtitle },
        `Sorted by ${sortBy} (${sortOrder})`
      )
    );
  };

  const renderFooter = () => {
    if (processedCandidates.length === 0) return null;

    return React.createElement(View, { style: styles.footer },
      React.createElement(Text, { style: styles.footerText },
        `Showing ${processedCandidates.length} of ${candidates.length} candidates`
      )
    );
  };

  return React.createElement(View, { style: styles.container },
    React.createElement(FlatList, {
      data: processedCandidates,
      renderItem: renderCandidate as any,
      keyExtractor: (item: Contestant) => item.id,
      ListHeaderComponent: renderHeader,
      ListEmptyComponent: renderEmptyState,
      ListFooterComponent: renderFooter,
      refreshControl: onRefresh ? React.createElement(RefreshControl, {
        refreshing: refreshing,
        onRefresh: handleRefresh,
        colors: ['#3b82f6'],
        tintColor: '#3b82f6'
      }) : undefined,
      showsVerticalScrollIndicator: false,
      contentContainerStyle: styles.listContent
    })
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    padding: 16
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af'
  }
});

export default CandidateList;

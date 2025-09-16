import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VoteHistoryCard } from './vote-history-card';
import { Vote } from '@/lib/api/dashboard-service';
import { Election } from '@/types/election';

interface VoteHistoryListProps {
  voteHistory: Vote[];
  elections?: Election[];
  onViewPosition: (electionId: string) => void;
  onViewResults: (electionId: string) => void;
  onExploreBlockchain: (txHash: string) => void;
  onViewTransaction: (txHash: string) => void;
}

export const VoteHistoryList: React.FC<VoteHistoryListProps> = ({
  voteHistory,
  elections = [],
  onViewPosition,
  onViewResults,
  onExploreBlockchain,
  onViewTransaction,
}) => {
  if (!voteHistory || voteHistory.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="bar-chart" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>
          No votes cast yet. Participate in elections to see your vote history.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.listContainer}>
      {voteHistory.map((vote) => {
        const election = elections.find((e) => e.id === vote.election_id);
        if (!election) {
          console.warn(`Election with ID ${vote.election_id} not found for vote ${vote._id}`);
          return null;
        }
        return (
          <VoteHistoryCard
            key={vote._id}
            vote={vote}
            election={election}
            onViewPosition={onViewPosition}
            onViewResults={onViewResults}
            onExploreBlockchain={onExploreBlockchain}
            onViewTransaction={onViewTransaction}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default VoteHistoryList;
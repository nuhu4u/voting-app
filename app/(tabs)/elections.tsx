import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { electionService } from '@/lib/api/election-service';

interface Election {
  id: string;
  title: string;
  election_type: string;
  status: string;
  start_date: string;
  end_date: string;
  total_votes: number;
  contestants: any[];
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setIsLoading(true);
      console.log('🗳️ ElectionsPage: Loading elections...');
      
      const response = await electionService.getElections();
      if (response.success && response.data) {
        setElections(response.data);
        console.log('🗳️ ElectionsPage: Elections loaded:', response.data);
      } else {
        console.log('⚠️ ElectionsPage: No elections found');
        setElections([]);
      }
    } catch (error) {
      console.error('❌ ElectionsPage: Error loading elections:', error);
      setElections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadElections();
    setRefreshing(false);
  };

  const handleVoteNow = (electionId: string) => {
    if (isAuthenticated) {
      router.push(`/vote/${electionId}`);
    } else {
      Alert.alert(
        'Login Required',
        'Please login to cast your vote.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/login') }
        ]
      );
    }
  };

  const handleViewResults = (electionId: string) => {
    router.push(`/results/${electionId}`);
  };

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    if (now < startDate) return 'UPCOMING';
    if (now > endDate) return 'COMPLETED';
    return 'ONGOING';
  };

  const getLeadingCandidate = (election: Election) => {
    if (!election.contestants || election.contestants.length === 0) {
      return 'No candidates';
    }
    
    const sorted = election.contestants.sort((a, b) => b.votes - a.votes);
    const leading = sorted[0];
    return `${leading.name} (${leading.votes} votes)`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return '#10b981';
      case 'UPCOMING': return '#f59e0b';
      case 'COMPLETED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading elections...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Live Elections</Text>
        <Text style={styles.subtitle}>
          {elections.length} active election{elections.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {elections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ballot" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No Active Elections</Text>
          <Text style={styles.emptyText}>
            There are currently no active elections. Check back later for updates.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#2563eb" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        elections.map((election) => {
          const status = getElectionStatus(election);
          const isLive = status === 'ONGOING';
          
          return (
            <View key={election.id} style={[styles.electionCard, isLive && styles.liveElectionCard]}>
              <View style={styles.electionHeader}>
                <Text style={styles.electionTitle}>{election.title}</Text>
                {isLive && (
                  <View style={styles.liveIndicator}>
                    <Text style={styles.liveIndicatorText}>LIVE</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.electionType}>{election.election_type}</Text>
              
              <Text style={[styles.electionStatus, { color: getStatusColor(status) }]}>
                {isLive ? 'Currently accepting votes' : status} • Status: {status}
              </Text>
              
              <View style={styles.electionStats}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#6b7280" />
                  <Text style={styles.statText}>Total Votes: {election.total_votes || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="trophy" size={16} color="#6b7280" />
                  <Text style={styles.statText}>Leading: {getLeadingCandidate(election)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="person" size={16} color="#6b7280" />
                  <Text style={styles.statText}>Candidates: {election.contestants?.length || 0}</Text>
                </View>
              </View>
              
              <View style={styles.electionDates}>
                <Text style={styles.dateText}>
                  Start: {new Date(election.start_date).toLocaleDateString()}
                </Text>
                <Text style={styles.dateText}>
                  End: {new Date(election.end_date).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.electionButtons}>
                <TouchableOpacity 
                  style={styles.viewResultsButton}
                  onPress={() => handleViewResults(election.id)}
                >
                  <Ionicons name="eye" size={20} color="#FFFFFF" />
                  <Text style={styles.viewResultsButtonText}>View Results</Text>
                </TouchableOpacity>
                
                {isLive && (
                  <TouchableOpacity 
                    style={styles.voteNowButton}
                    onPress={() => handleVoteNow(election.id)}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.voteNowButtonText}>Vote Now</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  refreshButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  electionCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveElectionCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  electionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  liveIndicator: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  electionType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  electionStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  electionStats: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  electionDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  electionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewResultsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  viewResultsButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  voteNowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  voteNowButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { electionService } from '@/lib/api/election-service';
import { TestApiConnection } from '@/components/test-api-connection';

interface Election {
  id: string;
  title: string;
  election_type: string;
  status: string;
  total_votes: number;
  start_date: string;
  end_date: string;
}

export default function VotePositionPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [authLoading, isAuthenticated]);

  // Load elections
  useEffect(() => {
    if (isAuthenticated && user) {
      loadElections();
    }
  }, [isAuthenticated, user]);

  const loadElections = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 VotePositionPage: Loading elections...');
      const response = await electionService.getElections();
      
      if (response.success && response.data) {
        console.log('✅ VotePositionPage: Elections loaded successfully:', response.data.length, 'elections');
        setElections(response.data);
      } else {
        console.error('❌ VotePositionPage: Failed to load elections:', response.message);
        setError(response.message || 'Failed to load elections');
      }
    } catch (err) {
      console.error('❌ VotePositionPage: Error loading elections:', err);
      setError('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadElections();
    setRefreshing(false);
  };

  const handleElectionPress = (election: Election) => {
    router.push(`/vote-position/${election.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return '#10B981';
      case 'COMPLETED':
        return '#6B7280';
      case 'UPCOMING':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return '#10B981';
      case 'COMPLETED':
        return '#6B7280';
      case 'UPCOMING':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <View style={styles.headerIcon}>
              <Ionicons name="location" size={24} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Vote Position Tracking</Text>
              <Text style={styles.headerSubtitle}>Track your vote across all electoral levels</Text>
            </View>
          </View>
          <View style={styles.liveBadge}>
            <Ionicons name="time" size={12} color="#10B981" />
            <Text style={styles.liveBadgeText}>Live</Text>
          </View>
        </View>
      </View>

      {/* API Test Section - Remove this after testing */}
      <TestApiConnection />

      {/* Elections Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="location" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Available Elections</Text>
            <Text style={styles.sectionSubtitle}>
              Click on any election to view your vote position and tracking information
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingCardText}>Loading elections...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadElections}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : elections.length > 0 ? (
          <View style={styles.electionsList}>
            {elections.map((election) => (
              <TouchableOpacity
                key={election.id}
                style={styles.electionCard}
                onPress={() => handleElectionPress(election)}
                activeOpacity={0.7}
              >
                <View style={styles.electionHeader}>
                  <View style={styles.electionIcon}>
                    <Ionicons name="location" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.electionInfo}>
                    <Text style={styles.electionTitle}>{election.title}</Text>
                    <View style={styles.electionBadges}>
                      <View style={[styles.typeBadge, { backgroundColor: '#EBF4FF' }]}>
                        <Text style={[styles.typeBadgeText, { color: '#3B82F6' }]}>
                          {election.election_type}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(election.status) + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusColor(election.status) }]}>
                          {election.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>

                <View style={styles.electionStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="people" size={16} color="#6B7280" />
                    <Text style={styles.statText}>
                      <Text style={styles.statNumber}>{election.total_votes.toLocaleString()}</Text> votes
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.statText}>
                      {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.electionFooter}>
                  <Text style={styles.clickToViewText}>Click to view position</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="location" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Elections Available</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no elections to track positions for.
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      {elections.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Total Elections</Text>
                <Ionicons name="location" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.statCardValue}>{elections.length}</Text>
              <Text style={styles.statCardSubtext}>Available for tracking</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Ongoing Elections</Text>
                <Ionicons name="time" size={16} color="#10B981" />
              </View>
              <Text style={styles.statCardValue}>
                {elections.filter(e => e.status === 'ONGOING').length}
              </Text>
              <Text style={styles.statCardSubtext}>Currently active</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Total Votes</Text>
                <Ionicons name="people" size={16} color="#8B5CF6" />
              </View>
              <Text style={styles.statCardValue}>
                {elections.reduce((sum, e) => sum + e.total_votes, 0).toLocaleString()}
              </Text>
              <Text style={styles.statCardSubtext}>Across all elections</Text>
            </View>
          </View>
        </View>
      )}

      {/* Ready to Track */}
      {!loading && elections.length > 0 && (
        <View style={styles.readySection}>
          <View style={styles.readyCard}>
            <View style={styles.readyIcon}>
              <Ionicons name="location" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.readyTitle}>Ready to Track Your Vote Position</Text>
            <Text style={styles.readySubtitle}>
              Click on any election card above to view your vote position and tracking information across all electoral levels.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingCardText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  electionsList: {
    gap: 16,
  },
  electionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  electionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  electionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  electionInfo: {
    flex: 1,
  },
  electionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  electionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  electionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  statNumber: {
    fontWeight: '600',
    color: '#1F2937',
  },
  electionFooter: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  clickToViewText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statCardSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  readySection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  readyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  readyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  readySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

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
import { dashboardService } from '@/lib/api/dashboard-service';

interface DashboardData {
  voterInfo: {
    name: string;
    user_unique_id: string;
    wallet_address: string;
    email: string;
    nin_verified: boolean;
    first_name: string;
    last_name: string;
    geographicData: {
      pollingUnit: string;
      pollingUnitCode: string;
      ward: string;
      wardCode: string;
      lgaOfResidence: string;
      lgaCode: string;
      stateOfResidence: string;
      stateCode: string;
    };
  };
  activeElections: any[];
  myVotes: any[];
  stats: {
    totalRegisteredVoters: number;
    totalVotesCast: number;
    nonVoters: number;
    turnoutPercentage: number;
  };
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 DashboardPage: Loading dashboard data...');
      
      const response = await dashboardService.getDashboardData();
      if (response.success && response.data) {
        setDashboardData(response.data);
        console.log('📊 DashboardPage: Dashboard data loaded:', response.data);
      } else {
        console.log('⚠️ DashboardPage: No dashboard data available');
      }
    } catch (error) {
      console.error('❌ DashboardPage: Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleViewElections = () => {
    router.push('/(tabs)/elections');
  };

  const handleViewProfile = () => {
    router.push('/profile');
  };

  const handleVoteNow = (electionId: string) => {
    router.push(`/vote/${electionId}`);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Ionicons name="lock-closed" size={64} color="#9ca3af" />
        <Text style={styles.notAuthenticatedTitle}>Authentication Required</Text>
        <Text style={styles.notAuthenticatedText}>
          Please login to access your dashboard.
        </Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>
            {dashboardData?.voterInfo?.first_name || user?.first_name || 'User'}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleViewProfile}>
          <Ionicons name="person-circle" size={32} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Voter Info Card */}
      {dashboardData?.voterInfo && (
        <View style={styles.voterInfoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color="#2563eb" />
            <Text style={styles.cardTitle}>Voter Information</Text>
          </View>
          
          <View style={styles.voterDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>
                {dashboardData.voterInfo.first_name} {dashboardData.voterInfo.last_name}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Voter ID:</Text>
              <Text style={styles.detailValue}>{dashboardData.voterInfo.user_unique_id}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{dashboardData.voterInfo.email}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NIN Status:</Text>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={dashboardData.voterInfo.nin_verified ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={dashboardData.voterInfo.nin_verified ? "#10b981" : "#ef4444"} 
                />
                <Text style={[
                  styles.statusText, 
                  { color: dashboardData.voterInfo.nin_verified ? "#10b981" : "#ef4444" }
                ]}>
                  {dashboardData.voterInfo.nin_verified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Statistics Cards */}
      {dashboardData?.stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Election Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#2563eb" />
              <Text style={styles.statNumber}>
                {formatNumber(dashboardData.stats.totalRegisteredVoters)}
              </Text>
              <Text style={styles.statLabel}>Total Voters</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statNumber}>
                {formatNumber(dashboardData.stats.totalVotesCast)}
              </Text>
              <Text style={styles.statLabel}>Votes Cast</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>
                {dashboardData.stats.turnoutPercentage.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Turnout</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#6b7280" />
              <Text style={styles.statNumber}>
                {formatNumber(dashboardData.stats.nonVoters)}
              </Text>
              <Text style={styles.statLabel}>Non-Voters</Text>
            </View>
          </View>
        </View>
      )}

      {/* Active Elections */}
      {dashboardData?.activeElections && dashboardData.activeElections.length > 0 && (
        <View style={styles.electionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Elections</Text>
            <TouchableOpacity onPress={handleViewElections}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.activeElections.slice(0, 3).map((election) => (
            <View key={election.id} style={styles.electionCard}>
              <View style={styles.electionHeader}>
                <Text style={styles.electionTitle}>{election.title}</Text>
                <View style={styles.liveIndicator}>
                  <Text style={styles.liveIndicatorText}>LIVE</Text>
                </View>
              </View>
              
              <Text style={styles.electionType}>{election.election_type}</Text>
              
              <View style={styles.electionStats}>
                <Text style={styles.electionStat}>
                  Total Votes: {election.total_votes || 0}
                </Text>
                <Text style={styles.electionStat}>
                  Candidates: {election.contestants?.length || 0}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVoteNow(election.id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.voteButtonText}>Vote Now</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* My Votes */}
      {dashboardData?.myVotes && dashboardData.myVotes.length > 0 && (
        <View style={styles.votesSection}>
          <Text style={styles.sectionTitle}>My Votes</Text>
          
          {dashboardData.myVotes.slice(0, 5).map((vote, index) => (
            <View key={index} style={styles.voteCard}>
              <View style={styles.voteHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.voteTitle}>Vote Cast</Text>
                <Text style={styles.voteDate}>
                  {new Date(vote.vote_timestamp).toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={styles.voteElection}>
                Election: {vote.election_id}
              </Text>
              
              {vote.transaction_hash && (
                <Text style={styles.voteHash}>
                  TX: {vote.transaction_hash.substring(0, 20)}...
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewElections}>
            <Ionicons name="ballot" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>View Elections</Text>
            <Text style={styles.actionDescription}>Browse all elections</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleViewProfile}>
            <Ionicons name="person" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionDescription}>Manage your account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/vote-position')}>
            <Ionicons name="analytics" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>Vote Position</Text>
            <Text style={styles.actionDescription}>Track your votes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/blockchain-transactions')}>
            <Ionicons name="cube" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>Blockchain</Text>
            <Text style={styles.actionDescription}>View transactions</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  profileButton: {
    padding: 8,
  },
  voterInfoCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  voterDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  electionsSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  electionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  electionTitle: {
    fontSize: 16,
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
    fontSize: 10,
    fontWeight: '600',
  },
  electionType: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  electionStats: {
    marginBottom: 12,
  },
  electionStat: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  voteButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  votesSection: {
    padding: 16,
  },
  voteCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  voteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
    flex: 1,
  },
  voteDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  voteElection: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  voteHash: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  actionsSection: {
    padding: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

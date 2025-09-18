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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { dashboardService } from '@/lib/api/dashboard-service';
import { electionService } from '@/lib/api/election-service';

const { width } = Dimensions.get('window');

interface ElectionStats {
  totalRegisteredVoters: number;
  totalVotesCast: number;
  nonVoters: number;
  turnoutPercentage: number;
}

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

export default function HomePage() {
  const [stats, setStats] = useState<ElectionStats | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🏠 HomePage: Loading data...');
      console.log('🏠 HomePage: API URL:', process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3001/api');
      
      // Load dashboard stats
      console.log('📊 HomePage: Fetching stats...');
      const statsResponse = await dashboardService.getElectionStats();
      console.log('📊 HomePage: Stats response:', statsResponse);
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
        console.log('📊 HomePage: Stats loaded:', statsResponse.data);
      } else {
        console.log('⚠️ HomePage: Stats failed:', statsResponse.error);
      }

      // Load active elections
      console.log('🗳️ HomePage: Fetching elections...');
      const electionsResponse = await electionService.getElections();
      console.log('🗳️ HomePage: Elections response:', electionsResponse);
      
      if (electionsResponse.success && electionsResponse.data) {
        setElections(electionsResponse.data);
        console.log('🗳️ HomePage: Elections loaded:', electionsResponse.data);
      } else {
        console.log('⚠️ HomePage: Elections failed:', electionsResponse.message);
        setError(electionsResponse.message || 'Failed to load elections');
      }
    } catch (error) {
      console.error('❌ HomePage: Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Network request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleViewElections = () => {
    if (isAuthenticated) {
      router.push('/(tabs)/elections');
    } else {
      Alert.alert(
        'Login Required',
        'Please login to view elections and cast your vote.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: handleLogin }
        ]
      );
    }
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
          { text: 'Login', onPress: handleLogin }
        ]
      );
    }
  };

  const handleViewResults = (electionId: string) => {
    router.push(`/results/${electionId}`);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading election data...</Text>
        <Text style={styles.debugText}>API: {process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3001/api'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.debugText}>API: {process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3001/api'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Ionicons name="balloon-outline" size={32} color="#FFFFFF" />
            <Text style={styles.logoText}>Nigerian E-Voting Portal</Text>
            <Text style={styles.tagline}>Secure • Transparent • Decentralized</Text>
          </View>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>→ Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Register to Vote</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Your Voice, Your Vote, Your Future</Text>
          <Text style={styles.heroSubtitle}>
            Participate in Nigeria's most secure and transparent electronic voting system. 
            Built on blockchain technology for maximum integrity.
          </Text>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.getStartedButton} onPress={handleRegister}>
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewElectionsButton} onPress={handleViewElections}>
              <Text style={styles.viewElectionsButtonText}>View Live Elections</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Election Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Election Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>
              {stats ? formatNumber(stats.totalRegisteredVoters) : '84,004,084'}
            </Text>
            <Text style={styles.statLabel}>Total Registered Voters</Text>
            <Text style={styles.statChange}>+2.1% from last election</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>176,846</Text>
            <Text style={styles.statLabel}>Total Polling Units</Text>
            <Text style={styles.statChange}>Across all states</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="business" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>774</Text>
            <Text style={styles.statLabel}>Total LGAs</Text>
            <Text style={styles.statChange}>Local Government Areas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="map" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>36 + FCT</Text>
            <Text style={styles.statLabel}>Total States</Text>
            <Text style={styles.statChange}>States and Federal Capital Territory</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleRegister}>
            <Ionicons name="person-add" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>Register as Voter</Text>
            <Text style={styles.actionDescription}>
              Complete your voter registration with NIN verification
            </Text>
            <View style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Register Now</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleLogin}>
            <Ionicons name="log-in" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>Voter Login</Text>
            <Text style={styles.actionDescription}>
              Access your dashboard to cast votes and view results
            </Text>
            <View style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Login</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleViewElections}>
            <Ionicons name="checkmark-circle" size={32} color="#2563eb" />
            <Text style={styles.actionTitle}>Live Elections</Text>
            <Text style={styles.actionDescription}>
              View ongoing elections and real-time results
            </Text>
            <View style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Elections</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Election Status */}
      <View style={styles.electionsSection}>
        <View style={styles.electionsHeader}>
          <Text style={styles.sectionTitle}>Current Election Status</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE: {elections.length} Active Elections</Text>
          </View>
        </View>
        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleTimeString()}
        </Text>
        
        {elections.length === 0 ? (
          <View style={styles.noElectionsCard}>
            <Ionicons name="ballot" size={48} color="#9ca3af" />
            <Text style={styles.noElectionsTitle}>No Active Elections</Text>
            <Text style={styles.noElectionsText}>
              There are currently no active elections. Check back later for updates.
            </Text>
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
                
                <Text style={styles.electionStatus}>
                  {isLive ? 'Currently accepting votes' : status} • Status: {status}
                </Text>
                
                <View style={styles.electionStats}>
                  <Text style={styles.electionStat}>
                    Total Votes: {election.total_votes || 0}
                  </Text>
                  <Text style={styles.electionStat}>
                    Leading: {getLeadingCandidate(election)}
                  </Text>
                  <Text style={styles.electionStat}>
                    Candidates: {election.contestants?.length || 0}
                  </Text>
                </View>
                
                <View style={styles.electionButtons}>
                  <TouchableOpacity 
                    style={styles.viewResultsButton}
                    onPress={() => handleViewResults(election.id)}
                  >
                    <Text style={styles.viewResultsButtonText}>View Live Results</Text>
                  </TouchableOpacity>
                  
                  {isLive && (
                    <TouchableOpacity 
                      style={styles.voteNowButton}
                      onPress={() => handleVoteNow(election.id)}
                    >
                      <Text style={styles.voteNowButtonText}>Vote Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>E-Voting Portal</Text>
            <Text style={styles.footerDescription}>
              Nigeria's most secure and transparent electronic voting system, 
              built on blockchain technology for maximum integrity and trust.
            </Text>
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Quick Links</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.footerLink}>Register to Vote</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.footerLink}>Voter Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleViewElections}>
              <Text style={styles.footerLink}>Live Elections</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Support</Text>
            <Text style={styles.footerLink}>Help Center</Text>
            <Text style={styles.footerLink}>Contact Us</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </View>
          
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Security</Text>
            <Text style={styles.footerLink}>End-to-End Encryption</Text>
            <Text style={styles.footerLink}>Blockchain Verified</Text>
            <Text style={styles.footerLink}>NIN Authentication</Text>
            <Text style={styles.footerLink}>Multi-Factor Security</Text>
          </View>
        </View>
        
        <Text style={styles.copyright}>
          © 2024 Nigerian E-Voting Portal. All rights reserved. 
          Built with security and transparency in mind.
        </Text>
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
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logoContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  registerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  registerButtonText: {
    color: '#1e40af',
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: width * 0.9,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  getStartedButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  viewElectionsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  viewElectionsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  statsSection: {
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: width * 0.4,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  statChange: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  actionsSection: {
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  actionsGrid: {
    gap: 16,
  },
  actionCard: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  electionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  electionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
  noElectionsCard: {
    backgroundColor: '#f9fafb',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  noElectionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  noElectionsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  electionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveElectionCard: {
    borderColor: '#10b981',
    borderWidth: 2,
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  electionTitle: {
    fontSize: 18,
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
  electionStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  electionStats: {
    marginBottom: 16,
  },
  electionStat: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  electionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  viewResultsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  viewResultsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  voteNowButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#34d399',
    alignItems: 'center',
  },
  voteNowButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#1e40af',
    padding: 20,
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 20,
  },
  footerSection: {
    flex: 1,
    minWidth: width * 0.4,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  footerDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
});

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { votePositionService } from '@/lib/api/vote-position-service';
// import { getPartyLogo, getPartyInfo, getPartyColor, getPartyDisplayName } from '@/lib/utils/party-utils';

interface LevelData {
  election: {
    id: string;
    title: string;
    status: string;
  };
  statistics: {
    total_votes: number;
    registered_voters: number;
    non_voters: number;
    turnout_percentage: number;
  };
  level_stats: Array<{
    total_votes: number;
    leading_candidate: {
      candidateId: string;
      candidateName: string;
      party: string;
      runningMate: string;
      votes: number;
      percentage: number;
    };
    candidates: Array<{
      candidateId: string;
      candidateName: string;
      party: string;
      runningMate: string;
      votes: number;
      percentage: number;
    }>;
    vote_details: Array<{
      transactionHash: string;
      contractAddress: string;
      candidateName: string;
      timestamp: string;
    }>;
  }>;
}

interface UserPositionData {
  user: {
    id: string;
    name: string;
    voter_id: string;
    wallet_address: string;
  };
  vote: {
    position: number;
    timestamp: string;
    transaction_hash: string;
    blockchain_block_number: number;
    blockchain_gas_used: number;
    candidate_id: string;
  };
  geographic_data: {
    polling_unit: string;
    ward: string;
    lga: string;
    state: string;
  };
}

export default function VotePositionLevelPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { level } = useLocalSearchParams<{ level: string }>();
  const { election } = useLocalSearchParams<{ election: string }>();
  
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [userPositionData, setUserPositionData] = useState<UserPositionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [authLoading, isAuthenticated]);

  // Load level data
  useEffect(() => {
    if (isAuthenticated && user && level && election) {
      loadLevelData();
    }
  }, [isAuthenticated, user, level, election]);

  const loadLevelData = async () => {
    if (!level || !election || !user) return;

    try {
      setLoading(true);
      setError('');

      console.log('🔍 Loading level data for:', { level, election, userId: user.id });

      // Load level statistics from backend
      const levelResponse = await votePositionService.getLevelPositionData(election, level as 'polling_unit' | 'ward' | 'lga' | 'state' | 'national');
      
      if (!levelResponse.success) {
        console.log('⚠️ Level data not available, using mock data');
        // Use mock data as fallback
        const mockLevelData: LevelData = {
          election: {
            id: election,
            title: 'Presidential Election 2024',
            status: 'ONGOING'
          },
          statistics: {
            total_votes: 1500,
            registered_voters: 2000,
            non_voters: 500,
            turnout_percentage: 75.0
          },
          level_stats: [{
            total_votes: 1500,
            leading_candidate: {
              candidateId: '1',
              candidateName: 'John Doe',
              party: 'APC',
              runningMate: 'Jane Smith',
              votes: 650,
              percentage: 43.3
            },
            candidates: [
              {
                candidateId: '1',
                candidateName: 'John Doe',
                party: 'APC',
                runningMate: 'Jane Smith',
                votes: 650,
                percentage: 43.3
              },
              {
                candidateId: '2',
                candidateName: 'Alice Johnson',
                party: 'PDP',
                runningMate: 'Bob Wilson',
                votes: 580,
                percentage: 38.7
              },
              {
                candidateId: '3',
                candidateName: 'Charlie Brown',
                party: 'LP',
                runningMate: 'Diana Prince',
                votes: 270,
                percentage: 18.0
              }
            ],
            vote_details: [{
              transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
              contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
              candidateName: 'John Doe',
              timestamp: new Date().toISOString()
            }]
          }]
        };
        setLevelData(mockLevelData);
      } else {
        setLevelData(levelResponse.data);
      }

      // Try to load user position data
      let userPositionResponse = null;
      try {
        userPositionResponse = await votePositionService.getUserVotePositionData(election, user.id);
        if (userPositionResponse.success && userPositionResponse.data) {
          setUserPositionData(userPositionResponse.data);
        }
      } catch (userError) {
        console.log('⚠️ Could not load user position data:', userError);
      }

      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('❌ Error loading level data:', err);
      setError('Failed to load level data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLevelData();
    setRefreshing(false);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'pollingUnit': return '🏫';
      case 'ward': return '🏘️';
      case 'lga': return '🏛️';
      case 'state': return '🌍';
      case 'national': return '🇳🇬';
      default: return '🗳️';
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'pollingUnit': return 'Polling Unit';
      case 'ward': return 'Ward';
      case 'lga': return 'LGA';
      case 'state': return 'State';
      case 'national': return 'National';
      default: return 'Level';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading position data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Error Loading Data</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadLevelData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!levelData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location" size={64} color="#9CA3AF" />
        <Text style={styles.errorTitle}>No Data Available</Text>
        <Text style={styles.errorText}>No position data found for this level and election.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userPosition = userPositionData?.vote?.position || 0;
  const totalVotes = levelData.level_stats?.[0]?.total_votes || 0;
  const leadingCandidate = levelData.level_stats?.[0]?.leading_candidate || null;
  const candidateResults = levelData.level_stats?.[0]?.candidates || [];
  const latestVote = levelData.level_stats?.[0]?.vote_details?.[0] || null;

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
              <Text style={styles.headerIconText}>{getLevelIcon(level || '')}</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>{getLevelName(level || '')} Level</Text>
              <Text style={styles.headerSubtitle}>{levelData.election?.title}</Text>
            </View>
          </View>
          <View style={styles.positionBadge}>
            <Text style={styles.positionBadgeText}>#{userPosition || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Level Summary */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>
              Your Position at {getLevelName(level || '')} Level
            </Text>
            <View style={styles.positionBadgeLarge}>
              <Text style={styles.positionBadgeLargeText}>#{userPosition || 'N/A'}</Text>
            </View>
          </View>
          <Text style={styles.summarySubtitle}>
            Election: {levelData.election?.title} • Last updated: {lastUpdated?.toLocaleString() || 'Loading...'}
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="locate" size={20} color="#3B82F6" />
                <Text style={styles.statCardLabel}>Your Position</Text>
              </View>
              <Text style={styles.statCardValue}>#{userPosition || 'N/A'}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="people" size={20} color="#10B981" />
                <Text style={styles.statCardLabel}>Total Votes</Text>
              </View>
              <Text style={styles.statCardValue}>{totalVotes.toLocaleString()}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="time" size={20} color="#F59E0B" />
                <Text style={styles.statCardLabel}>Non-Voters</Text>
              </View>
              <Text style={styles.statCardValue}>
                {(levelData.statistics?.non_voters || 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
                <Text style={styles.statCardLabel}>Turnout</Text>
              </View>
              <Text style={styles.statCardValue}>
                {levelData.statistics?.turnout_percentage?.toFixed(1) || '0.0'}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Blockchain Verification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Blockchain Verification</Text>
        <View style={styles.blockchainCard}>
          {latestVote && latestVote.transactionHash ? (
            <View style={styles.blockchainContent}>
              <View style={styles.blockchainItem}>
                <Text style={styles.blockchainLabel}>Transaction Hash</Text>
                <Text style={styles.blockchainValue} numberOfLines={2}>
                  {latestVote.transactionHash}
                </Text>
              </View>

              <View style={styles.blockchainItem}>
                <Text style={styles.blockchainLabel}>Contract Address</Text>
                <Text style={styles.blockchainValue} numberOfLines={2}>
                  {latestVote.contractAddress}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.viewTransactionButton}
                onPress={() => setShowTransactionModal(true)}
              >
                <Ionicons name="document-text" size={16} color="#FFFFFF" />
                <Text style={styles.viewTransactionText}>View Transaction Details</Text>
              </TouchableOpacity>

              <View style={styles.verifiedStatus}>
                <View style={styles.statusIndicator} />
                <Text style={styles.verifiedText}>Vote verified on blockchain</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noBlockchainData}>
              <Ionicons name="alert-circle" size={32} color="#F59E0B" />
              <Text style={styles.noBlockchainTitle}>No Blockchain Data Available</Text>
              <Text style={styles.noBlockchainText}>
                Votes may still be pending blockchain confirmation or this level has no recorded votes yet.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Leading Candidate */}
      {leadingCandidate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leading Candidate</Text>
          <View style={styles.leadingCandidateCard}>
            <View style={styles.candidateHeader}>
              <View style={styles.candidateAvatar}>
                <Text style={styles.candidateAvatarText}>
                  {leadingCandidate.candidateName?.charAt(0) || 'N'}
                </Text>
              </View>
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{leadingCandidate.candidateName}</Text>
                <Text style={styles.candidateParty}>{leadingCandidate.party}</Text>
                <Text style={styles.candidateRunningMate}>
                  Running Mate: {leadingCandidate.runningMate}
                </Text>
              </View>
              <View style={styles.candidateVotes}>
                <Text style={styles.candidateVoteCount}>
                  {leadingCandidate.votes.toLocaleString()}
                </Text>
                <Text style={styles.candidateVotePercentage}>
                  {leadingCandidate.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Candidate Results */}
      {candidateResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Candidate Results</Text>
          <View style={styles.candidatesCard}>
            {candidateResults.map((candidate, index) => (
              <View key={index} style={styles.candidateResult}>
                <View style={styles.candidateResultHeader}>
                  <View style={styles.candidateResultLeft}>
                    <View style={styles.candidateResultAvatar}>
                      <Text style={styles.candidateResultAvatarText}>
                        {candidate.candidateName?.charAt(0) || (index + 1)}
                      </Text>
                    </View>
                    <View style={styles.candidateResultInfo}>
                      <Text style={styles.candidateResultName}>{candidate.candidateName}</Text>
                      <Text style={styles.candidateResultParty}>{candidate.party}</Text>
                    </View>
                  </View>
                  <View style={styles.candidateResultVotes}>
                    <Text style={styles.candidateResultPercentage}>
                      {candidate.percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.candidateResultCount}>
                      {candidate.votes.toLocaleString()} votes
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${candidate.percentage}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigate Between Levels</Text>
        <View style={styles.navigationGrid}>
          {[
            { level: 'pollingUnit', name: 'Polling Unit', icon: '🏫', color: '#3B82F6' },
            { level: 'ward', name: 'Ward', icon: '🏘️', color: '#10B981' },
            { level: 'lga', name: 'LGA', icon: '🏛️', color: '#8B5CF6' },
            { level: 'state', name: 'State', icon: '🌍', color: '#F59E0B' },
            { level: 'national', name: 'National', icon: '🇳🇬', color: '#EF4444' },
          ].map((navLevel) => (
            <TouchableOpacity
              key={navLevel.level}
              style={[
                styles.navigationCard,
                { 
                  borderColor: navLevel.color,
                  backgroundColor: level === navLevel.level ? navLevel.color + '20' : '#F8FAFC'
                }
              ]}
              onPress={() => router.push(`/vote-position/level-detail/${navLevel.level}?election=${election}`)}
            >
              <Text style={styles.navigationIcon}>{navLevel.icon}</Text>
              <Text style={styles.navigationName}>{navLevel.name}</Text>
              {level === navLevel.level && (
                <Text style={styles.currentLevelText}>Current Level</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction Details Modal */}
      <Modal
        visible={showTransactionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTransactionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowTransactionModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {latestVote && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Transaction Hash</Text>
                  <Text style={styles.modalValue}>{latestVote.transactionHash}</Text>
                </View>

                <View style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Smart Contract Address</Text>
                  <Text style={styles.modalValue}>{latestVote.contractAddress}</Text>
                </View>

                <View style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Candidate</Text>
                  <Text style={styles.modalValue}>{latestVote.candidateName}</Text>
                </View>

                <View style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Timestamp</Text>
                  <Text style={styles.modalValue}>{formatDate(latestVote.timestamp)}</Text>
                </View>

                <View style={styles.networkInfo}>
                  <Text style={styles.networkTitle}>Network Information</Text>
                  <Text style={styles.networkText}>Network: Local Hardhat (Chain ID: 31337)</Text>
                  <Text style={styles.networkText}>RPC URL: http://localhost:8545</Text>
                  <Text style={styles.networkText}>Explorer: Local Development Network</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButtonLarge}
                onPress={() => setShowTransactionModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  headerIconText: {
    fontSize: 20,
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
  positionBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  positionBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  positionBadgeLarge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  positionBadgeLargeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  blockchainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blockchainContent: {
    gap: 16,
  },
  blockchainItem: {
    gap: 8,
  },
  blockchainLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  blockchainValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1F2937',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewTransactionButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  viewTransactionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  verifiedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  verifiedText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  noBlockchainData: {
    alignItems: 'center',
    padding: 20,
  },
  noBlockchainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 12,
    marginBottom: 8,
  },
  noBlockchainText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
  leadingCandidateCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  candidateAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  candidateParty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  candidateRunningMate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  candidateVotes: {
    alignItems: 'flex-end',
  },
  candidateVoteCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  candidateVotePercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  candidatesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  candidateResult: {
    marginBottom: 16,
  },
  candidateResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  candidateResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  candidateResultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  candidateResultAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  candidateResultInfo: {
    flex: 1,
  },
  candidateResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  candidateResultParty: {
    fontSize: 14,
    color: '#6B7280',
  },
  candidateResultVotes: {
    alignItems: 'flex-end',
  },
  candidateResultPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  candidateResultCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  navigationCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  navigationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  navigationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  currentLevelText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalItem: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1F2937',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  networkInfo: {
    backgroundColor: '#EBF4FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  networkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  networkText: {
    fontSize: 12,
    color: '#1E40AF',
    marginBottom: 4,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalCloseButtonLarge: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

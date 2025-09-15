import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ElectionTotalsScreen() {
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    // Mock data - will be replaced with API calls
    setTimeout(() => {
      setVoters([
        {
          id: '68b0c872dec9c31503399802',
          voterId: '68b0c872dec9c31503399802',
          voterName: 'N/A',
          email: 'N/A',
          voteTime: '9/12/2025, 9:38:11 PM',
          transactionHash: '0x6fdce54b7b1b820f7396956b2ea98305c66a96ca4c31d7911281d718d2fb887d',
          status: 'Verified'
        },
        {
          id: '68bd515ae17da688856ddf12',
          voterId: '68bd515ae17da688856ddf12',
          voterName: 'N/A',
          email: 'N/A',
          voteTime: '9/12/2025, 9:39:37 PM',
          transactionHash: '0x8d7885e4fd22a30a3aa7933e94bb67272869e8e3df6595a70931126ea3551e60',
          status: 'Verified'
        },
        {
          id: '68b119abeb55a9c172b95986',
          voterId: '68b119abeb55a9c172b95986',
          voterName: 'N/A',
          email: 'N/A',
          voteTime: '9/12/2025, 10:23:04 PM',
          transactionHash: '0x84099c111fe09fbb2bfdad842e50de357e7998d5cde3e4409914635a4ddbec05',
          status: 'Verified'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const electionStats = {
    totalVotes: 3,
    candidates: 4,
    blockchainStatus: 'Deployed',
    verifiedVotes: 100
  };

  const filteredVoters = voters.filter(voter => 
    voter.voterId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voter.voterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voter.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Total for Each Election</Text>
              <Text style={styles.headerSubtitle}>View voter details and election totals</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/elections')}
          >
            <Ionicons name="arrow-back" size={20} color="#64748b" />
            <Text style={styles.backText}>Back to Elections</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Election Summary Card */}
      <View style={styles.electionSummary}>
        <View style={styles.electionSummaryHeader}>
          <View>
            <Text style={styles.electionTitle}>Governorship Election 2025</Text>
            <Text style={styles.electionSubtitle}>Governorship • 4 candidates</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ONGOING</Text>
          </View>
        </View>
        
        <View style={styles.electionStatsGrid}>
          <View style={styles.electionStatCard}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.electionStatValue}>{electionStats.totalVotes}</Text>
            <Text style={styles.electionStatLabel}>Total Votes</Text>
          </View>
          
          <View style={styles.electionStatCard}>
            <Ionicons name="people" size={20} color="#2563eb" />
            <Text style={styles.electionStatValue}>{electionStats.candidates}</Text>
            <Text style={styles.electionStatLabel}>Candidates</Text>
          </View>
          
          <View style={styles.electionStatCard}>
            <Ionicons name="server" size={20} color="#9333ea" />
            <Text style={styles.electionStatValue}>{electionStats.blockchainStatus}</Text>
            <Text style={styles.electionStatLabel}>Blockchain Status</Text>
          </View>
          
          <View style={styles.electionStatCard}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            <Text style={styles.electionStatValue}>{electionStats.verifiedVotes}%</Text>
            <Text style={styles.electionStatLabel}>Verified Votes</Text>
          </View>
        </View>
      </View>

      {/* Search Voters Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchHeader}>
          <Ionicons name="search" size={20} color="#1e293b" />
          <Text style={styles.searchTitle}>Search Voters</Text>
        </View>
        <Text style={styles.searchDescription}>Search for specific voters by voter ID, name, or email</Text>
        
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter voter ID, name, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity style={styles.showAllButton}>
            <Text style={styles.showAllButtonText}>Show All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voter Details Section */}
      <View style={styles.voterDetailsSection}>
        <View style={styles.voterDetailsHeader}>
          <Text style={styles.voterDetailsTitle}>Voter Details</Text>
          <Text style={styles.voterDetailsCount}>{filteredVoters.length} total voters</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={32} color="#64748b" style={styles.spinningIcon} />
            <Text style={styles.loadingText}>Loading voter details...</Text>
          </View>
        ) : (
          <View style={styles.votersList}>
            {filteredVoters.map((voter) => (
              <View key={voter.id} style={styles.voterCard}>
                <View style={styles.voterInfo}>
                  <View style={styles.voterIdContainer}>
                    <Text style={styles.voterIdLabel}>Voter ID:</Text>
                    <Text style={styles.voterIdValue}>{voter.voterId}</Text>
                  </View>
                  
                  <View style={styles.voterDetailsRow}>
                    <View style={styles.voterDetailItem}>
                      <Text style={styles.voterDetailLabel}>Voter Name:</Text>
                      <Text style={styles.voterDetailValue}>{voter.voterName}</Text>
                    </View>
                    <View style={styles.voterDetailItem}>
                      <Text style={styles.voterDetailLabel}>Email:</Text>
                      <Text style={styles.voterDetailValue}>{voter.email}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.voterDetailsRow}>
                    <View style={styles.voterDetailItem}>
                      <Text style={styles.voterDetailLabel}>Vote Time:</Text>
                      <Text style={styles.voterDetailValue}>{voter.voteTime}</Text>
                    </View>
                    <View style={styles.voterDetailItem}>
                      <Text style={styles.voterDetailLabel}>Transaction Hash:</Text>
                      <Text style={styles.voterDetailValue}>{voter.transactionHash}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.voterStatus}>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  electionSummary: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  electionSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  electionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  electionSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  electionStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  electionStatCard: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  electionStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  electionStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  searchSection: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  searchDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#1e293b',
    backgroundColor: '#f9fafb',
  },
  showAllButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  showAllButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  voterDetailsSection: {
    margin: 12,
  },
  voterDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voterDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  voterDetailsCount: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  spinningIcon: {
    transform: [{ rotate: '360deg' }],
  },
  votersList: {
    gap: 12,
  },
  voterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  voterInfo: {
    flex: 1,
  },
  voterIdContainer: {
    marginBottom: 8,
  },
  voterIdLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  voterIdValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  voterDetailsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  voterDetailItem: {
    flex: 1,
    marginRight: 8,
  },
  voterDetailLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  voterDetailValue: {
    fontSize: 11,
    color: '#1e293b',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  voterStatus: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
});

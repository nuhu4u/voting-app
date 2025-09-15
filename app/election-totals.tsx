import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ElectionTotalsScreen() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - will be replaced with API calls
    setTimeout(() => {
      setElections([
        {
          id: '1',
          title: 'Senatorial Election 2025',
          election_type: 'SENATORIAL',
          status: 'ONGOING',
          total_votes: 1250,
          total_voters: 5000,
          contestants: [
            { name: 'Adebayo Ogundimu', party: 'APC', votes: 450 },
            { name: 'Sarah Johnson', party: 'PDP', votes: 380 },
            { name: 'Michael Adebayo', party: 'LP', votes: 250 },
            { name: 'Fatima Ibrahim', party: 'NNPP', votes: 170 }
          ]
        },
        {
          id: '2',
          title: 'Governorship Election 2025',
          election_type: 'GUBERNATORIAL',
          status: 'ONGOING',
          total_votes: 3200,
          total_voters: 8000,
          contestants: [
            { name: 'John Doe', party: 'APC', votes: 1200 },
            { name: 'Jane Smith', party: 'PDP', votes: 1100 },
            { name: 'Bob Wilson', party: 'LP', votes: 600 },
            { name: 'Alice Brown', party: 'NNPP', votes: 300 }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const overallStats = {
    totalElections: elections.length,
    totalVotesCast: elections.reduce((sum, e) => sum + (e.total_votes || 0), 0),
    totalVoters: elections.reduce((sum, e) => sum + (e.total_voters || 0), 0),
    averageTurnout: elections.length > 0 ? 
      (elections.reduce((sum, e) => sum + (e.total_votes || 0), 0) / elections.reduce((sum, e) => sum + (e.total_voters || 0), 0) * 100).toFixed(1) : 0
  };

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
              <Ionicons name="bar-chart" size={24} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Election Totals</Text>
              <Text style={styles.headerSubtitle}>Comprehensive vote counts and election statistics</Text>
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

      {/* Overall Statistics */}
      <View style={styles.overallStats}>
        <Text style={styles.overallStatsTitle}>Overall Election Statistics</Text>
        
        <View style={styles.overallStatsGrid}>
          <View style={styles.overallStatCard}>
            <Ionicons name="ballot" size={24} color="#2563eb" />
            <Text style={styles.overallStatValue}>{overallStats.totalElections}</Text>
            <Text style={styles.overallStatLabel}>Total Elections</Text>
          </View>
          
          <View style={styles.overallStatCard}>
            <Ionicons name="people" size={24} color="#16a34a" />
            <Text style={styles.overallStatValue}>{overallStats.totalVoters.toLocaleString()}</Text>
            <Text style={styles.overallStatLabel}>Total Voters</Text>
          </View>
          
          <View style={styles.overallStatCard}>
            <Ionicons name="checkmark-circle" size={24} color="#ea580c" />
            <Text style={styles.overallStatValue}>{overallStats.totalVotesCast.toLocaleString()}</Text>
            <Text style={styles.overallStatLabel}>Votes Cast</Text>
          </View>
          
          <View style={styles.overallStatCard}>
            <Ionicons name="trending-up" size={24} color="#9333ea" />
            <Text style={styles.overallStatValue}>{overallStats.averageTurnout}%</Text>
            <Text style={styles.overallStatLabel}>Average Turnout</Text>
          </View>
        </View>
      </View>

      {/* Elections List */}
      <View style={styles.electionsSection}>
        <Text style={styles.electionsTitle}>Election Breakdown</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={32} color="#64748b" style={styles.spinningIcon} />
            <Text style={styles.loadingText}>Loading election totals...</Text>
          </View>
        ) : (
          <View style={styles.electionsList}>
            {elections.map((election) => {
              const turnout = election.total_voters > 0 ? 
                ((election.total_votes / election.total_voters) * 100).toFixed(1) : 0;
              const nonVoters = election.total_voters - election.total_votes;
              
              return (
                <View key={election.id} style={styles.electionCard}>
                  <View style={styles.electionHeader}>
                    <Text style={styles.electionTitle}>{election.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      election.status === 'ONGOING' ? styles.statusOngoing : styles.statusCompleted
                    ]}>
                      <Text style={styles.statusText}>{election.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.electionStats}>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Voters</Text>
                        <Text style={styles.statValue}>{election.total_voters.toLocaleString()}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Votes Cast</Text>
                        <Text style={styles.statValue}>{election.total_votes.toLocaleString()}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Non-Voters</Text>
                        <Text style={styles.statValue}>{nonVoters.toLocaleString()}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Turnout</Text>
                        <Text style={styles.statValue}>{turnout}%</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.candidatesSection}>
                    <Text style={styles.candidatesTitle}>Candidate Results</Text>
                    {election.contestants.map((candidate, index) => {
                      const percentage = election.total_votes > 0 ? 
                        ((candidate.votes / election.total_votes) * 100).toFixed(1) : 0;
                      
                      return (
                        <View key={index} style={styles.candidateRow}>
                          <View style={styles.candidateInfo}>
                            <View style={styles.candidateRank}>
                              <Text style={styles.candidateRankText}>{index + 1}</Text>
                            </View>
                            <View style={styles.candidateDetails}>
                              <Text style={styles.candidateName}>{candidate.name}</Text>
                              <Text style={styles.candidateParty}>{candidate.party}</Text>
                            </View>
                          </View>
                          <View style={styles.candidateStats}>
                            <Text style={styles.candidateVotes}>{candidate.votes.toLocaleString()}</Text>
                            <Text style={styles.candidatePercentage}>{percentage}%</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
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
  overallStats: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  overallStatsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  overallStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overallStatCard: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
  },
  overallStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 6,
  },
  overallStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  electionsSection: {
    margin: 12,
  },
  electionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
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
  electionsList: {
    gap: 16,
  },
  electionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  electionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusOngoing: {
    backgroundColor: '#dcfce7',
  },
  statusCompleted: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  electionStats: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  candidatesSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  candidatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  candidateRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  candidateRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  candidateParty: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  candidateStats: {
    alignItems: 'flex-end',
  },
  candidateVotes: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  candidatePercentage: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});

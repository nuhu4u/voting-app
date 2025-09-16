import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';

const { width, height } = Dimensions.get('window');

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  election: any;
  voterInfo: any;
  onVoteSuccess?: () => void;
}

// Helper functions for party colors and acronyms
const getPartyColor = (party: string) => {
  if (!party) return '#CCCCCC';
  
  const upperParty = party.toUpperCase();
  if (upperParty.includes('APC') || upperParty.includes('ALL PROGRESSIVES CONGRESS')) {
    return '#FF0000'; // Red
  } else if (upperParty.includes('PDP') || upperParty.includes('PEOPLES DEMOCRATIC PARTY')) {
    return '#00FF00'; // Green
  } else if (upperParty.includes('LP') || upperParty.includes('LABOUR PARTY')) {
    return '#0000FF'; // Blue
  } else if (upperParty.includes('NNPP') || upperParty.includes('NEW NIGERIA PEOPLES PARTY')) {
    return '#FFA500'; // Orange
  }
  return '#CCCCCC'; // Gray
};

const getPartyAcronym = (party: string) => {
  if (!party) return 'Party';
  
  const upperParty = party.toUpperCase();
  if (upperParty.includes('APC') || upperParty.includes('ALL PROGRESSIVES CONGRESS')) {
    return 'APC';
  } else if (upperParty.includes('PDP') || upperParty.includes('PEOPLES DEMOCRATIC PARTY')) {
    return 'PDP';
  } else if (upperParty.includes('LP') || upperParty.includes('LABOUR PARTY')) {
    return 'LP';
  } else if (upperParty.includes('NNPP') || upperParty.includes('NEW NIGERIA PEOPLES PARTY')) {
    return 'NNPP';
  }
  return 'Party';
};

// Simple party logo helper - use local files from public/party-logos/
const getPartyLogo = (candidate: any) => {
  console.log('🎨 getPartyLogo called with candidate:', {
    name: candidate?.name,
    party: candidate?.party,
    partyPicture: candidate?.partyPicture
  });
  
  // Use local files from public/party-logos/ folder
  const partyName = candidate?.party?.toUpperCase() || '';
  
  if (partyName.includes('APC') || partyName.includes('ALL PROGRESSIVES CONGRESS')) {
    console.log('🎨 Using local APC file');
    return require('../../public/party-logos/apc.jpg');
  } else if (partyName.includes('PDP') || partyName.includes('PEOPLES DEMOCRATIC PARTY')) {
    console.log('🎨 Using local PDP file');
    return require('../../public/party-logos/pdp.jpg');
  } else if (partyName.includes('LP') || partyName.includes('LABOUR PARTY')) {
    console.log('🎨 Using local LP file');
    return require('../../public/party-logos/labour-party.jpg');
  } else if (partyName.includes('NNPP') || partyName.includes('NEW NIGERIA PEOPLES PARTY')) {
    console.log('🎨 Using local NNPP file');
    return require('../../public/party-logos/nnpp.jpg');
  }
  
  console.log('🎨 No local file found, returning null');
  return null;
};

export const VotingModal: React.FC<VotingModalProps> = ({
  isOpen,
  onClose,
  election,
  voterInfo,
  onVoteSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const { token } = useAuthStore();

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVoteSubmission = async () => {
    if (!selectedCandidate || !election) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3001/api'}/elections/${election.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidate_id: selectedCandidate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cast vote');
      }

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', 'Your vote has been cast successfully!');
        onVoteSuccess?.();
        onClose();
      } else {
        throw new Error(result.message || 'Vote submission failed');
      }
    } catch (error: any) {
      console.error('Vote submission error:', error);
      Alert.alert('Error', error.message || 'An error occurred while casting your vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return 'person-circle-outline';
      case 2: return 'document-text-outline';
      case 3: return 'checkmark-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Voter Verification';
      case 2: return 'Select Candidate';
      case 3: return 'Confirm Vote';
      default: return 'Voting';
    }
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.electionIcon}>
              <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{election?.title || 'Election'}</Text>
              <Text style={styles.subtitle}>{election?.type || 'Voting'}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of 3</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Step Header */}
          <View style={styles.stepHeader}>
            <View style={styles.stepIconContainer}>
              <Ionicons name={getStepIcon(currentStep)} size={32} color="#3B82F6" />
            </View>
            <Text style={styles.stepTitle}>{getStepTitle(currentStep)}</Text>
          </View>

          {/* Step 1: Voter Verification */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.verificationCard}>
                <View style={styles.verificationHeader}>
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  <Text style={styles.verificationTitle}>Identity Verification</Text>
                </View>
                
                <View style={styles.voterInfoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="person" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{voterInfo?.name || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="card" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Voter ID</Text>
                    <Text style={styles.infoValue}>{voterInfo?.voterId || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Polling Unit</Text>
                    <Text style={styles.infoValue}>{voterInfo?.pollingUnit || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="business" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>Ward</Text>
                    <Text style={styles.infoValue}>{voterInfo?.ward || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="map" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>LGA</Text>
                    <Text style={styles.infoValue}>{voterInfo?.lga || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Ionicons name="flag" size={16} color="#6B7280" />
                    <Text style={styles.infoLabel}>State</Text>
                    <Text style={styles.infoValue}>{voterInfo?.state || 'N/A'}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => setCurrentStep(2)}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Proceed to Ballot</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Candidate Selection */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.ballotHeader}>
                <Text style={styles.ballotTitle}>OFFICIAL BALLOT PAPER</Text>
                <Text style={styles.ballotSubtitle}>FEDERAL REPUBLIC OF NIGERIA</Text>
                <Text style={styles.ballotAuthority}>INDEPENDENT NATIONAL ELECTORAL COMMISSION (INEC)</Text>
              </View>
              
              <Text style={styles.instructions}>
                Select ONE candidate by tapping their card. Your choice will be highlighted.
              </Text>
              
              <View style={styles.candidatesContainer}>
              {election?.contestants?.map((candidate: any, index: number) => {
                console.log('🎨 Rendering candidate:', {
                  index,
                  name: candidate.name,
                  party: candidate.party,
                  partyPicture: candidate.partyPicture,
                  hasPartyPicture: !!candidate.partyPicture
                });
                return (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[
                      styles.candidateCard,
                      selectedCandidate === candidate.id && styles.selectedCandidateCard
                    ]}
                    onPress={() => setSelectedCandidate(candidate.id)}
                  >
                    {/* Party Logo at the top */}
                    <View style={styles.partyLogoTop}>
                      {getPartyLogo(candidate) ? (
                        <Image 
                          source={getPartyLogo(candidate)}
                          style={styles.partyLogoLarge}
                          onLoad={() => console.log('✅ Party logo loaded successfully for:', candidate.name)}
                          onError={(error) => {
                            console.log('❌ Party logo failed to load for:', candidate.name, 'Error:', error.nativeEvent.error);
                          }}
                        />
                      ) : (
                        <View style={[styles.partyLogoLarge, { 
                          backgroundColor: getPartyColor(candidate.party), 
                          justifyContent: 'center', 
                          alignItems: 'center' 
                        }]}>
                          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            {getPartyAcronym(candidate.party)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Candidate Header with number and selection */}
                    <View style={styles.candidateHeader}>
                      <View style={styles.candidateNumber}>
                        <Text style={styles.candidateNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.candidateCheckbox}>
                        {selectedCandidate === candidate.id && (
                          <Ionicons name="checkmark" size={20} color="#10B981" />
                        )}
                      </View>
                    </View>
                    
                    {/* Candidate Details */}
                    <View style={styles.candidateDetails}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateParty}>{candidate.party}</Text>
                      <Text style={styles.candidateQualification}>
                        {candidate.qualification}
                      </Text>
                      <Text style={styles.runningMate}>
                        Running Mate: {candidate.running_mate}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => setCurrentStep(1)}
                >
                  <Ionicons name="arrow-back" size={20} color="#6B7280" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.primaryButton, !selectedCandidate && styles.disabledButton]}
                  onPress={() => setCurrentStep(3)}
                  disabled={!selectedCandidate}
                >
                  <Text style={styles.primaryButtonText}>Proceed to Confirmation</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3: Vote Confirmation */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.warningCard}>
                <Ionicons name="warning" size={24} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Please review your selection carefully. Once submitted, your vote cannot be changed.
                </Text>
              </View>
              
              {selectedCandidate && (
                <View style={styles.confirmationCard}>
                  <Text style={styles.confirmationTitle}>Your Selection</Text>
                  <View style={styles.selectedCandidateInfo}>
                    {getPartyLogo(election?.contestants?.find((c: any) => c.id === selectedCandidate)) ? (
                      <Image 
                        source={getPartyLogo(
                          election?.contestants?.find((c: any) => c.id === selectedCandidate)
                        )}
                        style={styles.confirmationPartyLogo}
                        onLoad={() => console.log('✅ Confirmation party logo loaded successfully')}
                        onError={(error) => console.log('❌ Confirmation party logo failed to load. Error:', error.nativeEvent.error)}
                      />
                    ) : (
                      <View style={[styles.confirmationPartyLogo, { 
                        backgroundColor: getPartyColor(
                          election?.contestants?.find((c: any) => c.id === selectedCandidate)?.party
                        ), 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }]}>
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                          {getPartyAcronym(
                            election?.contestants?.find((c: any) => c.id === selectedCandidate)?.party
                          )}
                        </Text>
                      </View>
                    )}
                    <View style={styles.confirmationDetails}>
                      <Text style={styles.confirmationCandidateName}>
                        {election?.contestants?.find((c: any) => c.id === selectedCandidate)?.name}
                      </Text>
                      <Text style={styles.confirmationCandidateParty}>
                        {election?.contestants?.find((c: any) => c.id === selectedCandidate)?.party}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => setCurrentStep(2)}
                >
                  <Ionicons name="arrow-back" size={20} color="#6B7280" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleVoteSubmission}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Cast My Vote'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.95,
    height: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  electionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stepContent: {
    flex: 1,
  },
  verificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  voterInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  ballotHeader: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  ballotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 4,
  },
  ballotSubtitle: {
    fontSize: 12,
    color: '#16A34A',
    marginBottom: 2,
  },
  ballotAuthority: {
    fontSize: 10,
    color: '#16A34A',
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  candidatesContainer: {
    marginBottom: 20,
  },
  candidateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCandidateCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  partyLogoTop: {
    alignItems: 'center',
    marginBottom: 12,
  },
  partyLogoLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000000',
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  candidateNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  candidateCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#000000', // Add border to make it visible
  },
  partyLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partyLogoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  candidateDetails: {
    alignItems: 'center',
    textAlign: 'center',
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  candidateParty: {
    fontSize: 14,
    color: '#2563EB',
    marginBottom: 4,
    textAlign: 'center',
  },
  candidateQualification: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  runningMate: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  confirmationCard: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedCandidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmationPartyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  confirmationPartyLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationPartyLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  confirmationDetails: {
    flex: 1,
  },
  confirmationCandidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  confirmationCandidateParty: {
    fontSize: 16,
    color: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VotingModal;
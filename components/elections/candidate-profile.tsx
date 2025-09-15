/**
 * Candidate Profile Component
 * Detailed candidate profile with biography, manifesto, and social media links
 */

import * as React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contestant } from '../../types/election';

interface CandidateProfileProps {
  candidate: Contestant;
  electionStatus: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  onVote?: (candidate: Contestant) => void;
  onBack?: () => void;
  onShare?: (candidate: Contestant) => void;
  className?: string;
}

interface ExtendedContestant extends Contestant {
  bio?: string;
  manifesto?: string;
  qualifications?: string[];
  experience?: string[];
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function CandidateProfile({
  candidate,
  electionStatus,
  onVote,
  onBack,
  onShare,
  className
}: CandidateProfileProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'manifesto' | 'experience' | 'social'>('overview');

  // Extended candidate data with additional information
  const extendedCandidate: ExtendedContestant = {
    ...candidate,
    bio: (candidate as any).bio || 'No biography available',
    manifesto: (candidate as any).manifesto || 'No manifesto available',
    qualifications: (candidate as any).qualifications || [],
    experience: (candidate as any).experience || [],
    socialMedia: (candidate as any).socialMedia || {},
    isVerified: (candidate as any).isVerified || false,
    isActive: (candidate as any).isActive || true,
    createdAt: (candidate as any).createdAt || new Date().toISOString(),
    updatedAt: (candidate as any).updatedAt || new Date().toISOString()
  };

  const handleVote = () => {
    if (electionStatus !== 'ONGOING') {
      Alert.alert(
        'Voting Not Available',
        'Voting is only available during ongoing elections.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (onVote) {
      onVote(candidate);
    }
  };

  const handleSocialLink = async (url: string, platform: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${platform} link`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${platform} link`);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(candidate);
    }
  };

  const canVote = electionStatus === 'ONGOING';

  return React.createElement(ScrollView, { style: styles.container },
    // Header
    React.createElement(View, { style: styles.header },
      React.createElement(View, { style: styles.headerContent },
        onBack && React.createElement(Pressable, { 
          style: styles.backButton, 
          onPress: onBack 
        },
          React.createElement(Ionicons, { name: 'arrow-back', size: 24, color: 'white' })
        ),
        React.createElement(View, { style: styles.headerInfo },
          React.createElement(Text, { style: styles.headerTitle }, 'Candidate Profile'),
          React.createElement(Text, { style: styles.headerSubtitle }, extendedCandidate.name)
        ),
        React.createElement(Pressable, { 
          style: styles.shareButton, 
          onPress: handleShare 
        },
          React.createElement(Ionicons, { name: 'share', size: 24, color: 'white' })
        )
      )
    ),

    // Candidate Info Card
    React.createElement(View, { style: styles.infoCard },
      React.createElement(View, { style: styles.candidateHeader },
        React.createElement(View, { style: styles.avatarContainer },
          candidate.picture ? 
            React.createElement(Text, { style: styles.avatarText }, candidate.name.charAt(0)) :
            React.createElement(Text, { style: styles.avatarText }, candidate.name.charAt(0))
        ),
        React.createElement(View, { style: styles.candidateInfo },
          React.createElement(View, { style: styles.nameRow },
            React.createElement(Text, { style: styles.candidateName }, extendedCandidate.name),
            extendedCandidate.isVerified && React.createElement(Ionicons, { 
              name: 'checkmark-circle', 
              size: 20, 
              color: '#10b981' 
            })
          ),
          React.createElement(Text, { style: styles.candidateParty }, extendedCandidate.party),
          React.createElement(Text, { style: styles.candidatePosition }, extendedCandidate.position),
          React.createElement(Text, { style: styles.candidateAcronym }, extendedCandidate.party_acronym)
        )
      ),
      React.createElement(View, { style: styles.statsRow },
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statValue }, extendedCandidate.votes.toLocaleString()),
          React.createElement(Text, { style: styles.statLabel }, 'Votes')
        ),
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statValue }, extendedCandidate.party_acronym),
          React.createElement(Text, { style: styles.statLabel }, 'Party')
        ),
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statValue }, 
            extendedCandidate.isActive ? 'Active' : 'Inactive'
          ),
          React.createElement(Text, { style: styles.statLabel }, 'Status')
        )
      )
    ),

    // Action Buttons
    React.createElement(View, { style: styles.actionButtons },
      canVote && React.createElement(Pressable, { 
        style: styles.voteButton, 
        onPress: handleVote 
      },
        React.createElement(View, { style: styles.buttonContent },
          React.createElement(Ionicons, { name: 'checkmark-circle', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.buttonText }, 'Vote for Candidate')
        )
      ),
      React.createElement(Pressable, { 
        style: styles.shareButtonSecondary, 
        onPress: handleShare 
      },
        React.createElement(View, { style: styles.buttonContent },
          React.createElement(Ionicons, { name: 'share', size: 20, color: '#3b82f6' }),
          React.createElement(Text, { style: styles.buttonTextSecondary }, 'Share Profile')
        )
      )
    ),

    // Tabs
    React.createElement(View, { style: styles.tabs },
      [
        { key: 'overview', label: 'Overview', icon: 'information-circle' },
        { key: 'manifesto', label: 'Manifesto', icon: 'document-text' },
        { key: 'experience', label: 'Experience', icon: 'briefcase' },
        { key: 'social', label: 'Social', icon: 'people' },
      ].map((tab) => 
        React.createElement(Pressable, {
          key: tab.key,
          onPress: () => setActiveTab(tab.key as any),
          style: [styles.tab, activeTab === tab.key && styles.activeTab]
        },
          React.createElement(View, { style: styles.tabContent },
            React.createElement(Ionicons, { 
              name: tab.icon as any, 
              size: 18, 
              color: activeTab === tab.key ? '#3b82f6' : '#6b7280' 
            }),
            React.createElement(Text, { 
              style: [styles.tabText, activeTab === tab.key && styles.activeTabText]
            }, tab.label)
          )
        )
      )
    ),

    // Tab Content
    React.createElement(View, { style: styles.tabContent },
      activeTab === 'overview' && React.createElement(OverviewTab, { candidate: extendedCandidate }),
      activeTab === 'manifesto' && React.createElement(ManifestoTab, { candidate: extendedCandidate }),
      activeTab === 'experience' && React.createElement(ExperienceTab, { candidate: extendedCandidate }),
      activeTab === 'social' && React.createElement(SocialTab, { 
        candidate: extendedCandidate, 
        onSocialLink: handleSocialLink 
      })
    )
  );
}

interface TabProps {
  candidate: ExtendedContestant;
}

function OverviewTab({ candidate }: TabProps) {
  return React.createElement(View, { style: styles.tabContainer },
    React.createElement(Text, { style: styles.sectionTitle }, 'Biography'),
    React.createElement(Text, { style: styles.bioText }, candidate.bio),
    
    React.createElement(Text, { style: styles.sectionTitle }, 'Key Information'),
    React.createElement(View, { style: styles.infoList },
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Text, { style: styles.infoLabel }, 'Party'),
        React.createElement(Text, { style: styles.infoValue }, candidate.party)
      ),
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Text, { style: styles.infoLabel }, 'Position'),
        React.createElement(Text, { style: styles.infoValue }, candidate.position)
      ),
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Text, { style: styles.infoLabel }, 'Total Votes'),
        React.createElement(Text, { style: styles.infoValue }, candidate.votes.toLocaleString())
      ),
      React.createElement(View, { style: styles.infoItem },
        React.createElement(Text, { style: styles.infoLabel }, 'Status'),
        React.createElement(Text, { style: styles.infoValue }, 
          candidate.isActive ? 'Active' : 'Inactive'
        )
      )
    )
  );
}

function ManifestoTab({ candidate }: TabProps) {
  return React.createElement(View, { style: styles.tabContainer },
    React.createElement(Text, { style: styles.sectionTitle }, 'Manifesto'),
    React.createElement(Text, { style: styles.manifestoText }, candidate.manifesto),
    
    candidate.qualifications && candidate.qualifications.length > 0 && React.createElement(View, {},
      React.createElement(Text, { style: styles.sectionTitle }, 'Qualifications'),
      React.createElement(View, { style: styles.list },
        candidate.qualifications.map((qual, index) => 
          React.createElement(View, { key: index, style: styles.listItem },
            React.createElement(Ionicons, { name: 'checkmark-circle', size: 16, color: '#10b981' }),
            React.createElement(Text, { style: styles.listText }, qual)
          )
        )
      )
    )
  );
}

function ExperienceTab({ candidate }: TabProps) {
  return React.createElement(View, { style: styles.tabContainer },
    React.createElement(Text, { style: styles.sectionTitle }, 'Experience'),
    candidate.experience && candidate.experience.length > 0 ? 
      React.createElement(View, { style: styles.list },
        candidate.experience.map((exp, index) => 
          React.createElement(View, { key: index, style: styles.listItem },
            React.createElement(Ionicons, { name: 'briefcase', size: 16, color: '#3b82f6' }),
            React.createElement(Text, { style: styles.listText }, exp)
          )
        )
      ) :
      React.createElement(Text, { style: styles.emptyText }, 'No experience information available')
  );
}

interface SocialTabProps extends TabProps {
  onSocialLink: (url: string, platform: string) => void;
}

function SocialTab({ candidate, onSocialLink }: SocialTabProps) {
  const socialLinks = [
    { key: 'twitter', icon: 'logo-twitter', label: 'Twitter', url: candidate.socialMedia?.twitter },
    { key: 'facebook', icon: 'logo-facebook', label: 'Facebook', url: candidate.socialMedia?.facebook },
    { key: 'instagram', icon: 'logo-instagram', label: 'Instagram', url: candidate.socialMedia?.instagram },
    { key: 'website', icon: 'globe', label: 'Website', url: candidate.socialMedia?.website },
  ].filter(link => link.url);

  return React.createElement(View, { style: styles.tabContainer },
    React.createElement(Text, { style: styles.sectionTitle }, 'Social Media & Links'),
    socialLinks.length > 0 ? 
      React.createElement(View, { style: styles.socialLinks },
        socialLinks.map((link) => 
          React.createElement(Pressable, {
            key: link.key,
            style: styles.socialLink,
            onPress: () => onSocialLink(link.url!, link.label)
          },
            React.createElement(Ionicons, { name: link.icon as any, size: 24, color: '#3b82f6' }),
            React.createElement(Text, { style: styles.socialLinkText }, link.label)
          )
        )
      ) :
      React.createElement(Text, { style: styles.emptyText }, 'No social media links available')
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  backButton: {
    padding: 8
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 2
  },
  shareButton: {
    padding: 8
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6b7280'
  },
  candidateInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  candidateName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  candidateParty: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4
  },
  candidatePosition: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4
  },
  candidateAcronym: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  voteButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  shareButtonSecondary: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    alignItems: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  buttonTextSecondary: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#3b82f6'
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280'
  },
  activeTabText: {
    color: 'white'
  },
  tabContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  bioText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20
  },
  manifestoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20
  },
  infoList: {
    gap: 12
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827'
  },
  list: {
    gap: 8
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  listText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  socialLinks: {
    gap: 12
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8
  },
  socialLinkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500'
  }
});

export default CandidateProfile;

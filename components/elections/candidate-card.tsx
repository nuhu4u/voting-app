/**
 * Candidate Card Component
 * Individual candidate display with detailed information and interactions
 */

import * as React from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contestant } from '../../types/election';
import { formatDate } from '../../lib/utils';

interface CandidateCardProps {
  candidate: Contestant;
  electionStatus: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  onPress?: (candidate: Contestant) => void;
  onVote?: (candidate: Contestant) => void;
  onViewProfile?: (candidate: Contestant) => void;
  onShare?: (candidate: Contestant) => void;
  showVoteButton?: boolean;
  showVoteCount?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  className?: string;
}

export function CandidateCard({
  candidate,
  electionStatus,
  onPress,
  onVote,
  onViewProfile,
  onShare,
  showVoteButton = true,
  showVoteCount = true,
  variant = 'default',
  className
}: CandidateCardProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress(candidate);
    }
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

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(candidate);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(candidate);
    }
  };

  const canVote = electionStatus === 'ONGOING' && showVoteButton;

  if (variant === 'minimal') {
    return React.createElement(Pressable, {
      onPress: handlePress,
      onPressIn: () => setIsPressed(true),
      onPressOut: () => setIsPressed(false),
      style: [styles.minimalCard, isPressed && styles.pressedCard]
    },
      React.createElement(View, { style: styles.minimalContent },
        React.createElement(View, { style: styles.minimalAvatar },
          React.createElement(Text, { style: styles.minimalAvatarText }, candidate.name.charAt(0))
        ),
        React.createElement(View, { style: styles.minimalInfo },
          React.createElement(Text, { style: styles.minimalName }, candidate.name),
          React.createElement(Text, { style: styles.minimalParty }, candidate.party_acronym)
        ),
        showVoteCount && React.createElement(Text, { style: styles.minimalVotes }, candidate.votes.toString())
      )
    );
  }

  if (variant === 'compact') {
    return React.createElement(Pressable, {
      onPress: handlePress,
      onPressIn: () => setIsPressed(true),
      onPressOut: () => setIsPressed(false),
      style: [styles.compactCard, isPressed && styles.pressedCard]
    },
      React.createElement(View, { style: styles.compactContent },
        React.createElement(View, { style: styles.compactAvatar },
          candidate.picture ? 
            React.createElement(Image, { 
              source: { uri: candidate.picture }, 
              style: styles.compactAvatarImage 
            }) :
            React.createElement(Text, { style: styles.compactAvatarText }, candidate.name.charAt(0))
        ),
        React.createElement(View, { style: styles.compactInfo },
          React.createElement(Text, { style: styles.compactName }, candidate.name),
          React.createElement(Text, { style: styles.compactParty }, candidate.party),
          React.createElement(Text, { style: styles.compactPosition }, candidate.position)
        ),
        React.createElement(View, { style: styles.compactActions },
          showVoteCount && React.createElement(Text, { style: styles.compactVotes }, candidate.votes.toString()),
          canVote && React.createElement(Pressable, { 
            style: styles.compactVoteButton, 
            onPress: handleVote 
          },
            React.createElement(Ionicons, { name: 'checkmark-circle', size: 16, color: '#3b82f6' })
          )
        )
      )
    );
  }

  if (variant === 'detailed') {
    return React.createElement(View, { style: styles.detailedCard },
      React.createElement(View, { style: styles.detailedHeader },
        React.createElement(View, { style: styles.detailedAvatar },
          candidate.picture ? 
            React.createElement(Image, { 
              source: { uri: candidate.picture }, 
              style: styles.detailedAvatarImage 
            }) :
            React.createElement(Text, { style: styles.detailedAvatarText }, candidate.name.charAt(0))
        ),
        React.createElement(View, { style: styles.detailedInfo },
          React.createElement(Text, { style: styles.detailedName }, candidate.name),
          React.createElement(Text, { style: styles.detailedParty }, candidate.party),
          React.createElement(Text, { style: styles.detailedPosition }, candidate.position),
          React.createElement(Text, { style: styles.detailedAcronym }, candidate.party_acronym)
        ),
        React.createElement(View, { style: styles.detailedActions },
          React.createElement(Pressable, { 
            style: styles.actionButton, 
            onPress: handleViewProfile 
          },
            React.createElement(Ionicons, { name: 'person', size: 20, color: '#6b7280' })
          ),
          React.createElement(Pressable, { 
            style: styles.actionButton, 
            onPress: handleShare 
          },
            React.createElement(Ionicons, { name: 'share', size: 20, color: '#6b7280' })
          )
        )
      ),
      React.createElement(View, { style: styles.detailedStats },
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statLabel }, 'Votes'),
          React.createElement(Text, { style: styles.statValue }, candidate.votes.toLocaleString())
        ),
        React.createElement(View, { style: styles.statItem },
          React.createElement(Text, { style: styles.statLabel }, 'Party'),
          React.createElement(Text, { style: styles.statValue }, candidate.party_acronym)
        )
      ),
      canVote && React.createElement(Pressable, { 
        style: styles.detailedVoteButton, 
        onPress: handleVote 
      },
        React.createElement(View, { style: styles.voteButtonContent },
          React.createElement(Ionicons, { name: 'checkmark-circle', size: 20, color: 'white' }),
          React.createElement(Text, { style: styles.voteButtonText }, 'Vote for Candidate')
        )
      )
    );
  }

  // Default variant
  return React.createElement(Pressable, {
    onPress: handlePress,
    onPressIn: () => setIsPressed(true),
    onPressOut: () => setIsPressed(false),
    style: [styles.defaultCard, isPressed && styles.pressedCard]
  },
    React.createElement(View, { style: styles.defaultContent },
      React.createElement(View, { style: styles.defaultAvatar },
        candidate.picture ? 
          React.createElement(Image, { 
            source: { uri: candidate.picture }, 
            style: styles.defaultAvatarImage 
          }) :
          React.createElement(Text, { style: styles.defaultAvatarText }, candidate.name.charAt(0))
      ),
      React.createElement(View, { style: styles.defaultInfo },
        React.createElement(Text, { style: styles.defaultName }, candidate.name),
        React.createElement(Text, { style: styles.defaultParty }, candidate.party),
        React.createElement(Text, { style: styles.defaultPosition }, candidate.position)
      ),
      React.createElement(View, { style: styles.defaultActions },
        showVoteCount && React.createElement(View, { style: styles.voteCount },
          React.createElement(Text, { style: styles.voteCountText }, candidate.votes.toLocaleString()),
          React.createElement(Text, { style: styles.voteCountLabel }, 'votes')
        ),
        canVote && React.createElement(Pressable, { 
          style: styles.defaultVoteButton, 
          onPress: handleVote 
        },
          React.createElement(Ionicons, { name: 'checkmark-circle', size: 18, color: '#3b82f6' })
        )
      )
    )
  );
}

const styles = StyleSheet.create({
  // Minimal variant styles
  minimalCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8
  },
  pressedCard: {
    backgroundColor: '#f3f4f6'
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  minimalAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  minimalAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  minimalInfo: {
    flex: 1
  },
  minimalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  minimalParty: {
    fontSize: 12,
    color: '#6b7280'
  },
  minimalVotes: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6'
  },

  // Compact variant styles
  compactCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  compactAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  compactAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280'
  },
  compactInfo: {
    flex: 1
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  compactParty: {
    fontSize: 14,
    color: '#6b7280'
  },
  compactPosition: {
    fontSize: 12,
    color: '#9ca3af'
  },
  compactActions: {
    alignItems: 'flex-end',
    gap: 8
  },
  compactVotes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  compactVoteButton: {
    padding: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 20
  },

  // Detailed variant styles
  detailedCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16
  },
  detailedAvatar: {
    width: 64,
    height: 64,
    backgroundColor: '#e5e7eb',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailedAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32
  },
  detailedAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6b7280'
  },
  detailedInfo: {
    flex: 1
  },
  detailedName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  detailedParty: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2
  },
  detailedPosition: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4
  },
  detailedAcronym: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600'
  },
  detailedActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  detailedVoteButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  voteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  voteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },

  // Default variant styles
  defaultCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  defaultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  defaultAvatar: {
    width: 56,
    height: 56,
    backgroundColor: '#e5e7eb',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  defaultAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  defaultAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280'
  },
  defaultInfo: {
    flex: 1
  },
  defaultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  defaultParty: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2
  },
  defaultPosition: {
    fontSize: 12,
    color: '#9ca3af'
  },
  defaultActions: {
    alignItems: 'flex-end',
    gap: 8
  },
  voteCount: {
    alignItems: 'flex-end'
  },
  voteCountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  voteCountLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  defaultVoteButton: {
    padding: 10,
    backgroundColor: '#f0f9ff',
    borderRadius: 20
  }
});

export default CandidateCard;

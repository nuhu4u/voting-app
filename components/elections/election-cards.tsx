/**
 * Election Card Components
 * Various election card layouts and designs
 */

import * as React from 'react';

export interface ElectionCardData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  totalCandidates: number;
  totalVoters: number;
  hasVoted: boolean;
  imageUrl?: string;
  category: string;
  location: string;
  requirements: string[];
  votingMethod: 'online' | 'hybrid' | 'offline';
  securityLevel: 'standard' | 'enhanced' | 'maximum';
  blockchainHash?: string;
  resultsAvailable: boolean;
  participationRate: number;
  isBookmarked: boolean;
  isStarred: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ElectionCardProps {
  election: ElectionCardData;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  onSelect?: (election: ElectionCardData) => void;
  onVote?: (election: ElectionCardData) => void;
  onViewResults?: (election: ElectionCardData) => void;
  onBookmark?: (electionId: string) => void;
  onStar?: (electionId: string) => void;
  onShare?: (election: ElectionCardData) => void;
  showActions?: boolean;
  showStats?: boolean;
  showRequirements?: boolean;
  showTags?: boolean;
  className?: string;
}

export interface ElectionCardGridProps {
  elections: ElectionCardData[];
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  columns?: 1 | 2 | 3 | 4;
  onElectionSelect?: (election: ElectionCardData) => void;
  onElectionVote?: (election: ElectionCardData) => void;
  onElectionViewResults?: (election: ElectionCardData) => void;
  onElectionBookmark?: (electionId: string) => void;
  onElectionStar?: (electionId: string) => void;
  onElectionShare?: (election: ElectionCardData) => void;
  className?: string;
}

export interface ElectionCardListProps {
  elections: ElectionCardData[];
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  onElectionSelect?: (election: ElectionCardData) => void;
  onElectionVote?: (election: ElectionCardData) => void;
  onElectionViewResults?: (election: ElectionCardData) => void;
  onElectionBookmark?: (electionId: string) => void;
  onElectionStar?: (electionId: string) => void;
  onElectionShare?: (election: ElectionCardData) => void;
  className?: string;
}

/**
 * Default Election Card Component
 */
export function ElectionCard({
  election,
  variant = 'default',
  onSelect,
  onVote,
  onViewResults,
  onBookmark,
  onStar,
  onShare,
  showActions = true,
  showStats = true,
  showRequirements = false,
  showTags = true,
  className = ''
}: ElectionCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.completed;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getSecurityLevelColor = (level: string) => {
    const colors = {
      standard: 'bg-gray-100 text-gray-800',
      enhanced: 'bg-yellow-100 text-yellow-800',
      maximum: 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || colors.standard;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVotingMethodIcon = (method: string) => {
    const icons = {
      online: React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        })
      ),
      hybrid: React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
        })
      ),
      offline: React.createElement('svg', {
        className: 'w-4 h-4',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      },
        React.createElement('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 2,
          d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        })
      )
    };
    return icons[method as keyof typeof icons] || icons.online;
  };

  const renderCompactCard = () => {
    return React.createElement('div', {
      className: `bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`
    },
      React.createElement('div', {
        className: 'flex items-start justify-between mb-3'
      },
        React.createElement('div', { className: 'flex-1' },
          React.createElement('h3', {
            className: 'text-lg font-semibold text-gray-900 mb-1'
          }, election.title),
          React.createElement('p', {
            className: 'text-sm text-gray-600'
          }, election.category)
        ),
        React.createElement('div', { className: 'flex items-center space-x-2' },
          React.createElement('span', {
            className: `px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(election.status)}`
          }, election.status.charAt(0).toUpperCase() + election.status.slice(1)),
          election.priority === 'high' && React.createElement('span', {
            className: `px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(election.priority)}`
          }, 'High Priority')
        )
      ),
      React.createElement('div', {
        className: 'flex items-center justify-between text-sm text-gray-500'
      },
        React.createElement('span', {}, formatDate(election.startDate)),
        React.createElement('span', {}, `${election.totalCandidates} candidates`)
      )
    );
  };

  const renderDetailedCard = () => {
    return React.createElement('div', {
      className: `bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`
    },
      // Header
      React.createElement('div', {
        className: 'p-6 border-b border-gray-200'
      },
        React.createElement('div', {
          className: 'flex items-start justify-between mb-4'
        },
          React.createElement('div', { className: 'flex-1' },
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-900 mb-2'
            }, election.title),
            React.createElement('p', {
              className: 'text-gray-600 mb-3'
            }, election.description)
          ),
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement('span', {
              className: `px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(election.status)}`
            }, election.status.charAt(0).toUpperCase() + election.status.slice(1)),
            election.priority === 'high' && React.createElement('span', {
              className: `px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(election.priority)}`
            }, 'High Priority')
          )
        ),
        React.createElement('div', {
          className: 'flex items-center space-x-4 text-sm text-gray-500'
        },
          React.createElement('span', { className: 'flex items-center' },
            React.createElement('svg', {
              className: 'w-4 h-4 mr-1',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              }),
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              })
            ),
            election.location
          ),
          React.createElement('span', { className: 'flex items-center' },
            React.createElement('svg', {
              className: 'w-4 h-4 mr-1',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              React.createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
              })
            ),
            election.category
          )
        )
      ),

      // Content
      React.createElement('div', { className: 'p-6' },
        // Stats
        showStats && React.createElement('div', {
          className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'
        },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', {
              className: 'text-2xl font-bold text-gray-900'
            }, election.totalCandidates),
            React.createElement('div', {
              className: 'text-sm text-gray-500'
            }, 'Candidates')
          ),
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', {
              className: 'text-2xl font-bold text-gray-900'
            }, election.totalVoters.toLocaleString()),
            React.createElement('div', {
              className: 'text-sm text-gray-500'
            }, 'Voters')
          ),
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', {
              className: 'text-2xl font-bold text-gray-900'
            }, `${election.participationRate}%`),
            React.createElement('div', {
              className: 'text-sm text-gray-500'
            }, 'Participation')
          ),
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', {
              className: 'text-2xl font-bold text-gray-900'
            }, election.votingMethod.charAt(0).toUpperCase() + election.votingMethod.slice(1)),
            React.createElement('div', {
              className: 'text-sm text-gray-500'
            }, 'Method')
          )
        ),

        // Requirements
        showRequirements && election.requirements.length > 0 && React.createElement('div', {
          className: 'mb-6'
        },
          React.createElement('h4', {
            className: 'text-sm font-medium text-gray-700 mb-2'
          }, 'Requirements'),
          React.createElement('div', {
            className: 'flex flex-wrap gap-2'
          },
            election.requirements.map((req, index) => 
              React.createElement('span', {
                key: index,
                className: 'px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full'
              }, req)
            )
          )
        ),

        // Tags
        showTags && election.tags.length > 0 && React.createElement('div', {
          className: 'mb-6'
        },
          React.createElement('h4', {
            className: 'text-sm font-medium text-gray-700 mb-2'
          }, 'Tags'),
          React.createElement('div', {
            className: 'flex flex-wrap gap-2'
          },
            election.tags.map((tag, index) => 
              React.createElement('span', {
                key: index,
                className: 'px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full'
              }, tag)
            )
          )
        ),

        // Date and Time
        React.createElement('div', {
          className: 'flex items-center justify-between text-sm text-gray-500 mb-6'
        },
          React.createElement('div', {},
            React.createElement('div', { className: 'font-medium' }, 'Start Date'),
            React.createElement('div', {}, formatDate(election.startDate)),
            React.createElement('div', {}, formatTime(election.startDate))
          ),
          React.createElement('div', {},
            React.createElement('div', { className: 'font-medium' }, 'End Date'),
            React.createElement('div', {}, formatDate(election.endDate)),
            React.createElement('div', {}, formatTime(election.endDate))
          )
        ),

        // Actions
        showActions && React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement('button', {
              onClick: () => onSelect?.(election),
              className: 'px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors'
            }, 'View Details'),
            election.status === 'active' && !election.hasVoted && React.createElement('button', {
              onClick: () => onVote?.(election),
              className: 'px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors'
            }, 'Vote Now'),
            election.status === 'completed' && election.resultsAvailable && React.createElement('button', {
              onClick: () => onViewResults?.(election),
              className: 'px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 transition-colors'
            }, 'View Results')
          ),
          React.createElement('div', { className: 'flex items-center space-x-2' },
            React.createElement('button', {
              onClick: () => onBookmark?.(election.id),
              className: `p-2 rounded-lg transition-colors ${
                election.isBookmarked 
                  ? 'text-blue-600 bg-blue-100' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`
            },
              React.createElement('svg', {
                className: 'w-5 h-5',
                fill: election.isBookmarked ? 'currentColor' : 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24'
              },
                React.createElement('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                })
              )
            ),
            React.createElement('button', {
              onClick: () => onStar?.(election.id),
              className: `p-2 rounded-lg transition-colors ${
                election.isStarred 
                  ? 'text-yellow-600 bg-yellow-100' 
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`
            },
              React.createElement('svg', {
                className: 'w-5 h-5',
                fill: election.isStarred ? 'currentColor' : 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24'
              },
                React.createElement('path', {
                  d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
                })
              )
            ),
            React.createElement('button', {
              onClick: () => onShare?.(election),
              className: 'p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            },
              React.createElement('svg', {
                className: 'w-5 h-5',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24'
              },
                React.createElement('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                })
              )
            )
          )
        )
      )
    );
  };

  const renderMinimalCard = () => {
    return React.createElement('div', {
      className: `bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer ${className}`
    },
      React.createElement('div', {
        className: 'flex items-center justify-between'
      },
        React.createElement('div', { className: 'flex-1' },
          React.createElement('h4', {
            className: 'text-sm font-medium text-gray-900 truncate'
          }, election.title),
          React.createElement('p', {
            className: 'text-xs text-gray-500'
          }, election.category)
        ),
        React.createElement('span', {
          className: `px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(election.status)}`
        }, election.status.charAt(0).toUpperCase() + election.status.slice(1))
      )
    );
  };

  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'detailed':
      return renderDetailedCard();
    case 'minimal':
      return renderMinimalCard();
    default:
      return renderDetailedCard();
  }
}

/**
 * Election Card Grid Component
 */
export function ElectionCardGrid({
  elections,
  variant = 'default',
  columns = 3,
  onElectionSelect,
  onElectionVote,
  onElectionViewResults,
  onElectionBookmark,
  onElectionStar,
  onElectionShare,
  className = ''
}: ElectionCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return React.createElement('div', {
    className: `grid ${gridCols[columns]} gap-6 ${className}`
  },
    elections.map((election) => 
      React.createElement(ElectionCard, {
        key: election.id,
        election,
        variant,
        onSelect: onElectionSelect,
        onVote: onElectionVote,
        onViewResults: onElectionViewResults,
        onBookmark: onElectionBookmark,
        onStar: onElectionStar,
        onShare: onElectionShare
      })
    )
  );
}

/**
 * Election Card List Component
 */
export function ElectionCardList({
  elections,
  variant = 'default',
  onElectionSelect,
  onElectionVote,
  onElectionViewResults,
  onElectionBookmark,
  onElectionStar,
  onElectionShare,
  className = ''
}: ElectionCardListProps) {
  return React.createElement('div', {
    className: `space-y-4 ${className}`
  },
    elections.map((election) => 
      React.createElement(ElectionCard, {
        key: election.id,
        election,
        variant,
        onSelect: onElectionSelect,
        onVote: onElectionVote,
        onViewResults: onElectionViewResults,
        onBookmark: onElectionBookmark,
        onStar: onElectionStar,
        onShare: onElectionShare
      })
    )
  );
}

export default ElectionCard;

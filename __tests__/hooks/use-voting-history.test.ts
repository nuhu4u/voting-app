/**
 * Voting History Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { 
  useVotingHistory, 
  useVotingAnalytics, 
  useVotingTrends 
} from '@/hooks/use-voting-history';

describe('useVotingHistory', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    expect(result.current.votingRecords).toEqual([]);
    expect(result.current.filteredRecords).toEqual([]);
    expect(result.current.stats).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load voting history data', async () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(result.current.votingRecords).toHaveLength(4);
    expect(result.current.stats).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.votingRecords[0].electionTitle).toBe('Presidential Election 2023');
  });

  it('should filter records by election category', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    // Wait for data to load
    act(() => {
      result.current.votingRecords = [
        { id: '1', electionCategory: 'Presidential' } as any,
        { id: '2', electionCategory: 'Senate' } as any,
        { id: '3', electionCategory: 'Presidential' } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        electionCategory: ['Presidential']
      });
    });

    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => r.electionCategory === 'Presidential')).toBe(true);
  });

  it('should filter records by voting method', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', votingMethod: 'online' } as any,
        { id: '2', votingMethod: 'hybrid' } as any,
        { id: '3', votingMethod: 'online' } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        votingMethod: ['online']
      });
    });

    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => r.votingMethod === 'online')).toBe(true);
  });

  it('should filter records by status', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', status: 'confirmed' } as any,
        { id: '2', status: 'pending' } as any,
        { id: '3', status: 'confirmed' } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        status: ['confirmed']
      });
    });

    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => r.status === 'confirmed')).toBe(true);
  });

  it('should filter records by candidate party', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', candidateParty: 'Progressive Party' } as any,
        { id: '2', candidateParty: 'Democratic Alliance' } as any,
        { id: '3', candidateParty: 'Progressive Party' } as any
      ];
    });

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        candidateParty: ['Progressive Party']
      });
    });

    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => r.candidateParty === 'Progressive Party')).toBe(true);
  });

  it('should search records by election title', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', electionTitle: 'Presidential Election' } as any,
        { id: '2', electionTitle: 'Senate Election' } as any,
        { id: '3', electionTitle: 'Presidential Vote' } as any
      ];
    });

    act(() => {
      result.current.setSearchQuery('presidential');
    });

    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => 
      r.electionTitle.toLowerCase().includes('presidential')
    )).toBe(true);
  });

  it('should search records by candidate name', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', candidateName: 'John Doe' } as any,
        { id: '2', candidateName: 'Jane Smith' } as any,
        { id: '3', candidateName: 'John Johnson' } as any
      ];
    });

    act(() => {
      result.current.setSearchQuery('john');
    });

    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => 
      r.candidateName.toLowerCase().includes('john')
    )).toBe(true);
  });

  it('should get record by ID', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', electionTitle: 'Election 1' } as any,
        { id: '2', electionTitle: 'Election 2' } as any
      ];
    });

    const record = result.current.getRecordById('1');
    expect(record?.electionTitle).toBe('Election 1');
  });

  it('should get records by election', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', electionId: 'e1' } as any,
        { id: '2', electionId: 'e2' } as any,
        { id: '3', electionId: 'e1' } as any
      ];
    });

    const records = result.current.getRecordsByElection('e1');
    expect(records).toHaveLength(2);
    expect(records.every(r => r.electionId === 'e1')).toBe(true);
  });

  it('should get records by candidate', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', candidateId: 'c1' } as any,
        { id: '2', candidateId: 'c2' } as any,
        { id: '3', candidateId: 'c1' } as any
      ];
    });

    const records = result.current.getRecordsByCandidate('c1');
    expect(records).toHaveLength(2);
    expect(records.every(r => r.candidateId === 'c1')).toBe(true);
  });

  it('should get records by date range', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.votingRecords = [
        { id: '1', voteDate: '2023-01-15' } as any,
        { id: '2', voteDate: '2023-02-15' } as any,
        { id: '3', voteDate: '2023-03-15' } as any
      ];
    });

    const records = result.current.getRecordsByDateRange('2023-01-01', '2023-02-28');
    expect(records).toHaveLength(2);
    expect(records.every(r => {
      const date = new Date(r.voteDate);
      return date >= new Date('2023-01-01') && date <= new Date('2023-02-28');
    })).toBe(true);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        electionCategory: ['Presidential'],
        status: ['confirmed']
      });
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters.electionCategory).toEqual([]);
    expect(result.current.filters.status).toEqual([]);
  });

  it('should download history', () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    const mockCreateElement = jest.fn(() => mockLink);
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    });
    Object.defineProperty(document.body, 'appendChild', {
      value: mockAppendChild,
      writable: true
    });
    Object.defineProperty(document.body, 'removeChild', {
      value: mockRemoveChild,
      writable: true
    });

    act(() => {
      result.current.downloadHistory();
    });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
  });

  it('should refresh history', async () => {
    const { result } = renderHook(() => useVotingHistory('1'));

    await act(async () => {
      await result.current.refreshHistory();
    });

    expect(result.current.votingRecords).toHaveLength(4);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useVotingAnalytics', () => {
  const mockRecords = [
    { id: '1', status: 'confirmed', electionCategory: 'Presidential', candidateParty: 'Party A', votingMethod: 'online' } as any,
    { id: '2', status: 'confirmed', electionCategory: 'Senate', candidateParty: 'Party B', votingMethod: 'hybrid' } as any,
    { id: '3', status: 'rejected', electionCategory: 'Presidential', candidateParty: 'Party A', votingMethod: 'online' } as any,
    { id: '4', status: 'confirmed', electionCategory: 'House', candidateParty: 'Party C', votingMethod: 'offline' } as any
  ];

  it('should calculate basic analytics', () => {
    const { result } = renderHook(() => useVotingAnalytics(mockRecords));

    expect(result.current.totalVotes).toBe(4);
    expect(result.current.successfulVotes).toBe(3);
    expect(result.current.failedVotes).toBe(1);
    expect(result.current.pendingVotes).toBe(0);
    expect(result.current.successRate).toBe(75);
  });

  it('should calculate category breakdown', () => {
    const { result } = renderHook(() => useVotingAnalytics(mockRecords));

    expect(result.current.categoryBreakdown['Presidential']).toBe(2);
    expect(result.current.categoryBreakdown['Senate']).toBe(1);
    expect(result.current.categoryBreakdown['House']).toBe(1);
  });

  it('should calculate party breakdown', () => {
    const { result } = renderHook(() => useVotingAnalytics(mockRecords));

    expect(result.current.partyBreakdown['Party A']).toBe(2);
    expect(result.current.partyBreakdown['Party B']).toBe(1);
    expect(result.current.partyBreakdown['Party C']).toBe(1);
  });

  it('should calculate method breakdown', () => {
    const { result } = renderHook(() => useVotingAnalytics(mockRecords));

    expect(result.current.methodBreakdown['online']).toBe(2);
    expect(result.current.methodBreakdown['hybrid']).toBe(1);
    expect(result.current.methodBreakdown['offline']).toBe(1);
  });
});

describe('useVotingTrends', () => {
  const mockRecords = [
    { id: '1', voteDate: '2023-01-01', voteTime: '10:00 AM', status: 'confirmed' } as any,
    { id: '2', voteDate: '2023-01-15', voteTime: '2:00 PM', status: 'confirmed' } as any,
    { id: '3', voteDate: '2023-02-01', voteTime: '9:00 AM', status: 'confirmed' } as any,
    { id: '4', voteDate: '2023-02-15', voteTime: '11:00 AM', status: 'rejected' } as any,
    { id: '5', voteDate: '2023-03-01', voteTime: '3:00 PM', status: 'confirmed' } as any
  ];

  it('should calculate voting streaks', () => {
    const { result } = renderHook(() => useVotingTrends(mockRecords));

    expect(result.current.currentStreak).toBe(1); // Last vote was confirmed
    expect(result.current.maxStreak).toBe(3); // Three consecutive confirmed votes
  });

  it('should calculate monthly voting pattern', () => {
    const { result } = renderHook(() => useVotingTrends(mockRecords));

    expect(result.current.monthlyVotes['2023-01']).toBe(2);
    expect(result.current.monthlyVotes['2023-02']).toBe(2);
    expect(result.current.monthlyVotes['2023-03']).toBe(1);
  });

  it('should calculate average votes per month', () => {
    const { result } = renderHook(() => useVotingTrends(mockRecords));

    expect(result.current.averageVotesPerMonth).toBe(5 / 3); // 5 votes over 3 months
  });

  it('should calculate most active voting hour', () => {
    const { result } = renderHook(() => useVotingTrends(mockRecords));

    // 10:00 AM appears twice, should be most active
    expect(result.current.mostActiveHour).toBe(10);
  });

  it('should calculate hourly voting pattern', () => {
    const { result } = renderHook(() => useVotingTrends(mockRecords));

    expect(result.current.hourlyVotes[10]).toBe(2); // 10:00 AM
    expect(result.current.hourlyVotes[14]).toBe(1); // 2:00 PM
    expect(result.current.hourlyVotes[9]).toBe(1);  // 9:00 AM
    expect(result.current.hourlyVotes[11]).toBe(1); // 11:00 AM
    expect(result.current.hourlyVotes[15]).toBe(1); // 3:00 PM
  });
});

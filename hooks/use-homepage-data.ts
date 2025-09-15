import { useState, useEffect, useCallback } from 'react';
import { homepageService, HomepageData, ElectionData, HomepageStats } from '@/lib/api/homepage-service';

export interface UseHomepageDataReturn {
  data: HomepageData | null;
  elections: ElectionData[];
  stats: HomepageStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  refreshElections: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useHomepageData(): UseHomepageDataReturn {
  const [data, setData] = useState<HomepageData | null>(null);
  const [elections, setElections] = useState<ElectionData[]>([]);
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const homepageData = await homepageService.getHomepageData();
      
      setData(homepageData);
      setElections(homepageData.elections);
      setStats(homepageData.stats);
      setLastUpdated(new Date(homepageData.last_updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage data');
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshElections = useCallback(async () => {
    try {
      setError(null);
      const activeElections = await homepageService.getActiveElections();
      setElections(activeElections);
      
      // Update the main data object
      if (data) {
        setData({
          ...data,
          elections: activeElections,
          last_updated: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh elections');
      console.error('Error refreshing elections:', err);
    }
  }, [data]);

  const refreshStats = useCallback(async () => {
    try {
      setError(null);
      const electionStats = await homepageService.getElectionStats();
      setStats(electionStats);
      
      // Update the main data object
      if (data) {
        setData({
          ...data,
          stats: electionStats,
          last_updated: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stats');
      console.error('Error refreshing stats:', err);
    }
  }, [data]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshElections();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshElections]);

  return {
    data,
    elections,
    stats,
    loading,
    error,
    lastUpdated,
    refresh,
    refreshElections,
    refreshStats,
  };
}

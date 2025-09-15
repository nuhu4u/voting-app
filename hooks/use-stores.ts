// Re-export all store hooks for easier imports
export { useAuthStore } from '@/store/auth-store';
export { useElectionStore } from '@/store/election-store';
export { useUIStore } from '@/store/ui-store';
export { useBlockchainStore } from '@/store/blockchain-store';

// Combined hooks for common use cases
import { useAuthStore } from '@/store/auth-store';
import { useElectionStore } from '@/store/election-store';
import { useUIStore } from '@/store/ui-store';
import { useBlockchainStore } from '@/store/blockchain-store';

// Hook for getting all stores at once
export function useAllStores() {
  const auth = useAuthStore();
  const election = useElectionStore();
  const ui = useUIStore();
  const blockchain = useBlockchainStore();

  return {
    auth,
    election,
    ui,
    blockchain,
  };
}

// Hook for getting only the data from stores (no actions)
export function useStoreData() {
  const auth = useAuthStore();
  const election = useElectionStore();
  const ui = useUIStore();
  const blockchain = useBlockchainStore();

  return {
    auth: {
      isAuthenticated: auth.isAuthenticated,
      user: auth.user,
      token: auth.token,
      isLoading: auth.isLoading,
      error: auth.error,
    },
    election: {
      elections: election.elections,
      currentElection: election.currentElection,
      electionResults: election.electionResults,
      userVotes: election.userVotes,
      filters: election.filters,
      isLoading: election.isLoading,
      error: election.error,
      hasMore: election.hasMore,
    },
    ui: {
      theme: ui.theme,
      currentTab: ui.currentTab,
      notifications: ui.notifications,
      unreadCount: ui.unreadCount,
      isAppLoading: ui.isAppLoading,
      isOnline: ui.isOnline,
      globalError: ui.globalError,
    },
    blockchain: {
      wallet: blockchain.wallet,
      isWalletConnected: blockchain.isWalletConnected,
      contractInfo: blockchain.contractInfo,
      transactions: blockchain.transactions,
      pendingTransactions: blockchain.pendingTransactions,
      isConnected: blockchain.isConnected,
      isLoading: blockchain.isLoading,
      error: blockchain.error,
    },
  };
}

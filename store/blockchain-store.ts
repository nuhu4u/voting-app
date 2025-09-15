import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  hash: string;
  type: 'vote' | 'registration' | 'verification';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  blockNumber?: number;
  gasUsed?: number;
  from: string;
  to: string;
  value: string;
}

interface BlockchainState {
  // Wallet
  walletAddress: string | null;
  walletBalance: string;
  isWalletConnected: boolean;
  
  // Transactions
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  
  // Network
  networkId: number | null;
  isNetworkCorrect: boolean;
  
  // Actions
  setWalletAddress: (address: string | null) => void;
  setWalletBalance: (balance: string) => void;
  setWalletConnected: (connected: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  setNetworkId: (networkId: number | null) => void;
  setNetworkCorrect: (correct: boolean) => void;
}

export const useBlockchainStore = create<BlockchainState>()(
  persist(
    (set, get) => ({
      // Initial state
      walletAddress: null,
      walletBalance: '0',
      isWalletConnected: false,
      transactions: [],
      pendingTransactions: [],
      networkId: null,
      isNetworkCorrect: false,

      // Actions
      setWalletAddress: (address) => {
        set({ walletAddress: address });
      },

      setWalletBalance: (balance) => {
        set({ walletBalance: balance });
      },

      setWalletConnected: (connected) => {
        set({ isWalletConnected: connected });
      },

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions],
          pendingTransactions: transaction.status === 'pending' 
            ? [transaction, ...state.pendingTransactions]
            : state.pendingTransactions,
        }));
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
          pendingTransactions: state.pendingTransactions.filter((tx) =>
            tx.id !== id || updates.status !== 'pending'
          ),
        }));
      },

      clearTransactions: () => {
        set({ transactions: [], pendingTransactions: [] });
      },

      setNetworkId: (networkId) => {
        set({ networkId });
      },

      setNetworkCorrect: (correct) => {
        set({ isNetworkCorrect: correct });
      },
    }),
    {
      name: 'blockchain-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        walletBalance: state.walletBalance,
        isWalletConnected: state.isWalletConnected,
        transactions: state.transactions,
        networkId: state.networkId,
        isNetworkCorrect: state.isNetworkCorrect,
      }),
    }
  )
);

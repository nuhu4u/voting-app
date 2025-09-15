import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@react-navigation/native';
import { StoreProvider } from '@/components/store-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { NotificationProvider } from '@/contexts/notification-context';
import { OfflineProvider } from '@/contexts/offline-context';

// Mock data
export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'voter' as const,
  nin: '12345678901',
  phone: '+2348012345678',
  is_verified: true,
  created_at: '2024-01-01T00:00:00Z',
  last_login: '2024-01-01T00:00:00Z',
};

export const mockElection = {
  id: '1',
  title: 'Test Election',
  description: 'A test election',
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-01-02T00:00:00Z',
  status: 'active' as const,
  type: 'presidential' as const,
  candidates: [
    {
      id: '1',
      name: 'Candidate 1',
      party: 'Test Party 1',
      position: 1,
      votes: 100,
    },
    {
      id: '2',
      name: 'Candidate 2',
      party: 'Test Party 2',
      position: 2,
      votes: 50,
    },
  ],
  total_votes: 150,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockElections = [mockElection];

export const mockVote = {
  id: '1',
  election_id: '1',
  candidate_id: '1',
  voter_id: '1',
  position: 1,
  timestamp: '2024-01-01T00:00:00Z',
  verified: true,
};

export const mockBlockchainTransaction = {
  id: '1',
  transaction_hash: '0x1234567890abcdef',
  election_id: '1',
  type: 'VOTE' as const,
  status: 'CONFIRMED' as const,
  gas_used: 21000,
  gas_price: '20',
  block_number: 12345,
  confirmations: 12,
  timestamp: '2024-01-01T00:00:00Z',
  from_address: '0xabcdef1234567890',
  to_address: '0x1234567890abcdef',
  value: '0',
  nonce: 1,
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>
        <NotificationProvider>
          <OfflineProvider>
            <ThemeProvider value={{}}>
              {children}
            </ThemeProvider>
          </OfflineProvider>
        </NotificationProvider>
      </AuthProvider>
    </StoreProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render };

// Test helpers
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
});

export const createMockRoute = (params = {}) => ({
  key: 'test-key',
  name: 'test-route',
  params,
});

export const createMockAuthStore = (overrides = {}) => ({
  user: mockUser,
  token: 'mock-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  ...overrides,
});

export const createMockElectionStore = (overrides = {}) => ({
  elections: mockElections,
  currentElection: mockElection,
  electionResults: null,
  userVotes: [mockVote],
  filters: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  currentPage: 1,
  totalPages: 1,
  fetchElections: jest.fn(),
  fetchElectionById: jest.fn(),
  castVote: jest.fn(),
  fetchUserVotes: jest.fn(),
  applyFilters: jest.fn(),
  clearFilters: jest.fn(),
  setCurrentElection: jest.fn(),
  ...overrides,
});

export const createMockUIStore = (overrides = {}) => ({
  theme: 'light' as const,
  isMenuOpen: false,
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  setTheme: jest.fn(),
  toggleMenu: jest.fn(),
  ...overrides,
});

export const createMockBlockchainStore = (overrides = {}) => ({
  wallet: null,
  transactions: [mockBlockchainTransaction],
  metrics: {
    totalTransactions: 1,
    successfulTransactions: 1,
    failedTransactions: 0,
    averageGasUsed: 21000,
    averageGasPrice: '20',
  },
  isLoading: false,
  error: null,
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  fetchTransactions: jest.fn(),
  fetchMetrics: jest.fn(),
  retryTransaction: jest.fn(),
  createElectionOnBlockchain: jest.fn(),
  endElectionOnBlockchain: jest.fn(),
  updateResultsOnBlockchain: jest.fn(),
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
  timestamp: new Date().toISOString(),
});

export const mockApiError = (message = 'API Error', status = 500) => ({
  success: false,
  error: {
    message,
    status,
    code: 'API_ERROR',
  },
  timestamp: new Date().toISOString(),
});

// Test data factories
export const createMockElection = (overrides: any = {}) => ({
  ...mockElection,
  ...overrides,
});

export const createMockCandidate = (overrides: any = {}) => ({
  id: '1',
  name: 'Test Candidate',
  party: 'Test Party',
  position: 1,
  votes: 0,
  ...overrides,
});

export const createMockVote = (overrides: any = {}) => ({
  ...mockVote,
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  ...mockUser,
  ...overrides,
});

// Wait for async operations
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock;
};

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
};

// Mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console };
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  return originalConsole;
};

// Restore console methods
export const restoreConsole = (originalConsole: any) => {
  Object.assign(console, originalConsole);
};

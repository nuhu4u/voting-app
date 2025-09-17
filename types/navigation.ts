// Navigation related types
import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  index: undefined;
  '(tabs)': NavigatorScreenParams<TabParamList>;
  '(auth)': NavigatorScreenParams<AuthStackParamList>;
  observer: NavigatorScreenParams<ObserverStackParamList>;
  blockchain: NavigatorScreenParams<BlockchainStackParamList>;
  'vote-position': NavigatorScreenParams<VotePositionStackParamList>;
  'blockchain-transactions': undefined;
  'total-elections': undefined;
  'auth-status': undefined;
};

// Tab Navigator
export type TabParamList = {
  index: undefined;
  elections: undefined;
  dashboard: undefined;
  profile: undefined;
  blockchain: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
  'verify-nin': undefined;
};


// Observer Stack Navigator
export type ObserverStackParamList = {
  index: undefined;
  login: undefined;
  register: undefined;
  apply: undefined;
  profile: undefined;
  blockchain: undefined;
  'blockchain-dashboard': undefined;
  'forgot-password': undefined;
  '[id]': { id: string };
};

// Blockchain Stack Navigator
export type BlockchainStackParamList = {
  index: undefined;
  'election/[id]': { id: string };
  'transaction/[hash]': { hash: string };
};

// Vote Position Stack Navigator
export type VotePositionStackParamList = {
  index: undefined;
  '[electionId]': { electionId: string };
  'level-detail/[level]': { level: string };
  enhanced: undefined;
};

// Navigation Props
export interface NavigationProps {
  navigation: any;
  route: any;
}

// Screen Props
export interface ScreenProps<T = any> {
  route: {
    params: T;
  };
  navigation: any;
}

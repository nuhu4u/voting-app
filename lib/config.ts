import { AppConfig } from '@/types/common';

// App configuration
export const config: AppConfig = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:3001/api', // Use WiFi IP
  blockchainNetwork: process.env.EXPO_PUBLIC_BLOCKCHAIN_NETWORK || '10.226.155.194',
  appVersion: '1.0.0',
  environment: (process.env.EXPO_PUBLIC_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
  features: {
    blockchain: process.env.EXPO_PUBLIC_ENABLE_BLOCKCHAIN === 'true',
    offline: process.env.EXPO_PUBLIC_ENABLE_OFFLINE === 'true',
    biometrics: process.env.EXPO_PUBLIC_ENABLE_BIOMETRICS === 'true',
  },
};

// API configuration
export const API_BASE_URL = config.apiUrl;
console.log('🔧 Config: API URL set to:', config.apiUrl);
export const apiConfig = {
  baseUrl: config.apiUrl,
  timeout: 30000, // Increased back to 30 seconds for biometric operations
  retryAttempts: 3, // Increased back to 3 attempts
  retryDelay: 2000, // Increased delay between retries
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Blockchain configuration
export const blockchainConfig = {
  network: config.blockchainNetwork,
  rpcUrl: process.env.EXPO_PUBLIC_RPC_URL || 'http://10.226.155.194:8545',
  chainId: parseInt(process.env.EXPO_PUBLIC_CHAIN_ID || '1337'),
  gasLimit: 300000,
  gasPrice: '20000000000', // 20 gwei
};

// Storage keys
export const storageKeys = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  userData: 'user_data',
  theme: 'theme',
  language: 'language',
  biometricEnabled: 'biometric_enabled',
  offlineData: 'offline_data',
} as const;

// Date formats
export const dateFormats = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  datetime: 'MMM dd, yyyy HH:mm',
  time: 'HH:mm',
  full: 'EEEE, MMMM dd, yyyy',
} as const;

// Pagination defaults
export const paginationDefaults = {
  pageSize: 10,
  maxPageSize: 100,
  defaultPage: 1,
} as const;

// Validation rules
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^(\+234|234|0)?[789][01]\d{8}$/,
    message: 'Please enter a valid Nigerian phone number',
  },
  nin: {
    pattern: /^\d{11}$/,
    message: 'NIN must be exactly 11 digits',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  },
} as const;

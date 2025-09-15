// API related types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    forgotPassword: string;
    resetPassword: string;
    verifyOtp: string;
    changePassword: string;
  };
  elections: {
    list: string;
    create: string;
    get: string;
    update: string;
    delete: string;
    results: string;
    vote: string;
  };
  blockchain: {
    transaction: string;
    verify: string;
    status: string;
  };
  observer: {
    dashboard: string;
    reports: string;
    elections: string;
  };
  admin: {
    dashboard: string;
    users: string;
    elections: string;
    reports: string;
    stats: string;
  };
}

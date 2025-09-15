// Authentication related types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string; // Computed property: first_name + last_name
  nin?: string;
  phone?: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface ObserverUser extends User {
  organization: string;
  accreditation_number: string;
  assigned_elections: string[];
  is_verified: boolean;
  last_login?: string;
}

export interface AdminUser extends User {
  permissions: string[];
  last_login?: string;
}

export type UserRole = 'voter' | 'observer' | 'admin';

export interface LoginCredentials {
  emailOrNin: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  nin: string;
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refresh_token?: string;
  };
}

export interface TokenData {
  user_id: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

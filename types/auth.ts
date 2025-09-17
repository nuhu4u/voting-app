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

export type UserRole = 'voter' | 'observer';

export interface LoginCredentials {
  emailOrNin: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  // State of Origin
  state_of_origin_id?: string;
  lga_of_origin_id?: string;
  // State of Residence
  state_id?: string;
  lga_id?: string;
  ward_id?: string;
  polling_unit_id?: string;
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

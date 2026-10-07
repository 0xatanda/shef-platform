export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
  };
}
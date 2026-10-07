import api from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
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
    user: AuthUser;
  };
}

export async function login(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    payload,
  );

  return response.data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const refresh_token =
    localStorage.getItem("shef_refresh_token");

  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  const response = await api.post<AuthResponse>(
    "/auth/refresh",
    {
      refresh_token,
    },
  );

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<{
    success: boolean;
    message: string;
    data: AuthUser;
  }>("/auth/me");

  return response.data.data;
}

export async function logout(): Promise<void> {
  const refresh_token =
    localStorage.getItem("shef_refresh_token");

  try {
    if (refresh_token) {
      await api.post("/auth/logout", {
        refresh_token,
      });
    }
  } finally {
    clearAuthStorage();
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem("shef_token");
  localStorage.removeItem("shef_refresh_token");
  localStorage.removeItem("shef_user");
}

export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem("shef_token"),
  );
}
import api from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    user: AuthUser;
  };
}

export async function login(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload,
  );

  return response.data;
}

export function logout() {
  localStorage.removeItem("shef_token");
  localStorage.removeItem("shef_user");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("shef_token"));
}
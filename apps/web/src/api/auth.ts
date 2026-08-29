import api from "./client";
import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth";

export async function login(
  payload: LoginRequest,
): Promise<LoginResponse> {

  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload,
  );

  return response.data;
}
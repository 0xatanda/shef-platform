import api from "./client";

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function submitContact(
  payload: ContactPayload,
) {
  const response = await api.post(
    "/contact",
    payload,
  );

  return response.data;
}
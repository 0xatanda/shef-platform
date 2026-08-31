import api, { API_ORIGIN } from "./client";

export interface Media {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path?: string;
  url: string;
  created_at: string;
}

export function getMediaUrl(url: string) {
  if (!url) return "";

  if (url.startsWith("http")) {
    return url;
  }

  return `${API_ORIGIN}${url}`;
}

export async function uploadMedia(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/admin/uploads",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function listMedia(
  page = 1,
  limit = 20,
) {
  const response = await api.get(
    `/admin/uploads?page=${page}&limit=${limit}`,
  );

  return response.data;
}

export async function deleteMedia(id: string) {
  const response = await api.delete(
    `/admin/uploads/${id}`,
  );

  return response.data;
}
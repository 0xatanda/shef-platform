import api from "./client";

export type Publication = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  type: string;
  status: string;
  featured_image: string;
  author: string;
  published_at?: string | null;
  published_by?: string | null;
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type PublicationListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Publication[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
};

export type PublicationResponse = {
  success: boolean;
  message: string;
  data: Publication;
};

export async function getPublications(
  page = 1,
  limit = 10,
) {
  const response =
    await api.get<PublicationListResponse>(
      `/publications?page=${page}&limit=${limit}`,
    );

  return response.data;
}

export async function getPublication(id: string) {
  const response =
    await api.get<PublicationResponse>(
      `/publications/${id}`,
    );

  return response.data;
}
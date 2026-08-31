import api from "./client";

export interface Publication {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  image_url?: string;
  author?: string;
  category?: string;
  status?: string;
  published_at?: string;
  created_at?: string;
}

export interface PublicationListResponse {
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
}

export async function getPublications() {
  const response =
    await api.get<PublicationListResponse>(
      "/publications",
    );

  return response.data;
}

export async function getPublication(id: string) {
  const response =
    await api.get<{
      success: boolean;
      data: Publication;
    }>(`/publications/${id}`);

  return response.data;
}
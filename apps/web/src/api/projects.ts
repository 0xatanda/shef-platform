import api from "./client";

export type ProjectMedia = {
  id: string;
  media_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_featured: boolean;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string;
  status: "draft" | "published";
  media: ProjectMedia[];
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Project[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
};

export type ProjectResponse = {
  success: boolean;
  message: string;
  data: Project;
};

export async function getProjects(
  page = 1,
  limit = 10,
) {
  const response =
    await api.get<ProjectListResponse>(
      `/projects?page=${page}&limit=${limit}`,
    );

  return response.data;
}

export async function getProject(
  id: string,
) {
  const response =
    await api.get<ProjectResponse>(
      `/projects/${id}`,
    );

  return response.data;
}
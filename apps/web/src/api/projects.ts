import api from "./client";

export interface Project {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  image_url?: string;
  status?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectListResponse {
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
}

export async function getProjects() {
  const response =
    await api.get<ProjectListResponse>("/projects");

  return response.data;
}

export async function getProject(id: string) {
  const response =
    await api.get<{ success: boolean; data: Project }>(
      `/projects/${id}`,
    );

  return response.data;
}
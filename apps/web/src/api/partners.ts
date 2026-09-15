import api from "./client";

export type Partner = {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnerForm = {
  name: string;
  logo: string;
  website: string;
  description: string;
  display_order: number;
  is_active: boolean;
};

export type PartnerListResponse = {
  success: boolean;
  message: string;
  data: {
    items: Partner[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
};

export type PartnerResponse = {
  success: boolean;
  message: string;
  data: Partner;
};

export async function getPartners(
  page = 1,
  limit = 20,
) {
  const response =
    await api.get<PartnerListResponse>(
      `/admin/partners/?page=${page}&limit=${limit}`,
    );

  return response.data;
}

export async function getPartner(id: string) {
  const response =
    await api.get<PartnerResponse>(
      `/admin/partners/${id}`,
    );

  return response.data;
}

export async function createPartner(
  data: PartnerForm,
) {
  const response =
    await api.post<PartnerResponse>(
      "/admin/partners/",
      data,
    );

  return response.data;
}

export async function updatePartner(
  id: string,
  data: PartnerForm,
) {
  const response =
    await api.put<PartnerResponse>(
      `/admin/partners/${id}`,
      data,
    );

  return response.data;
}

export async function deletePartner(id: string) {
  const response = await api.delete(
    `/admin/partners/${id}`,
  );

  return response.data;
}

export async function restorePartner(id: string) {
  const response = await api.patch(
    `/admin/partners/${id}/restore`,
  );

  return response.data;
}
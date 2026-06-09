import { api } from "./api";
import { Business, BusinessCreate, DiscoverRequest, DiscoverResponse } from "@/types/business";

export const leadService = {
  getLeads: async (params?: { skip?: number; limit?: number; category?: string }): Promise<Business[]> => {
    const { data } = await api.get("/leads", { params });
    return data;
  },

  getLead: async (id: number): Promise<Business> => {
    const { data } = await api.get(`/leads/${id}`);
    return data;
  },

  createLead: async (lead: BusinessCreate): Promise<Business> => {
    const { data } = await api.post("/leads", lead);
    return data;
  },

  updateLead: async (id: number, lead: Partial<BusinessCreate>): Promise<Business> => {
    const { data } = await api.put(`/leads/${id}`, lead);
    return data;
  },

  deleteLead: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/leads/${id}`);
    return data;
  },

  discoverLeads: async (request: DiscoverRequest): Promise<DiscoverResponse> => {
    const { data } = await api.post("/leads/discover", request);
    return data;
  },

  importCsv: async (file: File): Promise<{ message: string; imported_count: number }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/leads/import-csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

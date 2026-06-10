import { api } from "./api";
import { Outreach } from "@/types/outreach";

export const outreachService = {
  getOutreach: async (businessId: number): Promise<Outreach> => {
    const { data } = await api.get(`/outreach/${businessId}`);
    return data;
  },

  generateOutreach: async (businessId: number): Promise<Outreach> => {
    const { data } = await api.post(`/outreach/generate/${businessId}`);
    return data;
  },

  getAllOutreach: async (params?: { campaign_id?: number }): Promise<Outreach[]> => {
    const { data } = await api.get("/outreach", { params });
    return data;
  },
};

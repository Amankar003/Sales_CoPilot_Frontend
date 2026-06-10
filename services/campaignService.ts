import { api } from "./api";
import { Campaign, CampaignDiscoverRequest } from "@/types/campaign";
import { Business } from "@/types/business";

export const campaignService = {
  createCampaign: async (data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.post<Campaign>("/campaigns", data);
    return response.data;
  },

  getCampaigns: async (skip: number = 0, limit: number = 100): Promise<Campaign[]> => {
    const response = await api.get<Campaign[]>(`/campaigns?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  discoverCampaign: async (
    id: number,
    data: CampaignDiscoverRequest
  ): Promise<{ message: string; campaign: Campaign; count: number; businesses: Business[] }> => {
    const response = await api.post(`/campaigns/${id}/discover`, data);
    return response.data;
  },

  createAndDiscoverCampaign: async (
    data: CampaignDiscoverRequest
  ): Promise<{ message: string; campaign: Campaign; count: number; businesses: Business[] }> => {
    const response = await api.post("/campaigns/discover", data);
    return response.data;
  },
};

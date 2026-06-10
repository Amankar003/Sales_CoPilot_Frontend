import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/services/campaignService";
import { Campaign, CampaignDiscoverRequest } from "@/types/campaign";

export const useCampaigns = (skip: number = 0, limit: number = 100) => {
  return useQuery({
    queryKey: ["campaigns", skip, limit],
    queryFn: () => campaignService.getCampaigns(skip, limit),
  });
};

export const useCampaign = (id: number) => {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => campaignService.getCampaign(id),
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaign: Partial<Campaign>) => campaignService.createCampaign(campaign),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useDiscoverCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CampaignDiscoverRequest) => campaignService.createAndDiscoverCampaign(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services/leadService";
import { BusinessCreate, DiscoverRequest } from "@/types/business";

export const useLeads = (params?: { skip?: number; limit?: number; category?: string }) => {
  return useQuery({
    queryKey: ["leads", params],
    queryFn: () => leadService.getLeads(params),
  });
};

export const useLead = (id: number) => {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => leadService.getLead(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lead: BusinessCreate) => leadService.createLead(lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useDiscoverLeads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: DiscoverRequest) => leadService.discoverLeads(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useImportCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => leadService.importCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/auditService";

export const useAudit = (businessId: number) => {
  return useQuery({
    queryKey: ["audit", businessId],
    queryFn: () => auditService.getAudit(businessId),
    enabled: !!businessId,
    retry: false, // Don't retry automatically if it fails (e.g. 404 not found)
  });
};

export const useGenerateAudit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessId: number) => auditService.generateAudit(businessId),
    onSuccess: (data, businessId) => {
      queryClient.setQueryData(["audit", businessId], data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

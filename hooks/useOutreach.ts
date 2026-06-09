import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { outreachService } from "@/services/outreachService";

export const useOutreach = (businessId: number) => {
  return useQuery({
    queryKey: ["outreach", businessId],
    queryFn: () => outreachService.getOutreach(businessId),
    enabled: !!businessId,
    retry: false,
  });
};

export const useGenerateOutreach = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessId: number) => outreachService.generateOutreach(businessId),
    onSuccess: (data, businessId) => {
      queryClient.setQueryData(["outreach", businessId], data);
    },
  });
};

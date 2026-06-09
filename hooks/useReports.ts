import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportService } from "@/services/reportService";

export const useReport = (businessId: number) => {
  return useQuery({
    queryKey: ["report", businessId],
    queryFn: () => reportService.getReport(businessId),
    enabled: !!businessId,
    retry: false,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessId: number) => reportService.generateReport(businessId),
    onSuccess: (data, businessId) => {
      queryClient.setQueryData(["report", businessId], data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

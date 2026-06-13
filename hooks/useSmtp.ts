import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { smtpService } from "@/services/smtpService";
import { SMTPAccountCreate, SMTPAccountUpdate, SMTPTestRequest } from "@/types/smtp";

export const useSmtpAccounts = () => {
  return useQuery({
    queryKey: ["smtp-accounts"],
    queryFn: () => smtpService.getAccounts(),
  });
};

export const useSmtpStats = () => {
  return useQuery({
    queryKey: ["smtp-stats"],
    queryFn: () => smtpService.getStats(),
    refetchInterval: 30000, // Refresh stats every 30s
  });
};

export const useCreateSmtpAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account: SMTPAccountCreate) => smtpService.createAccount(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["smtp-stats"] });
    },
  });
};

export const useUpdateSmtpAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SMTPAccountUpdate }) =>
      smtpService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["smtp-stats"] });
    },
  });
};

export const useDeleteSmtpAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => smtpService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["smtp-stats"] });
    },
  });
};

export const useTestSmtp = () => {
  return useMutation({
    mutationFn: (request: SMTPTestRequest) => smtpService.testConnection(request),
  });
};

export const usePauseSmtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => smtpService.pauseAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["smtp-stats"] });
    },
  });
};

export const useResumeSmtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => smtpService.resumeAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["smtp-stats"] });
    },
  });
};

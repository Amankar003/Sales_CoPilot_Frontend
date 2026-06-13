import { api } from "./api";
import {
  SMTPAccount,
  SMTPAccountCreate,
  SMTPAccountUpdate,
  SMTPAccountStats,
  SMTPTestRequest,
  SMTPTestResponse,
} from "@/types/smtp";

export const smtpService = {
  getAccounts: async (): Promise<SMTPAccount[]> => {
    const { data } = await api.get("/smtp/accounts");
    return data;
  },

  createAccount: async (account: SMTPAccountCreate): Promise<SMTPAccount> => {
    const { data } = await api.post("/smtp/accounts", account);
    return data;
  },

  updateAccount: async (id: number, account: SMTPAccountUpdate): Promise<SMTPAccount> => {
    const { data } = await api.put(`/smtp/accounts/${id}`, account);
    return data;
  },

  deleteAccount: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.delete(`/smtp/accounts/${id}`);
    return data;
  },

  getStats: async (): Promise<SMTPAccountStats> => {
    const { data } = await api.get("/smtp/stats");
    return data;
  },

  testConnection: async (request: SMTPTestRequest): Promise<SMTPTestResponse> => {
    const { data } = await api.post("/smtp/test", request);
    return data;
  },

  pauseAccount: async (id: number): Promise<SMTPAccount> => {
    const { data } = await api.post(`/smtp/pause/${id}`);
    return data;
  },

  resumeAccount: async (id: number): Promise<SMTPAccount> => {
    const { data } = await api.post(`/smtp/resume/${id}`);
    return data;
  },
};

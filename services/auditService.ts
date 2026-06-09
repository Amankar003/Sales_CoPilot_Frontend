import { api } from "./api";
import { Audit } from "@/types/audit";

export const auditService = {
  getAudit: async (businessId: number): Promise<Audit> => {
    const { data } = await api.get(`/audit/${businessId}`);
    return data;
  },

  generateAudit: async (businessId: number): Promise<Audit> => {
    const { data } = await api.post(`/audit/${businessId}`);
    return data;
  },
};

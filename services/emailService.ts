import { api } from "./api";
import { EmailLog } from "@/types/outreach";

export const emailService = {
  sendEmail: async (outreachId: number, recipientEmail?: string): Promise<{ message: string }> => {
    const { data } = await api.post(`/email/send/${outreachId}`, { recipient_email: recipientEmail });
    return data;
  },

  getLogs: async (params?: { skip?: number; limit?: number; campaign_id?: number }): Promise<EmailLog[]> => {
    const { data } = await api.get("/email/logs", { params });
    return data;
  },
};

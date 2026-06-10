import { api } from "./api";
import { Business } from "@/types/business";
import { AuditSummary } from "@/types/audit";

export interface DashboardStats {
  total_campaigns: number;
  total_leads: number;
  leads_per_campaign: number;
  audits_completed: number;
  reports_generated: number;
  emails_sent: number;
  average_audit_score: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get("/dashboard/stats");
    return data;
  },

  getRecentLeads: async (limit: number = 5): Promise<Business[]> => {
    const { data } = await api.get(`/dashboard/recent-leads?limit=${limit}`);
    return data;
  },

  getRecentAudits: async (limit: number = 5): Promise<AuditSummary[]> => {
    const { data } = await api.get(`/dashboard/recent-audits?limit=${limit}`);
    return data;
  },

  getRecentCampaigns: async (limit: number = 5): Promise<any[]> => {
    const { data } = await api.get(`/dashboard/recent-campaigns?limit=${limit}`);
    return data;
  },
};

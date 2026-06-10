import { api } from "./api";
import { Report } from "@/types/report";

export const reportService = {
  getReport: async (businessId: number): Promise<Report> => {
    const { data } = await api.get(`/reports/${businessId}`);
    return data;
  },

  generateReport: async (businessId: number): Promise<Report> => {
    const { data } = await api.post(`/reports/generate/${businessId}`);
    return data;
  },

  downloadReportUrl: (reportId: number): string => {
    return `${api.defaults.baseURL}/reports/download/${reportId}`;
  },

  getReports: async (params?: { campaign_id?: number }): Promise<Report[]> => {
    const { data } = await api.get("/reports", { params });
    return data;
  },
};

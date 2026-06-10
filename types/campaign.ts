export interface Campaign {
  id: number;
  name: string;
  sector: string;
  location: string;
  status: 
    | "draft" 
    | "discovering" 
    | "enriching" 
    | "auditing" 
    | "generating_reports" 
    | "generating_outreach" 
    | "completed" 
    | "completed_with_errors" 
    | "failed";
  leads_count: number;
  enriched_count: number;
  audited_count: number;
  reports_count: number;
  outreach_count: number;
  emails_sent_count: number;
  pipeline_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignDiscoverRequest {
  name: string;
  sector: string;
  location: string;
  max_runtime_seconds?: number;
  auto_enrich?: boolean;
  auto_audit?: boolean;
  auto_generate_reports?: boolean;
  auto_generate_outreach?: boolean;
}

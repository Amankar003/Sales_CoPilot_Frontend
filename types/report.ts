export interface Report {
  id: number;
  business_id: number;
  audit_id: number;
  title: string;
  executive_summary: string | null;
  website_audit_summary: string | null;
  social_audit_summary: string | null;
  pain_points: string[] | null;
  recommended_solutions: string[] | null;
  opportunity_summary: string | null;
  overall_score: number | null;
  html_path: string | null;
  pdf_path: string | null;
  created_at: string;
}

export interface ReportSummary {
  id: number;
  business_id: number;
  business_name: string | null;
  title: string;
  overall_score: number | null;
  has_pdf: boolean;
  created_at: string;
}

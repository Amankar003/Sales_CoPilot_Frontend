export interface Audit {
  id: number;
  business_id: number;
  has_website: boolean;
  ssl_enabled: boolean;
  mobile_responsive: boolean;
  loading_speed_score: number | null;
  seo_score: number | null;
  ux_score: number | null;
  social_score: number | null;
  has_contact_form: boolean;
  has_whatsapp: boolean;
  has_booking_system: boolean;
  has_crm_signals: boolean;
  broken_links_count: number;
  meta_title: string | null;
  meta_description: string | null;
  h1_count: number;
  image_alt_missing_count: number;
  audit_score: number | null;
  pain_points: string[] | null;
  opportunities: string[] | null;
  recommendations: string[] | null;
  created_at: string;
}

export interface AuditSummary {
  id: number;
  business_id: number;
  business_name: string | null;
  audit_score: number | null;
  has_website: boolean;
  seo_score: number | null;
  social_score: number | null;
  created_at: string;
}

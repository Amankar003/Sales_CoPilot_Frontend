export interface Outreach {
  id: number;
  business_id: number;
  business_name?: string | null;
  audit_id: number | null;
  email_subject: string | null;
  email_body: string | null;
  whatsapp_message: string | null;
  call_notes: string | null;
  meeting_pitch: string | null;
  created_at: string;
}

export interface EmailLog {
  id: number;
  business_id: number;
  outreach_id: number;
  recipient_email: string;
  subject: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  error_message: string | null;
  business_name: string | null;
  // SMTP Pool tracking
  smtp_account_id: number | null;
  provider: string | null;
  message_id: string | null;
  delivery_status: string | null;
  bounce_reason: string | null;
  retry_count: number;
}

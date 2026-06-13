export interface SMTPAccount {
  id: number;
  name: string;
  email: string;
  password: string; // Always "••••••••" from API
  host: string;
  port: number;
  use_tls: boolean;
  use_starttls: boolean;
  daily_limit: number;
  hourly_limit: number;
  sent_today: number;
  sent_this_hour: number;
  last_sent_at: string | null;
  status: "active" | "paused" | "blocked" | "disabled";
  priority: number;
  failure_count: number;
  total_sent: number;
  total_failed: number;
  warmup_enabled: boolean;
  warmup_start_date: string | null;
  warmup_daily_increment: number;
  provider: string | null;
  remaining_daily: number;
  remaining_hourly: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface SMTPAccountCreate {
  name: string;
  email: string;
  password: string;
  host: string;
  port: number;
  use_tls: boolean;
  use_starttls: boolean;
  daily_limit: number;
  hourly_limit: number;
  priority: number;
  warmup_enabled: boolean;
  warmup_daily_increment: number;
  provider: string;
}

export interface SMTPAccountUpdate {
  name?: string;
  email?: string;
  password?: string;
  host?: string;
  port?: number;
  use_tls?: boolean;
  use_starttls?: boolean;
  daily_limit?: number;
  hourly_limit?: number;
  priority?: number;
  warmup_enabled?: boolean;
  warmup_daily_increment?: number;
  provider?: string;
}

export interface SMTPAccountStats {
  total_accounts: number;
  active_accounts: number;
  paused_accounts: number;
  blocked_accounts: number;
  disabled_accounts: number;
  total_sent_today: number;
  total_remaining_today: number;
  total_daily_capacity: number;
  accounts_at_limit: number;
}

export interface SMTPTestRequest {
  id?: number;
  host?: string;
  port?: number;
  email?: string;
  password?: string;
  use_tls?: boolean;
  use_starttls?: boolean;
}

export interface SMTPTestResponse {
  success: boolean;
  message: string;
  latency_ms: number | null;
}

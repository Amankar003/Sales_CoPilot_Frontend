"use client";

import { useState } from "react";
import {
  useSmtpAccounts,
  useSmtpStats,
  useCreateSmtpAccount,
  useUpdateSmtpAccount,
  useDeleteSmtpAccount,
  useTestSmtp,
  usePauseSmtp,
  useResumeSmtp,
} from "@/hooks/useSmtp";
import { SMTPAccount, SMTPAccountCreate, SMTPAccountUpdate } from "@/types/smtp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Server,
  Plus,
  Pencil,
  Trash2,
  Pause,
  Play,
  Zap,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
  Activity,
} from "lucide-react";

const PROVIDERS = [
  { value: "gmail", label: "Gmail" },
  { value: "outlook", label: "Outlook / Office 365" },
  { value: "brevo", label: "Brevo (Sendinblue)" },
  { value: "ses", label: "Amazon SES" },
  { value: "mailgun", label: "Mailgun" },
  { value: "custom", label: "Custom SMTP" },
];

const PROVIDER_PRESETS: Record<string, { host: string; port: number; use_tls: boolean; use_starttls: boolean }> = {
  gmail: { host: "smtp.gmail.com", port: 587, use_tls: false, use_starttls: true },
  outlook: { host: "smtp.office365.com", port: 587, use_tls: false, use_starttls: true },
  brevo: { host: "smtp-relay.brevo.com", port: 587, use_tls: false, use_starttls: true },
  ses: { host: "email-smtp.us-east-1.amazonaws.com", port: 587, use_tls: false, use_starttls: true },
  mailgun: { host: "smtp.mailgun.org", port: 587, use_tls: false, use_starttls: true },
};

const DEFAULT_FORM: SMTPAccountCreate = {
  name: "",
  email: "",
  password: "",
  host: "",
  port: 587,
  use_tls: false,
  use_starttls: true,
  daily_limit: 500,
  hourly_limit: 50,
  priority: 5,
  warmup_enabled: false,
  warmup_daily_increment: 20,
  provider: "custom",
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: React.ReactNode }> = {
    active: {
      className: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
    paused: {
      className: "text-amber-500 border-amber-500/20 bg-amber-500/10",
      icon: <Pause className="w-3 h-3 mr-1" />,
    },
    blocked: {
      className: "text-destructive border-destructive/20 bg-destructive/10",
      icon: <AlertTriangle className="w-3 h-3 mr-1" />,
    },
    disabled: {
      className: "text-slate-500 border-slate-500/20 bg-slate-500/10",
      icon: <XCircle className="w-3 h-3 mr-1" />,
    },
  };
  const c = config[status] || config.disabled;
  return (
    <Badge variant="outline" className={c.className}>
      {c.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function StatsCards() {
  const { data: stats, isLoading } = useSmtpStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6"><div className="h-16" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Accounts",
      value: stats.total_accounts,
      sub: `${stats.active_accounts} active`,
      icon: <Server className="w-5 h-5 text-indigo-400" />,
      color: "from-indigo-500/10 to-indigo-600/5",
    },
    {
      title: "Sent Today",
      value: stats.total_sent_today,
      sub: `${stats.total_remaining_today} remaining`,
      icon: <Mail className="w-5 h-5 text-emerald-400" />,
      color: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      title: "Daily Capacity",
      value: stats.total_daily_capacity,
      sub: `${stats.accounts_at_limit} at limit`,
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      color: "from-amber-500/10 to-amber-600/5",
    },
    {
      title: "Pool Health",
      value: stats.blocked_accounts === 0 ? "Healthy" : `${stats.blocked_accounts} blocked`,
      sub: `${stats.paused_accounts} paused`,
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      color: stats.blocked_accounts === 0 ? "from-cyan-500/10 to-cyan-600/5" : "from-red-500/10 to-red-600/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className={`glass-card bg-gradient-to-br ${card.color}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
              {card.icon}
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AccountFormDialog({
  mode,
  account,
  trigger,
}: {
  mode: "create" | "edit";
  account?: SMTPAccount;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SMTPAccountCreate>(
    mode === "edit" && account
      ? {
          name: account.name,
          email: account.email,
          password: "",
          host: account.host,
          port: account.port,
          use_tls: account.use_tls,
          use_starttls: account.use_starttls,
          daily_limit: account.daily_limit,
          hourly_limit: account.hourly_limit,
          priority: account.priority,
          warmup_enabled: account.warmup_enabled,
          warmup_daily_increment: account.warmup_daily_increment,
          provider: account.provider || "custom",
        }
      : { ...DEFAULT_FORM }
  );

  const createMutation = useCreateSmtpAccount();
  const updateMutation = useUpdateSmtpAccount();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDER_PRESETS[provider];
    setForm((prev) => ({
      ...prev,
      provider,
      ...(preset || {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.host) return;
    if (mode === "create" && !form.password) return;

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(form);
      } else if (account) {
        const updateData: SMTPAccountUpdate = { ...form };
        if (!updateData.password) delete updateData.password;
        await updateMutation.mutateAsync({ id: account.id, data: updateData });
      }
      setOpen(false);
      if (mode === "create") setForm({ ...DEFAULT_FORM });
    } catch (err) {
      // Error handled by TanStack Query
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? <Plus className="w-5 h-5 text-primary" /> : <Pencil className="w-5 h-5 text-primary" />}
            {mode === "create" ? "Add SMTP Account" : `Edit: ${account?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new SMTP account to the sending pool."
              : "Update account settings. Leave password blank to keep current."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider</Label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleProviderChange(p.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 ${
                    form.provider === p.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/60"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Gmail Main"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Sender Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sender@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password / App Password
              {mode === "edit" && (
                <span className="text-muted-foreground font-normal ml-2">(leave blank to keep current)</span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={mode === "edit" ? "••••••••" : "Enter SMTP password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Host & Port */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="host">SMTP Host</Label>
              <Input
                id="host"
                placeholder="smtp.gmail.com"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 587 })}
              />
            </div>
          </div>

          {/* TLS Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.use_starttls}
                onChange={(e) => setForm({ ...form, use_starttls: e.target.checked, use_tls: e.target.checked ? false : form.use_tls })}
                className="rounded border-border"
              />
              STARTTLS (port 587)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.use_tls}
                onChange={(e) => setForm({ ...form, use_tls: e.target.checked, use_starttls: e.target.checked ? false : form.use_starttls })}
                className="rounded border-border"
              />
              Direct TLS (port 465)
            </label>
          </div>

          {/* Rate Limits */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_limit">Daily Limit</Label>
              <Input
                id="daily_limit"
                type="number"
                value={form.daily_limit}
                onChange={(e) => setForm({ ...form, daily_limit: parseInt(e.target.value) || 500 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_limit">Hourly Limit</Label>
              <Input
                id="hourly_limit"
                type="number"
                value={form.hourly_limit}
                onChange={(e) => setForm({ ...form, hourly_limit: parseInt(e.target.value) || 50 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-100)</Label>
              <Input
                id="priority"
                type="number"
                min={1}
                max={100}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          {/* Warm-up */}
          <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-muted/20">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={form.warmup_enabled}
                onChange={(e) => setForm({ ...form, warmup_enabled: e.target.checked })}
                className="rounded border-border"
              />
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Enable Warm-up Mode
            </label>
            {form.warmup_enabled && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="warmup_increment" className="text-xs text-muted-foreground">
                  Emails added per day during ramp-up
                </Label>
                <Input
                  id="warmup_increment"
                  type="number"
                  min={1}
                  value={form.warmup_daily_increment}
                  onChange={(e) =>
                    setForm({ ...form, warmup_daily_increment: parseInt(e.target.value) || 20 })
                  }
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Day 1: {form.warmup_daily_increment}, Day 2: {form.warmup_daily_increment * 2}, Day 3: {form.warmup_daily_increment * 3}... until daily limit
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : mode === "create" ? (
              <><Plus className="w-4 h-4 mr-2" /> Add Account</>
            ) : (
              <><Pencil className="w-4 h-4 mr-2" /> Save Changes</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SMTPPoolPage() {
  const { data: accounts, isLoading } = useSmtpAccounts();
  const deleteMutation = useDeleteSmtpAccount();
  const testMutation = useTestSmtp();
  const pauseMutation = usePauseSmtp();
  const resumeMutation = useResumeSmtp();

  const [testResult, setTestResult] = useState<{ id: number; success: boolean; message: string } | null>(null);

  const handleTest = async (id: number) => {
    setTestResult(null);
    try {
      const result = await testMutation.mutateAsync({ id });
      setTestResult({ id, success: result.success, message: result.message });
    } catch {
      setTestResult({ id, success: false, message: "Connection test failed" });
    }
  };

  const handleDelete = async (account: SMTPAccount) => {
    if (!confirm(`Delete SMTP account "${account.name}"? This action cannot be undone.`)) return;
    await deleteMutation.mutateAsync(account.id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">SMTP Pool</h1>
          <p className="text-muted-foreground mt-1">
            Manage multiple SMTP accounts for email rotation, failover, and deliverability.
          </p>
        </div>
        <AccountFormDialog
          mode="create"
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Account
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Accounts Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            SMTP Accounts
          </CardTitle>
          <CardDescription>
            Accounts are rotated automatically based on your sending strategy. Higher priority accounts receive more traffic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No SMTP Accounts</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                Add your first SMTP account to start sending emails. The system will fall back to
                your .env SMTP configuration if no accounts are configured.
              </p>
              <AccountFormDialog
                mode="create"
                trigger={
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Add Your First Account
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent Today</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs capitalize px-2 py-1 rounded-md bg-muted/50">
                          {account.provider || "custom"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={account.status} />
                        {account.warmup_enabled && (
                          <Badge variant="outline" className="ml-2 text-[10px] text-amber-500 border-amber-500/20">
                            <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                            Warming
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{account.sent_today} / {account.daily_limit}</p>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, (account.sent_today / account.daily_limit) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">{account.remaining_daily} remaining</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${account.success_rate >= 90 ? "text-emerald-500" : account.success_rate >= 70 ? "text-amber-500" : "text-destructive"}`}>
                          {account.success_rate}%
                        </span>
                        {account.failure_count > 0 && (
                          <p className="text-[10px] text-destructive">{account.failure_count} consecutive failures</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{account.priority}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {/* Test Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleTest(account.id)}
                            disabled={testMutation.isPending}
                            title="Test Connection"
                          >
                            {testMutation.isPending && testResult === null ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : testResult?.id === account.id ? (
                              testResult.success ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-destructive" />
                              )
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          {/* Pause / Resume */}
                          {account.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => pauseMutation.mutateAsync(account.id)}
                              title="Pause"
                            >
                              <Pause className="w-3.5 h-3.5 text-amber-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => resumeMutation.mutateAsync(account.id)}
                              title="Resume"
                              disabled={account.status === "disabled"}
                            >
                              <Play className="w-3.5 h-3.5 text-emerald-500" />
                            </Button>
                          )}

                          {/* Edit */}
                          <AccountFormDialog
                            mode="edit"
                            account={account}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            }
                          />

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(account)}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Test result tooltip */}
                        {testResult?.id === account.id && (
                          <p className={`text-[10px] mt-1 text-right ${testResult.success ? "text-emerald-500" : "text-destructive"}`}>
                            {testResult.message.length > 40 ? testResult.message.slice(0, 40) + "..." : testResult.message}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Security & Backward Compatibility</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All SMTP passwords are encrypted at rest using Fernet symmetric encryption. Passwords are never
                returned in API responses. If no SMTP accounts are configured in this pool, the system automatically
                falls back to the <code className="px-1 py-0.5 bg-muted rounded text-[10px]">.env</code> SMTP
                configuration for backward compatibility.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileBarChart, Activity, Mail, CheckCircle2 } from "lucide-react";
import { DashboardStats } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const items = [
    {
      title: "Total Campaigns",
      value: stats?.total_campaigns || 0,
      icon: FileBarChart,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      description: "Active search projects",
    },
    {
      title: "Total Leads",
      value: stats?.total_leads || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Discovered and imported",
    },
    {
      title: "Leads / Campaign",
      value: stats?.leads_per_campaign || 0,
      icon: Activity,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Average per project",
    },
    {
      title: "Audits Completed",
      value: stats?.audits_completed || 0,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Full site & social audits",
    },
    {
      title: "Avg Audit Score",
      value: `${stats?.average_audit_score || 0}/100`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Across all audited leads",
    },
    {
      title: "Reports Generated",
      value: stats?.reports_generated || 0,
      icon: FileBarChart,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "PDFs ready to send",
    },
    {
      title: "Emails Sent",
      value: stats?.emails_sent || 0,
      icon: Mail,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      description: "Automated outreach",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item, index) => (
        <Card key={index} className="glass-card overflow-hidden relative group border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{item.value}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

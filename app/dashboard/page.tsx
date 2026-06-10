"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowRight, FileCheck, FolderKanban } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: recentLeads, isLoading: isLeadsLoading } = useQuery({
    queryKey: ["dashboard", "recent-leads"],
    queryFn: () => dashboardService.getRecentLeads(6),
  });

  const { data: recentCampaigns, isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["dashboard", "recent-campaigns"],
    queryFn: () => dashboardService.getRecentCampaigns(5),
  });

  // Helper for score colors
  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 70) return "bg-emerald-500/15 text-emerald-500 border-emerald-500/20";
    if (score >= 40) return "bg-amber-500/15 text-amber-500 border-amber-500/20";
    return "bg-rose-500/15 text-rose-500 border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your lead pipeline, audit performance, and outreach campaigns.
        </p>
      </div>

      <StatsCards stats={stats} isLoading={isStatsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px]">
        <RecentLeads leads={recentLeads} isLoading={isLeadsLoading} />
        
        {/* Recent Campaigns Card */}
        <Card className="glass-card border-border/40 flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Latest lead discovery campaigns.</CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-0 pt-0">
            <div className="space-y-0">
              {isCampaignsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b border-border/20">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                    <Skeleton className="h-8 w-12 rounded-md" />
                  </div>
                ))
              ) : recentCampaigns && recentCampaigns.length > 0 ? (
                recentCampaigns.map((campaign) => (
                  <Link 
                    key={campaign.id} 
                    href={`/leads?campaign_id=${campaign.id}`}
                    className="flex items-center justify-between p-4 border-b border-border/20 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium group-hover:text-primary transition-colors flex items-center gap-2">
                        {campaign.name}
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{campaign.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Leads</span>
                        <Badge variant="outline" className={`font-mono bg-blue-500/15 text-blue-500 border-blue-500/20`}>
                          {campaign.leads_count}
                        </Badge>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FolderKanban className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No campaigns found</p>
                  <p className="text-xs text-muted-foreground mt-1">Create a campaign to discover leads.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

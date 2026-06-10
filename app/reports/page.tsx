"use client";

import { useActiveCampaign } from "@/components/providers/CampaignProvider";
import { useReports } from "@/hooks/useReports";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Loader2, FileBarChart, Download, Eye, Calendar, FolderKanban } from "lucide-react";
import Link from "next/link";
import { reportService } from "@/services/reportService";

export default function ReportsPage() {
  const { activeCampaignId, setActiveCampaignId } = useActiveCampaign();
  const { data: campaigns } = useCampaigns(0, 100);
  
  const { data: reports, isLoading, isError } = useReports(activeCampaignId || undefined);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and download professional PDF audit reports for your leads.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-card border border-border/50 rounded-lg p-1.5">
          <FolderKanban className="w-4 h-4 text-muted-foreground ml-2" />
          <select 
            className="bg-transparent border-none text-sm focus:ring-0 outline-none pr-4"
            value={activeCampaignId || ""}
            onChange={(e) => setActiveCampaignId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Campaigns</option>
            {campaigns?.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading reports...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileBarChart className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-medium text-destructive">Failed to load reports</h3>
          <p className="text-muted-foreground">There was an error loading your reports. Please try again later.</p>
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-card/30 border border-border/50 rounded-xl glass">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <FileBarChart className="w-8 h-8 text-primary/70" />
          </div>
          <h3 className="text-xl font-medium">No reports generated yet</h3>
          <p className="text-muted-foreground max-w-md">
            No reports generated yet. Select a campaign, go to a lead, run audit, then generate a report.
          </p>
          <Link href="/leads" className={buttonVariants({ variant: "default", className: "mt-4" })}>
            View Leads
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="glass-card flex flex-col h-full hover:shadow-lg transition-all duration-200 hover:border-primary/30">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{report.business_name || "Unknown Business"}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {report.overall_score !== null && (
                    <div className="flex flex-col items-end shrink-0">
                      <div className="text-2xl font-bold text-emerald-500">
                        {Math.round(report.overall_score)}
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Score</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {report.executive_summary || "No summary available."}
                </p>
              </CardContent>
              <CardFooter className="flex items-center gap-2 pt-4 border-t border-border/50">
                <a 
                  href={reportService.downloadReportUrl(report.id)} 
                  target="_blank" 
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
                >
                  <Download className="w-4 h-4 mr-2" /> PDF
                </a>
                <Link 
                  href={`/leads/${report.business_id}`}
                  className={buttonVariants({ variant: "default", size: "sm", className: "flex-1" })}
                >
                  <Eye className="w-4 h-4 mr-2" /> View Lead
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

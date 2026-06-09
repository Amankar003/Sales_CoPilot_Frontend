"use client";

import { use, useState } from "react";
import { useLead } from "@/hooks/useLeads";
import { useAudit, useGenerateAudit } from "@/hooks/useAudit";
import { useReport, useGenerateReport } from "@/hooks/useReports";
import { useOutreach, useGenerateOutreach } from "@/hooks/useOutreach";
import { reportService } from "@/services/reportService";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, Globe, MapPin, Building2, Phone, Mail, 
  CheckCircle2, AlertCircle, FileBarChart, Send, Download, PhoneCall, MessageCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the Promise
  const unwrappedParams = use(params);
  const leadId = parseInt(unwrappedParams.id, 10);
  
  // Queries
  const { data: lead, isLoading: leadLoading } = useLead(leadId);
  const { data: audit, isLoading: auditLoading } = useAudit(leadId);
  const { data: report, isLoading: reportLoading } = useReport(leadId);
  const { data: outreach, isLoading: outreachLoading } = useOutreach(leadId);

  // Mutations
  const generateAudit = useGenerateAudit();
  const generateReport = useGenerateReport();
  const generateOutreach = useGenerateOutreach();

  // Handlers
  const handleRunAudit = () => generateAudit.mutate(leadId);
  const handleGenerateReport = () => generateReport.mutate(leadId);
  const handleGenerateOutreach = () => generateOutreach.mutate(leadId);

  if (leadLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-muted-foreground">Lead not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-card/40 p-6 rounded-xl border border-border/50 glass">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {lead.category}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary/70" />
              {lead.address || lead.location}
            </div>
            {lead.website && (
              <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Globe className="w-4 h-4 text-primary/70" />
                {lead.website}
              </a>
            )}
            {lead.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary/70" />
                {lead.phone}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {audit ? (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Audit Score</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-emerald-500">{Math.round(audit.audit_score || 0)}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
            </div>
          ) : (
            <Button onClick={handleRunAudit} disabled={generateAudit.isPending} size="lg" className="shadow-lg shadow-primary/20">
              {generateAudit.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running AI Audit...</>
              ) : (
                <><Activity className="mr-2 h-4 w-4" /> Run Full Audit</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass">
          <TabsTrigger value="details">Business Info</TabsTrigger>
          <TabsTrigger value="audit" disabled={!audit && !auditLoading}>Audit Results</TabsTrigger>
          <TabsTrigger value="report" disabled={!audit}>Audit Report</TabsTrigger>
          <TabsTrigger value="outreach" disabled={!audit}>AI Outreach</TabsTrigger>
        </TabsList>

        {/* Tab 1: Business Details */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4">
                  <div className="text-sm text-muted-foreground font-medium">Email</div>
                  <div className="col-span-2 text-sm">{lead.email || "Not available"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4">
                  <div className="text-sm text-muted-foreground font-medium">Phone</div>
                  <div className="col-span-2 text-sm">{lead.phone || "Not available"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4">
                  <div className="text-sm text-muted-foreground font-medium">Website</div>
                  <div className="col-span-2 text-sm">
                    {lead.website ? (
                      <a href={lead.website} className="text-primary hover:underline">{lead.website}</a>
                    ) : "Not available"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm text-muted-foreground font-medium">Social Links</div>
                  <div className="col-span-2 text-sm flex flex-wrap gap-2">
                    {lead.instagram && <Badge variant="outline">Instagram</Badge>}
                    {lead.facebook && <Badge variant="outline">Facebook</Badge>}
                    {lead.linkedin && <Badge variant="outline">LinkedIn</Badge>}
                    {!lead.instagram && !lead.facebook && !lead.linkedin && <span className="text-muted-foreground italic">None detected</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Discovery Meta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4">
                  <div className="text-sm text-muted-foreground font-medium">Added On</div>
                  <div className="col-span-2 text-sm">{new Date(lead.created_at).toLocaleDateString()}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4">
                  <div className="text-sm text-muted-foreground font-medium">Source</div>
                  <div className="col-span-2 text-sm capitalize">{lead.source}</div>
                </div>
                {lead.google_rating && (
                  <div className="grid grid-cols-3 gap-4 border-b border-border/50 pb-4">
                    <div className="text-sm text-muted-foreground font-medium">Google Rating</div>
                    <div className="col-span-2 text-sm">{lead.google_rating} / 5 ({lead.reviews_count} reviews)</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Audit Results */}
        <TabsContent value="audit" className="mt-6">
          {audit ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Overall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round(audit.audit_score || 0)}/100</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">SEO</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round(audit.seo_score || 0)}/100</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">UX & Speed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round(audit.ux_score || 0)}/100</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Social</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{Math.round(audit.social_score || 0)}/100</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" /> Pain Points Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {audit.pain_points?.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="h-5 w-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">{i+1}</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="glass-card border-emerald-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {audit.recommendations?.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">{i+1}</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>

        {/* Tab 3: Report */}
        <TabsContent value="report" className="mt-6">
          <Card className="glass-card">
            {report ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                  <div>
                    <CardTitle>Professional Audit Report</CardTitle>
                    <CardDescription>Generated on {new Date(report.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <a 
                    href={reportService.downloadReportUrl(report.id)} 
                    target="_blank" 
                    rel="noreferrer"
                    className={buttonVariants({ className: "bg-primary hover:bg-primary/90 text-white" })}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </a>
                </CardHeader>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Executive Summary</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{report.executive_summary}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Website Analysis</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{report.website_audit_summary}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Social Media Presence</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{report.social_audit_summary}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">The Opportunity</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{report.opportunity_summary}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <FileBarChart className="w-16 h-16 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-medium">No Report Generated</h3>
                <p className="text-muted-foreground max-w-md">
                  Use the AI to generate a professional PDF audit report you can send to {lead.name}.
                </p>
                <Button onClick={handleGenerateReport} disabled={generateReport.isPending} className="mt-4 shadow-lg shadow-primary/20">
                  {generateReport.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PDF Report...</>
                  ) : (
                    <><FileBarChart className="mr-2 h-4 w-4" /> Generate Report</>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 4: Outreach */}
        <TabsContent value="outreach" className="mt-6">
          <Card className="glass-card">
            {outreach ? (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {/* Email Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" /> Email Sequence
                    </h3>
                    <Button size="sm" variant="outline">
                      <Send className="mr-2 h-4 w-4" /> Send Now
                    </Button>
                  </div>
                  
                  <div className="space-y-4 bg-background/50 p-4 rounded-lg border border-border/50">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Subject</span>
                      <p className="font-medium text-sm mt-1">{outreach.email_subject}</p>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Body</span>
                      <p className="text-sm whitespace-pre-wrap mt-2 leading-relaxed font-mono bg-muted/30 p-3 rounded">{outreach.email_body}</p>
                    </div>
                  </div>
                </div>

                {/* Other Channels */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <MessageCircle className="w-5 h-5 text-emerald-500" /> WhatsApp Message
                    </h3>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <p className="text-sm whitespace-pre-wrap">{outreach.whatsapp_message}</p>
                    </div>
                  </div>
                  
                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <PhoneCall className="w-5 h-5 text-blue-500" /> Cold Call Script
                    </h3>
                    <div className="bg-background/50 p-4 rounded-lg border border-border/50">
                      <p className="text-sm whitespace-pre-wrap">{outreach.call_notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <Send className="w-16 h-16 text-muted-foreground opacity-20" />
                <h3 className="text-xl font-medium">No Outreach Generated</h3>
                <p className="text-muted-foreground max-w-md">
                  Use the AI to write hyper-personalized cold emails, WhatsApp messages, and call scripts based on the audit.
                </p>
                <Button onClick={handleGenerateOutreach} disabled={generateOutreach.isPending} className="mt-4 shadow-lg shadow-primary/20">
                  {generateOutreach.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Writing Outreach Content...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Generate Outreach Strategy</>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple fallback icon component since Activity isn't imported at top
function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

"use client";

import { useState, useEffect } from "react";
import { useDiscoverCampaign } from "@/hooks/useCampaigns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Search, 
  MapPin, 
  Building2, 
  FolderKanban, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  ShieldAlert, 
  FileText, 
  Send,
  Check,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Business } from "@/types/business";
import { Campaign } from "@/types/campaign";
import { campaignService } from "@/services/campaignService";
import { leadService } from "@/services/leadService";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DiscoverPage() {
  const [campaignName, setCampaignName] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  
  // Automation settings
  const [autoEnrich, setAutoEnrich] = useState(true);
  const [autoAudit, setAutoAudit] = useState(true);
  const [autoGenerateReports, setAutoGenerateReports] = useState(true);
  const [autoGenerateOutreach, setAutoGenerateOutreach] = useState(true);

  // Pipeline execution state
  const [pollingCampaign, setPollingCampaign] = useState<Campaign | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [leads, setLeads] = useState<Business[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const discoverMutation = useDiscoverCampaign();

  // Polling Campaign Status
  useEffect(() => {
    if (!isPolling || !pollingCampaign?.id) return;

    const interval = setInterval(async () => {
      try {
        const campaign = await campaignService.getCampaign(pollingCampaign.id);
        setPollingCampaign(campaign);

        if (
          campaign.status === "completed" ||
          campaign.status === "completed_with_errors" ||
          campaign.status === "failed"
        ) {
          setIsPolling(false);
          clearInterval(interval);
          
          if (campaign.status === "failed") {
            setErrorMsg(campaign.pipeline_error || "Automated pipeline failed.");
          } else {
            // Load discovered leads
            const campaignLeads = await leadService.getLeads({ campaign_id: campaign.id });
            setLeads(campaignLeads);
          }
        }
      } catch (err) {
        console.error("Error polling campaign status", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPolling, pollingCampaign?.id]);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !sector || !location) return;

    setErrorMsg(null);
    setLeads(null);
    setPollingCampaign(null);

    try {
      const response = await discoverMutation.mutateAsync({
        name: campaignName,
        sector,
        location,
        auto_enrich: autoEnrich,
        auto_audit: autoAudit,
        auto_generate_reports: autoGenerateReports,
        auto_generate_outreach: autoGenerateOutreach,
        max_runtime_seconds: 120, // Technical safety cap
      });

      // Set active polling campaign
      setPollingCampaign(response.campaign);
      setIsPolling(true);
    } catch (error: any) {
      console.error("Discovery trigger failed", error);
      setErrorMsg(error.response?.data?.detail || "Failed to trigger discovery pipeline.");
    }
  };

  const getStepStatus = (stepName: string) => {
    if (!pollingCampaign) return "pending";
    const status = pollingCampaign.status;

    const stepsOrder = [
      "discovering",
      "enriching",
      "auditing",
      "generating_reports",
      "generating_outreach",
      "completed"
    ];

    const currentStepIndex = stepsOrder.indexOf(status);
    const targetStepIndex = stepsOrder.indexOf(stepName);

    if (status === "failed") {
      if (currentStepIndex === targetStepIndex) return "failed";
      return currentStepIndex > targetStepIndex ? "completed" : "pending";
    }

    if (status === "completed" || status === "completed_with_errors") {
      return "completed";
    }

    if (currentStepIndex === targetStepIndex) {
      return "active";
    } else if (currentStepIndex > targetStepIndex) {
      return "completed";
    } else {
      return "pending";
    }
  };

  const getStepIcon = (stepName: string) => {
    const status = getStepStatus(stepName);
    switch (status) {
      case "completed":
        return <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>;
      case "active":
        return <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30 animate-pulse"><Loader2 className="w-3.5 h-3.5 animate-spin" /></div>;
      case "failed":
        return <div className="w-6 h-6 rounded-full bg-destructive/20 text-destructive flex items-center justify-center border border-destructive/30"><XCircle className="w-3.5 h-3.5" /></div>;
      default:
        return <div className="w-6 h-6 rounded-full bg-muted border border-border text-muted-foreground flex items-center justify-center text-xs font-semibold"><Clock className="w-3.5 h-3.5" /></div>;
    }
  };

  const resetPage = () => {
    setCampaignName("");
    setSector("");
    setLocation("");
    setPollingCampaign(null);
    setLeads(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Campaign Pipeline Discovery</h1>
        <p className="text-muted-foreground mt-1">
          Automate the full sales funnel from raw lead discovery to audit reports and outreach templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-card h-fit">
            <CardHeader>
              <CardTitle>Discovery Options</CardTitle>
              <CardDescription>Enter details to start the automated pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDiscover} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName" className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-primary" /> Campaign Name
                  </Label>
                  <Input 
                    id="campaignName" 
                    placeholder="e.g. Noida Hospitals June 2026" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    required
                    disabled={discoverMutation.isPending || isPolling}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Sector / Niche
                  </Label>
                  <Input 
                    id="sector" 
                    placeholder="e.g. Hospital, Dentist, Plumber" 
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    required
                    disabled={discoverMutation.isPending || isPolling}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> Location
                  </Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Noida, Austin TX" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    disabled={discoverMutation.isPending || isPolling}
                  />
                </div>

                {/* Automation Checkboxes */}
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <h4 className="text-sm font-semibold text-primary/80">Workflow Automation</h4>
                  
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="autoEnrich" 
                      className="mt-1 rounded border-border text-primary focus:ring-primary"
                      checked={autoEnrich} 
                      onChange={(e) => setAutoEnrich(e.target.checked)}
                      disabled={discoverMutation.isPending || isPolling}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor="autoEnrich" className="cursor-pointer">Auto-Enrich Leads</Label>
                      <span className="text-xs text-muted-foreground">Find missing websites, emails, and social handles.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="autoAudit" 
                      className="mt-1 rounded border-border text-primary focus:ring-primary"
                      checked={autoAudit} 
                      onChange={(e) => setAutoAudit(e.target.checked)}
                      disabled={discoverMutation.isPending || isPolling}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor="autoAudit" className="cursor-pointer">Auto-Run Audits</Label>
                      <span className="text-xs text-muted-foreground">Analyze SEO, page speed, mobile performance, and tech stack.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="autoGenerateReports" 
                      className="mt-1 rounded border-border text-primary focus:ring-primary"
                      checked={autoGenerateReports} 
                      onChange={(e) => setAutoGenerateReports(e.target.checked)}
                      disabled={discoverMutation.isPending || isPolling || !autoAudit}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor="autoGenerateReports" className="cursor-pointer">Auto-Generate Reports</Label>
                      <span className="text-xs text-muted-foreground">Create customized client-facing PDF audit summaries.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="autoGenerateOutreach" 
                      className="mt-1 rounded border-border text-primary focus:ring-primary"
                      checked={autoGenerateOutreach} 
                      onChange={(e) => setAutoGenerateOutreach(e.target.checked)}
                      disabled={discoverMutation.isPending || isPolling || !autoAudit}
                    />
                    <div className="grid gap-1">
                      <Label htmlFor="autoGenerateOutreach" className="cursor-pointer">Auto-Generate Outreach</Label>
                      <span className="text-xs text-muted-foreground">Draft customized Email, WhatsApp, and call script content.</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={discoverMutation.isPending || isPolling || !campaignName || !sector || !location}
                >
                  {discoverMutation.isPending || isPolling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Pipeline...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Pipeline Discovery
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Status / Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Pipeline Progress */}
          {pollingCampaign && (
            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <RefreshCw className={`w-5 h-5 text-primary ${isPolling ? "animate-spin" : ""}`} />
                      Pipeline: {pollingCampaign.name}
                    </CardTitle>
                    <CardDescription>
                      Sector: {pollingCampaign.sector} | Location: {pollingCampaign.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize text-primary border-primary/30 bg-primary/5 px-2 py-0.5">
                    {pollingCampaign.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Stepper */}
                <div className="space-y-4">
                  {/* Step 1: Discover */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/20">
                    <div className="flex items-center gap-3">
                      {getStepIcon("discovering")}
                      <div>
                        <p className="text-sm font-semibold">1. Local Discovery</p>
                        <p className="text-xs text-muted-foreground">Scraping maps data to identify verified businesses</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono">{pollingCampaign.leads_count} Leads Found</Badge>
                  </div>

                  {/* Step 2: Enrichment */}
                  {autoEnrich && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/20">
                      <div className="flex items-center gap-3">
                        {getStepIcon("enriching")}
                        <div>
                          <p className="text-sm font-semibold">2. Contact & Web Enrichment</p>
                          <p className="text-xs text-muted-foreground">Finding missing websites, emails, and social profiles</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">{pollingCampaign.enriched_count} Enriched</Badge>
                    </div>
                  )}

                  {/* Step 3: Audit */}
                  {autoAudit && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/20">
                      <div className="flex items-center gap-3">
                        {getStepIcon("auditing")}
                        <div>
                          <p className="text-sm font-semibold">3. Digital Audit Analysis</p>
                          <p className="text-xs text-muted-foreground">Running page performance and accessibility audits</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">{pollingCampaign.audited_count} Audited</Badge>
                    </div>
                  )}

                  {/* Step 4: Reports */}
                  {autoGenerateReports && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/20">
                      <div className="flex items-center gap-3">
                        {getStepIcon("generating_reports")}
                        <div>
                          <p className="text-sm font-semibold">4. Report PDF Generation</p>
                          <p className="text-xs text-muted-foreground">Creating professional client-facing report templates</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">{pollingCampaign.reports_count} Generated</Badge>
                    </div>
                  )}

                  {/* Step 5: Outreach */}
                  {autoGenerateOutreach && (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card/20">
                      <div className="flex items-center gap-3">
                        {getStepIcon("generating_outreach")}
                        <div>
                          <p className="text-sm font-semibold">5. AI Outreach Copywriting</p>
                          <p className="text-xs text-muted-foreground">Writing personalized email pitch drafts and WhatsApp notes</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">{pollingCampaign.outreach_count} Drafted</Badge>
                    </div>
                  )}
                </div>

                {/* Pipeline Error Output */}
                {errorMsg && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Pipeline Error</p>
                      <p className="text-xs mt-1">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* Pipeline Success Output */}
                {(pollingCampaign.status === "completed" || pollingCampaign.status === "completed_with_errors") && (
                  <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Pipeline Execution Finished</p>
                      <p className="text-xs mt-1">
                        All selected automation operations completed successfully for {pollingCampaign.leads_count} discovered leads.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-3 pt-0">
                {(pollingCampaign.status === "completed" || pollingCampaign.status === "completed_with_errors" || pollingCampaign.status === "failed") && (
                  <>
                    <Button variant="outline" className="flex-1" onClick={resetPage}>
                      Reset Form
                    </Button>
                    <Link href={`/leads`} className={buttonVariants({ className: "flex-1" })}>
                      View Discovered Leads
                    </Link>
                  </>
                )}
              </CardFooter>
            </Card>
          )}

          {/* Leads Results List */}
          {leads && leads.length > 0 && (
            <Card className="glass-card animate-in fade-in-50 duration-300">
              <CardHeader>
                <CardTitle>Discovered Leads Details</CardTitle>
                <CardDescription>Real-time lists of businesses found and saved in database.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 hover:border-primary/45 transition-all">
                    <div>
                      <h4 className="font-semibold text-lg">{lead.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {lead.address || lead.location}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        {lead.website && (
                          <span className="text-primary flex items-center gap-1 hover:underline truncate max-w-[150px]">
                            <Globe className="w-3.5 h-3.5" /> {lead.website}
                          </span>
                        )}
                        {lead.email && (
                          <span className="text-muted-foreground flex items-center gap-1 truncate max-w-[150px]">
                            <Send className="w-3.5 h-3.5" /> {lead.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0">
                      <Link 
                        href={`/leads/${lead.id}`} 
                        className={buttonVariants({ variant: "default", size: "sm" })}
                      >
                        Lead Details <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Initial / Empty State */}
          {!pollingCampaign && (
            <Card className="glass-card flex flex-col items-center justify-center py-20 text-center border-dashed border-border/70 bg-card/10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-primary/70" />
              </div>
              <h3 className="text-xl font-medium">No active discovery pipeline</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-2">
                Create a campaign and click Start to trigger the automated lead discovery, enrichment, website audit, and AI copywriting pipeline.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveCampaign } from "@/components/providers/CampaignProvider";
import { useLeads } from "@/hooks/useLeads";
import { useAudit, useGenerateAudit } from "@/hooks/useAudit";
import { useReport, useGenerateReport } from "@/hooks/useReports";
import { useOutreach, useGenerateOutreach } from "@/hooks/useOutreach";
import { reportService } from "@/services/reportService";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Loader2, Mail, MessageCircle, PhoneCall, Send,
  FolderKanban, MapPin, Globe, Star, Users,
  Activity, CheckCircle2, XCircle, AlertTriangle,
  ChevronLeft, ChevronRight, Copy, ExternalLink,
  FileText, Clock, Edit, Download, Share2,
  ShieldCheck, Search, RefreshCw, Eye, Zap,
  BarChart3, TrendingUp, Target, BadgeCheck,
} from "lucide-react";
import Link from "next/link";

/* ================================================================
   OUTREACH WORKSPACE — Premium AI Sales Intelligence Cockpit
   ================================================================ */

export default function OutreachWorkspace() {
  const { activeCampaignId } = useActiveCampaign();

  const { data: leadsData, isLoading: isLoadingLeads } = useLeads({
    campaign_id: activeCampaignId || undefined,
    limit: 1000,
  });

  const leads = leadsData || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("reports");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLeadSearch, setShowLeadSearch] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setSearchQuery("");
    setActiveTab("reports");
  }, [activeCampaignId]);

  const currentLead = leads[currentIndex];

  // Data hooks — only fire when we have a valid lead
  const { data: audit, isLoading: isAuditLoading } = useAudit(currentLead?.id || 0);
  const { data: report, isLoading: isReportLoading } = useReport(currentLead?.id || 0);
  const { data: outreach, isLoading: isOutreachLoading } = useOutreach(currentLead?.id || 0);

  const generateAudit = useGenerateAudit();
  const generateReport = useGenerateReport();
  const generateOutreach = useGenerateOutreach();

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(p => p - 1);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < leads.length - 1) setCurrentIndex(p => p + 1);
  }, [currentIndex, leads.length]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlePrev, handleNext]);

  const clip = (text: string | null | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
  };

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(l => l.name.toLowerCase().includes(q));
  }, [leads, searchQuery]);

  const isVerified = currentLead && (currentLead.website || currentLead.phone);

  /* ---------- EMPTY / LOADING STATES ---------- */

  if (!activeCampaignId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] bg-[#020617]">
        <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mb-5">
          <FolderKanban className="w-8 h-8 text-[#6366F1]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Campaign Selected</h2>
        <p className="text-slate-400 text-[15px] max-w-sm text-center">Select a campaign from the header to start reviewing leads in your workspace.</p>
      </div>
    );
  }

  if (isLoadingLeads) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] bg-[#020617]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6366F1] mb-4" />
        <p className="text-slate-400 text-[15px]">Loading campaign leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] bg-[#020617]">
        <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center mb-5">
          <Users className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Leads Found</h2>
        <p className="text-slate-400 text-[15px] max-w-sm text-center mb-6">This campaign has no leads yet. Start a discovery run to populate your workspace.</p>
        <Link href="/discover">
          <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6">Discover Leads</Button>
        </Link>
      </div>
    );
  }

  if (!currentLead) return null;

  /* ---------- TABS ---------- */
  const tabs = [
    { id: "reports", label: "Reports & Lead Briefing", icon: FileText },
    { id: "audit", label: "Audit", icon: ShieldCheck },
    { id: "recommendations", label: "Recommendations", icon: Zap },
    { id: "outreach", label: "Outreach", icon: Mail },
  ];

  const auditScore = audit?.audit_score ?? report?.overall_score ?? null;

  /* ---------- RENDER ---------- */
  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-[#020617] text-slate-200 overflow-hidden">

      {/* ================================================================
          LAYER 2 — LEAD HEADER CARD
          ================================================================ */}
      <div className="w-full bg-[#0F172A] border-b border-[#1E293B] shrink-0 px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Business Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2.5">
              <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentIndex === 0} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#1E293B] shrink-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-[28px] font-bold text-white leading-tight truncate">{currentLead.name}</h1>
              {isVerified && (
                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20 text-[11px] px-1.5 py-0.5 gap-1 shrink-0">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentIndex === leads.length - 1} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#1E293B] shrink-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 text-[13px] text-slate-400 mb-1.5">
              {currentLead.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" />{currentLead.location}</span>}
              {currentLead.category && <><span className="text-[#1E293B]">|</span><span className="flex items-center gap-1"><FolderKanban className="w-3.5 h-3.5 text-slate-500" />{currentLead.category}</span></>}
              {currentLead.website && <><span className="text-[#1E293B]">|</span><a href={currentLead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#818CF8] hover:underline"><Globe className="w-3.5 h-3.5" />{currentLead.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></>}
            </div>
            <div className="flex items-center gap-3 text-[13px] text-slate-400">
              {currentLead.phone && <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-slate-500" />{currentLead.phone}</span>}
              {currentLead.email && <><span className="text-[#1E293B]">|</span><span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" />{currentLead.email}</span></>}
            </div>
          </div>

          {/* Middle: Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-[#020617] border border-[#1E293B] min-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Opp Score</span>
              <span className="text-[18px] font-bold text-[#22C55E]">{currentLead.confidence_score ?? "—"}%</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-[#020617] border border-[#1E293B] min-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Audit</span>
              <span className={`text-[18px] font-bold ${auditScore && auditScore >= 70 ? "text-[#22C55E]" : auditScore ? "text-[#F59E0B]" : "text-slate-500"}`}>{auditScore ? `${auditScore}` : "—"}</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-[#020617] border border-[#1E293B] min-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Priority</span>
              <span className="text-[13px] font-bold text-[#EF4444]">High</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-[#020617] border border-[#1E293B] min-w-[80px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Outreach</span>
              <span className={`text-[13px] font-bold ${outreach ? "text-[#22C55E]" : "text-slate-500"}`}>{outreach ? "Ready" : "Pending"}</span>
            </div>
          </div>

          {/* Right: Nav + Profile Link */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button variant="outline" size="sm" className="bg-[#0F172A] border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white h-8 text-[12px] px-3" onClick={() => setShowLeadSearch(!showLeadSearch)}>
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Find Lead
                </Button>
                {showLeadSearch && (
                  <div className="absolute top-10 right-0 w-72 bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-2xl z-50 p-2">
                    <Input
                      placeholder="Search leads..."
                      className="bg-[#020617] border-[#1E293B] text-slate-200 text-[13px] h-8 mb-2 placeholder:text-slate-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      {filteredLeads.slice(0, 20).map((l) => {
                        const idx = leads.findIndex(lead => lead.id === l.id);
                        return (
                          <button
                            key={l.id}
                            onClick={() => { setCurrentIndex(idx); setShowLeadSearch(false); setSearchQuery(""); }}
                            className={`w-full text-left px-3 py-1.5 rounded text-[13px] transition-colors ${idx === currentIndex ? "bg-[#6366F1]/10 text-[#818CF8]" : "text-slate-300 hover:bg-[#1E293B]"}`}
                          >
                            {l.name}
                          </button>
                        );
                      })}
                      {filteredLeads.length === 0 && <p className="text-slate-500 text-[12px] text-center py-2">No leads found</p>}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[13px] text-slate-400 font-medium whitespace-nowrap">Lead {currentIndex + 1} of {leads.length}</span>
            </div>
            <Link href={`/leads/${currentLead.id}`}>
              <Button variant="outline" size="sm" className="bg-[#0F172A] border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white h-8 text-[12px] px-3">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Lead Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================
          LAYER 3 — TABS + MAIN CONTENT + RIGHT SIDEBAR
          ================================================================ */}
      <div className="flex flex-1 overflow-hidden">

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Tab Bar */}
          <div className="w-full bg-[#0F172A] border-b border-[#1E293B] flex items-center px-6 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[14px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#6366F1] text-[#818CF8]"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "reports" && <ReportsTab lead={currentLead} report={report} isLoading={isReportLoading} audit={audit} generateReport={generateReport} />}
            {activeTab === "audit" && <AuditTab lead={currentLead} audit={audit} isLoading={isAuditLoading} generateAudit={generateAudit} />}
            {activeTab === "recommendations" && <RecommendationsTab lead={currentLead} report={report} audit={audit} isLoading={isReportLoading} generateReport={generateReport} />}
            {activeTab === "outreach" && <OutreachTab lead={currentLead} outreach={outreach} report={report} isLoading={isOutreachLoading} generateOutreach={generateOutreach} clip={clip} />}
          </div>
        </div>

        {/* ================================================================
            RIGHT UTILITY SIDEBAR
            ================================================================ */}
        <div className="w-[320px] bg-[#0B1120] border-l border-[#1E293B] shrink-0 overflow-y-auto hidden xl:flex flex-col">

          {/* Quick Actions */}
          <div className="p-5 border-b border-[#1E293B]">
            <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-1.5">
              {!audit && (
                <SidebarBtn icon={ShieldCheck} label="Run Audit" onClick={() => generateAudit.mutate(currentLead.id)} disabled={generateAudit.isPending} accent />
              )}
              {audit && !report && (
                <SidebarBtn icon={FileText} label="Generate Report" onClick={() => generateReport.mutate(currentLead.id)} disabled={generateReport.isPending} accent />
              )}
              {report && (
                <>
                  <SidebarBtn icon={Eye} label="View Full Report" onClick={() => window.open(`/reports/${currentLead.id}`, "_blank")} />
                  {report.pdf_path && <SidebarBtn icon={Download} label="Download PDF" onClick={() => window.open(reportService.downloadReportUrl(report.id), "_blank")} />}
                </>
              )}
              {!outreach && report && (
                <>
                  <div className="h-px bg-[#1E293B] my-2" />
                  <SidebarBtn icon={Mail} label="Generate Outreach" onClick={() => generateOutreach.mutate(currentLead.id)} disabled={generateOutreach.isPending} accent />
                </>
              )}
              {outreach && (
                <>
                  <div className="h-px bg-[#1E293B] my-2" />
                  <SidebarBtn icon={Send} label="Send Email" accent />
                </>
              )}
            </div>
          </div>

          {/* Lead Activity Timeline */}
          <div className="p-5 flex-1">
            <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-5">Lead Activity</h3>
            <div className="relative border-l-2 border-[#1E293B] ml-2 space-y-5">
              <TimelineItem label="Lead Discovered" date={new Date(currentLead.created_at).toLocaleDateString()} active />
              <TimelineItem label="Audit Completed" active={!!audit} date={audit ? "Completed" : undefined} />
              <TimelineItem label="Report Generated" active={!!report} date={report ? new Date(report.created_at).toLocaleDateString() : undefined} />
              <TimelineItem label="Recommendations Generated" active={!!report?.recommended_solutions?.length} date={report?.recommended_solutions?.length ? "Completed" : undefined} />
              <TimelineItem label="Outreach Generated" active={!!outreach} date={outreach ? "Completed" : undefined} />
              <TimelineItem label="Email Sent" active={false} />
              <TimelineItem label="Meeting Booked" active={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ================================================================
   SHARED SIDEBAR COMPONENTS
   ================================================================ */

function SidebarBtn({ icon: Icon, label, onClick, disabled, accent, color }: {
  icon: React.ElementType; label: string; onClick?: () => void; disabled?: boolean; accent?: boolean; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        accent
          ? "bg-[#6366F1] text-white hover:bg-[#4F46E5]"
          : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" style={color ? { color } : undefined} />
      {label}
    </button>
  );
}

function HighlightRow({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[13px] text-slate-400">{label}</span>
      <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

function TimelineItem({ label, active, date }: { label: string; active: boolean; date?: string }) {
  return (
    <div className="relative pl-5">
      <div className={`absolute w-2.5 h-2.5 rounded-full -left-[6px] top-0.5 border-2 border-[#0B1120] ${active ? "bg-[#6366F1]" : "bg-[#1E293B]"}`} />
      <div className={`text-[13px] font-medium ${active ? "text-white" : "text-slate-500"}`}>{label}</div>
      {date && <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{date}</div>}
    </div>
  );
}


/* ================================================================
   TAB: REPORTS & LEAD BRIEFING (Default Active)
   ================================================================ */

function ReportsTab({ lead, report, isLoading, audit, generateReport }: any) {
  if (isLoading) return <TabLoader />;

  if (!report) {
    return (
      <EmptyState
        icon={FileText}
        title="No report generated yet."
        description="Generate a comprehensive AI-powered digital audit report with executive summaries, scores, and actionable insights."
        actionLabel={audit ? "Generate Report" : "Run Audit First"}
        onAction={() => generateReport.mutate(lead.id)}
        disabled={generateReport.isPending || !audit}
        loading={generateReport.isPending}
      />
    );
  }

  const mockPainPoints = report.pain_points?.length ? report.pain_points : ["Weak online visibility", "Poor conversion paths"];
  const mockServices = report.recommended_solutions?.length ? report.recommended_solutions : ["Local SEO", "Lead Capture System"];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-10">
      
      {/* 1. COMPACT BUSINESS IDENTITY ROW */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-slate-300 bg-[#0F172A] p-4 rounded-xl border border-[#1E293B]">
        <span className="font-bold text-white text-[16px]">{lead.name}</span>
        {lead.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500" />{lead.location}</span>}
        {lead.category && <span className="flex items-center gap-1.5 text-slate-500">• {lead.category}</span>}
        {lead.website && <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#818CF8] hover:underline"><Globe className="w-4 h-4" />{lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>}
        {lead.phone && <span className="flex items-center gap-1.5"><PhoneCall className="w-4 h-4 text-slate-500" />{lead.phone}</span>}
        {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" />{lead.email}</span>}
        {lead.google_rating && <span className="flex items-center gap-1.5 text-[#F59E0B]"><Star className="w-4 h-4" />{lead.google_rating} ({lead.reviews_count ?? 0} reviews)</span>}
      </div>

      {/* 2. EXECUTIVE SUMMARY CARD */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-8 shadow-sm relative overflow-hidden">
        <h2 className="text-[20px] font-bold text-white mb-4">Executive Summary</h2>
        <p className="text-[16px] text-slate-300 leading-relaxed mb-6 relative z-10">
          {report.executive_summary || `This business has strong local brand recognition but is losing potential customers due to weak online visibility, poor conversion paths, and a lack of lead automation.`}
        </p>
        <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-[#1E293B] relative z-10">
          <div>
            <span className="text-[12px] text-slate-500 uppercase tracking-wider block mb-1">Opportunity Size</span>
            <span className="text-[16px] font-bold text-[#22C55E]">$3,000 - $5,000</span>
          </div>
          <div>
            <span className="text-[12px] text-slate-500 uppercase tracking-wider block mb-1">Likelihood to Close</span>
            <span className="text-[16px] font-bold text-[#6366F1]">High</span>
          </div>
          <div>
            <span className="text-[12px] text-slate-500 uppercase tracking-wider block mb-1">Recommended Entry Service</span>
            <span className="text-[16px] font-bold text-white">{mockServices[0]}</span>
          </div>
        </div>
      </div>

      {/* 3. OPPORTUNITY SNAPSHOT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-center">
          <span className="text-[12px] text-slate-500 uppercase tracking-wider mb-1">Opportunity Score</span>
          <span className="text-[24px] font-bold text-[#22C55E]">{lead.confidence_score ?? 85}</span>
        </div>
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-center">
          <span className="text-[12px] text-slate-500 uppercase tracking-wider mb-1">Audit Score</span>
          <span className="text-[24px] font-bold text-[#F59E0B]">{audit?.audit_score ?? 65}</span>
        </div>
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-center">
          <span className="text-[12px] text-slate-500 uppercase tracking-wider mb-1">Priority</span>
          <span className="text-[24px] font-bold text-[#EF4444]">High</span>
        </div>
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-center">
          <span className="text-[12px] text-slate-500 uppercase tracking-wider mb-1">Est. Deal Size</span>
          <span className="text-[24px] font-bold text-white">$4,000</span>
        </div>
      </div>

      {/* 4. TOP PAIN POINTS */}
      <div>
        <h3 className="text-[18px] font-bold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-[#EF4444]" /> Top Pain Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockPainPoints.slice(0, 4).map((pain: string, i: number) => (
            <div key={i} className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex flex-col">
              <div className="mb-3">
                <Badge className={`${i === 0 ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20" : "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"} text-[11px] px-2 py-0.5 rounded-sm hover:bg-transparent`}>
                  {i === 0 ? "Critical" : "High Priority"}
                </Badge>
              </div>
              <h4 className="text-[15px] font-bold text-white mb-2">{pain}</h4>
              <p className="text-[13px] text-slate-400 mt-auto">
                <span className="text-slate-300 font-medium">Sales Impact:</span> Competitors are likely capturing leads that should belong to this business.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. RECOMMENDED SERVICES */}
      <div>
        <h3 className="text-[18px] font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-[#F59E0B]" /> Recommended Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockServices.slice(0, 2).map((service: string, i: number) => (
            <div key={i} className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-6">
              <h4 className="text-[16px] font-bold text-[#22C55E] mb-3">{service}</h4>
              <div className="space-y-4">
                <div className="text-[13px]">
                  <span className="text-slate-500 block mb-1">Why this matters:</span>
                  <span className="text-slate-300">Improve visibility and capture more local inquiries directly from search.</span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[11px] text-slate-500 block">ROI</span>
                    <span className="text-[13px] font-semibold text-white">High</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Effort</span>
                    <span className="text-[13px] font-semibold text-white">Medium</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-slate-500 block">Pitch Angle</span>
                    <span className="text-[13px] font-semibold text-[#818CF8]">"Capture local traffic"</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. SALES STRATEGY CARD */}
      <div className="bg-[#0B1120] border-2 border-[#6366F1]/30 rounded-2xl p-8 relative overflow-hidden mt-2">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6366F1]/5 rounded-bl-full pointer-events-none" />
        <h2 className="text-[20px] font-bold text-white mb-6 flex items-center gap-2 relative z-10"><Target className="w-5 h-5 text-[#6366F1]" /> Sales Strategy</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
          <div>
            <span className="text-[12px] text-[#818CF8] uppercase tracking-wider font-bold block mb-2">Opening Angle</span>
            <p className="text-[15px] text-slate-300">Acknowledge their strong local reputation and emphasize the gap in their online conversion paths.</p>
          </div>
          <div>
            <span className="text-[12px] text-[#EF4444] uppercase tracking-wider font-bold block mb-2">Primary Pain</span>
            <p className="text-[15px] text-slate-300">{mockPainPoints[0] || "Missing online inquiry conversion opportunities."}</p>
          </div>
          <div>
            <span className="text-[12px] text-[#22C55E] uppercase tracking-wider font-bold block mb-2">Best Offer</span>
            <p className="text-[15px] text-slate-300">{mockServices[0]} + Lead Capture Integration.</p>
          </div>
          <div>
            <span className="text-[12px] text-slate-400 uppercase tracking-wider font-bold block mb-2">Suggested Next Step</span>
            <p className="text-[15px] text-slate-300">Offer a free 15-minute digital growth audit walkthrough.</p>
          </div>
          <div className="md:col-span-2 bg-[#020617] rounded-lg p-5 border border-[#1E293B]">
            <span className="text-[12px] text-[#F59E0B] uppercase tracking-wider font-bold block mb-2">Objection Handling Tip</span>
            <p className="text-[14px] text-slate-300">If they say "We already get enough referrals", show them competitor search visibility data and how much invisible traffic they are losing locally.</p>
          </div>
        </div>
      </div>

      {/* 7. REPORT ACTIONS */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1E293B]">
        <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white" onClick={() => window.open(`/reports/${lead.id}`, "_blank")}>
          <Eye className="w-4 h-4 mr-2" /> View Full Report
        </Button>
        {report?.pdf_path && (
          <Button variant="outline" className="bg-[#0F172A] border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white" onClick={() => window.open(reportService.downloadReportUrl(report.id), "_blank")}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        )}
        <Button variant="outline" className="bg-[#0F172A] border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white" onClick={() => generateReport.mutate(lead.id)} disabled={generateReport.isPending}>
          <RefreshCw className={`w-4 h-4 mr-2 ${generateReport.isPending ? 'animate-spin' : ''}`} /> Regenerate Report
        </Button>
      </div>

    </div>
  );
}


/* ================================================================
   TAB: AUDIT
   ================================================================ */

function AuditTab({ lead, audit, isLoading, generateAudit }: any) {
  if (isLoading) return <TabLoader />;

  if (!audit) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No audit generated yet."
        description="Run an automated technical, SEO, UX, and social media audit to extract actionable digital signals for this business."
        actionLabel="Run Audit"
        onAction={() => generateAudit.mutate(lead.id)}
        disabled={generateAudit.isPending}
        loading={generateAudit.isPending}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Technical Audit */}
      <AuditCard
        title="Technical Audit"
        score={audit.loading_speed_score}
        status={audit.ssl_enabled && audit.mobile_responsive ? "Good" : "Needs Attention"}
        statusColor={audit.ssl_enabled && audit.mobile_responsive ? "#22C55E" : "#EF4444"}
        rows={[
          { label: "SSL / HTTPS", ok: audit.ssl_enabled },
          { label: "Mobile Responsive", ok: audit.mobile_responsive },
          { label: "Contact Form", ok: audit.has_contact_form },
          { label: "Performance Score", text: audit.loading_speed_score ? `${audit.loading_speed_score}/100` : "N/A" },
          { label: "Broken Links", text: String(audit.broken_links_count), warn: audit.broken_links_count > 0 },
        ]}
        issues={`Broken links: ${audit.broken_links_count}. ${!audit.ssl_enabled ? "No SSL." : ""} ${!audit.mobile_responsive ? "Not mobile friendly." : ""}`}
        recs="Fix broken links. Ensure SSL is enabled. Optimize for mobile."
      />

      {/* SEO Audit */}
      <AuditCard
        title="SEO Audit"
        score={audit.seo_score}
        status={audit.seo_score && audit.seo_score >= 60 ? "Fair" : "Poor"}
        statusColor={audit.seo_score && audit.seo_score >= 60 ? "#F59E0B" : "#EF4444"}
        rows={[
          { label: "SEO Score", text: audit.seo_score ? `${audit.seo_score}/100` : "N/A" },
          { label: "Meta Title", text: audit.meta_title ? "Present" : "Missing", warn: !audit.meta_title },
          { label: "Meta Description", text: audit.meta_description ? "Present" : "Missing", warn: !audit.meta_description },
          { label: "H1 Tags", text: String(audit.h1_count) },
          { label: "Missing Alt Tags", text: String(audit.image_alt_missing_count), warn: audit.image_alt_missing_count > 0 },
        ]}
        issues={`SEO score ${audit.seo_score ?? "N/A"}/100. ${audit.image_alt_missing_count} images missing alt tags. ${!audit.meta_description ? "No meta description." : ""}`}
        recs="Add missing alt tags. Write compelling meta descriptions. Fix heading hierarchy."
      />

      {/* UX Audit */}
      <AuditCard
        title="UX Audit"
        score={audit.ux_score}
        status={audit.has_booking_system || audit.has_contact_form ? "Fair" : "Critical"}
        statusColor={audit.has_booking_system || audit.has_contact_form ? "#F59E0B" : "#EF4444"}
        rows={[
          { label: "UX Score", text: audit.ux_score ? `${audit.ux_score}/100` : "N/A" },
          { label: "Booking System", ok: audit.has_booking_system },
          { label: "CRM Signals", ok: audit.has_crm_signals },
          { label: "Lead Capture Form", ok: audit.has_contact_form },
          { label: "WhatsApp Integration", ok: audit.has_whatsapp },
        ]}
        issues={`${!audit.has_booking_system ? "No booking system." : ""} ${!audit.has_crm_signals ? "No CRM detected." : ""} ${!audit.has_contact_form ? "No lead capture form." : ""}`}
        recs="Add appointment booking widget. Implement lead capture forms. Integrate WhatsApp."
      />

      {/* Social Audit */}
      <AuditCard
        title="Social Audit"
        score={audit.social_score}
        status={audit.social_score && audit.social_score >= 50 ? "Good" : "Needs Work"}
        statusColor={audit.social_score && audit.social_score >= 50 ? "#22C55E" : "#F59E0B"}
        rows={[
          { label: "Social Score", text: audit.social_score ? `${audit.social_score}/100` : "N/A" },
          { label: "WhatsApp", ok: audit.has_whatsapp },
          { label: "Instagram", ok: !!lead.instagram },
          { label: "Facebook", ok: !!lead.facebook },
          { label: "LinkedIn", ok: !!lead.linkedin },
        ]}
        issues={`Social score ${audit.social_score ?? "N/A"}/100. ${!lead.instagram ? "No Instagram." : ""} ${!lead.linkedin ? "No LinkedIn." : ""}`}
        recs="Create or optimize social media profiles. Increase posting frequency."
      />
    </div>
  );
}


/* ================================================================
   TAB: RECOMMENDATIONS
   ================================================================ */

function RecommendationsTab({ lead, report, audit, isLoading, generateReport }: any) {
  if (isLoading) return <TabLoader />;

  if (!report) {
    return (
      <EmptyState
        icon={Zap}
        title="No recommendations generated yet."
        description="Generate a report to unlock structured AI recommendations, pain point analysis, and service suggestions."
        actionLabel={audit ? "Generate Recommendations" : "Run Audit First"}
        onAction={() => generateReport.mutate(lead.id)}
        disabled={generateReport.isPending || !audit}
        loading={generateReport.isPending}
      />
    );
  }

  const painPoints = report.pain_points?.length ? report.pain_points : ["No specific pain points identified"];
  const services = report.recommended_solutions?.length ? report.recommended_solutions : ["No specific services recommended"];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      
      {/* 1. Pain Points Evidence */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1E293B] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
          <h3 className="text-[18px] font-bold text-white">Pain Points & Evidence</h3>
        </div>
        <div className="divide-y divide-[#1E293B]">
          {painPoints.map((point: string, idx: number) => (
            <div key={idx} className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 text-[11px] px-2 py-0.5 rounded-sm hover:bg-transparent">Evidence Verified</Badge>
              </div>
              <h4 className="text-[16px] font-bold text-slate-200 mb-2">{point}</h4>
              <p className="text-[14px] text-slate-400">
                <span className="text-slate-300 font-medium">Why it hurts them:</span> They are likely losing high-intent traffic to competitors who have optimized this area.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Detailed Service Proposals */}
      <h3 className="text-[18px] font-bold text-white mt-4 flex items-center gap-2"><Zap className="w-5 h-5 text-[#22C55E]" /> Proposed Solutions & Bundles</h3>
      
      <div className="flex flex-col gap-4">
        {services.map((service: string, idx: number) => (
          <div key={idx} className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-6 relative overflow-hidden">
            {idx === 0 && <div className="absolute top-0 right-0 bg-[#6366F1] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Top Recommendation</div>}
            
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <h4 className="text-[18px] font-bold text-[#22C55E] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> {service}
                </h4>
                <div>
                  <span className="text-[12px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Why Now?</span>
                  <p className="text-[14px] text-slate-300">Competitors are actively acquiring customers through this channel. Waiting will increase the cost to compete.</p>
                </div>
                <div className="bg-[#020617] border border-[#1E293B] rounded-lg p-4">
                  <span className="text-[12px] text-[#818CF8] uppercase tracking-wider font-semibold block mb-1">Sales Pitch Angle</span>
                  <p className="text-[14px] text-slate-200">"We noticed a gap in your funnel that's currently leaking leads. Fixing this usually results in a 20% increase in inbound inquiries within 30 days."</p>
                </div>
              </div>

              <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
                <div className="bg-[#020617] border border-[#1E293B] rounded-lg p-4 text-center">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Priority Order</span>
                  <span className="text-[15px] font-bold text-white">Phase {idx + 1}</span>
                </div>
                <div className="bg-[#020617] border border-[#1E293B] rounded-lg p-4 text-center">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Service Bundle</span>
                  <span className="text-[15px] font-bold text-white">Core Plan</span>
                </div>
                <div className="bg-[#020617] border border-[#1E293B] rounded-lg p-4 text-center">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">Estimated Pricing</span>
                  <span className="text-[18px] font-bold text-[#22C55E]">${idx === 0 ? "1,500" : "800"} / mo</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}


/* ================================================================
   TAB: OUTREACH
   ================================================================ */

function OutreachTab({ lead, outreach, report, isLoading, generateOutreach, clip }: any) {
  if (isLoading) return <TabLoader />;

  if (!outreach) {
    return (
      <EmptyState
        icon={Mail}
        title="No outreach generated yet."
        description="Generate personalized emails, WhatsApp messages, and call scripts tailored to this lead's specific pain points."
        actionLabel={report ? "Generate Outreach" : "Generate Report First"}
        onAction={() => generateOutreach.mutate(lead.id)}
        disabled={generateOutreach.isPending || !report}
        loading={generateOutreach.isPending}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* SECTION 1: WhatsApp and Call Notes (Top Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OmniCard 
          icon={MessageCircle} 
          iconColor="#22C55E" 
          title="WhatsApp Message" 
          content={outreach.whatsapp_message} 
          onCopy={() => clip(outreach.whatsapp_message)} 
        />
        <OmniCard 
          icon={PhoneCall} 
          iconColor="#6366F1" 
          title="Call Notes" 
          content={outreach.call_notes} 
          onCopy={() => clip(outreach.call_notes)} 
        />
      </div>

      {/* SECTION 2: Email Draft (Bottom Row, Full Width) */}
      <div className="w-full">
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-white flex items-center gap-2"><Mail className="w-5 h-5" /> Email Draft</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-transparent border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white h-9 text-[13px] px-4" onClick={() => clip(outreach.email_subject + "\n\n" + outreach.email_body)}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white h-9 text-[13px] px-4">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button size="sm" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white h-9 text-[13px] px-4">
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </div>
          <div className="px-6 py-4 border-b border-[#1E293B] bg-[#020617]">
            <div className="text-[12px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">Subject</div>
            <div className="text-[15px] font-medium text-white">{outreach.email_subject || "No subject"}</div>
          </div>
          <div className="p-6 whitespace-pre-wrap text-[15px] text-slate-300 leading-relaxed min-h-[250px]">
            {outreach.email_body || "No email body generated."}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ================================================================
   SHARED COMPONENTS
   ================================================================ */

function TabLoader() {
  return (
    <div className="flex items-center justify-center h-[40vh]">
      <Loader2 className="w-7 h-7 animate-spin text-[#6366F1]" />
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction, disabled, loading }: {
  icon: React.ElementType; title: string; description: string; actionLabel: string; onAction: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] bg-[#0F172A] border border-[#1E293B] rounded-xl text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-[#818CF8]" />
      </div>
      <h3 className="text-[20px] font-bold text-white mb-2">{title}</h3>
      <p className="text-[14px] text-slate-400 mb-6 max-w-md">{description}</p>
      <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white h-10 px-6 text-[13px]" onClick={onAction} disabled={disabled}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {actionLabel}
      </Button>
    </div>
  );
}

function MetaRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1E293B] last:border-0">
      <span className="text-[13px] text-slate-400">{label}</span>
      <span className={`text-[13px] font-medium ${highlight ? "text-[#818CF8]" : "text-slate-200"}`}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, highlight, fallback }: { label: string; value: string | number | null; highlight?: boolean; fallback?: string }) {
  return (
    <div className="flex py-3 px-5">
      <span className="w-2/5 text-[13px] text-slate-400 font-medium">{label}</span>
      {value ? (
        <span className={`w-3/5 text-[14px] ${highlight ? "text-[#818CF8]" : "text-slate-200"}`}>{value}</span>
      ) : (
        <span className="w-3/5 text-[14px] text-slate-500 italic">{fallback || "—"}</span>
      )}
    </div>
  );
}

function Callout({ color, title, text }: { color: string; title: string; text: string }) {
  return (
    <div className="p-5 rounded-xl border" style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}>
      <h4 className="text-[14px] font-semibold uppercase tracking-wide mb-2" style={{ color }}>{title}</h4>
      <p className="text-[14px] text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number | null }) {
  const color = score === null ? "#475569" : score >= 70 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 text-center">
      <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[22px] font-bold" style={{ color }}>{score ?? "—"}</div>
      <div className="text-[10px] text-slate-500">/100</div>
    </div>
  );
}

function AuditCard({ title, score, status, statusColor, rows, issues, recs }: {
  title: string; score: number | null; status: string; statusColor: string;
  rows: { label: string; ok?: boolean; text?: string; warn?: boolean }[];
  issues: string; recs: string;
}) {
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-white">{title}</h3>
        <Badge className="text-[11px] px-1.5 py-0.5 rounded-sm border" style={{ backgroundColor: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}30` }}>
          {status}
        </Badge>
      </div>
      {score !== null && (
        <div className="px-5 py-3 border-b border-[#1E293B] flex justify-between items-center bg-[#020617]">
          <span className="text-[13px] text-slate-400">Score</span>
          <span className="text-[18px] font-bold" style={{ color: score >= 70 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444" }}>{score}/100</span>
        </div>
      )}
      <div className="p-5 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between items-center text-[13px]">
            <span className="text-slate-400">{r.label}</span>
            {r.ok !== undefined ? (
              r.ok ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> : <XCircle className="w-4 h-4 text-[#EF4444]" />
            ) : (
              <span className={`font-medium ${r.warn ? "text-[#EF4444]" : "text-slate-200"}`}>{r.text}</span>
            )}
          </div>
        ))}
      </div>
      <div className="border-t border-[#1E293B] p-4 space-y-3">
        <div className="p-3 rounded-md bg-[#EF4444]/5 border border-[#EF4444]/10">
          <span className="text-[11px] text-[#EF4444] font-semibold block mb-1">Issues</span>
          <span className="text-[12px] text-slate-300">{issues}</span>
        </div>
        <div className="p-3 rounded-md bg-[#22C55E]/5 border border-[#22C55E]/10">
          <span className="text-[11px] text-[#22C55E] font-semibold block mb-1">Recommendations</span>
          <span className="text-[12px] text-slate-300">{recs}</span>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-[13px] font-medium text-slate-300">{value}</div>
    </div>
  );
}

function OmniCard({ icon: Icon, iconColor, title, content, onCopy }: {
  icon: React.ElementType; iconColor: string; title: string; content: string | null; onCopy: () => void;
}) {
  return (
    <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="px-6 py-5 border-b border-[#1E293B] flex items-center justify-between bg-[#020617]/50">
        <h4 className="text-[16px] font-semibold text-white flex items-center gap-2.5">
          <Icon className="w-5 h-5" style={{ color: iconColor }} /> {title}
        </h4>
        <Button variant="outline" size="sm" className="bg-transparent border-[#1E293B] text-slate-300 hover:bg-[#1E293B] hover:text-white h-8 text-[12px]" onClick={onCopy}>
          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
        </Button>
      </div>
      <div className="p-6 text-[15px] text-slate-300 whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto">
        {content || "Not generated"}
      </div>
    </div>
  );
}

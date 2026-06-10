"use client";

import { Bell, FolderKanban, Users, Activity, FileBarChart, Mail, Send, Calendar, UserCircle, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useActiveCampaign } from "@/components/providers/CampaignProvider";
import { useCampaigns } from "@/hooks/useCampaigns";

export function Header() {
  const { activeCampaignId, setActiveCampaignId } = useActiveCampaign();
  const { data: campaigns } = useCampaigns(0, 50);
  const activeCampaign = campaigns?.find(c => c.id === activeCampaignId);

  const stats = [
    { label: "Status", value: activeCampaign?.status?.replace(/_/g, " ") || "—", icon: Sparkles, color: "#22C55E" },
    { label: "Leads", value: activeCampaign?.leads_count ?? 0, icon: Users, color: "#6366F1" },
    { label: "Audits", value: activeCampaign?.audited_count ?? 0, icon: Activity, color: "#6366F1" },
    { label: "Reports", value: activeCampaign?.reports_count ?? 0, icon: FileBarChart, color: "#6366F1" },
    { label: "Outreach", value: activeCampaign?.outreach_count ?? 0, icon: Mail, color: "#6366F1" },
    { label: "Emails Sent", value: activeCampaign?.emails_sent_count ?? 0, icon: Send, color: "#22C55E" },
    { label: "Meetings", value: 0, icon: Calendar, color: "#F59E0B" },
  ];

  return (
    <header className="h-[72px] flex items-center justify-between px-5 border-b border-[#1E293B] bg-[#020617] sticky top-0 z-20 w-full shrink-0">
      {/* Left: Trigger + Campaign Selector */}
      <div className="flex items-center gap-4 min-w-0">
        <SidebarTrigger className="text-slate-500 hover:text-slate-200 shrink-0" />

        <div className="h-8 w-px bg-[#1E293B]" />

        <div className="flex items-center gap-2 bg-[#0F172A] border border-[#1E293B] rounded-md px-3 py-1.5 min-w-[220px]">
          <FolderKanban className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            className="bg-transparent border-none text-[13px] font-medium focus:ring-0 outline-none w-full cursor-pointer text-slate-200 appearance-none"
            value={activeCampaignId || ""}
            onChange={(e) => setActiveCampaignId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="" className="bg-[#0F172A] text-slate-400">Select Campaign</option>
            {campaigns?.map(c => (
              <option key={c.id} value={c.id} className="bg-[#0F172A]">{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stat Pills */}
        {activeCampaign && (
          <div className="hidden xl:flex items-center gap-1.5 ml-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-[#0F172A] border border-[#1E293B] text-slate-300 whitespace-nowrap font-medium"
              >
                <s.icon className="w-3 h-3" style={{ color: s.color }} />
                <span className="text-slate-500">{s.label}:</span>
                <span className="text-slate-200 capitalize">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100 hover:bg-[#0F172A] h-9 w-9">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
        </Button>
        <div className="h-6 w-px bg-[#1E293B]" />
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 hover:bg-[#0F172A] h-9 w-9">
          <UserCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

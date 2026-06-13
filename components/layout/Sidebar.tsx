"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  FileBarChart,
  Mail,
  Send,
  Settings,
  Rocket,
  Server,
} from "lucide-react";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Discover", icon: Search, url: "/discover" },
  { title: "Leads", icon: Users, url: "/leads" },
];

const workspaceItems = [
  { title: "Reports", icon: FileBarChart, url: "/reports" },
  { title: "Outreach", icon: Mail, url: "/outreach" },
  { title: "Email Logs", icon: Send, url: "/email-logs" },
  { title: "SMTP Pool", icon: Server, url: "/settings/smtp" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <ShadcnSidebar variant="inset" className="border-r border-[#1E293B] bg-[#0B1120] w-60">
      <SidebarHeader className="h-[72px] flex items-center px-5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5 w-full">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">LeadPilot AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                    className="px-3 py-2 rounded-md transition-all duration-150 text-slate-400 hover:text-white hover:bg-[#1E293B] data-[active=true]:bg-[#6366F1]/10 data-[active=true]:text-[#818CF8] font-medium text-[13px]"
                  >
                    <item.icon className="w-4 h-4 mr-2.5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                    className="px-3 py-2 rounded-md transition-all duration-150 text-slate-400 hover:text-white hover:bg-[#1E293B] data-[active=true]:bg-[#6366F1]/10 data-[active=true]:text-[#818CF8] font-medium text-[13px]"
                  >
                    <item.icon className="w-4 h-4 mr-2.5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#1E293B] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/settings" />}
              isActive={pathname === "/settings"}
              className="px-3 py-2 rounded-md transition-all duration-150 text-slate-400 hover:text-white hover:bg-[#1E293B] data-[active=true]:bg-[#6366F1]/10 data-[active=true]:text-[#818CF8] font-medium text-[13px]"
            >
              <Settings className="w-4 h-4 mr-2.5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

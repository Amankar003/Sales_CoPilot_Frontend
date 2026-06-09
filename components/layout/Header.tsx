"use client";

import { usePathname } from "next/navigation";
import { Bell, Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Header() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  // Capitalize first letter of each path segment
  const formatPath = (path: string) => {
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border/50 glass sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        
        <div className="hidden md:block">
          <Breadcrumb>
            <BreadcrumbList>
              {paths.length === 0 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                paths.map((path, index) => {
                  const isLast = index === paths.length - 1;
                  const url = `/${paths.slice(0, index + 1).join("/")}`;

                  return (
                    <div key={path} className="flex items-center gap-2">
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{formatPath(path)}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={url}>{formatPath(path)}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </div>
                  );
                })
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">Upgrade to Pro</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}

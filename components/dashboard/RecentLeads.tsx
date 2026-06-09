import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Business } from "@/types/business";
import { MapPin, Globe, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentLeadsProps {
  leads?: Business[];
  isLoading: boolean;
}

export function RecentLeads({ leads, isLoading }: RecentLeadsProps) {
  return (
    <Card className="glass-card border-border/40 flex flex-col h-full">
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>Latest businesses added to your pipeline.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-0 pt-0">
        <div className="space-y-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border-b border-border/20">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))
          ) : leads && leads.length > 0 ? (
            leads.map((lead) => (
              <Link 
                key={lead.id} 
                href={`/leads/${lead.id}`}
                className="flex items-start justify-between p-4 border-b border-border/20 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium group-hover:text-primary transition-colors">
                    {lead.name}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {lead.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {lead.website ? 'Has Website' : 'No Website'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                    {lead.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium">No leads found</p>
              <p className="text-xs text-muted-foreground mt-1">Start by discovering leads in your target market.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

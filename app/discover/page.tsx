"use client";

import { useState } from "react";
import { useDiscoverLeads } from "@/hooks/useLeads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search, MapPin, Building2, ListOrdered } from "lucide-react";
import { Business } from "@/types/business";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DiscoverPage() {
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState("10");
  const [results, setResults] = useState<Business[] | null>(null);
  
  const discoverMutation = useDiscoverLeads();

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sector || !location) return;

    try {
      const response = await discoverMutation.mutateAsync({
        sector,
        location,
        limit: parseInt(limit, 10) || 10,
      });
      setResults(response.leads);
    } catch (error) {
      console.error("Discovery failed", error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Discover Leads</h1>
        <p className="text-muted-foreground mt-1">
          Search for local businesses in specific sectors to add to your pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Search Criteria</CardTitle>
            <CardDescription>Enter details to find new businesses.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDiscover} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sector" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Sector / Niche
                </Label>
                <Input 
                  id="sector" 
                  placeholder="e.g. Dentists, Plumbers" 
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Location
                </Label>
                <Input 
                  id="location" 
                  placeholder="e.g. Austin, TX" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit" className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-primary" /> Max Results
                </Label>
                <Input 
                  id="limit" 
                  type="number" 
                  min="1" 
                  max="50" 
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full mt-4" 
                disabled={discoverMutation.isPending || !sector || !location}
              >
                {discoverMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Leads
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results === null 
                ? "Discovered leads will appear here." 
                : `Found ${results.length} businesses. They have been saved to your pipeline.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {discoverMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Scraping the web...</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Searching DuckDuckGo and analyzing maps data to find {sector} in {location}.
                  </p>
                </div>
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-4">
                {results.map((lead) => (
                  <div key={lead.id} className="flex items-start justify-between p-4 border border-border/50 rounded-lg hover:border-primary/50 transition-colors bg-card/30">
                    <div>
                      <h4 className="font-semibold text-lg">{lead.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <MapPin className="w-3.5 h-3.5" /> {lead.address || lead.location}
                      </p>
                      {lead.website && (
                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                          {lead.website}
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Badge variant="outline">{lead.category}</Badge>
                      <Link 
                        href={`/leads/${lead.id}`} 
                        className={buttonVariants({ variant: "secondary", size: "sm" })}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : results !== null && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>No results found for your query.</p>
                <p className="text-sm mt-1">Try broadening your location or sector.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p>Ready to discover leads</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

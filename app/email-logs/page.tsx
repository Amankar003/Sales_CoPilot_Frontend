"use client";

import { useQuery } from "@tanstack/react-query";
import { emailService } from "@/services/emailService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EmailLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["email-logs"],
    queryFn: () => emailService.getLogs(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Email Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of all automated outreach emails.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
          <CardDescription>Recent email sending attempts and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs && logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{log.recipient_email}</TableCell>
                        <TableCell>{log.business_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{log.subject}</TableCell>
                        <TableCell>
                          {log.status === "sent" ? (
                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
                            </Badge>
                          ) : log.status === "failed" ? (
                            <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/10">
                              <XCircle className="w-3 h-3 mr-1" /> Failed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {log.sent_at ? formatDistanceToNow(new Date(log.sent_at), { addSuffix: true }) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No emails have been sent yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

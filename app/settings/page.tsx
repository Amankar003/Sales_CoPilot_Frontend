"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Configure your backend connections.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Configuration is currently managed via .env files.</p>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMe, useGetStatsSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, Calendar, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useGetMe();
  
  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-muted-foreground">
          Dashboard for the 3rd Southeast Asia Ticks and Tick-Borne Diseases Symposium.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Registration Status
            </CardTitle>
            <CardDescription>Manage your delegate registration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Please ensure your registration is complete and payment is settled before the event.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/portal/registration">View Registration</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Abstract Submissions
            </CardTitle>
            <CardDescription>Submit and track your research</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">The call for abstracts is open. Submit your oral or poster presentation abstracts.</p>
            <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/portal/abstracts">Manage Abstracts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAbstracts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, FileText, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Abstracts() {
  const { data: abstracts, isLoading } = useGetAbstracts();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'under_review': return 'secondary';
      case 'revision_requested': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <PortalLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Abstracts</h1>
          <p className="text-muted-foreground">Manage your abstract submissions for the symposium.</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/portal/abstracts/new">
            <Plus className="w-4 h-4 mr-2" />
            Submit New Abstract
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : abstracts && abstracts.length > 0 ? (
        <div className="grid gap-6">
          {abstracts.map((abstract) => (
            <Card key={abstract.id}>
              <CardHeader className="flex flex-row justify-between items-start pb-2">
                <div>
                  <Badge variant="outline" className="mb-2 font-mono text-xs">{abstract.abstractCode}</Badge>
                  <CardTitle className="text-xl font-serif leading-tight">{abstract.title}</CardTitle>
                </div>
                <Badge variant={getStatusBadgeVariant(abstract.status)} className="capitalize shrink-0 ml-4">
                  {abstract.status.replace('_', ' ')}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span className="capitalize">{abstract.abstractType} Presentation</span>
                  </div>
                  {abstract.createdAt && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground">Submitted:</span> {new Date(abstract.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 border-t border-border py-3">
                <Button variant="link" className="px-0 text-primary" asChild>
                  <Link href={`/portal/abstracts/${abstract.id}`}>
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 px-4 bg-muted/30 border-dashed">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-serif font-bold mb-2">No Abstracts Submitted</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't submitted any abstracts yet. Share your research with the global tropical diseases community.
          </p>
          <Button asChild>
            <Link href="/portal/abstracts/new">Submit Your First Abstract</Link>
          </Button>
        </Card>
      )}
    </PortalLayout>
  );
}

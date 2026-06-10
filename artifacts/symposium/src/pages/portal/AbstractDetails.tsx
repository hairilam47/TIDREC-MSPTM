import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAbstract } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AbstractDetails() {
  const [, params] = useRoute("/portal/abstracts/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: abstract, isLoading } = useGetAbstract(id);

  if (isLoading) {
    return (
      <PortalLayout>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </PortalLayout>
    );
  }

  if (!abstract) {
    return (
      <PortalLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold mb-2">Abstract Not Found</h2>
          <Button asChild variant="outline">
            <Link href="/portal/abstracts">Back to Abstracts</Link>
          </Button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href="/portal/abstracts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Abstracts
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{abstract.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono bg-muted px-2 py-1 rounded">{abstract.abstractCode}</span>
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {abstract.abstractType} Presentation</span>
              <span>Submitted: {new Date(abstract.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Badge className="text-sm capitalize" variant={abstract.status === 'accepted' ? 'default' : abstract.status === 'rejected' ? 'destructive' : 'secondary'}>
            {abstract.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Abstract Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{abstract.body}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Keywords</span>
              <p>{abstract.keywords || "None provided"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">Co-Authors</span>
              <p>{abstract.coAuthors || "None provided"}</p>
            </div>
          </CardContent>
        </Card>

        {abstract.reviewNotes && (
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg text-accent">Reviewer Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{abstract.reviewNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}

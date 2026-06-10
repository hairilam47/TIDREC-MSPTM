import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useCreateAbstract } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  abstractType: z.enum(["oral", "poster"]),
  keywords: z.string().min(1, "Please provide keywords"),
  coAuthors: z.string().optional(),
  body: z.string().min(50, "Abstract body must be at least 50 characters").max(3000),
});

export default function NewAbstract() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateAbstract();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", abstractType: "poster", keywords: "", coAuthors: "", body: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Abstract Submitted", description: "Your abstract has been successfully submitted for review." });
        setLocation("/portal/abstracts");
      },
      onError: (error) => {
        toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <PortalLayout>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-muted-foreground hover:text-foreground">
          <Link href="/portal/abstracts">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Abstracts
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Submit New Abstract</h1>
        <p className="text-muted-foreground">Present your research at SATBDS 2027.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abstract Details</CardTitle>
          <CardDescription>All fields are required unless marked as optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abstract Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the full title of your presentation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="abstractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presentation Preference</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="oral">Oral Presentation</SelectItem>
                          <SelectItem value="poster">Poster Presentation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="Comma-separated (e.g. malaria, vector control, climate)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coAuthors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Co-Authors (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="List co-authors and their affiliations" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abstract Body</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your abstract text (Background, Methods, Results, Conclusion)" 
                        className="min-h-[250px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum 3000 characters. Please structure your abstract clearly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="button" variant="outline" asChild className="mr-4">
                  <Link href="/portal/abstracts">Cancel</Link>
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90">
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Abstract
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PortalLayout>
  );
}

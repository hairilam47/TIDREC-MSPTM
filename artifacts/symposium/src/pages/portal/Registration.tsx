import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetMyRegistration, useCreateRegistration } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  category: z.string().min(1, "Please select a category"),
  dietaryRequirements: z.string().optional(),
  specialNeeds: z.string().optional(),
});

export default function Registration() {
  const { data: registration, isLoading, refetch } = useGetMyRegistration();
  const createMutation = useCreateRegistration();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { category: "", dietaryRequirements: "", specialNeeds: "" },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Registration submitted", description: "Your symposium registration has been received." });
        refetch();
      },
      onError: (error) => {
        toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) return <PortalLayout><div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></PortalLayout>;

  return (
    <PortalLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Registration</h1>
        <p className="text-muted-foreground">Manage your conference registration and details.</p>
      </div>

      {registration ? (
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5 border-b border-border">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-serif text-primary">Registration Confirmed</CardTitle>
                <CardDescription>Registration ID: {registration.registrationCode}</CardDescription>
              </div>
              <Badge variant={registration.paymentStatus === 'paid' ? 'default' : 'secondary'} className="text-sm">
                {registration.paymentStatus.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attendee Information</h3>
                <p className="font-medium text-lg">{registration.firstName} {registration.lastName}</p>
                <p className="text-muted-foreground">{registration.email}</p>
                <p className="text-muted-foreground">{registration.institution}, {registration.country}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</h3>
                <p className="capitalize">{registration.category.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Payment Details</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Amount Due</span>
                    <span className="font-bold">${registration.paymentAmount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">{registration.paymentStatus}</span>
                  </div>
                  {registration.paymentStatus === 'pending' && (
                    <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                      Proceed to Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Registration</CardTitle>
            <CardDescription>Please provide additional details to finalize your registration.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="healthcare_professional">Healthcare Professional</SelectItem>
                          <SelectItem value="researcher">Researcher / Scientist</SelectItem>
                          <SelectItem value="educator">Educator</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="industry">Industry Professional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dietaryRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Requirements (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g. Vegetarian, Halal, Gluten-free" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Needs / Accessibility (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please let us know if you require any specific accommodations" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Registration
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </PortalLayout>
  );
}

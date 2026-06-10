import React from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  institution: z.string().min(1),
  country: z.string().min(1),
  category: z.enum(["healthcare_professional", "researcher", "educator", "student", "industry"]),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { 
      email: "", password: "", firstName: "", lastName: "", institution: "", country: "", category: "healthcare_professional"
    },
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        localStorage.setItem("satbds_token", res.token);
        setLocation("/portal");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-card p-8 rounded-xl shadow-lg border border-border">
        <h2 className="text-center text-3xl font-serif font-bold text-foreground mb-8">
          Create an account
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="institution" render={({ field }) => (
              <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />

            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useRegister, useCreateRegistration, useGetRegistrationCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, User, Building, CreditCard, ClipboardList } from "lucide-react";
import { Link } from "wouter";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  institution: string;
  country: string;
  registrationType: string;
  paymentType: string;
  dietaryRequirements: string;
  specialNeeds: string;
}

const PAYMENT_TYPES = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online_banking", label: "Online Banking (FPX)" },
  { value: "credit_card", label: "Credit / Debit Card" },
];

const STEPS = [
  { num: 1, label: "Account", icon: User },
  { num: 2, label: "Profile", icon: Building },
  { num: 3, label: "Registration", icon: ClipboardList },
  { num: 4, label: "Payment", icon: CreditCard },
];

export default function Register() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    email: "", password: "", confirmPassword: "",
    firstName: "", lastName: "",
    institution: "", country: "",
    registrationType: "", paymentType: "",
    dietaryRequirements: "", specialNeeds: "",
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const registrationMutation = useCreateRegistration();
  const { data: categories = [] } = useGetRegistrationCategories();

  const update = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!formData.email) return "Email is required";
      if (!formData.password || formData.password.length < 8)
        return "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match";
      if (!formData.firstName) return "First name is required";
      if (!formData.lastName) return "Last name is required";
    }
    if (step === 2) {
      if (!formData.institution) return "Institution is required";
      if (!formData.country) return "Country is required";
    }
    if (step === 3) {
      if (!formData.registrationType) return "Please select a registration category";
    }
    if (step === 4) {
      if (!formData.paymentType) return "Please select a payment method";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep();
    if (err) {
      toast({ title: "Please fix the following", description: err, variant: "destructive" });
      return;
    }
    setStep((step + 1) as Step);
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    const err = validateStep();
    if (err) {
      toast({ title: "Please fix the following", description: err, variant: "destructive" });
      return;
    }

    registerMutation.mutate({
      data: {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        institution: formData.institution,
        country: formData.country,
        category: formData.registrationType,
      },
    }, {
      onSuccess: (data) => {
        localStorage.setItem("satbds_token", data.token);
        registrationMutation.mutate({
          data: {
            category: formData.registrationType,
            dietaryRequirements: formData.dietaryRequirements || undefined,
            specialNeeds: formData.specialNeeds || undefined,
          },
        }, {
          onSuccess: () => {
            toast({
              title: "Registration complete!",
              description: "Welcome to SATBDS 2027. Your delegate portal is ready.",
            });
            window.location.href = "/portal/";
          },
          onError: () => {
            toast({
              title: "Account created",
              description: "Please complete your conference registration in your portal.",
            });
            window.location.href = "/portal/registration";
          },
        });
      },
      onError: (err: { message?: string }) => {
        toast({
          title: "Registration failed",
          description: err.message || "Please try again",
          variant: "destructive",
        });
      },
    });
  };

  const isPending = registerMutation.isPending || registrationMutation.isPending;
  const selectedType = categories.find(c => c.slug === formData.registrationType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="font-sans text-3xl font-bold text-accent cursor-pointer">SATBDS 2027</h1>
          </Link>
          <p className="text-white/60 mt-1 text-sm">22–23 March 2027 · Sunway Putra Hotel, Kuala Lumpur</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                      ? "bg-accent text-white"
                      : "bg-white/10 text-white/40"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs hidden sm:block ${isCurrent ? "text-accent font-medium" : "text-white/40"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-14 h-px mx-2 mb-5 ${step > s.num ? "bg-primary" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
        <Card className="bg-white shadow-2xl">
          {/* Step 1 — Account */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Create Your Account</CardTitle>
                <CardDescription>Enter your login credentials and full name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={e => update("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      data-testid="input-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={e => update("password", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      data-testid="input-confirm-password"
                      type="password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={e => update("confirmPassword", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      data-testid="input-first-name"
                      placeholder="Given name"
                      value={formData.firstName}
                      onChange={e => update("firstName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      data-testid="input-last-name"
                      placeholder="Family name"
                      value={formData.lastName}
                      onChange={e => update("lastName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </>
          )}

          {/* Step 2 — Professional Profile */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Professional Details</CardTitle>
                <CardDescription>Tell us about your institutional affiliation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="institution">Institution / Organisation *</Label>
                  <Input
                    id="institution"
                    data-testid="input-institution"
                    placeholder="e.g. University of Malaya"
                    value={formData.institution}
                    onChange={e => update("institution", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    data-testid="input-country"
                    placeholder="e.g. Malaysia"
                    value={formData.country}
                    onChange={e => update("country", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3 — Registration Category */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Registration Category</CardTitle>
                <CardDescription>Select the category that best describes your professional role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div data-testid="select-registration-type" className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading categories…</div>
                  ) : categories.map(cat => (
                    <label
                      key={cat.slug}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.registrationType === cat.slug
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="registrationType"
                          value={cat.slug}
                          checked={formData.registrationType === cat.slug}
                          onChange={e => update("registrationType", e.target.value)}
                        />
                        <div>
                          <div className="font-medium text-sm">{cat.label}</div>
                          {cat.description && (
                            <div className="text-xs text-muted-foreground">{cat.description}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary whitespace-nowrap ml-3">
                        MYR {cat.priceMyr.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
                <div>
                  <Label htmlFor="dietary">Dietary Requirements (Optional)</Label>
                  <Textarea
                    id="dietary"
                    data-testid="input-dietary"
                    placeholder="e.g. Halal, Vegetarian, Gluten-free"
                    value={formData.dietaryRequirements}
                    onChange={e => update("dietaryRequirements", e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="specialNeeds">Accessibility / Special Needs (Optional)</Label>
                  <Textarea
                    id="specialNeeds"
                    data-testid="input-special-needs"
                    placeholder="Let us know if you require specific accommodations"
                    value={formData.specialNeeds}
                    onChange={e => update("specialNeeds", e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4 — Payment & Review */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Payment & Review</CardTitle>
                <CardDescription>Confirm your details and select a payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary card */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    Registration Summary
                  </h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attendee</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Institution</span>
                    <span className="font-medium">{formData.institution}, {formData.country}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                    <span className="font-semibold">Category</span>
                    <span className="font-medium">{selectedType?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">Registration Fee</span>
                    <span className="font-bold text-primary text-base">
                      {selectedType ? `MYR ${selectedType.priceMyr.toLocaleString()}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Payment Method *</Label>
                  <div data-testid="select-payment-type" className="space-y-3">
                    {PAYMENT_TYPES.map(pt => (
                      <label
                        key={pt.value}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.paymentType === pt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value={pt.value}
                          checked={formData.paymentType === pt.value}
                          onChange={e => update("paymentType", e.target.value)}
                        />
                        <span className="font-medium text-sm">{pt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded p-3">
                  Payment instructions will be sent to <strong>{formData.email}</strong> after registration.
                  You can also complete payment from your delegate portal at any time.
                </p>
              </CardContent>
            </>
          )}

          {/* Navigation buttons */}
          <div className="px-6 pb-6 flex justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={goBack}
                disabled={isPending}
                data-testid="button-back"
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <Button
                onClick={goNext}
                className="bg-accent hover:bg-accent/90 text-white"
                data-testid="button-next"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-accent hover:bg-accent/90 text-white"
                data-testid="button-submit-registration"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
            )}
          </div>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}

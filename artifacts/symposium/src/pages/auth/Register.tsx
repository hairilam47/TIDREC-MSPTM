import { useState, useEffect } from "react";
import { COUNTRIES_DATA, COUNTRY_NAMES } from "@/lib/countries";
import { motion } from "framer-motion";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, User, Building, CreditCard, ClipboardList } from "lucide-react";
import { Link } from "wouter";
import logoImg from "@assets/[WEBSITE LOGO] SEAT-MSPTM.png";

type Step = 1 | 2 | 3 | 4;

const SALUTATIONS = ["Ms.", "Mr.", "Dr.", "Assoc. Prof. Dr.", "Prof. Dr.", "Dato'", "Datuk", "Datin", "Other"];

interface AddonFee {
  category: string;
  fee: string;
  amount: number;
}

interface CategoryWithEarlyBird {
  id: number;
  slug: string;
  label: string;
  priceMyr: number;
  earlyBirdPriceMyr?: number | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  salutation: string;
  salutationOther: string;
  mobileCountryCode: string;
  mobileNumber: string;
  nationality: string;
  gender: string;
  dateOfBirth: string;
  isMmaMember: string;
  mmcNumber: string;
  institution: string;
  country: string;
  registrationType: string;
  paymentType: string;
  dietaryRequirements: string;
  specialNeeds: string;
}

const PAYMENT_TYPES = [
  { value: "bank_transfer", label: "Bank Transfer", desc: "Transfer to our bank account. Payment instructions will be emailed after registration." },
  { value: "online_banking", label: "Online Banking (FPX)", desc: "Pay via your internet banking (Maybank2u, CIMB Clicks, etc.). Link sent by email." },
  { value: "credit_card", label: "Credit / Debit Card", desc: "Visa or Mastercard accepted. Secure payment link will be sent to your email." },
  { value: "e_perolehan", label: "ePerolehan", desc: "For Malaysian government agencies using the ePerolehan procurement portal. A Purchase Order (PO) number is required." },
];

const STEPS = [
  { num: 1, label: "Account", icon: User },
  { num: 2, label: "Profile", icon: Building },
  { num: 3, label: "Registration", icon: ClipboardList },
  { num: 4, label: "Payment", icon: CreditCard },
];

function parseFeeAmount(feeStr: string): number {
  const n = parseFloat(feeStr.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseEarlyBirdDeadline(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export default function Register() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    email: "", password: "", confirmPassword: "",
    fullName: "",
    salutation: "", salutationOther: "",
    mobileCountryCode: "+60", mobileNumber: "",
    nationality: "", gender: "",
    dateOfBirth: "",
    isMmaMember: "", mmcNumber: "",
    institution: "", country: "",
    registrationType: "", paymentType: "",
    dietaryRequirements: "", specialNeeds: "",
  });
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [additionalFees, setAdditionalFees] = useState<AddonFee[]>([]);
  const [isEarlyBird, setIsEarlyBird] = useState(false);
  const [earlyBirdLabel, setEarlyBirdLabel] = useState("Early Bird");
  const [earlyBirdDeadlineLabel, setEarlyBirdDeadlineLabel] = useState("");
  const [logoSize, setLogoSize] = useState("md");
  const [isPending, setIsPending] = useState(false);

  const { toast } = useToast();
  const registerMutation = useRegister();
  const [categories, setCategories] = useState<CategoryWithEarlyBird[]>([]);

  const LOGO_HEIGHT: Record<string, string> = { xs: "h-12", sm: "h-16", md: "h-24", lg: "h-32", xl: "h-40" };

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d?.register_logo_size) setLogoSize(d.register_logo_size);
        if (d?.register_early_bird_label) setEarlyBirdLabel(d.register_early_bird_label);
        if (d?.register_early_bird_deadline) setEarlyBirdDeadlineLabel(d.register_early_bird_deadline);
        const deadlineStr: string = d?.date_early_bird_closes ?? "";
        const deadline = parseEarlyBirdDeadline(deadlineStr);
        if (deadline) setIsEarlyBird(new Date() <= deadline);
        try {
          const raw = d?.register_additional_fees_json;
          const parsed: { category: string; fee: string }[] = raw ? JSON.parse(raw) : [];
          const fees: AddonFee[] = parsed.map(item => ({
            category: item.category,
            fee: item.fee,
            amount: parseFeeAmount(item.fee),
          }));
          setAdditionalFees(fees.filter(f => f.amount > 0));
        } catch {
          setAdditionalFees([]);
        }
      })
      .catch(() => {});

    fetch("/api/registration-categories")
      .then(r => r.json())
      .then((cats: CategoryWithEarlyBird[]) => {
        if (Array.isArray(cats)) setCategories(cats.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
      })
      .catch(() => {});
  }, []);

  const update = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const toggleAddon = (category: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const getEffectivePrice = (cat: CategoryWithEarlyBird): number => {
    if (isEarlyBird && cat.earlyBirdPriceMyr != null) return cat.earlyBirdPriceMyr;
    return cat.priceMyr;
  };

  const selectedType = categories.find(c => c.slug === formData.registrationType);
  const basePrice = selectedType ? getEffectivePrice(selectedType) : 0;
  const addonsTotal = additionalFees
    .filter(f => selectedAddons.has(f.category))
    .reduce((sum, f) => sum + f.amount, 0);
  const grandTotal = basePrice + addonsTotal;

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!formData.email) return "Email is required";
      if (!formData.password || formData.password.length < 8)
        return "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match";
      if (!formData.fullName.trim()) return "Full name is required";
    }
    if (step === 2) {
      if (!formData.salutation) return "Salutation is required";
      if (formData.salutation === "Other" && !formData.salutationOther.trim())
        return "Please specify your salutation";
      if (!formData.mobileCountryCode) return "Mobile country code is required";
      if (!formData.mobileNumber.trim()) return "Mobile number is required";
      if (!formData.nationality) return "Nationality is required";
      if (!formData.gender) return "Gender is required";
      if (!formData.dateOfBirth) return "Date of birth is required";
      if (!formData.isMmaMember) return "Please indicate your MMA membership status";
      if (formData.isMmaMember === "mma" && !formData.mmcNumber.trim())
        return "MMC number is required for MMA members";
      if (!formData.institution.trim()) return "Institution / Organisation is required";
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

  const isStepValid = (): boolean => {
    if (step === 1) {
      return !!formData.email && formData.password.length >= 8 && formData.password === formData.confirmPassword && !!formData.fullName.trim();
    }
    if (step === 2) {
      if (!formData.salutation || !formData.mobileCountryCode || !formData.mobileNumber.trim() || !formData.nationality || !formData.gender || !formData.dateOfBirth || !formData.isMmaMember || !formData.institution.trim() || !formData.country) return false;
      if (formData.salutation === "Other" && !formData.salutationOther.trim()) return false;
      if (formData.isMmaMember === "mma" && !formData.mmcNumber.trim()) return false;
      return true;
    }
    if (step === 3) return !!formData.registrationType;
    if (step === 4) return !!formData.paymentType;
    return false;
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

    setIsPending(true);

    const isMma = formData.isMmaMember === "mma";
    const mmcNumber = isMma ? formData.mmcNumber.trim() : "000";

    registerMutation.mutate({
      data: {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName.trim(),
        salutation: formData.salutation,
        salutationOther: formData.salutation === "Other" ? formData.salutationOther.trim() : undefined,
        mobileCountryCode: formData.mobileCountryCode,
        mobileNumber: formData.mobileNumber.trim(),
        nationality: formData.nationality,
        gender: formData.gender as "Male" | "Female",
        dateOfBirth: formData.dateOfBirth,
        isMmaMember: isMma,
        mmcNumber,
        institution: formData.institution.trim(),
        country: formData.country,
        category: formData.registrationType,
      },
    }, {
      onSuccess: async (data) => {
        localStorage.setItem("satbds_token", data.token);
        try {
          const selectedAddonItems = additionalFees
            .filter(f => selectedAddons.has(f.category))
            .map(f => ({ category: f.category, fee: f.fee, amount: f.amount }));

          const regRes = await fetch("/api/registrations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({
              category: formData.registrationType,
              dietaryRequirements: formData.dietaryRequirements || undefined,
              specialNeeds: formData.specialNeeds || undefined,
              addonsTotal: selectedAddonItems.reduce((s, i) => s + i.amount, 0),
              selectedAddons: selectedAddonItems,
              paymentMethod: formData.paymentType || undefined,
            }),
          });

          if (regRes.ok) {
            toast({
              title: "Registration complete!",
              description: "Welcome to SEAT-MSPTM 2027. Your delegate portal is ready.",
            });
            window.location.href = "/portal/";
          } else {
            toast({
              title: "Account created",
              description: "Please complete your conference registration in your portal.",
            });
            window.location.href = "/portal/registration";
          }
        } catch {
          toast({
            title: "Account created",
            description: "Please complete your conference registration in your portal.",
          });
          window.location.href = "/portal/registration";
        } finally {
          setIsPending(false);
        }
      },
      onError: (err: { message?: string }) => {
        setIsPending(false);
        toast({
          title: "Registration failed",
          description: err.message || "Please try again",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-secondary/95 to-primary/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Branding */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={logoImg} alt="SEAT-MSPTM 2027" className={`${LOGO_HEIGHT[logoSize] ?? "h-24"} w-auto object-contain mx-auto cursor-pointer`} />
          </Link>
          <p className="text-white/60 mt-2 text-sm">22–23 March 2027 · Sunway Putra Hotel, Kuala Lumpur</p>
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
                    isCompleted ? "bg-primary text-white" : isCurrent ? "bg-accent text-white" : "bg-white/10 text-white/40"
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

        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
        <Card className="bg-white shadow-2xl">

          {/* ── Step 1: Account ── */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Create Your Account</CardTitle>
                <CardDescription>Enter your login credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" data-testid="input-email" type="email" placeholder="you@example.com"
                    value={formData.email} onChange={e => update("email", e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" data-testid="input-password" type="password" placeholder="Min. 8 characters"
                      value={formData.password} onChange={e => update("password", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" data-testid="input-confirm-password" type="password" placeholder="Repeat password"
                      value={formData.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name as in IC / Passport *</Label>
                  <Input id="fullName" data-testid="input-full-name" placeholder="e.g. Ahmad bin Abdullah"
                    value={formData.fullName} onChange={e => update("fullName", e.target.value)} className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoice, receipt, conference name badge and certificate will be produced based on full name provided.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </>
          )}

          {/* ── Step 2: Profile ── */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Personal & Professional Details</CardTitle>
                <CardDescription>All fields are required</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* Salutation */}
                <div>
                  <Label className="mb-2 block">Salutation *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SALUTATIONS.map(s => (
                      <label key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm transition-all ${
                        formData.salutation === s ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <input type="radio" name="salutation" value={s}
                          checked={formData.salutation === s} onChange={e => update("salutation", e.target.value)} className="shrink-0" />
                        {s}
                      </label>
                    ))}
                  </div>
                  {formData.salutation === "Other" && (
                    <div className="mt-2">
                      <Input placeholder="Please specify your salutation"
                        value={formData.salutationOther} onChange={e => update("salutationOther", e.target.value)} />
                    </div>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <Label className="mb-1 block">Mobile Number *</Label>
                  <p className="text-xs text-muted-foreground mb-2">Please include country code</p>
                  <div className="flex gap-2">
                    <Select value={formData.mobileCountryCode} onValueChange={v => update("mobileCountryCode", v)}>
                      <SelectTrigger className="w-44 shrink-0">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {COUNTRIES_DATA.map(c => (
                          <SelectItem key={c.name} value={c.dialCode}>
                            {c.name} ({c.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="e.g. 12-3456789"
                      value={formData.mobileNumber} onChange={e => update("mobileNumber", e.target.value)} className="flex-1" />
                  </div>
                </div>

                {/* Nationality */}
                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Select value={formData.nationality} onValueChange={v => update("nationality", v)}>
                    <SelectTrigger id="nationality" className="mt-1">
                      <SelectValue placeholder="Select your nationality" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {COUNTRY_NAMES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div>
                  <Label className="mb-2 block">Gender *</Label>
                  <div className="flex gap-4">
                    {["Male", "Female"].map(g => (
                      <label key={g} className={`flex items-center gap-2 px-5 py-2 rounded-lg border-2 cursor-pointer text-sm transition-all ${
                        formData.gender === g ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <input type="radio" name="gender" value={g}
                          checked={formData.gender === g} onChange={e => update("gender", e.target.value)} />
                        {g}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input id="dateOfBirth" type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className="mt-1" />
                </div>

                {/* MMA Membership */}
                <div>
                  <Label className="mb-2 block">MMA Membership *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Required for MMA CPD submission after the event. Full name as in IC, IC number and MMC number are needed.
                  </p>
                  <div className="flex gap-4 mb-3">
                    {[
                      { value: "mma", label: "MMA Member" },
                      { value: "non_mma", label: "Non-MMA Member" },
                    ].map(opt => (
                      <label key={opt.value} className={`flex items-center gap-2 px-5 py-2 rounded-lg border-2 cursor-pointer text-sm transition-all ${
                        formData.isMmaMember === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <input type="radio" name="isMmaMember" value={opt.value}
                          checked={formData.isMmaMember === opt.value} onChange={e => update("isMmaMember", e.target.value)} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {formData.isMmaMember === "mma" && (
                    <div>
                      <Label htmlFor="mmcNumber">MMC Number *</Label>
                      <Input id="mmcNumber" placeholder="Alphanumeric, e.g. MMC12345"
                        value={formData.mmcNumber}
                        onChange={e => update("mmcNumber", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                        className="mt-1" />
                      <p className="text-xs text-muted-foreground mt-1">Alphanumeric characters only.</p>
                    </div>
                  )}
                </div>

                {/* Institution */}
                <div>
                  <Label htmlFor="institution">Institution / Organisation *</Label>
                  <Input id="institution" data-testid="input-institution" placeholder="Institution / Organisation"
                    value={formData.institution} onChange={e => update("institution", e.target.value)} className="mt-1" />
                </div>

                {/* Country */}
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={formData.country} onValueChange={v => update("country", v)}>
                    <SelectTrigger id="country" data-testid="input-country" className="mt-1">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {COUNTRY_NAMES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </CardContent>
            </>
          )}

          {/* ── Step 3: Registration Category & Add-ons ── */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Registration Category</CardTitle>
                <CardDescription>Select the category that best describes your professional role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isEarlyBird && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(14,110,116,0.1)", color: "var(--teal, #0e6e74)", border: "1px solid rgba(14,110,116,0.25)" }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{earlyBirdLabel} pricing is active{earlyBirdDeadlineLabel ? ` — ${earlyBirdDeadlineLabel}` : ""}</span>
                  </div>
                )}
                <div data-testid="select-registration-type" className="space-y-3">
                  {categories.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading categories…</div>
                  ) : categories.map(cat => {
                    const effectivePrice = getEffectivePrice(cat);
                    const hasEarlyBird = isEarlyBird && cat.earlyBirdPriceMyr != null;
                    return (
                      <label key={cat.slug} className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.registrationType === cat.slug ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="registrationType" value={cat.slug}
                            checked={formData.registrationType === cat.slug} onChange={e => update("registrationType", e.target.value)} />
                          <div>
                            <div className="font-medium text-sm">{cat.label}</div>
                            {cat.description && <div className="text-xs text-muted-foreground">{cat.description}</div>}
                          </div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <div className="text-sm font-bold text-primary">MYR {effectivePrice.toLocaleString()}</div>
                          {hasEarlyBird && <div className="text-xs line-through text-muted-foreground">MYR {cat.priceMyr.toLocaleString()}</div>}
                          {hasEarlyBird && <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--teal, #0e6e74)" }}>{earlyBirdLabel}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
                {additionalFees.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: "var(--navy, #0b2744)" }}>Optional Add-ons</p>
                    <div className="space-y-2">
                      {additionalFees.map(addon => (
                        <label key={addon.category} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedAddons.has(addon.category) ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
                        }`}>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={selectedAddons.has(addon.category)}
                              onChange={() => toggleAddon(addon.category)} className="rounded" />
                            <span className="text-sm font-medium">{addon.category}</span>
                          </div>
                          <span className="text-sm font-bold text-primary ml-3 shrink-0">MYR {addon.amount.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="dietary">Dietary Requirements (Optional)</Label>
                  <Textarea id="dietary" data-testid="input-dietary" placeholder="e.g. Halal, Vegetarian, Gluten-free"
                    value={formData.dietaryRequirements} onChange={e => update("dietaryRequirements", e.target.value)} className="mt-1" rows={2} />
                </div>
                <div>
                  <Label htmlFor="specialNeeds">Accessibility / Special Needs (Optional)</Label>
                  <Textarea id="specialNeeds" data-testid="input-special-needs" placeholder="Let us know if you require specific accommodations"
                    value={formData.specialNeeds} onChange={e => update("specialNeeds", e.target.value)} className="mt-1" rows={2} />
                </div>
              </CardContent>
            </>
          )}

          {/* ── Step 4: Payment & Review ── */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle className="font-sans text-secondary text-2xl">Payment & Review</CardTitle>
                <CardDescription>Confirm your details and select a payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Registration Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attendee</span>
                    <span className="font-medium">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{formData.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Institution</span>
                    <span className="font-medium">{formData.institution}, {formData.country}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Category</span>
                      <span className="font-medium">
                        {selectedType?.label}
                        {isEarlyBird && selectedType?.earlyBirdPriceMyr != null && (
                          <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(14,110,116,0.12)", color: "var(--teal, #0e6e74)" }}>
                            {earlyBirdLabel}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Registration Fee</span>
                      <span className="font-semibold">MYR {basePrice.toLocaleString()}</span>
                    </div>
                    {additionalFees.filter(f => selectedAddons.has(f.category)).map(addon => (
                      <div key={addon.category} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{addon.category}</span>
                        <span className="font-semibold">MYR {addon.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm border-t pt-2 mt-1">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary text-base">MYR {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-3 block">Payment Method *</Label>
                  <div data-testid="select-payment-type" className="space-y-3">
                    {PAYMENT_TYPES.map(pt => (
                      <label key={pt.value} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.paymentType === pt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                        <input type="radio" name="paymentType" value={pt.value}
                          checked={formData.paymentType === pt.value} onChange={e => update("paymentType", e.target.value)} className="mt-0.5" />
                        <div>
                          <div className="font-medium text-sm">{pt.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{pt.desc}</div>
                        </div>
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

          {/* Navigation */}
          <div className="px-6 pb-6 flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={goBack} disabled={isPending || registerMutation.isPending} data-testid="button-back">
                Back
              </Button>
            ) : <div />}
            {step < 4 ? (
              <Button onClick={goNext} disabled={!isStepValid()} className="bg-accent hover:bg-accent/90 text-white disabled:opacity-50 disabled:cursor-not-allowed" data-testid="button-next">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isPending || registerMutation.isPending}
                className="bg-accent hover:bg-accent/90 text-white" data-testid="button-submit-registration">
                {(isPending || registerMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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

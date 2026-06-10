import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useCreateAbstract } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Details", "Content", "Review"];

export default function NewAbstract() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateAbstract();
  const { toast } = useToast();
  const [step, setStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState<{ abstractCode: string } | null>(null);

  const [form, setForm] = React.useState({
    title: "",
    abstractType: "oral" as "oral" | "poster",
    keywords: "",
    coAuthors: "",
    body: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.title.trim() || form.title.length < 5) errs.title = "Title must be at least 5 characters.";
      if (!form.keywords.trim()) errs.keywords = "At least one keyword is required.";
    }
    if (step === 1) {
      if (!form.body.trim() || form.body.length < 50) errs.body = "Abstract body must be at least 50 characters.";
      if (form.body.length > 3000) errs.body = "Abstract body must be under 3000 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    createMutation.mutate(
      {
        data: {
          title: form.title,
          body: form.body,
          abstractType: form.abstractType,
          keywords: form.keywords || undefined,
          coAuthors: form.coAuthors || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setSubmitted({ abstractCode: data.abstractCode ?? "ABS-XXXX" });
        },
        onError: () => {
          toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
        },
      },
    );
  };

  if (submitted) {
    return (
      <PortalLayout title="Submit Abstract">
        <div className="max-w-md mx-auto text-center py-12">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#d1e7dd" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "#198754" }} />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2" style={{ color: "#0B2744" }}>
            Abstract Submitted!
          </h2>
          <p className="text-sm mb-3" style={{ color: "#6c757d" }}>
            Your abstract has been received and is now under review.
          </p>
          <div className="rounded-xl px-6 py-3 mb-6 inline-block" style={{ background: "#e6f4f5" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#0E6E74" }}>
              Abstract Code
            </div>
            <div className="text-[18px] font-mono font-bold" style={{ color: "#0B2744" }}>
              {submitted.abstractCode}
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setLocation("/portal/abstracts")}
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: "#0E6E74" }}
            >
              View All Abstracts
            </button>
            <button
              onClick={() => { setSubmitted(null); setStep(0); setForm({ title: "", abstractType: "oral", keywords: "", coAuthors: "", body: "" }); }}
              className="px-5 py-2.5 rounded-lg text-[13px] font-semibold"
              style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
            >
              Submit Another
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Submit Abstract">
      <div className="max-w-2xl">
        {/* Back */}
        <Link href="/portal/abstracts" className="flex items-center gap-1.5 text-[13px] mb-5 no-underline" style={{ color: "#6c757d" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Abstracts
        </Link>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold mb-1"
                  style={{
                    background: i < step ? "#198754" : i === step ? "#0E6E74" : "#e9ecef",
                    color: i <= step ? "#fff" : "#adb5bd",
                    boxShadow: i === step ? "0 0 0 3px rgba(14,110,116,0.2)" : "none",
                  }}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <div
                  className="text-[11px] font-medium"
                  style={{ color: i === step ? "#0E6E74" : i < step ? "#198754" : "#adb5bd" }}
                >
                  {s}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-5" style={{ height: 2, background: i < step ? "#198754" : "#e9ecef" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: Details */}
        {step === 0 && (
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #e9ecef" }}>
            <h2 className="text-[17px] font-serif font-bold mb-5" style={{ color: "#0B2744" }}>Abstract Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Abstract Title <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Enter the full title of your presentation"
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
                  style={{ border: `1px solid ${errors.title ? "#dc3545" : "#dee2e6"}`, fontFamily: "Inter, sans-serif" }}
                />
                {errors.title && <p className="text-[12px] mt-1" style={{ color: "#dc3545" }}>{errors.title}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Presentation Type <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <div className="flex gap-3">
                  {(["oral", "poster"] as const).map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer flex-1 justify-center"
                      style={{
                        border: form.abstractType === t ? "2px solid #0E6E74" : "1px solid #dee2e6",
                        background: form.abstractType === t ? "#e6f4f5" : "#fff",
                      }}
                    >
                      <input type="radio" name="type" value={t} checked={form.abstractType === t} onChange={() => set("abstractType", t)} className="sr-only" />
                      <span className="text-[13px] font-medium capitalize" style={{ color: form.abstractType === t ? "#0E6E74" : "#495057" }}>
                        {t} Presentation
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Keywords <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="e.g. tick-borne diseases, vector control, epidemiology"
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
                  style={{ border: `1px solid ${errors.keywords ? "#dc3545" : "#dee2e6"}`, fontFamily: "Inter, sans-serif" }}
                />
                {errors.keywords && <p className="text-[12px] mt-1" style={{ color: "#dc3545" }}>{errors.keywords}</p>}
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#495057" }}>
                  Co-Authors <span className="text-[12px] font-normal" style={{ color: "#adb5bd" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.coAuthors}
                  onChange={(e) => set("coAuthors", e.target.value)}
                  placeholder="e.g. Dr. Jane Smith (UM), Prof. Ali Hassan (USM)"
                  className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none"
                  style={{ border: "1px solid #dee2e6", fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4" style={{ borderTop: "1px solid #f1f3f5" }}>
              <button onClick={handleNext} className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white" style={{ background: "#0E6E74" }}>
                Next: Abstract Content →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Content */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #e9ecef" }}>
            <h2 className="text-[17px] font-serif font-bold mb-2" style={{ color: "#0B2744" }}>Abstract Content</h2>
            <p className="text-[13px] mb-5" style={{ color: "#6c757d" }}>
              Provide a clear, structured abstract. Recommended structure: Background, Methods, Results, Conclusion.
            </p>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium" style={{ color: "#495057" }}>
                  Abstract Body <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <span className="text-[12px]" style={{ color: form.body.length > 2800 ? "#dc3545" : "#adb5bd" }}>
                  {form.body.length}/3000
                </span>
              </div>
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                placeholder="Background: ...&#10;Methods: ...&#10;Results: ...&#10;Conclusion: ..."
                rows={12}
                className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none resize-y"
                style={{ border: `1px solid ${errors.body ? "#dc3545" : "#dee2e6"}`, fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}
              />
              {errors.body && <p className="text-[12px] mt-1" style={{ color: "#dc3545" }}>{errors.body}</p>}
            </div>
            <div className="flex justify-between mt-6 pt-4" style={{ borderTop: "1px solid #f1f3f5" }}>
              <button onClick={() => setStep(0)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>
                ← Back
              </button>
              <button onClick={handleNext} className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white" style={{ background: "#0E6E74" }}>
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6" style={{ border: "1px solid #e9ecef" }}>
            <h2 className="text-[17px] font-serif font-bold mb-5" style={{ color: "#0B2744" }}>Review & Submit</h2>
            <div className="space-y-4">
              {[
                { label: "Title", value: form.title },
                { label: "Type", value: form.abstractType === "oral" ? "Oral Presentation" : "Poster Presentation" },
                { label: "Keywords", value: form.keywords },
                { label: "Co-Authors", value: form.coAuthors || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-24 flex-shrink-0 text-[12px] font-semibold uppercase tracking-wide pt-0.5" style={{ color: "#adb5bd" }}>{label}</div>
                  <div className="text-[14px]" style={{ color: "#212529" }}>{value}</div>
                </div>
              ))}
              <div className="flex gap-4">
                <div className="w-24 flex-shrink-0 text-[12px] font-semibold uppercase tracking-wide pt-0.5" style={{ color: "#adb5bd" }}>Abstract</div>
                <div className="text-[13px] rounded-lg p-4 flex-1" style={{ background: "#f8f9fa", color: "#495057", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {form.body}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-6 pt-4" style={{ borderTop: "1px solid #f1f3f5" }}>
              <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg text-[13px] font-medium" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>
                ← Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white"
                style={{ background: "#0E6E74" }}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Abstract
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

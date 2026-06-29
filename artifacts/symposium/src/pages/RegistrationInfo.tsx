import { useState, useEffect } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarCheck, Camera } from "lucide-react";

function parseSafe<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

const DEFAULT_ENTITLEMENTS = [
  "Admission to all scientific sessions",
  "Conference materials",
  "Certificate of attendance (e-certificate)",
  "Opening Ceremony",
  "Closing Ceremony",
  "Coffee Breaks",
  "Lunches",
  "Welcome Reception",
];
const DEFAULT_ADDITIONAL_FEES = [{ category: "Gala Dinner", fee: "MYR XX" }];
const DEFAULT_CANCEL_BEFORE = ["Refund of 70% of the registration fee after deduction of administrative charges."];
const DEFAULT_CANCEL_AFTER = ["No refund will be made.", "Delegates may nominate a substitute participant."];
const DEFAULT_CANCEL_NOTES = [
  "All cancellation requests must be submitted via email to events@msptm.network",
  "Refunds for registration fees will be processed after the conclusion of SEAT-MSPTM 2027.",
  "Confirmed refunds will be issued after the conference, via bank transfer or credit card, according to your initial payment method.",
  "Participants are responsible for any bank charges associated with the refund process.",
];
const DEFAULT_DISCLAIMER = [
  "The Organising Committee reserves the right to change programme details, dates, or speakers without prior notice.",
  "The Committee reserves the right to postpone or cancel the conference if necessary.",
  "The Organisers shall not be responsible for losses resulting from programme changes, postponement, or cancellation.",
];

interface Category {
  id: number;
  slug: string;
  label: string;
  priceMyr: number;
  earlyBirdPriceMyr: number | null;
  description: string | null;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold" style={{ color: "var(--navy)" }}>{children}</h2>
      <div className="h-0.5 w-10 rounded-full mt-1.5" style={{ background: "var(--gold)" }} />
    </div>
  );
}

export default function RegistrationInfo() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings).catch(() => {});
    fetch("/api/registration-categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const s = (key: string, fallback = "") => settings[key] ?? fallback;

  const entitlements = parseSafe<string[]>(s("register_entitlements_json"), DEFAULT_ENTITLEMENTS);
  const additionalFees = parseSafe<{ category: string; fee: string }[]>(s("register_additional_fees_json"), DEFAULT_ADDITIONAL_FEES);
  const cancelBeforePolicy = parseSafe<string[]>(s("register_cancel_before_policy_json"), DEFAULT_CANCEL_BEFORE);
  const cancelAfterPolicy = parseSafe<string[]>(s("register_cancel_after_policy_json"), DEFAULT_CANCEL_AFTER);
  const cancelNotes = parseSafe<string[]>(s("register_cancel_notes_json"), DEFAULT_CANCEL_NOTES);
  const disclaimers = parseSafe<string[]>(s("register_disclaimer_json"), DEFAULT_DISCLAIMER);

  const hasEarlyBird = categories.some(c => c.earlyBirdPriceMyr != null);
  const contactEmail = s("contact_email", "events@msptm.network");

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-surface, #f5f6f8)" }}>
      <SiteHeader />

      {/* ── Hero banner ── */}
      <section
        className="relative py-20 text-center"
        style={{ background: "linear-gradient(135deg, var(--navy) 0%, #163a60 60%, #0e6e74 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            {s("register_page_hero_heading", "Registration")}
          </h1>
          <p className="text-white/60 text-sm">
            {s("event_dates", "22–23 March 2027")} · {s("event_venue", "Sunway Putra Hotel")}, {s("event_city", "Kuala Lumpur, Malaysia")}
          </p>
        </div>
      </section>

      {/* ── Page content ── */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* ── Intro / CTA block ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
            style={{ background: "rgba(14,110,116,0.08)", border: "2px solid rgba(14,110,116,0.25)" }}
          >
            <CalendarCheck className="w-7 h-7" style={{ color: "var(--teal)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--navy)" }}>
            {s("register_page_intro_title", "Register for SEAT-MSPTM 2027")}
          </h2>
          <p className="text-muted-foreground mb-6">{s("register_page_status", "Registration is now open.")}</p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-base h-11">
            <Link href="/register">Register Now</Link>
          </Button>
        </div>

        {/* ── Registration Fees ── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <SectionHeading>Registration Fees</SectionHeading>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--navy)" }}>
                  <th className="text-left px-5 py-4 text-white font-semibold text-sm">Category</th>
                  {hasEarlyBird && (
                    <th className="text-right px-5 py-4 text-white font-semibold whitespace-nowrap text-sm">
                      {s("register_early_bird_label", "Early Bird")}
                      <br />
                      <span className="text-white/60 text-xs font-normal">
                        {s("register_early_bird_deadline", "Until 31 Dec 2026")}
                      </span>
                    </th>
                  )}
                  <th className="text-right px-5 py-4 text-white font-semibold whitespace-nowrap text-sm">
                    {s("register_regular_label", "Regular")}
                    <br />
                    <span className="text-white/60 text-xs font-normal">
                      {s("register_regular_deadline", "Until 15 Feb 2027")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium" style={{ color: "var(--navy)" }}>{cat.label}</td>
                    {hasEarlyBird && (
                      <td className="px-5 py-3.5 text-right font-semibold" style={{ color: "var(--teal)" }}>
                        {cat.earlyBirdPriceMyr != null
                          ? `MYR ${cat.earlyBirdPriceMyr.toLocaleString()}`
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-right font-bold" style={{ color: "var(--navy)" }}>
                      MYR {cat.priceMyr.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {s("register_fees_notes") && (
            <div
              className="mt-4 text-xs leading-relaxed whitespace-pre-line rounded-lg px-4 py-3 border"
              style={{ background: "#fafafa", color: "var(--text-muted, #6b7280)", borderColor: "var(--border-color, #e5e7eb)" }}
            >
              {s("register_fees_notes")}
            </div>
          )}
        </section>

        {/* ── Additional Fees ── */}
        {additionalFees.length > 0 && (
          <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
            <SectionHeading>Additional Fees</SectionHeading>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--navy)" }}>
                    <th className="text-left px-5 py-4 text-white font-semibold text-sm">Category</th>
                    <th className="text-right px-5 py-4 text-white font-semibold text-sm">Flat Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {additionalFees.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium" style={{ color: "var(--navy)" }}>{row.category}</td>
                      <td className="px-5 py-3.5 text-right font-bold" style={{ color: "var(--navy)" }}>{row.fee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Entitlements ── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <SectionHeading>{s("register_entitlements_heading", "Conference Delegates Entitlements")}</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entitlements.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-lg border border-border">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "var(--teal)" }} />
                <span className="text-sm" style={{ color: "var(--navy)" }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cancellation & Refund ── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <SectionHeading>{s("register_cancel_heading", "Cancellation and Refund Policy")}</SectionHeading>
          <p className="text-sm text-muted-foreground mb-5">
            Any cancellation of registration should be communicated in writing and will be subject to the following conditions:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Before deadline */}
            <div className="rounded-xl border p-5" style={{ borderColor: "rgba(14,110,116,0.3)", background: "rgba(14,110,116,0.04)" }}>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(14,110,116,0.12)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--teal)" }}>
                    {s("register_cancel_before_label", "Cancellation received ON or BEFORE")}
                  </p>
                  <p className="font-bold text-sm mt-1" style={{ color: "var(--navy)" }}>
                    {s("register_cancel_before_date", "31 December 2026")}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {cancelBeforePolicy.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--teal)" }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After deadline */}
            <div className="rounded-xl border p-5" style={{ borderColor: "rgba(200,155,60,0.4)", background: "rgba(200,155,60,0.04)" }}>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(200,155,60,0.12)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--gold)" }}>
                    {s("register_cancel_after_label", "Cancellation received AFTER")}
                  </p>
                  <p className="font-bold text-sm mt-1" style={{ color: "var(--navy)" }}>
                    {s("register_cancel_after_date", "31 December 2026 or NO SHOW")}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {cancelAfterPolicy.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--gold)" }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {cancelNotes.length > 0 && (
            <ul className="space-y-2">
              {cancelNotes.map((note, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--navy)" }}>•</span>
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Disclaimer ── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
          <SectionHeading>{s("register_disclaimer_heading", "Disclaimer")}</SectionHeading>
          <ul className="space-y-2.5">
            {disclaimers.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2.5">
                <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--navy)" }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Photo Release ── */}
        <section className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-10">
          <SectionHeading>{s("register_photo_heading", "Photo Release Policy")}</SectionHeading>
          <div className="flex gap-4 items-start">
            <div
              className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(11,39,68,0.07)" }}
            >
              <Camera className="w-5 h-5" style={{ color: "var(--navy)" }} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {s(
                "register_photo_policy",
                "By registering for SEAT-MSPTM 2027, participants consent to photography, videography, and recording during the conference. Images and recordings may be used in future promotional, educational, and archival materials related to the symposium.",
              )}
            </p>
          </div>
        </section>

        {/* ── Contact footer ── */}
        <p className="text-center text-sm text-muted-foreground border-t border-border pt-8 pb-4">
          For any enquiries, please contact the Conference Secretariat at{" "}
          <a href={`mailto:${contactEmail}`} className="font-semibold hover:underline" style={{ color: "var(--teal)" }}>
            {contactEmail}
          </a>
        </p>

      </div>
    </div>
  );
}

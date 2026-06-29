import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Save, Info, FileText, Upload, X, ImageIcon, Loader2, Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@assets/[WEBSITE LOGO] SEAT-MSPTM.png";

const LOGO_SIZES: { key: string; label: string; heightPx: number; tailwind: string }[] = [
  { key: "xs", label: "Extra Small", heightPx: 48,  tailwind: "h-12" },
  { key: "sm", label: "Small",       heightPx: 64,  tailwind: "h-16" },
  { key: "md", label: "Medium",      heightPx: 96,  tailwind: "h-24" },
  { key: "lg", label: "Large",       heightPx: 128, tailwind: "h-32" },
  { key: "xl", label: "Extra Large", heightPx: 160, tailwind: "h-40" },
];

const API = "/api";

type Field = { key: string; label: string; type: string; placeholder?: string };
type FieldGroup = { label: string; hint?: string; fields: Field[] };

const FIELD_GROUPS: FieldGroup[] = [
  {
    label: "Event Details",
    hint: "Appears on: all pages — header, banner alt text, footer",
    fields: [
      { key: "event_name", label: "Full Event Name", type: "text" },
      { key: "event_short_name", label: "Short Name", type: "text" },
      { key: "event_dates", label: "Event Dates", type: "text", placeholder: "22–23 March 2027" },
      { key: "event_venue", label: "Venue", type: "text" },
      { key: "event_city", label: "City / Country", type: "text" },
    ],
  },
  {
    label: "Marketing Site Content",
    hint: "Appears on: Home page — About section",
    fields: [
      { key: "hero_subtitle", label: "Hero Subtitle (second paragraph)", type: "textarea" },
      { key: "about_text", label: "About Section (main paragraph)", type: "textarea" },
    ],
  },
  {
    label: "Contact & Venue",
    hint: "Appears on: Contact page, Home page venue strip",
    fields: [
      { key: "contact_email", label: "Contact Email", type: "text" },
      { key: "contact_maps_url", label: "Google Maps URL", type: "text" },
      { key: "venue_website_url", label: "Venue Website URL", type: "text" },
    ],
  },
  {
    label: "Organisers",
    hint: "Short names used in admin; full names appear on the Contact page",
    fields: [
      { key: "organiser_primary", label: "Primary Organiser (short name)", type: "text" },
      { key: "organiser_secondary", label: "Co-Organiser (short name)", type: "text" },
      { key: "organiser_full_primary", label: "Primary Organiser (full name)", type: "text" },
      { key: "organiser_full_secondary", label: "Co-Organiser (full name)", type: "text" },
      { key: "organiser_full_tertiary", label: "3rd Organiser (full name)", type: "text", placeholder: "Universiti Teknologi MARA (UiTM)" },
      { key: "co_organiser_uitm_website_url", label: "UiTM Website URL", type: "text", placeholder: "https://www.uitm.edu.my" },
    ],
  },
  {
    label: "Abstract Key Dates",
    hint: "Appears on: Portal — Call for Abstracts page",
    fields: [
      { key: "date_call_for_abstract_opens", label: "Call for Abstract Opens", type: "text", placeholder: "1 August 2026" },
      { key: "date_abstract_submission_deadline", label: "Abstract Submission Deadline", type: "text", placeholder: "30 December 2026" },
      { key: "date_abstract_result_notification", label: "Abstract Result Notification", type: "text", placeholder: "15 January 2027" },
    ],
  },
  {
    label: "Registration Settings",
    hint: "Used in the admin dashboard and registration reports",
    fields: [
      { key: "registration_target", label: "Registration Target (delegates)", type: "text" },
      { key: "abstract_deadline", label: "Abstract Submission Deadline", type: "text" },
      { key: "early_bird_deadline", label: "Early Bird Registration Deadline", type: "text" },
    ],
  },
  {
    label: "Abstract Guidelines",
    hint: "Appears on: Portal — Call for Abstracts page",
    fields: [
      { key: "guideline_submission", label: "General Submission Guidelines", type: "textarea" },
      { key: "guideline_mode", label: "Presentation Mode", type: "textarea" },
      { key: "guideline_oral", label: "Oral Presentation", type: "textarea" },
      { key: "guideline_poster", label: "Poster Presentation", type: "textarea" },
      { key: "guideline_competition", label: "Student Competition", type: "textarea" },
      { key: "guideline_consent", label: "Author Consent Statement", type: "textarea" },
    ],
  },
];

const INPUT_CLS =
  "w-full px-3.5 py-3 rounded-lg text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[var(--teal-focus)] focus:border-[var(--primary)]";

export default function AdminSettings() {
  const { toast } = useToast();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingProspectus, setUploadingProspectus] = React.useState(false);
  const [prospectusError, setProspectusError] = React.useState<string | null>(null);
  const [uploadingAnnouncement, setUploadingAnnouncement] = React.useState(false);
  const [announcementError, setAnnouncementError] = React.useState<string | null>(null);
  const [uploadingLogoKey, setUploadingLogoKey] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);

  const importantDates = React.useMemo<{ label: string; date: string }[]>(() => {
    try {
      const raw = values.important_dates_json;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* ignore */ }
    return [];
  }, [values.important_dates_json]);

  const setDates = (next: { label: string; date: string }[]) => {
    set("important_dates_json", JSON.stringify(next));
  };

  const updateDate = (i: number, field: "label" | "date", val: string) =>
    setDates(importantDates.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const addDate = () =>
    setDates([...importantDates, { label: "", date: "" }]);

  const removeDate = (i: number) =>
    setDates(importantDates.filter((_, idx) => idx !== i));

  const moveDate = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= importantDates.length) return;
    const next = [...importantDates];
    [next[i], next[j]] = [next[j], next[i]];
    setDates(next);
  };

  const additionalFees = React.useMemo<{ category: string; fee: string }[]>(() => {
    try { const p = JSON.parse(values.register_additional_fees_json ?? ""); if (Array.isArray(p)) return p; } catch { /* ignore */ }
    return [];
  }, [values.register_additional_fees_json]);
  const setFees = (next: { category: string; fee: string }[]) => set("register_additional_fees_json", JSON.stringify(next));

  const entitlementItems = React.useMemo<string[]>(() => {
    try { const p = JSON.parse(values.register_entitlements_json ?? ""); if (Array.isArray(p)) return p; } catch { /* ignore */ }
    return [];
  }, [values.register_entitlements_json]);
  const setEntitlements = (next: string[]) => set("register_entitlements_json", JSON.stringify(next));

  const cancelBeforeItems = React.useMemo<string[]>(() => {
    try { const p = JSON.parse(values.register_cancel_before_policy_json ?? ""); if (Array.isArray(p)) return p; } catch { /* ignore */ }
    return [];
  }, [values.register_cancel_before_policy_json]);
  const setCancelBefore = (next: string[]) => set("register_cancel_before_policy_json", JSON.stringify(next));

  const cancelAfterItems = React.useMemo<string[]>(() => {
    try { const p = JSON.parse(values.register_cancel_after_policy_json ?? ""); if (Array.isArray(p)) return p; } catch { /* ignore */ }
    return [];
  }, [values.register_cancel_after_policy_json]);
  const setCancelAfter = (next: string[]) => set("register_cancel_after_policy_json", JSON.stringify(next));

  const cancelNoteItems = React.useMemo<string[]>(() => {
    try { const p = JSON.parse(values.register_cancel_notes_json ?? ""); if (Array.isArray(p)) return p; } catch { /* ignore */ }
    return [];
  }, [values.register_cancel_notes_json]);
  const setCancelNotes = (next: string[]) => set("register_cancel_notes_json", JSON.stringify(next));

  const disclaimerItems = React.useMemo<string[]>(() => {
    try { const p = JSON.parse(values.register_disclaimer_json ?? ""); if (Array.isArray(p)) return p; } catch { /* ignore */ }
    return [];
  }, [values.register_disclaimer_json]);

  const handleAnnouncementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setAnnouncementError("Only PDF files are allowed.");
      return;
    }
    setUploadingAnnouncement(true);
    setAnnouncementError(null);
    try {
      const token = localStorage.getItem("satbds_token");
      const urlRes = await fetch(`${API}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: "application/pdf" }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" },
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");
      set("first_announcement_url", objectPath);
      toast({ title: "PDF uploaded — click Save Changes to publish." });
    } catch (err) {
      setAnnouncementError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingAnnouncement(false);
      e.target.value = "";
    }
  };

  const handleProspectusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setProspectusError("Only PDF files are allowed.");
      return;
    }
    setUploadingProspectus(true);
    setProspectusError(null);
    try {
      const token = localStorage.getItem("satbds_token");
      const urlRes = await fetch(`${API}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: "application/pdf" }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" },
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");
      set("sponsor_prospectus_url", objectPath);
      toast({ title: "PDF uploaded — click Save Changes to publish." });
    } catch (err) {
      setProspectusError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingProspectus(false);
      e.target.value = "";
    }
  };

  const handleLogoUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const inputEl = e.target;
    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file (PNG, JPG, SVG, etc.).");
      return;
    }
    setUploadingLogoKey(key);
    setLogoError(null);
    try {
      const token = localStorage.getItem("satbds_token");
      const contentType = file.type || "application/octet-stream";
      const urlRes = await fetch(`${API}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType }),
      });
      if (!urlRes.ok) {
        const body = await urlRes.json().catch(() => ({}));
        throw new Error(body.error || `Failed to get upload URL (HTTP ${urlRes.status})`);
      }
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": contentType } });
      if (!putRes.ok) throw new Error(`Upload to storage failed (HTTP ${putRes.status})`);
      const saveRes = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: objectPath }),
      });
      if (!saveRes.ok) throw new Error(`Failed to save logo (HTTP ${saveRes.status})`);
      const updated = await saveRes.json();
      setValues(updated);
      toast({ title: "Logo uploaded successfully." });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogoKey(null);
      try { inputEl.value = ""; } catch { /* ignore */ }
    }
  };

  const handleLogoRemove = async (key: string) => {
    setUploadingLogoKey(key);
    setLogoError(null);
    try {
      const token = localStorage.getItem("satbds_token");
      const saveRes = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: "" }),
      });
      if (!saveRes.ok) throw new Error(`Failed to remove logo (HTTP ${saveRes.status})`);
      const updated = await saveRes.json();
      setValues(updated);
      toast({ title: "Logo removed." });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setUploadingLogoKey(null);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem("satbds_token");
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setValues(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    setSaving(true);
    const token = localStorage.getItem("satbds_token");
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setValues(updated);
      toast({ title: "Settings saved" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="text-center py-20" style={{ color: "var(--text-disabled)" }}>Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
          <Info className="w-4 h-4 flex-shrink-0" />
          Changes reflect on the marketing site and portal after saving.
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">

        {/* ── Standard field groups ── */}
        {FIELD_GROUPS.map((group) => (
          <div key={group.label} className="card">
            <div className="card-body">
              <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>{group.label}</h3>
              {group.hint && (
                <p className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>{group.hint}</p>
              )}
              {!group.hint && <div className="mb-5" />}
              <div className="space-y-4">
                {group.fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                      {f.label}
                    </label>
                    {f.type === "textarea" ? (
                      <textarea
                        value={values[f.key] ?? ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        rows={3}
                        className={`${INPUT_CLS} resize-none`}
                        style={{ border: "1px solid var(--border-color)", lineHeight: 1.7 }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[f.key] ?? ""}
                        onChange={(e) => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className={INPUT_CLS}
                        style={{ border: "1px solid var(--border-color)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* ── Registration Page Branding ── */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>Registration Page</h3>
            <p className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
              Appears on: Registration page — logo size above the form
            </p>

            <p className="text-[13px] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Logo Size</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {LOGO_SIZES.map(s => {
                const selected = (values.register_logo_size ?? "md") === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => set("register_logo_size", s.key)}
                    style={{
                      border: selected ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                      borderRadius: 10,
                      padding: "12px 8px",
                      background: selected ? "var(--primary-lt)" : "var(--bg-surface)",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      position: "relative",
                      transition: "border 0.12s, background 0.12s",
                    }}
                  >
                    {selected && (
                      <CheckCircle2 style={{ position: "absolute", top: 6, right: 6, width: 14, height: 14, color: "var(--primary)" }} />
                    )}
                    <div style={{ height: s.heightPx, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={logoImg} alt="" style={{ height: s.heightPx, width: "auto", objectFit: "contain", maxWidth: 100 }} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: selected ? "var(--primary)" : "var(--text)", lineHeight: 1.3 }}>{s.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{s.heightPx}px</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Registration Info Page ── */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>Registration Info Page</h3>
            <p className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
              Appears on: Marketing site — /registration page (fees, entitlements, cancellation policy, etc.)
            </p>

            {/* Intro */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-secondary)" }}>Page Intro</p>
            <div className="space-y-4 mb-6">
              {[
                { key: "register_page_hero_heading", label: "Hero Heading" },
                { key: "register_page_intro_title", label: "Intro Title" },
                { key: "register_page_status", label: "Status Line (shown under title)" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
                  <input type="text" value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
                </div>
              ))}
            </div>

            {/* Fee column labels */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-secondary)" }}>Fee Table Column Labels</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { key: "register_early_bird_label", label: "Early Bird Label" },
                { key: "register_early_bird_deadline", label: "Early Bird Deadline (shown below header)" },
                { key: "register_regular_label", label: "Regular Label" },
                { key: "register_regular_deadline", label: "Regular Deadline (shown below header)" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
                  <input type="text" value={values[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
                </div>
              ))}
            </div>

            {/* Additional Fees */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-3" style={{ color: "var(--text-secondary)" }}>Additional Fees Table</p>
            <div className="space-y-2 mb-2">
              {additionalFees.length === 0 && (
                <p className="text-[13px] italic py-2 text-center" style={{ color: "var(--text-disabled)" }}>No additional fees added yet.</p>
              )}
              {additionalFees.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={row.category} onChange={e => setFees(additionalFees.map((r, j) => j === i ? { ...r, category: e.target.value } : r))} placeholder="Category (e.g. Gala Dinner)" className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: "1 1 0" }} />
                  <input type="text" value={row.fee} onChange={e => setFees(additionalFees.map((r, j) => j === i ? { ...r, fee: e.target.value } : r))} placeholder="Fee (e.g. MYR 250)" className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: "0 0 160px" }} />
                  <button type="button" onClick={() => setFees(additionalFees.filter((_, j) => j !== i))} className="btn btn-sm flex-shrink-0" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setFees([...additionalFees, { category: "", fee: "" }])} className="btn btn-sm flex items-center gap-1.5 mb-6" style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}>
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>

            {/* Fees Notes */}
            <div className="mb-6">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Fees Footnotes</label>
              <textarea value={values.register_fees_notes ?? ""} onChange={e => set("register_fees_notes", e.target.value)} rows={5} className={`${INPUT_CLS} resize-none`} style={{ border: "1px solid var(--border-color)", lineHeight: 1.7 }} />
            </div>

            {/* Entitlements */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Conference Entitlements</p>
            <div className="mb-2">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Section Heading</label>
              <input type="text" value={values.register_entitlements_heading ?? ""} onChange={e => set("register_entitlements_heading", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
            </div>
            <div className="space-y-2 mb-2">
              {entitlementItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={item} onChange={e => setEntitlements(entitlementItems.map((v, j) => j === i ? e.target.value : v))} placeholder="Entitlement item" className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: 1 }} />
                  <button type="button" onClick={() => setEntitlements(entitlementItems.filter((_, j) => j !== i))} className="btn btn-sm flex-shrink-0" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setEntitlements([...entitlementItems, ""])} className="btn btn-sm flex items-center gap-1.5 mb-6" style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}>
              <Plus className="w-3.5 h-3.5" /> Add Entitlement
            </button>

            {/* Cancellation Policy */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Cancellation &amp; Refund Policy</p>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Section Heading</label>
              <input type="text" value={values.register_cancel_heading ?? ""} onChange={e => set("register_cancel_heading", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Before-deadline Label</label>
                <input type="text" value={values.register_cancel_before_label ?? ""} onChange={e => set("register_cancel_before_label", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Before-deadline Date</label>
                <input type="text" value={values.register_cancel_before_date ?? ""} onChange={e => set("register_cancel_before_date", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Before-deadline Policy Items</label>
              <div className="space-y-2 mb-1">
                {cancelBeforeItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={item} onChange={e => setCancelBefore(cancelBeforeItems.map((v, j) => j === i ? e.target.value : v))} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: 1 }} />
                    <button type="button" onClick={() => setCancelBefore(cancelBeforeItems.filter((_, j) => j !== i))} className="btn btn-sm flex-shrink-0" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setCancelBefore([...cancelBeforeItems, ""])} className="btn btn-sm flex items-center gap-1.5" style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}><Plus className="w-3.5 h-3.5" /> Add</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>After-deadline Label</label>
                <input type="text" value={values.register_cancel_after_label ?? ""} onChange={e => set("register_cancel_after_label", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>After-deadline Date</label>
                <input type="text" value={values.register_cancel_after_date ?? ""} onChange={e => set("register_cancel_after_date", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>After-deadline Policy Items</label>
              <div className="space-y-2 mb-1">
                {cancelAfterItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={item} onChange={e => setCancelAfter(cancelAfterItems.map((v, j) => j === i ? e.target.value : v))} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: 1 }} />
                    <button type="button" onClick={() => setCancelAfter(cancelAfterItems.filter((_, j) => j !== i))} className="btn btn-sm flex-shrink-0" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setCancelAfter([...cancelAfterItems, ""])} className="btn btn-sm flex items-center gap-1.5" style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}><Plus className="w-3.5 h-3.5" /> Add</button>
            </div>
            <div className="mb-6">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Cancellation Notes (shown below policy cards)</label>
              <div className="space-y-2 mb-1">
                {cancelNoteItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={item} onChange={e => setCancelNotes(cancelNoteItems.map((v, j) => j === i ? e.target.value : v))} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: 1 }} />
                    <button type="button" onClick={() => setCancelNotes(cancelNoteItems.filter((_, j) => j !== i))} className="btn btn-sm flex-shrink-0" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setCancelNotes([...cancelNoteItems, ""])} className="btn btn-sm flex items-center gap-1.5" style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}><Plus className="w-3.5 h-3.5" /> Add Note</button>
            </div>

            {/* Disclaimer */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Disclaimer</p>
            <div className="mb-2">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Section Heading</label>
              <input type="text" value={values.register_disclaimer_heading ?? ""} onChange={e => set("register_disclaimer_heading", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
            </div>
            <div className="space-y-2 mb-1">
              {disclaimerItems.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={item} onChange={e => set("register_disclaimer_json", JSON.stringify(disclaimerItems.map((v, j) => j === i ? e.target.value : v)))} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)", flex: 1 }} />
                  <button type="button" onClick={() => set("register_disclaimer_json", JSON.stringify(disclaimerItems.filter((_, j) => j !== i)))} className="btn btn-sm flex-shrink-0" style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => set("register_disclaimer_json", JSON.stringify([...disclaimerItems, ""]))} className="btn btn-sm flex items-center gap-1.5 mb-6" style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}><Plus className="w-3.5 h-3.5" /> Add Item</button>

            {/* Photo Release */}
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2" style={{ color: "var(--text-secondary)" }}>Photo Release Policy</p>
            <div className="mb-2">
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Section Heading</label>
              <input type="text" value={values.register_photo_heading ?? ""} onChange={e => set("register_photo_heading", e.target.value)} className={INPUT_CLS} style={{ border: "1px solid var(--border-color)" }} />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>Policy Text</label>
              <textarea value={values.register_photo_policy ?? ""} onChange={e => set("register_photo_policy", e.target.value)} rows={3} className={`${INPUT_CLS} resize-none`} style={{ border: "1px solid var(--border-color)", lineHeight: 1.7 }} />
            </div>
          </div>
        </div>

        {/* ── Important Dates (dynamic) ── */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>Important Dates</h3>
            <p className="text-[12px] mb-5" style={{ color: "var(--text-muted)" }}>
              Appears on: Home page — Important Dates panel. Add, edit, reorder, or remove rows freely.
            </p>

            <div className="space-y-2 mb-4">
              {importantDates.length === 0 && (
                <p className="text-[13px] italic py-3 text-center" style={{ color: "var(--text-disabled)" }}>
                  No dates added yet. Click "Add Date" to get started.
                </p>
              )}
              {importantDates.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  {/* Up / Down */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveDate(i, -1)}
                      disabled={i === 0}
                      className="btn btn-sm flex items-center justify-center disabled:opacity-30"
                      style={{ width: 24, height: 22, padding: 0, border: "1px solid var(--border-color)" }}
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDate(i, 1)}
                      disabled={i === importantDates.length - 1}
                      className="btn btn-sm flex items-center justify-center disabled:opacity-30"
                      style={{ width: 24, height: 22, padding: 0, border: "1px solid var(--border-color)" }}
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Label */}
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateDate(i, "label", e.target.value)}
                    placeholder="Label (e.g. Registration Opens)"
                    className={INPUT_CLS}
                    style={{ border: "1px solid var(--border-color)", flex: "1 1 0" }}
                  />

                  {/* Date */}
                  <input
                    type="text"
                    value={row.date}
                    onChange={(e) => updateDate(i, "date", e.target.value)}
                    placeholder="Date (e.g. 10 Aug 2026)"
                    className={INPUT_CLS}
                    style={{ border: "1px solid var(--border-color)", flex: "0 0 180px" }}
                  />

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeDate(i)}
                    className="btn btn-sm flex-shrink-0 flex items-center gap-1"
                    style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                    title="Remove row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addDate}
              className="btn btn-sm flex items-center gap-1.5"
              style={{ border: "1px dashed var(--border-color)", color: "var(--text-muted)" }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Date
            </button>
          </div>
        </div>

        {/* ── First Announcement ── */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>First Announcement</h3>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
              Upload a PDF to add a "First Announcement" item to the About dropdown on the marketing site.
            </p>

            {values.first_announcement_url ? (
              <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ background: "var(--primary-lt)", border: "1px solid var(--teal-focus)" }}>
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                <span className="text-[13px] flex-1" style={{ color: "var(--text)", fontWeight: 500 }}>
                  First Announcement PDF is configured
                </span>
                <button
                  onClick={() => { set("first_announcement_url", ""); setAnnouncementError(null); }}
                  className="btn btn-sm"
                  style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <p className="text-[13px] mb-4 italic" style={{ color: "var(--text-disabled)" }}>
                No PDF uploaded yet. The dropdown item will be hidden until a PDF is added.
              </p>
            )}

            <label
              className="btn btn-primary"
              style={{
                opacity: uploadingAnnouncement ? 0.6 : 1,
                pointerEvents: uploadingAnnouncement ? "none" : "auto",
                cursor: uploadingAnnouncement ? "default" : "pointer",
              }}
            >
              <Upload className="w-4 h-4" />
              {uploadingAnnouncement ? "Uploading…" : values.first_announcement_url ? "Replace PDF" : "Upload PDF"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploadingAnnouncement}
                onChange={handleAnnouncementUpload}
              />
            </label>

            {announcementError && (
              <p className="text-[12px] mt-2" style={{ color: "var(--status-danger-text)" }}>{announcementError}</p>
            )}
          </div>
        </div>

        {/* ── Sponsor Prospectus ── */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>Sponsor Prospectus</h3>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
              Upload a PDF to enable the "Sponsor Prospectus" menu item on the marketing site. Visitors can click it to download the file directly.
            </p>

            {values.sponsor_prospectus_url ? (
              <div className="flex items-center gap-3 p-3 rounded-lg mb-4" style={{ background: "var(--primary-lt)", border: "1px solid var(--teal-focus)" }}>
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
                <span className="text-[13px] flex-1" style={{ color: "var(--text)", fontWeight: 500 }}>
                  Prospectus PDF is configured
                </span>
                <button
                  onClick={() => { set("sponsor_prospectus_url", ""); setProspectusError(null); }}
                  className="btn btn-sm"
                  style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <p className="text-[13px] mb-4 italic" style={{ color: "var(--text-disabled)" }}>
                No prospectus uploaded yet. The menu item will be hidden until a PDF is added.
              </p>
            )}

            <label
              className="btn btn-primary"
              style={{
                opacity: uploadingProspectus ? 0.6 : 1,
                pointerEvents: uploadingProspectus ? "none" : "auto",
                cursor: uploadingProspectus ? "default" : "pointer",
              }}
            >
              <Upload className="w-4 h-4" />
              {uploadingProspectus ? "Uploading…" : values.sponsor_prospectus_url ? "Replace PDF" : "Upload PDF"}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploadingProspectus}
                onChange={handleProspectusUpload}
              />
            </label>

            {prospectusError && (
              <p className="text-[12px] mt-2" style={{ color: "var(--status-danger-text)" }}>{prospectusError}</p>
            )}
          </div>
        </div>

        {/* ── Co-organiser & Venue Logos ── */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>Co-organiser &amp; Venue Logos</h3>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
              Upload logos for the co-organiser cards shown on the marketing site home page. Images save immediately — no need to click Save Changes.
            </p>

            {(
              [
                { key: "co_organiser_tidrec_logo", slug: "tidrec", label: "TIDREC", desc: "Tropical Infectious Diseases Research & Education Centre" },
                { key: "co_organiser_msptm_logo", slug: "msptm", label: "MSPTM", desc: "Malaysian Society of Parasitology and Tropical Medicine" },
                { key: "co_organiser_uitm_logo", slug: "uitm", label: "UiTM", desc: "Universiti Teknologi MARA" },
                { key: "venue_logo", slug: "venue", label: "Venue — Sunway Putra Hotel", desc: "Hotel / venue logo" },
              ] as const
            ).map(({ key, slug, label, desc }) => {
              const hasLogo = Boolean(values[key]);
              const isBusy = uploadingLogoKey === key;
              return (
                <div key={key} className="flex items-start gap-4 py-4 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                  <div
                    className="flex-shrink-0 w-28 h-20 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{ border: "1px solid var(--border-color)", background: "var(--bg-subtle, #f8f9fa)" }}
                  >
                    {hasLogo ? (
                      <img
                        src={`${API}/co-organiser-logo/${slug}`}
                        alt={label}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8" style={{ color: "var(--text-disabled)" }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{label}</p>
                    <p className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>{hasLogo ? "Logo uploaded" : desc}</p>
                    <div className="flex flex-wrap gap-2">
                      <label
                        className="btn btn-sm btn-primary flex items-center gap-1.5"
                        style={{ opacity: isBusy ? 0.6 : 1, pointerEvents: isBusy ? "none" : "auto", cursor: isBusy ? "default" : "pointer" }}
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {isBusy ? "Uploading…" : hasLogo ? "Replace" : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isBusy}
                          onChange={(e) => handleLogoUpload(key, e)}
                        />
                      </label>
                      {hasLogo && (
                        <button
                          className="btn btn-sm"
                          disabled={isBusy}
                          onClick={() => handleLogoRemove(key)}
                          style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {logoError && (
              <p className="text-[12px] mt-3" style={{ color: "var(--status-danger-text)" }}>{logoError}</p>
            )}
          </div>
        </div>

      </div>

      {/* Sticky bottom save bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background: "var(--bg-frosted)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid var(--border-color)",
          boxShadow: `0 -2px 12px var(--shadow-xs)`,
        }}
      >
        <p className="text-[13px] hidden sm:block" style={{ color: "var(--text-muted)" }}>
          Changes will reflect on the marketing site and portal after saving.
        </p>
        <button
          onClick={save}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-60 ml-auto"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="h-20" />
    </AdminLayout>
  );
}

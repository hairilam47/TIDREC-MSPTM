import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Save, Info, FileText, Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API = `${BASE_URL}/api`;

const FIELD_GROUPS = [
  {
    label: "Event Details",
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
    fields: [
      { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
      { key: "about_text", label: "About Section", type: "textarea" },
    ],
  },
  {
    label: "Important Dates",
    fields: [
      { key: "date_registration_opens", label: "Registration Opens", type: "text", placeholder: "10 Aug 2026" },
      { key: "date_early_bird_closes", label: "Early Bird Registration Closes", type: "text", placeholder: "05 Oct 2026" },
      { key: "date_abstract_submission_closes", label: "Abstract Submission Closes", type: "text", placeholder: "31 Jan 2027" },
      { key: "date_regular_submission_closes", label: "Regular Submission Closes", type: "text", placeholder: "10 Feb 2027" },
      { key: "date_conference", label: "Conference Dates", type: "text", placeholder: "22–23 Mar 2027" },
    ],
  },
  {
    label: "Abstract Key Dates",
    fields: [
      { key: "date_call_for_abstract_opens", label: "Call for Abstract Opens", type: "text", placeholder: "1 August 2026" },
      { key: "date_abstract_submission_deadline", label: "Abstract Submission Deadline", type: "text", placeholder: "30 December 2026" },
      { key: "date_abstract_result_notification", label: "Abstract Result Notification", type: "text", placeholder: "15 January 2027" },
    ],
  },
  {
    label: "Registration Settings",
    fields: [
      { key: "registration_target", label: "Registration Target (delegates)", type: "text" },
      { key: "abstract_deadline", label: "Abstract Submission Deadline", type: "text" },
      { key: "early_bird_deadline", label: "Early Bird Registration Deadline", type: "text" },
    ],
  },
  {
    label: "Organisers",
    fields: [
      { key: "organiser_primary", label: "Primary Organiser", type: "text" },
      { key: "organiser_secondary", label: "Co-Organiser", type: "text" },
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
    if (!file.type.startsWith("image/")) {
      setLogoError("Please upload an image file (PNG, JPG, SVG, etc.).");
      return;
    }
    setUploadingLogoKey(key);
    setLogoError(null);
    try {
      const token = localStorage.getItem("satbds_token");
      const urlRes = await fetch(`${API}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!putRes.ok) throw new Error("Upload to storage failed");
      const saveRes = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: objectPath }),
      });
      if (!saveRes.ok) throw new Error("Failed to save logo path");
      const updated = await saveRes.json();
      setValues(updated);
      toast({ title: "Logo uploaded successfully." });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingLogoKey(null);
      e.target.value = "";
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
      if (!saveRes.ok) throw new Error("Failed to remove logo");
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
        {FIELD_GROUPS.map((group) => (
          <div key={group.label} className="card">
            <div className="card-body">
              <h3 className="text-[14px] font-semibold mb-5" style={{ color: "var(--text)" }}>{group.label}</h3>
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
                        placeholder={(f as { placeholder?: string }).placeholder}
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

        {/* First Announcement */}
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

        {/* Sponsor Prospectus */}
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

        {/* Co-organiser & Venue Logos */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-[14px] font-semibold mb-1" style={{ color: "var(--text)" }}>Co-organiser &amp; Venue Logos</h3>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
              Upload logos for the co-organiser cards shown on the marketing site home page. Images save immediately — no need to click Save Changes.
            </p>

            {(
              [
                { key: "co_organiser_tidrec_logo", slug: "tidrec", label: "TIDREC@UM", desc: "Tropical Infectious Diseases Research & Education Centre" },
                { key: "co_organiser_msptm_logo", slug: "msptm", label: "MSPTM", desc: "Malaysian Society of Parasitology and Tropical Medicine" },
                { key: "venue_logo", slug: "venue", label: "Venue — Sunway Putra Hotel", desc: "Hotel / venue logo" },
              ] as const
            ).map(({ key, slug, label, desc }) => {
              const hasLogo = Boolean(values[key]);
              const isBusy = uploadingLogoKey === key;
              return (
                <div key={key} className="flex items-start gap-4 py-4 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                  {/* Preview */}
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

                  {/* Info + buttons */}
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

      {/* Spacer so last card isn't hidden behind sticky bar */}
      <div className="h-20" />
    </AdminLayout>
  );
}

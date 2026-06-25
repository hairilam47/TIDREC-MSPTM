import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Save, Info, FileText, Upload, X } from "lucide-react";
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

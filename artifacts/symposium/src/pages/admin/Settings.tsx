import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Save, Info } from "lucide-react";
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

export default function AdminSettings() {
  const { toast } = useToast();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

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
    return <AdminLayout title="Settings"><div className="text-center py-20" style={{ color: "#adb5bd" }}>Loading…</div></AdminLayout>;
  }

  return (
    <AdminLayout title="Settings">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: "#6c757d" }}>
          <Info className="w-4 h-4" />
          Changes to content will reflect on the marketing site and portal after saving.
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {FIELD_GROUPS.map((group) => (
          <div key={group.label} className="bg-white rounded-xl p-6" style={{ border: "1px solid #e9ecef" }}>
            <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#0B2744" }}>{group.label}</h3>
            <div className="space-y-4">
              {group.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color: "#495057" }}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      value={values[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                      style={{ border: "1px solid #dee2e6", lineHeight: 1.7 }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                      style={{ border: "1px solid #dee2e6" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

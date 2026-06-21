import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSpeakers, useCreateSpeaker, useUpdateSpeaker, useDeleteSpeaker, SpeakerTier } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpeakerInput } from "@workspace/api-client-react";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

const BLANK: SpeakerInput = { name: "", country: "", institution: "", topic: "", bio: "", photoUrl: "", speakerTier: null };

const TIER_OPTIONS: { value: SpeakerTier | ""; label: string }[] = [
  { value: "", label: "— No tier assigned —" },
  { value: SpeakerTier.keynote, label: "Keynote Speaker" },
  { value: SpeakerTier.plenary, label: "Plenary Speaker" },
  { value: SpeakerTier.invited, label: "Invited Speaker" },
];

const TIER_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  keynote: { label: "Keynote", bg: "#fff3cd", color: "#856404" },
  plenary: { label: "Plenary", bg: "#d1ecf1", color: "#0c5460" },
  invited: { label: "Invited", bg: "#d4edda", color: "#155724" },
};

export default function AdminSpeakers() {
  const { data: speakers, refetch } = useGetSpeakers();
  const createMutation = useCreateSpeaker();
  const updateMutation = useUpdateSpeaker();
  const deleteMutation = useDeleteSpeaker();
  const { toast } = useToast();
  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<SpeakerInput>({ ...BLANK });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const set = (k: keyof SpeakerInput, v: string | null) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (s: NonNullable<typeof speakers>[0]) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      country: s.country,
      institution: s.institution ?? "",
      topic: s.topic,
      bio: s.bio ?? "",
      photoUrl: s.photoUrl ?? "",
      speakerTier: s.speakerTier ?? null,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.topic.trim()) e.topic = "Research topic is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: SpeakerInput = {
      name: form.name,
      country: form.country,
      topic: form.topic,
      institution: form.institution || undefined,
      bio: form.bio || undefined,
      photoUrl: form.photoUrl || undefined,
      speakerTier: form.speakerTier || null,
    };
    const onSuccess = () => { refetch(); setShowModal(false); toast({ title: editId ? "Speaker updated" : "Speaker added" }); };
    const onError = () => toast({ title: "Save failed", variant: "destructive" });
    if (editId) {
      updateMutation.mutate({ id: editId, data }, { onSuccess, onError });
    } else {
      createMutation.mutate({ data }, { onSuccess, onError });
    }
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate({ id: deleteId }, {
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Speaker deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout title="Speakers">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{speakers?.length ?? 0} speakers</span>
        <button
          className="btn btn-sm"
          style={{ background: "var(--primary)", color: "#fff", borderColor: "var(--primary-dk)", transition: "none" }}
          onClick={openCreate}
        >
          <Plus style={{ width: 14, height: 14 }} /> Add Speaker
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {(speakers ?? []).map((s) => {
          const tierMeta = s.speakerTier ? TIER_LABELS[s.speakerTier] : null;
          return (
            <div key={s.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, background: "linear-gradient(135deg, var(--primary-lt), var(--bg-surface-secondary))" }}>
                <span className="font-sans" style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>
                  {s.initials}
                </span>
              </div>
              <div className="card-body" style={{ paddingTop: 12, paddingBottom: 8 }}>
                {tierMeta && (
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 20, background: tierMeta.bg, color: tierMeta.color, marginBottom: 6 }}>
                    {tierMeta.label}
                  </span>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--primary)", marginBottom: 2 }}>{s.topic}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {s.institution ? `${s.institution}, ` : ""}{s.country}
                </div>
              </div>
              <div className="card-footer" style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(s)}>
                  <Pencil style={{ width: 13, height: 13 }} /> Edit
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: "#f8d7da", color: "#842029", borderColor: "#f1aeb5" }}
                  onClick={() => setDeleteId(s.id)}
                >
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          );
        })}
        {(speakers ?? []).length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", fontSize: 14, color: "var(--text-muted)" }}>
            No speakers yet. Add the first one.
          </div>
        )}
      </div>

      {showModal && (
        <ModalShell
          title={editId ? "Edit Speaker" : "Add Speaker"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ opacity: (createMutation.isPending || updateMutation.isPending) ? 0.6 : 1 }}
              >
                {editId ? "Save Changes" : "Add Speaker"}
              </button>
            </>
          }
        >
          <FormField label="Full Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Prof. Janet Cox-Singh"
              className={INPUT_BASE}
              style={inputBorder(errors.name)}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Country" required error={errors.country}>
              <input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="e.g. United Kingdom"
                className={INPUT_BASE}
                style={inputBorder(errors.country)}
              />
            </FormField>
            <FormField label="Institution" hint="Optional">
              <input
                value={form.institution ?? ""}
                onChange={(e) => set("institution", e.target.value)}
                placeholder="e.g. University of St Andrews"
                className={INPUT_BASE}
                style={inputBorder()}
              />
            </FormField>
          </div>

          <FormField label="Speaker Tier" hint="Controls how the speaker is grouped on the public Speakers page">
            <select
              value={form.speakerTier ?? ""}
              onChange={(e) => set("speakerTier", e.target.value || null)}
              className={INPUT_BASE}
              style={inputBorder()}
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Research Topic / Talk Title" required error={errors.topic}>
            <input
              value={form.topic}
              onChange={(e) => set("topic", e.target.value)}
              placeholder="e.g. Tick-borne Disease Transmission Dynamics"
              className={INPUT_BASE}
              style={inputBorder(errors.topic)}
            />
          </FormField>

          <FormField label="Biography" hint="Optional — brief overview of research focus">
            <textarea
              value={form.bio ?? ""}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
              placeholder="Short professional biography…"
              className={TEXTAREA_BASE}
              style={inputBorder()}
            />
          </FormField>

          <FormField label="Photo URL" hint="Optional — direct link to a portrait image">
            <input
              value={form.photoUrl ?? ""}
              onChange={(e) => set("photoUrl", e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className={INPUT_BASE}
              style={inputBorder()}
            />
          </FormField>
        </ModalShell>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Speaker?"
          message="This speaker will be permanently removed. Any sessions assigned to them will have their speaker cleared."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

import React from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useGetSpeakers, useCreateSpeaker, useUpdateSpeaker, useDeleteSpeaker,
  useReorderSpeakers, SpeakerTier,
} from "@workspace/api-client-react";
import type { Speaker, SpeakerInput } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

const BLANK: SpeakerInput = { name: "", country: "", institution: "", topic: "", bio: "", photoUrl: "", speakerTier: null };

const TIER_OPTIONS: { value: SpeakerTier | ""; label: string }[] = [
  { value: "", label: "— No tier assigned —" },
  { value: SpeakerTier.keynote, label: "Keynote Speaker" },
  { value: SpeakerTier.plenary, label: "Plenary Speaker" },
  { value: SpeakerTier.invited, label: "Invited Speaker" },
];

const TIER_GROUPS: { key: SpeakerTier | null; label: string; bg: string; color: string }[] = [
  { key: SpeakerTier.keynote, label: "Keynote Speakers",  bg: "var(--gold-lt)",  color: "var(--gold-dk)" },
  { key: SpeakerTier.plenary, label: "Plenary Speakers",  bg: "var(--cyan-lt)",  color: "var(--cyan)" },
  { key: SpeakerTier.invited, label: "Invited Speakers",  bg: "var(--green-lt)", color: "var(--green)" },
  { key: null,                label: "Other / Unassigned", bg: "var(--border-color)", color: "var(--text-secondary)" },
];

function SpeakerRow({
  speaker, isDragging, isDragOver,
  onDragStart, onDragEnter, onDragEnd, onDragOver, onDrop,
  onEdit, onDelete,
}: {
  speaker: Speaker;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photoSrc = resolveImageUrl(speaker.photoUrl);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        border: isDragOver ? "2px dashed var(--primary)" : "1px solid var(--border)",
        background: isDragging ? "var(--bg-surface-secondary)" : isDragOver ? "var(--primary-lt)" : "var(--bg-surface)",
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        transition: "background 0.12s, border 0.12s, opacity 0.12s",
        userSelect: "none",
      }}
    >
      <GripVertical style={{ width: 16, height: 16, color: "var(--text-muted)", flexShrink: 0 }} />

      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, var(--primary-lt), var(--bg-surface-secondary))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photoSrc ? (
          <img src={photoSrc} alt={speaker.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{speaker.initials}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {speaker.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {speaker.topic}{speaker.institution ? ` · ${speaker.institution}` : ""}{speaker.country ? `, ${speaker.country}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit">
          <Pencil style={{ width: 12, height: 12 }} />
        </button>
        <button
          className="btn btn-sm"
          style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          <Trash2 style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  );
}

function DraggableGroup({
  group, speakers, onEdit, onDelete, onReorder,
}: {
  group: typeof TIER_GROUPS[0];
  speakers: Speaker[];
  onEdit: (s: Speaker) => void;
  onDelete: (id: number) => void;
  onReorder: (reordered: Speaker[]) => void;
}) {
  const [local, setLocal] = React.useState(speakers);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  React.useEffect(() => { setLocal(speakers); }, [speakers]);

  const handleDragStart = (idx: number) => { setDragIdx(idx); setOverIdx(null); };

  const handleDragEnter = (idx: number) => {
    if (dragIdx === null || idx === dragIdx) return;
    setOverIdx(idx);
    const reordered = [...local];
    const [dragged] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, dragged);
    setLocal(reordered);
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
    onReorder(local);
  };

  if (local.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 20, background: group.bg, color: group.color, flexShrink: 0 }}>
          {group.label}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {local.length} {local.length === 1 ? "speaker" : "speakers"}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
          <GripVertical style={{ width: 12, height: 12 }} /> drag to reorder
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {local.map((s, idx) => (
          <SpeakerRow
            key={s.id}
            speaker={s}
            isDragging={dragIdx === idx}
            isDragOver={overIdx === idx && dragIdx !== idx}
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { setDragIdx(null); setOverIdx(null); }}
            onEdit={() => onEdit(s)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminSpeakers() {
  const { data: speakers, refetch } = useGetSpeakers();
  const createMutation = useCreateSpeaker();
  const updateMutation = useUpdateSpeaker();
  const deleteMutation = useDeleteSpeaker();
  const reorderMutation = useReorderSpeakers();
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
  const openEdit = (s: Speaker) => {
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

  const handleReorder = (reordered: Speaker[]) => {
    const items = reordered.map((s, idx) => ({ id: s.id, sortOrder: idx + 1 }));
    reorderMutation.mutate({ items }, {
      onSuccess: () => refetch(),
      onError: () => toast({ title: "Failed to save order", variant: "destructive" }),
    });
  };

  const grouped = TIER_GROUPS.map((g) => ({
    ...g,
    speakers: (speakers ?? []).filter((s) =>
      g.key === null ? !s.speakerTier : s.speakerTier === g.key
    ),
  }));

  return (
    <AdminLayout title="Speakers">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {speakers?.length ?? 0} speakers across {grouped.filter(g => g.speakers.length > 0).length} groups
        </span>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus style={{ width: 14, height: 14 }} /> Add Speaker
        </button>
      </div>

      {grouped.every(g => g.speakers.length === 0) && (
        <div style={{ textAlign: "center", padding: "48px 0", fontSize: 14, color: "var(--text-muted)" }}>
          No speakers yet. Add the first one.
        </div>
      )}

      {grouped.map((group) => (
        <DraggableGroup
          key={group.key ?? "__unassigned__"}
          group={group}
          speakers={group.speakers}
          onEdit={openEdit}
          onDelete={(id) => setDeleteId(id)}
          onReorder={handleReorder}
        />
      ))}

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
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Prof. Janet Cox-Singh" className={INPUT_BASE} style={inputBorder(errors.name)} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FormField label="Country" required error={errors.country}>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="e.g. United Kingdom" className={INPUT_BASE} style={inputBorder(errors.country)} />
            </FormField>
            <FormField label="Institution" hint="Optional">
              <input value={form.institution ?? ""} onChange={(e) => set("institution", e.target.value)} placeholder="e.g. University of St Andrews" className={INPUT_BASE} style={inputBorder()} />
            </FormField>
          </div>

          <FormField label="Speaker Tier" hint="Controls how the speaker is grouped on the public Speakers page">
            <select value={form.speakerTier ?? ""} onChange={(e) => set("speakerTier", e.target.value || null)} className={INPUT_BASE} style={inputBorder()}>
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Research Topic / Talk Title" required error={errors.topic}>
            <input value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Tick-borne Disease Transmission Dynamics" className={INPUT_BASE} style={inputBorder(errors.topic)} />
          </FormField>

          <FormField label="Biography" hint="Optional — brief overview of research focus">
            <textarea value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="Short professional biography…" className={TEXTAREA_BASE} style={inputBorder()} />
          </FormField>

          <FormField label="Speaker Photo" hint="Optional — PNG, JPG, or WebP portrait image">
            <ImageUploadField value={form.photoUrl ?? ""} onChange={(path) => set("photoUrl", path)} accept="image/png,image/jpeg,image/webp" />
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

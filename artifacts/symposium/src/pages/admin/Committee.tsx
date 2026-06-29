import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, inputBorder } from "@/components/ui/form-primitives";
import {
  useGetCommitteeMembers,
  useCreateCommitteeMember,
  useUpdateCommitteeMember,
  useDeleteCommitteeMember,
  useReorderCommitteeMembers,
  CommitteeLevel,
} from "@workspace/api-client-react";
import type { CommitteeMember, CommitteeMemberInput } from "@workspace/api-client-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

const BLANK: CommitteeMemberInput = {
  name: "",
  title: "",
  photoUrl: "",
  committeeLevel: CommitteeLevel.international_advisory,
  subcommitteeName: "",
  sortOrder: 0,
};

const LEVEL_OPTIONS = [
  { value: CommitteeLevel.international_advisory, label: "International Advisory Committee" },
  { value: CommitteeLevel.local_organising,       label: "Local Organising Committee" },
  { value: CommitteeLevel.subcommittee,           label: "Subcommittee" },
];

const LEVEL_GROUPS: { key: CommitteeLevel; label: string; bg: string; color: string }[] = [
  { key: CommitteeLevel.international_advisory, label: "International Advisory Committee", bg: "var(--cyan-lt)",  color: "var(--cyan)" },
  { key: CommitteeLevel.local_organising,       label: "Local Organising Committee",       bg: "var(--gold-lt)",  color: "var(--gold-dk)" },
  { key: CommitteeLevel.subcommittee,           label: "Subcommittees",                    bg: "var(--green-lt)", color: "var(--green)" },
];

function MemberRow({
  member,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
}: {
  member: CommitteeMember;
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
  const photoSrc = resolveImageUrl(member.photoUrl);

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
      <GripVertical style={{ width: 16, height: 16, color: "var(--text-muted)", flexShrink: 0, cursor: "grab" }} />

      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, var(--primary-lt), var(--bg-surface-secondary))", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photoSrc ? (
          <img src={photoSrc} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{member.initials}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{member.name}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {member.title}{member.subcommitteeName ? ` · ${member.subcommitteeName}` : ""}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Edit"
        >
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
  group,
  members,
  onEdit,
  onDelete,
  onReorder,
}: {
  group: typeof LEVEL_GROUPS[0];
  members: CommitteeMember[];
  onEdit: (m: CommitteeMember) => void;
  onDelete: (id: number) => void;
  onReorder: (reordered: CommitteeMember[]) => void;
}) {
  const [localMembers, setLocalMembers] = React.useState(members);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  React.useEffect(() => { setLocalMembers(members); }, [members]);

  const handleDragStart = (idx: number) => {
    setDragIdx(idx);
    setOverIdx(null);
  };

  const handleDragEnter = (idx: number) => {
    if (dragIdx === null || idx === dragIdx) return;
    setOverIdx(idx);
    const reordered = [...localMembers];
    const [dragged] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, dragged);
    setLocalMembers(reordered);
    setDragIdx(idx);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
    onReorder(localMembers);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  if (localMembers.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 20, background: group.bg, color: group.color, flexShrink: 0 }}>
          {group.label}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{localMembers.length} {localMembers.length === 1 ? "member" : "members"}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, opacity: 0.7 }}>
          <GripVertical style={{ width: 12, height: 12 }} /> drag to reorder
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {localMembers.map((m, idx) => (
          <MemberRow
            key={m.id}
            member={m}
            isDragging={dragIdx === idx}
            isDragOver={overIdx === idx && dragIdx !== idx}
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onEdit={() => onEdit(m)}
            onDelete={() => onDelete(m.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminCommittee() {
  const { data: members, refetch } = useGetCommitteeMembers();
  const createMutation = useCreateCommitteeMember();
  const updateMutation = useUpdateCommitteeMember();
  const deleteMutation = useDeleteCommitteeMember();
  const reorderMutation = useReorderCommitteeMembers();
  const { toast } = useToast();

  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<CommitteeMemberInput>({ ...BLANK });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const set = (k: keyof CommitteeMemberInput, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (m: CommitteeMember) => {
    setEditId(m.id);
    setForm({
      name: m.name,
      title: m.title,
      photoUrl: m.photoUrl ?? "",
      committeeLevel: m.committeeLevel as CommitteeLevel,
      subcommitteeName: m.subcommitteeName ?? "",
      sortOrder: m.sortOrder,
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.title.trim()) e.title = "Role / title is required";
    if (!form.committeeLevel) e.committeeLevel = "Committee level is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: CommitteeMemberInput = {
      name: form.name,
      title: form.title,
      photoUrl: form.photoUrl || undefined,
      committeeLevel: form.committeeLevel,
      subcommitteeName: form.subcommitteeName || undefined,
      sortOrder: Number(form.sortOrder) || 0,
    };
    const onSuccess = () => { refetch(); setShowModal(false); toast({ title: editId ? "Member updated" : "Member added" }); };
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
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Member removed" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  const handleReorder = (groupKey: CommitteeLevel, reordered: CommitteeMember[]) => {
    const items = reordered.map((m, idx) => ({ id: m.id, sortOrder: idx + 1 }));
    reorderMutation.mutate({ items }, {
      onSuccess: () => refetch(),
      onError: () => toast({ title: "Failed to save order", variant: "destructive" }),
    });
  };

  const grouped = LEVEL_GROUPS.map((g) => ({
    ...g,
    members: (members ?? []).filter((m) => m.committeeLevel === g.key),
  }));

  return (
    <AdminLayout title="Committee">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{members?.length ?? 0} members across {grouped.filter(g => g.members.length > 0).length} groups</span>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus style={{ width: 14, height: 14 }} /> Add Member
        </button>
      </div>

      {grouped.every(g => g.members.length === 0) && (
        <div style={{ textAlign: "center", padding: "48px 0", fontSize: 14, color: "var(--text-muted)" }}>
          No committee members yet. Add the first one.
        </div>
      )}

      {grouped.map((group) => (
        <DraggableGroup
          key={group.key}
          group={group}
          members={group.members}
          onEdit={openEdit}
          onDelete={(id) => setDeleteId(id)}
          onReorder={(reordered) => handleReorder(group.key, reordered)}
        />
      ))}

      {showModal && (
        <ModalShell
          title={editId ? "Edit Member" : "Add Committee Member"}
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
                {editId ? "Save Changes" : "Add Member"}
              </button>
            </>
          }
        >
          <FormField label="Full Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Prof. Ahmad Sulaiman"
              className={INPUT_BASE}
              style={inputBorder(errors.name)}
            />
          </FormField>

          <FormField label="Role / Title" required error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Professor of Tropical Medicine"
              className={INPUT_BASE}
              style={inputBorder(errors.title)}
            />
          </FormField>

          <FormField label="Committee Level" required error={errors.committeeLevel}>
            <select
              value={form.committeeLevel}
              onChange={(e) => set("committeeLevel", e.target.value)}
              className={INPUT_BASE}
              style={inputBorder(errors.committeeLevel)}
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>

          {form.committeeLevel === CommitteeLevel.subcommittee && (
            <FormField label="Subcommittee Name" hint="e.g. Scientific Programme, Logistics">
              <input
                value={form.subcommitteeName ?? ""}
                onChange={(e) => set("subcommitteeName", e.target.value)}
                placeholder="e.g. Scientific Programme Committee"
                className={INPUT_BASE}
                style={inputBorder()}
              />
            </FormField>
          )}

          <FormField label="Photo" hint="Optional — PNG, JPG, or WebP portrait">
            <ImageUploadField
              value={form.photoUrl ?? ""}
              onChange={(path) => set("photoUrl", path)}
              accept="image/png,image/jpeg,image/webp"
            />
          </FormField>
        </ModalShell>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Remove Committee Member?"
          message="This member will be permanently removed from the committee list."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

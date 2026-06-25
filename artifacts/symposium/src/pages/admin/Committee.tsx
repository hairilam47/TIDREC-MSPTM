import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, inputBorder } from "@/components/ui/form-primitives";
import {
  useGetCommitteeMembers,
  useCreateCommitteeMember,
  useUpdateCommitteeMember,
  useDeleteCommitteeMember,
  CommitteeLevel,
} from "@workspace/api-client-react";
import type { CommitteeMemberInput } from "@workspace/api-client-react";
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
  { value: CommitteeLevel.local_organising, label: "Local Organising Committee" },
  { value: CommitteeLevel.subcommittee, label: "Subcommittee" },
];

const LEVEL_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  international_advisory: { label: "International Advisory", bg: "var(--cyan-lt)",  color: "var(--cyan)" },
  local_organising:       { label: "Local Organising",       bg: "var(--gold-lt)",  color: "var(--gold-dk)" },
  subcommittee:           { label: "Subcommittee",           bg: "var(--green-lt)", color: "var(--green)" },
};

export default function AdminCommittee() {
  const { data: members, refetch } = useGetCommitteeMembers();
  const createMutation = useCreateCommitteeMember();
  const updateMutation = useUpdateCommitteeMember();
  const deleteMutation = useDeleteCommitteeMember();
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
  const openEdit = (m: NonNullable<typeof members>[0]) => {
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
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Member deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <AdminLayout title="Committee">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{members?.length ?? 0} members</span>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus style={{ width: 14, height: 14 }} /> Add Member
        </button>
      </div>

      <div className="row col-3">
        {(members ?? []).map((m) => {
          const lvl = LEVEL_LABELS[m.committeeLevel];
          return (
            <div key={m.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ height: 72, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, var(--primary-lt), var(--bg-surface-secondary))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {resolveImageUrl(m.photoUrl) ? (
                  <img src={resolveImageUrl(m.photoUrl)!} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span className="font-sans" style={{ fontSize: 26, fontWeight: 700, color: "var(--primary)" }}>
                    {m.initials}
                  </span>
                )}
              </div>
              <div className="card-body" style={{ paddingTop: 10, paddingBottom: 8 }}>
                {lvl && (
                  <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 20, background: lvl.bg, color: lvl.color, marginBottom: 5 }}>
                    {lvl.label}
                  </span>
                )}
                {m.subcommitteeName && (
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 3 }}>{m.subcommitteeName}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--primary)" }}>{m.title}</div>
              </div>
              <div className="card-footer" style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(m)}>
                  <Pencil style={{ width: 13, height: 13 }} /> Edit
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                  onClick={() => setDeleteId(m.id)}
                >
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          );
        })}
        {(members ?? []).length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 0", fontSize: 14, color: "var(--text-muted)" }}>
            No committee members yet. Add the first one.
          </div>
        )}
      </div>

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

          <FormField label="Sort Order" hint="Lower numbers appear first (default: 0)">
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
              className={INPUT_BASE}
              style={inputBorder()}
            />
          </FormField>

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

/**
 * NOTE: The admin-portal vite.config.ts sets `@` → `artifacts/symposium/src`.
 * Therefore `import AdminCommittee from "@/pages/admin/Committee"` in App.tsx
 * resolves to artifacts/symposium/src/pages/admin/Committee.tsx at runtime.
 *
 * This file provides a standalone implementation for editor tooling and future
 * refactoring if the alias ever changes. It is kept in sync with the runtime file.
 */
import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetCommitteeMembers,
  useCreateCommitteeMember,
  useUpdateCommitteeMember,
  useDeleteCommitteeMember,
} from "@workspace/api-client-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

type CommitteeLevel = "international_advisory" | "local_organising" | "subcommittee";

interface FormState {
  name: string;
  title: string;
  photoUrl: string;
  committeeLevel: CommitteeLevel;
  subcommitteeName: string;
  sortOrder: number;
}

const BLANK: FormState = {
  name: "",
  title: "",
  photoUrl: "",
  committeeLevel: "international_advisory",
  subcommitteeName: "",
  sortOrder: 0,
};

const LEVEL_OPTIONS: { value: CommitteeLevel; label: string }[] = [
  { value: "international_advisory", label: "International Advisory Committee" },
  { value: "local_organising",       label: "Local Organising Committee" },
  { value: "subcommittee",           label: "Subcommittee" },
];

const LEVEL_LABELS: Record<CommitteeLevel, { label: string; color: string; bg: string }> = {
  international_advisory: { label: "International Advisory", color: "#0369a1", bg: "#e0f2fe" },
  local_organising:       { label: "Local Organising",       color: "#b45309", bg: "#fef3c7" },
  subcommittee:           { label: "Subcommittee",           color: "#065f46", bg: "#d1fae5" },
};

/** Resolve a stored object path to a public <img> src via the unauthenticated media proxy. */
function resolvePhotoSrc(photoUrl: string | null | undefined): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) return photoUrl;
  if (photoUrl.startsWith("/objects/")) return `/api/media/objects/${photoUrl.slice("/objects/".length)}`;
  if (photoUrl.startsWith("/api/")) return photoUrl;
  return null;
}

function MemberAvatar({ photoUrl, initials }: { photoUrl?: string | null; initials: string }) {
  const src = resolvePhotoSrc(photoUrl);
  if (src) {
    return <img src={src} alt={initials} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0B2744, #0E6E74)" }}>
      <UserRound className="w-7 h-7 text-white/70" />
    </div>
  );
}

function InputField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

function Modal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900 text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">{children}</div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style={{ background: "#0B2744" }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, loading }: {
  message: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

const INPUT_CLS = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#0B2744] focus:ring-1 focus:ring-[#0B2744]/20 bg-white";

export default function AdminCommittee() {
  const { data: members, refetch } = useGetCommitteeMembers();
  const createMutation = useCreateCommitteeMember();
  const updateMutation = useUpdateCommitteeMember();
  const deleteMutation = useDeleteCommitteeMember();
  const { toast } = useToast();

  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<FormState>({ ...BLANK });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const set = (k: keyof FormState, v: string | number) => {
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data = {
      name: form.name.trim(),
      title: form.title.trim(),
      photoUrl: form.photoUrl || undefined,
      committeeLevel: form.committeeLevel,
      subcommitteeName: form.subcommitteeName.trim() || undefined,
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

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Committee</h1>
            <p className="text-sm text-gray-500 mt-0.5">{members?.length ?? 0} members</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#0B2744" }}>
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(members ?? []).map((m) => {
            const lvl = LEVEL_LABELS[m.committeeLevel as CommitteeLevel];
            const photoSrc = resolvePhotoSrc(m.photoUrl);
            return (
              <div key={m.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="h-20 overflow-hidden flex-shrink-0">
                  {photoSrc ? (
                    <img src={photoSrc} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B2744, #0E6E74)" }}>
                      <UserRound className="w-7 h-7 text-white/70" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  {lvl && (
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full w-fit"
                      style={{ color: lvl.color, background: lvl.bg }}>{lvl.label}</span>
                  )}
                  {m.subcommitteeName && <p className="text-[11px] text-gray-400">{m.subcommitteeName}</p>}
                  <p className="text-[13px] font-semibold text-gray-800 leading-snug">{m.name}</p>
                  <p className="text-[12px] text-gray-500">{m.title}</p>
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  <button onClick={() => openEdit(m)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => setDeleteId(m.id)} className="flex items-center justify-center px-2.5 py-1.5 rounded-lg border text-red-600 border-red-100 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {(members ?? []).length === 0 && (
            <div className="col-span-full text-center py-16 text-sm text-gray-400">No committee members yet.</div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editId ? "Edit Member" : "Add Committee Member"} onClose={() => setShowModal(false)} onSave={save} saving={saving}>
          <InputField label="Full Name" required error={errors.name}>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Prof. Ahmad Sulaiman" className={INPUT_CLS} style={errors.name ? { borderColor: "#dc3545" } : {}} />
          </InputField>
          <InputField label="Role / Title" required error={errors.title}>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Chairperson" className={INPUT_CLS} style={errors.title ? { borderColor: "#dc3545" } : {}} />
          </InputField>
          <InputField label="Committee Level">
            <select value={form.committeeLevel} onChange={(e) => set("committeeLevel", e.target.value)} className={INPUT_CLS}>
              {LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </InputField>
          {form.committeeLevel === "subcommittee" && (
            <InputField label="Subcommittee Name">
              <input value={form.subcommitteeName} onChange={(e) => set("subcommitteeName", e.target.value)} placeholder="e.g. Scientific Committee" className={INPUT_CLS} />
            </InputField>
          )}
          <InputField label="Sort Order">
            <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} className={INPUT_CLS} />
          </InputField>
          <InputField label="Photo">
            <ImageUploadField value={form.photoUrl} onChange={(path) => set("photoUrl", path)} accept="image/png,image/jpeg,image/webp" hint="Optional — PNG, JPG, or WebP portrait photo" />
          </InputField>
        </Modal>
      )}

      {deleteId !== null && (
        <ConfirmDialog message="This member will be permanently removed from the committee list." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />
      )}
    </AdminLayout>
  );
}

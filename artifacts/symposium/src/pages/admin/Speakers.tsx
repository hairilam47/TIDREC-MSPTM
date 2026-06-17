import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSpeakers, useCreateSpeaker, useUpdateSpeaker, useDeleteSpeaker } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpeakerInput } from "@workspace/api-client-react";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

const BLANK: SpeakerInput = { name: "", country: "", institution: "", topic: "", bio: "", photoUrl: "" };

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

  const set = (k: keyof SpeakerInput, v: string) => {
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
      <div className="flex justify-between items-center mb-5">
        <div className="text-[13px]" style={{ color: "#6c757d" }}>{speakers?.length ?? 0} speakers</div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white"
          style={{ background: "#0E6E74" }}
        >
          <Plus className="w-4 h-4" /> Add Speaker
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(speakers ?? []).map((s) => (
          <div key={s.id} className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
            <div className="flex items-center justify-center h-24" style={{ background: "linear-gradient(135deg, #e6f4f5, #f8f9fa)" }}>
              <div className="text-3xl font-serif font-bold" style={{ color: "#0E6E74" }}>{s.initials}</div>
            </div>
            <div className="p-4">
              <div className="text-[14px] font-semibold mb-0.5" style={{ color: "#212529" }}>{s.name}</div>
              <div className="text-[12px] mb-0.5" style={{ color: "#0E6E74" }}>{s.topic}</div>
              <div className="text-[11px] mb-3" style={{ color: "#adb5bd" }}>
                {s.institution ? `${s.institution}, ` : ""}{s.country}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-gray-50"
                  style={{ border: "1px solid #e9ecef", color: "#495057" }}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteId(s.id)}
                  className="flex items-center justify-center py-1.5 px-2.5 rounded-lg transition-colors hover:bg-red-50"
                  style={{ border: "1px solid #f8d7da", color: "#842029" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(speakers ?? []).length === 0 && (
          <div className="col-span-4 text-center py-12 text-[14px]" style={{ color: "#adb5bd" }}>
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
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-50"
                style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60"
                style={{ background: "#0E6E74" }}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

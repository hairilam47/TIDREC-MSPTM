import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSpeakers, useCreateSpeaker, useUpdateSpeaker, useDeleteSpeaker } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpeakerInput } from "@workspace/api-client-react";

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

  const set = (k: keyof SpeakerInput, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (s: typeof speakers extends (infer T)[] | undefined ? T : never) => {
    if (!s) return;
    setEditId((s as { id: number }).id);
    setForm({ name: (s as { name: string }).name, country: (s as { country: string }).country, institution: (s as { institution?: string | null }).institution ?? "", topic: (s as { topic: string }).topic, bio: (s as { bio?: string | null }).bio ?? "", photoUrl: (s as { photoUrl?: string | null }).photoUrl ?? "" });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.country.trim()) e.country = "Required";
    if (!form.topic.trim()) e.topic = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: SpeakerInput = { name: form.name, country: form.country, topic: form.topic, institution: form.institution || undefined, bio: form.bio || undefined, photoUrl: form.photoUrl || undefined };
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
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
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
              <div className="text-[11px] mb-3" style={{ color: "#adb5bd" }}>{s.institution ? `${s.institution}, ` : ""}{s.country}</div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium" style={{ border: "1px solid #e9ecef", color: "#495057" }}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setDeleteId(s.id)} className="flex items-center justify-center py-1.5 px-2.5 rounded-lg" style={{ border: "1px solid #f8d7da", color: "#842029" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(speakers ?? []).length === 0 && (
          <div className="col-span-4 text-center py-12 text-[14px]" style={{ color: "#adb5bd" }}>No speakers yet. Add the first one.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e9ecef" }}>
              <h3 className="text-[16px] font-semibold" style={{ color: "#0B2744" }}>{editId ? "Edit Speaker" : "Add Speaker"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" style={{ color: "#6c757d" }} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {(["name", "country", "institution", "topic"] as const).map((f) => (
                <div key={f}>
                  <label className="block text-[12px] font-medium mb-1 capitalize" style={{ color: "#495057" }}>{f}{f === "name" || f === "country" || f === "topic" ? " *" : ""}</label>
                  <input value={form[f] ?? ""} onChange={(e) => set(f, e.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: `1px solid ${errors[f] ? "#dc3545" : "#dee2e6"}` }} />
                  {errors[f] && <p className="text-[11px] mt-0.5" style={{ color: "#dc3545" }}>{errors[f]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Bio</label>
                <textarea value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={{ border: "1px solid #dee2e6" }} />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Photo URL</label>
                <input value={form.photoUrl ?? ""} onChange={(e) => set("photoUrl", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid #e9ecef" }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px]" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
                {editId ? "Save Changes" : "Add Speaker"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: "#0B2744" }}>Delete Speaker?</h3>
            <p className="text-[13px] mb-5" style={{ color: "#6c757d" }}>This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-[13px]" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#dc3545" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SponsorInput, SponsorInputTier } from "@workspace/api-client-react";

const TIER_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  platinum: { bg: "#f1f3f5", color: "#495057", border: "#dee2e6" },
  gold: { bg: "#FDF6E8", color: "#8a6a24", border: "#f0d9a0" },
  silver: { bg: "#f8f9fa", color: "#6c757d", border: "#dee2e6" },
  bronze: { bg: "#fdf2ec", color: "#8a4a24", border: "#f0c9a0" },
};

const BLANK: SponsorInput = { name: "", tier: "gold", logoUrl: "", website: "" };

export default function AdminSponsors() {
  const { data: sponsors, refetch } = useGetSponsors();
  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();
  const deleteMutation = useDeleteSponsor();
  const { toast } = useToast();
  const [showModal, setShowModal] = React.useState(false);
  const [editId, setEditId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<SponsorInput>({ ...BLANK });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const set = (k: keyof SponsorInput, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (s: NonNullable<typeof sponsors>[0]) => {
    setEditId(s.id);
    setForm({ name: s.name, tier: s.tier, logoUrl: s.logoUrl ?? "", website: s.website ?? "" });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: SponsorInput = { name: form.name, tier: form.tier, logoUrl: form.logoUrl || undefined, website: form.website || undefined };
    const onSuccess = () => { refetch(); setShowModal(false); toast({ title: editId ? "Sponsor updated" : "Sponsor added" }); };
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
      onSuccess: () => { refetch(); setDeleteId(null); toast({ title: "Sponsor deleted" }); },
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  const tiers: SponsorInputTier[] = ["platinum", "gold", "silver", "bronze"];

  return (
    <AdminLayout title="Sponsors">
      <div className="flex justify-between items-center mb-5">
        <div className="text-[13px]" style={{ color: "#6c757d" }}>{sponsors?.length ?? 0} sponsors across {tiers.filter((t) => sponsors?.some((s) => s.tier === t)).length} tiers</div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
          <Plus className="w-4 h-4" /> Add Sponsor
        </button>
      </div>

      {tiers.map((tier) => {
        const tierSponsors = (sponsors ?? []).filter((s) => s.tier === tier);
        if (tierSponsors.length === 0) return null;
        const ts = TIER_STYLES[tier];
        return (
          <div key={tier} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] font-bold uppercase tracking-wider px-3 py-1 rounded-full capitalize" style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>{tier}</span>
              <span className="text-[12px]" style={{ color: "#adb5bd" }}>{tierSponsors.length} sponsor{tierSponsors.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tierSponsors.map((s) => (
                <div key={s.id} className="bg-white rounded-xl p-4 flex items-center gap-3" style={{ border: `1px solid ${ts.border}` }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-[13px] font-bold" style={{ background: ts.bg, color: ts.color }}>
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate" style={{ color: "#212529" }}>{s.name}</div>
                    {s.website && (
                      <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] no-underline" style={{ color: "#0E6E74" }}>
                        <ExternalLink className="w-3 h-3" /> {s.website.replace(/^https?:\/\//, "").split("/")[0]}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded" style={{ border: "1px solid #e9ecef", color: "#495057" }}><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded" style={{ border: "1px solid #f8d7da", color: "#842029" }}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {(sponsors ?? []).length === 0 && (
        <div className="text-center py-12 text-[14px]" style={{ color: "#adb5bd" }}>No sponsors yet. Add the first one.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #e9ecef" }}>
              <h3 className="text-[16px] font-semibold" style={{ color: "#0B2744" }}>{editId ? "Edit Sponsor" : "Add Sponsor"}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" style={{ color: "#6c757d" }} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: `1px solid ${errors.name ? "#dc3545" : "#dee2e6"}` }} />
                {errors.name && <p className="text-[11px] mt-0.5" style={{ color: "#dc3545" }}>{errors.name}</p>}
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Tier *</label>
                <select value={form.tier} onChange={(e) => set("tier", e.target.value as SponsorInputTier)} className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }}>
                  {tiers.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Logo URL</label>
                <input value={form.logoUrl ?? ""} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: "#495057" }}>Website</label>
                <input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid #e9ecef" }}>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-[13px]" style={{ border: "1px solid #e9ecef", color: "#6c757d" }}>Cancel</button>
              <button onClick={save} disabled={createMutation.isPending || updateMutation.isPending} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: "#0E6E74" }}>
                {editId ? "Save Changes" : "Add Sponsor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-[16px] font-semibold mb-2" style={{ color: "#0B2744" }}>Delete Sponsor?</h3>
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

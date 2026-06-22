import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from "@workspace/api-client-react";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SponsorInput, SponsorInputTier } from "@workspace/api-client-react";
import { FormField, ModalShell, ConfirmDialog, INPUT_BASE, SELECT_BASE, inputBorder } from "@/components/ui/form-primitives";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

const TIER_STYLES: Record<string, { bg: string; color: string; borderColor: string }> = {
  platinum: { bg: "#f1f3f5", color: "#495057", borderColor: "#dee2e6" },
  gold:     { bg: "#FDF6E8", color: "#8a6a24", borderColor: "#f0d9a0" },
  silver:   { bg: "#f8f9fa", color: "#6c757d", borderColor: "#dee2e6" },
  bronze:   { bg: "#fdf2ec", color: "#8a4a24", borderColor: "#f0c9a0" },
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

  const set = (k: keyof SponsorInput, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const openCreate = () => { setEditId(null); setForm({ ...BLANK }); setErrors({}); setShowModal(true); };
  const openEdit = (s: NonNullable<typeof sponsors>[0]) => {
    setEditId(s.id);
    setForm({ name: s.name, tier: s.tier, logoUrl: s.logoUrl ?? "", website: s.website ?? "" });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Organisation name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const data: SponsorInput = {
      name: form.name,
      tier: form.tier,
      logoUrl: form.logoUrl || undefined,
      website: form.website || undefined,
    };
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {sponsors?.length ?? 0} sponsors across {tiers.filter((t) => sponsors?.some((s) => s.tier === t)).length} tiers
        </span>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus style={{ width: 14, height: 14 }} /> Add Sponsor
        </button>
      </div>

      {tiers.map((tier) => {
        const tierSponsors = (sponsors ?? []).filter((s) => s.tier === tier);
        if (tierSponsors.length === 0) return null;
        const ts = TIER_STYLES[tier];
        return (
          <div key={tier} style={{ marginBottom: 24 }}>
            {/* Tier heading */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "3px 10px", borderRadius: 20,
                  background: ts.bg, color: ts.color, border: `1px solid ${ts.borderColor}`,
                }}
              >
                {tier}
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {tierSponsors.length} sponsor{tierSponsors.length > 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {tierSponsors.map((s) => (
                <div key={s.id} className="card">
                  <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700,
                        background: ts.bg, color: ts.color, border: `1px solid ${ts.borderColor}`,
                      }}
                    >
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.name}
                      </div>
                      {s.website && (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--primary)", textDecoration: "none" }}
                        >
                          <ExternalLink style={{ width: 11, height: 11 }} />
                          {s.website.replace(/^https?:\/\//, "").split("/")[0]}
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)} title="Edit">
                        <Pencil style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: "#f8d7da", color: "#842029", borderColor: "#f1aeb5" }}
                        onClick={() => setDeleteId(s.id)}
                        title="Delete"
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {(sponsors ?? []).length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", fontSize: 14, color: "var(--text-muted)" }}>
          No sponsors yet. Add the first one.
        </div>
      )}

      {showModal && (
        <ModalShell
          title={editId ? "Edit Sponsor" : "Add Sponsor"}
          onClose={() => setShowModal(false)}
          size="md"
          footer={
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending}
                style={{ opacity: (createMutation.isPending || updateMutation.isPending) ? 0.6 : 1 }}
              >
                {editId ? "Save Changes" : "Add Sponsor"}
              </button>
            </>
          }
        >
          <FormField label="Organisation Name" required error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. BioTech Malaysia Sdn Bhd"
              className={INPUT_BASE}
              style={inputBorder(errors.name)}
            />
          </FormField>

          <FormField label="Sponsorship Tier" required>
            <select
              value={form.tier}
              onChange={(e) => set("tier", e.target.value as SponsorInputTier)}
              className={SELECT_BASE}
              style={inputBorder()}
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Sponsor Logo" hint="Optional — PNG, SVG, JPG, or WebP">
            <ImageUploadField
              value={form.logoUrl ?? ""}
              onChange={(path) => set("logoUrl", path)}
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
            />
          </FormField>

          <FormField label="Website" hint="Optional — sponsor's homepage">
            <input
              value={form.website ?? ""}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
              className={INPUT_BASE}
              style={inputBorder()}
            />
          </FormField>
        </ModalShell>
      )}

      {deleteId && (
        <ConfirmDialog
          title="Delete Sponsor?"
          message="This sponsor will be permanently removed from the symposium listing."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

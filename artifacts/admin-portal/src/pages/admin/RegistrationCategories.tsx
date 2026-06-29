import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Plus, Pencil, Trash2, X, Save, GripVertical, CheckCircle2, XCircle } from "lucide-react";

const API = "/api";
const token = () => localStorage.getItem("satbds_token") ?? "";

interface Category {
  id: number;
  slug: string;
  label: string;
  priceMyr: number;
  earlyBirdPriceMyr: number | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY: Omit<Category, "id"> = {
  slug: "",
  label: "",
  priceMyr: 0,
  earlyBirdPriceMyr: null,
  description: null,
  sortOrder: 0,
  isActive: true,
};

const INPUT = "w-full px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-teal-400";
const INPUT_STYLE = { border: "1px solid var(--border-color, #e2e8f0)" };

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>
      <CheckCircle2 className="w-3 h-3" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
      <XCircle className="w-3 h-3" /> Inactive
    </span>
  );
}

type FormState = Omit<Category, "id"> & { id?: number };

export default function AdminRegistrationCategories() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editId, setEditId] = React.useState<number | "new" | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/admin/registration-categories`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error("Failed to load categories");
      setCategories(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const openNew = () => {
    const nextOrder = Math.max(0, ...categories.map(c => c.sortOrder)) + 1;
    setForm({ ...EMPTY, sortOrder: nextOrder });
    setEditId("new");
    setFormError(null);
  };

  const openEdit = (cat: Category) => {
    setForm({
      id: cat.id,
      slug: cat.slug,
      label: cat.label,
      priceMyr: cat.priceMyr,
      earlyBirdPriceMyr: cat.earlyBirdPriceMyr,
      description: cat.description ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setEditId(cat.id);
    setFormError(null);
  };

  const closeEdit = () => { setEditId(null); setFormError(null); };

  const setF = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setFormError(null);
    if (!form.slug.trim()) { setFormError("Slug is required."); return; }
    if (!form.label.trim()) { setFormError("Label is required."); return; }
    setSaving(true);
    try {
      const body = {
        slug: form.slug.trim(),
        label: form.label.trim(),
        priceMyr: Number(form.priceMyr) || 0,
        earlyBirdPriceMyr: form.earlyBirdPriceMyr !== null && form.earlyBirdPriceMyr !== (null as unknown) && String(form.earlyBirdPriceMyr).trim() !== "" ? Number(form.earlyBirdPriceMyr) : null,
        description: (form.description as string)?.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      if (editId === "new") {
        const res = await fetch(`${API}/registration-categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Create failed"); }
      } else {
        const res = await fetch(`${API}/registration-categories/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify(body),
        });
        if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Update failed"); }
      }
      await load();
      closeEdit();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (cat: Category) => {
    if (!confirm(`${cat.isActive ? "Deactivate" : "Reactivate"} "${cat.label}"?`)) return;
    try {
      const res = await fetch(`${API}/registration-categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (!res.ok) throw new Error("Update failed");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text, #0f172a)" }}>Registration Categories</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted, #64748b)" }}>Manage delegate registration types and pricing.</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "var(--teal, #0e6e74)" }}>
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {loading && <p className="text-sm py-10 text-center" style={{ color: "var(--text-muted)" }}>Loading…</p>}
        {error && <p className="text-sm py-10 text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-color, #e2e8f0)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--navy, #0b2744)" }}>
                  <th className="text-left px-4 py-3 text-white font-semibold text-xs">#</th>
                  <th className="text-left px-4 py-3 text-white font-semibold text-xs">Category</th>
                  <th className="text-right px-4 py-3 text-white font-semibold text-xs">Early Bird (MYR)</th>
                  <th className="text-right px-4 py-3 text-white font-semibold text-xs">Regular (MYR)</th>
                  <th className="text-center px-4 py-3 text-white font-semibold text-xs">Status</th>
                  <th className="px-4 py-3 text-white font-semibold text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color, #e2e8f0)" }}>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm italic" style={{ color: "var(--text-muted)" }}>
                      No categories yet. Click "Add Category" to create one.
                    </td>
                  </tr>
                )}
                {categories.map((cat) => (
                  <React.Fragment key={cat.id}>
                    <tr style={{ background: editId === cat.id ? "rgba(14,110,116,0.04)" : undefined }}>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3.5 h-3.5 opacity-30" />
                          {cat.sortOrder}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold" style={{ color: "var(--navy, #0b2744)" }}>{cat.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{cat.slug}</p>
                        {cat.description && <p className="text-xs mt-0.5 italic" style={{ color: "var(--text-muted)" }}>{cat.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold" style={{ color: "var(--teal, #0e6e74)" }}>
                        {cat.earlyBirdPriceMyr != null ? cat.earlyBirdPriceMyr.toLocaleString() : <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: "var(--navy, #0b2744)" }}>
                        {cat.priceMyr.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge active={cat.isActive} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" style={{ color: "var(--teal)" }} />
                          </button>
                          <button
                            onClick={() => deactivate(cat)}
                            className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                            title={cat.isActive ? "Deactivate" : "Reactivate"}
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: cat.isActive ? "#dc2626" : "#059669" }} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit form */}
                    {editId === cat.id && (
                      <tr>
                        <td colSpan={6} className="px-4 pb-4 pt-1">
                          <EditForm form={form} setF={setF} saving={saving} formError={formError} onSave={save} onCancel={closeEdit} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* New category form */}
        {editId === "new" && (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "var(--border-color)", background: "rgba(14,110,116,0.03)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--navy)" }}>New Category</h3>
            <EditForm form={form} setF={setF} saving={saving} formError={formError} onSave={save} onCancel={closeEdit} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function EditForm({
  form,
  setF,
  saving,
  formError,
  onSave,
  onCancel,
}: {
  form: FormState;
  setF: (k: keyof FormState, v: unknown) => void;
  saving: boolean;
  formError: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary, #334155)" }}>Label *</label>
          <input type="text" value={form.label} onChange={e => setF("label", e.target.value)} placeholder="e.g. MSPTM Member / ASIAN Alliance" className={INPUT} style={INPUT_STYLE} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Slug * (unique, no spaces)</label>
          <input type="text" value={form.slug} onChange={e => setF("slug", e.target.value.toLowerCase().replace(/\s+/g, "_"))} placeholder="e.g. msptm_member" className={INPUT} style={INPUT_STYLE} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Regular Price (MYR) *</label>
          <input type="number" min="0" value={form.priceMyr} onChange={e => setF("priceMyr", e.target.value)} placeholder="e.g. 800" className={INPUT} style={INPUT_STYLE} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Early Bird Price (MYR)</label>
          <input
            type="number"
            min="0"
            value={form.earlyBirdPriceMyr ?? ""}
            onChange={e => setF("earlyBirdPriceMyr", e.target.value === "" ? null : e.target.value)}
            placeholder="Leave blank if none"
            className={INPUT}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Sort Order</label>
          <input type="number" min="0" value={form.sortOrder} onChange={e => setF("sortOrder", e.target.value)} className={INPUT} style={INPUT_STYLE} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>Description (optional)</label>
        <input type="text" value={form.description ?? ""} onChange={e => setF("description", e.target.value)} placeholder="Brief description shown in admin" className={INPUT} style={INPUT_STYLE} />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: "var(--text-secondary)" }}>
          <input type="checkbox" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="rounded" />
          Active (visible on registration page)
        </label>
      </div>

      {formError && <p className="text-xs text-red-600">{formError}</p>}

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--teal)" }}
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

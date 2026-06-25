import React from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useGetAllRegistrationCategories,
  useCreateRegistrationCategory,
  useUpdateRegistrationCategory,
} from "@workspace/api-client-react";
import type { RegistrationCategory, RegistrationCategoryInput } from "@workspace/api-client-react";
import { Plus, Pencil, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModalShell, FormField, INPUT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

interface CatForm {
  label: string;
  slug: string;
  priceMyr: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FORM: CatForm = {
  label: "",
  slug: "",
  priceMyr: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function CategoryModal({
  initial,
  onClose,
  onSuccess,
}: {
  initial?: RegistrationCategory;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = React.useState<CatForm>(
    initial
      ? {
          label: initial.label,
          slug: initial.slug,
          priceMyr: String(initial.priceMyr),
          description: initial.description ?? "",
          sortOrder: String(initial.sortOrder),
          isActive: initial.isActive,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = React.useState<Partial<Record<keyof CatForm, string>>>({});
  const [slugManual, setSlugManual] = React.useState(!!initial);
  const createMutation = useCreateRegistrationCategory();
  const updateMutation = useUpdateRegistrationCategory();
  const { toast } = useToast();

  const set =
    (field: keyof CatForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "label" && !slugManual) {
          next.slug = slugify(value);
        }
        return next;
      });
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = () => {
    const newErrors: Partial<Record<keyof CatForm, string>> = {};
    if (!form.label.trim()) newErrors.label = "Required";
    if (!form.slug.trim()) newErrors.slug = "Required";
    if (!/^[a-z0-9_]+$/.test(form.slug))
      newErrors.slug = "Only lowercase letters, numbers, underscores";
    const price = parseFloat(form.priceMyr);
    if (isNaN(price) || price < 0) newErrors.priceMyr = "Enter a valid price";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: RegistrationCategoryInput = {
      label: form.label.trim(),
      slug: form.slug.trim(),
      priceMyr: parseFloat(form.priceMyr),
      description: form.description.trim() || undefined,
      sortOrder: parseInt(form.sortOrder) || 0,
      isActive: form.isActive,
    };
    if (initial) {
      updateMutation.mutate(
        { id: initial.id, data },
        {
          onSuccess: () => {
            toast({ title: "Category updated" });
            onSuccess();
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            if (msg?.includes("already exists")) setErrors({ slug: "Slug already in use" });
            else toast({ title: "Update failed", variant: "destructive" });
          },
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Category created" });
            onSuccess();
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
            if (msg?.includes("already exists")) setErrors({ slug: "Slug already in use" });
            else toast({ title: "Create failed", variant: "destructive" });
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ModalShell
      title={initial ? "Edit Category" : "Add Category"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="cat-form"
            disabled={isPending}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial ? "Save Changes" : "Create Category"}
          </button>
        </div>
      }
    >
      <form id="cat-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Label" required error={errors.label}>
          <input
            value={form.label}
            onChange={set("label")}
            placeholder="e.g. MSPTM Member / ASIAN Alliance"
            className={INPUT_BASE}
            style={inputBorder(errors.label)}
            autoFocus
          />
        </FormField>
        <FormField
          label="Slug"
          required
          error={errors.slug}
          hint="Unique identifier — auto-generated from label"
        >
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              set("slug")(e);
            }}
            placeholder="e.g. msptm_member"
            className={INPUT_BASE}
            style={inputBorder(errors.slug)}
          />
        </FormField>
        <FormField label="Price (MYR)" required error={errors.priceMyr}>
          <input
            type="number"
            value={form.priceMyr}
            onChange={set("priceMyr")}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={INPUT_BASE}
            style={inputBorder(errors.priceMyr)}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sort Order" hint="Lower = shown first">
            <input
              type="number"
              value={form.sortOrder}
              onChange={set("sortOrder")}
              min="0"
              className={INPUT_BASE}
              style={inputBorder()}
            />
          </FormField>
          <FormField label="Status">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
                style={{ accentColor: "var(--primary)" }}
              />
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                {form.isActive ? "Active — visible to delegates" : "Inactive — hidden from registration"}
              </span>
            </label>
          </FormField>
        </div>
        <FormField label="Description" hint="Optional — shown below category name in the registration form">
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="e.g. For members of the Malaysian Society of Parasitology and Tropical Medicine"
            rows={2}
            className={TEXTAREA_BASE}
            style={inputBorder()}
          />
        </FormField>
      </form>
    </ModalShell>
  );
}

export default function AdminRegistrationCategories() {
  const { data: categories = [], isLoading, refetch } = useGetAllRegistrationCategories();
  const updateMutation = useUpdateRegistrationCategory();
  const { toast } = useToast();
  const [showModal, setShowModal] = React.useState(false);
  const [editing, setEditing] = React.useState<RegistrationCategory | undefined>(undefined);

  const handleSuccess = () => {
    setShowModal(false);
    setEditing(undefined);
    refetch();
  };

  const toggleActive = (cat: RegistrationCategory) => {
    updateMutation.mutate(
      {
        id: cat.id,
        data: {
          label: cat.label,
          slug: cat.slug,
          priceMyr: cat.priceMyr,
          description: cat.description ?? undefined,
          sortOrder: cat.sortOrder,
          isActive: !cat.isActive,
        },
      },
      {
        onSuccess: () => {
          refetch();
          toast({ title: cat.isActive ? "Category deactivated" : "Category activated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Registration Categories">
      <div className="flex items-start justify-between mb-5 gap-4">
        <p className="text-[13px] max-w-lg" style={{ color: "var(--text-muted)" }}>
          Manage delegate registration categories and their pricing. Active categories appear in the
          public registration form.
        </p>
        <button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
          className="btn btn-primary flex-shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    {["#", "Label", "Slug", "Price (MYR)", "Status", "Actions"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-[13px]"
                        style={{ color: "var(--text-disabled)" }}
                      >
                        No categories yet. Click "Add Category" to create one.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr
                        key={cat.id}
                        style={{ opacity: cat.isActive ? 1 : 0.55 }}
                      >
                        <td className="text-[12px] w-10" style={{ color: "var(--text-disabled)" }}>
                          {cat.sortOrder}
                        </td>
                        <td>
                          <div className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
                            {cat.label}
                          </div>
                          {cat.description && (
                            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-disabled)" }}>
                              {cat.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded" style={{ color: "var(--text-secondary)" }}>
                            {cat.slug}
                          </code>
                        </td>
                        <td>
                          <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
                            {cat.priceMyr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={
                              cat.isActive
                                ? { background: "#d1e7dd", color: "#0a5c39" }
                                : { background: "var(--border-color)", color: "var(--text-muted)" }
                            }
                          >
                            {cat.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setEditing(cat);
                                setShowModal(true);
                              }}
                              className="btn btn-outline btn-sm flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => toggleActive(cat)}
                              disabled={updateMutation.isPending}
                              className="btn btn-sm disabled:opacity-60 flex items-center gap-1"
                              style={
                                cat.isActive
                                  ? { background: "#fff3cd", color: "#856404", borderColor: "#ffe69c" }
                                  : { background: "#d1e7dd", color: "#0a5c39", borderColor: "#a3cfbb" }
                              }
                            >
                              {cat.isActive ? (
                                <><ToggleLeft className="w-3.5 h-3.5" />Deactivate</>
                              ) : (
                                <><ToggleRight className="w-3.5 h-3.5" />Activate</>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <CategoryModal
          initial={editing}
          onClose={() => {
            setShowModal(false);
            setEditing(undefined);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </AdminLayout>
  );
}

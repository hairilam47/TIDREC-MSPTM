import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations, useUpdateRegistration, useAdminCreateRegistration, useGetRegistrationCategories } from "@workspace/api-client-react";
import { Search, Download, ChevronDown, Pencil, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModalShell, FormField, INPUT_BASE, SELECT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  paid:    { bg: "var(--status-success-bg)", color: "var(--status-success-text)" },
  pending: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)" },
  overdue: { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)" },
  waived:  { bg: "var(--primary-lt)",        color: "var(--primary)" },
};

interface AddRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  country: string;
  category: string;
  paymentStatus: string;
  paymentAmount: string;
  dietaryRequirements: string;
  specialNeeds: string;
}

const EMPTY_FORM: AddRegistrationForm = {
  firstName: "",
  lastName: "",
  email: "",
  institution: "",
  country: "",
  category: "",
  paymentStatus: "pending",
  paymentAmount: "",
  dietaryRequirements: "",
  specialNeeds: "",
};

function AddRegistrationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (code: string) => void }) {
  const [form, setForm] = React.useState<AddRegistrationForm>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<AddRegistrationForm>>({});
  const createMutation = useAdminCreateRegistration();
  const { data: categories = [] } = useGetRegistrationCategories();

  const set = (field: keyof AddRegistrationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "category" && value) {
        const cat = categories.find(c => c.slug === value);
        if (!prev.paymentAmount && cat) {
          next.paymentAmount = String(cat.priceMyr);
        }
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setCategory = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    setForm((prev) => ({
      ...prev,
      category: slug,
      paymentAmount: prev.paymentAmount || (cat ? String(cat.priceMyr) : ""),
    }));
    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<AddRegistrationForm> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Required";
    if (!form.lastName.trim()) newErrors.lastName = "Required";
    if (!form.email.trim()) newErrors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.category) newErrors.category = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createMutation.mutate(
      {
        data: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          institution: form.institution.trim() || undefined,
          country: form.country.trim() || undefined,
          category: form.category,
          paymentStatus: form.paymentStatus as "pending" | "paid" | "overdue" | "waived",
          paymentAmount: form.paymentAmount ? parseFloat(form.paymentAmount) : undefined,
          dietaryRequirements: form.dietaryRequirements.trim() || undefined,
          specialNeeds: form.specialNeeds.trim() || undefined,
        },
      },
      {
        onSuccess: (reg) => onSuccess(reg.registrationCode ?? ""),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          if (msg?.includes("already exists")) {
            setErrors((prev) => ({ ...prev, email: "A registration already exists for this email" }));
          }
        },
      }
    );
  };

  return (
    <ModalShell
      title="Register Delegate"
      onClose={onClose}
      size="xl"
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
            form="add-registration-form"
            disabled={createMutation.isPending}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Register Delegate
          </button>
        </div>
      }
    >
      <form id="add-registration-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Delegate Identity */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Delegate Identity
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required error={errors.firstName}>
              <input
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="e.g. Ahmad"
                className={INPUT_BASE}
                style={inputBorder(errors.firstName)}
                autoFocus
              />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName}>
              <input
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="e.g. Razak"
                className={INPUT_BASE}
                style={inputBorder(errors.lastName)}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Email Address" required error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="delegate@institution.edu"
                className={INPUT_BASE}
                style={inputBorder(errors.email)}
              />
            </FormField>
          </div>
        </div>

        {/* Section: Affiliation */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Affiliation
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Institution">
              <input
                value={form.institution}
                onChange={set("institution")}
                placeholder="e.g. University of Malaya"
                className={INPUT_BASE}
                style={inputBorder()}
              />
            </FormField>
            <FormField label="Country">
              <input
                value={form.country}
                onChange={set("country")}
                placeholder="e.g. Malaysia"
                className={INPUT_BASE}
                style={inputBorder()}
              />
            </FormField>
          </div>
        </div>

        {/* Section: Delegate Category */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Delegate Category
          </h3>
          {errors.category && (
            <p className="text-[12px] mb-2" style={{ color: "var(--red)" }}>{errors.category}</p>
          )}
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="text-[13px] text-center py-3" style={{ color: "var(--text-disabled)" }}>Loading categories…</div>
            ) : categories.map((cat) => {
              const selected = form.category === cat.slug;
              return (
                <label
                  key={cat.slug}
                  className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: selected ? "2px solid var(--primary)" : errors.category ? `1px solid var(--red)` : "1px solid var(--border-color)",
                    background: selected ? "var(--primary-lt)" : "var(--bg-surface)",
                  }}
                >
                  <input
                    type="radio"
                    name="modal-category"
                    value={cat.slug}
                    checked={selected}
                    onChange={() => setCategory(cat.slug)}
                    className="w-4 h-4 flex-shrink-0"
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: selected ? "var(--primary)" : "var(--text)" }}>
                      {cat.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      MYR {cat.priceMyr.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                      {cat.description && ` · ${cat.description}`}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section: Payment */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Payment Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Payment Status">
              <div className="relative">
                <select
                  value={form.paymentStatus}
                  onChange={set("paymentStatus")}
                  className={SELECT_BASE}
                  style={inputBorder()}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                  <option value="overdue">Overdue</option>
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            </FormField>
            <FormField label="Amount (MYR)" hint="Leave blank to set later">
              <input
                type="number"
                value={form.paymentAmount}
                onChange={set("paymentAmount")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={INPUT_BASE}
                style={inputBorder()}
              />
            </FormField>
          </div>
          <div className="mt-4 space-y-4">
            <FormField label="Dietary Requirements">
              <textarea
                value={form.dietaryRequirements}
                onChange={set("dietaryRequirements")}
                placeholder="e.g. Vegetarian, Halal, no nuts…"
                rows={2}
                className={TEXTAREA_BASE}
                style={inputBorder()}
              />
            </FormField>
            <FormField label="Special Needs / Accessibility">
              <textarea
                value={form.specialNeeds}
                onChange={set("specialNeeds")}
                placeholder="e.g. Wheelchair access…"
                rows={2}
                className={TEXTAREA_BASE}
                style={inputBorder()}
              />
            </FormField>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

export default function AdminRegistrations() {
  const { data: registrations, refetch } = useGetRegistrations();
  const updateMutation = useUpdateRegistration();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editStatus, setEditStatus] = React.useState<string>("");
  const [editAmount, setEditAmount] = React.useState<string>("");
  const [showAddModal, setShowAddModal] = React.useState(false);

  const filtered = (registrations ?? []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.country ?? "").toLowerCase().includes(q) ||
      (r.registrationCode ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    const headers = [
      "Code", "Salutation", "Full Name", "Email",
      "Mobile Country Code", "Mobile Number", "Nationality",
      "Gender", "Date of Birth", "Age",
      "MMA Member", "MMC Number",
      "Institution", "Country", "Category",
      "Payment Status", "Amount (MYR)", "Registered",
    ];
    const computeAge = (dob: string | null | undefined): string => {
      if (!dob) return "";
      const d = new Date(dob);
      if (isNaN(d.getTime())) return "";
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      return String(age);
    };
    const rows = filtered.map((r) => [
      r.registrationCode ?? "",
      (r as Record<string, unknown>).salutation as string ?? "",
      (r as Record<string, unknown>).fullName as string ?? `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim(),
      r.email ?? "",
      (r as Record<string, unknown>).mobileCountryCode as string ?? "",
      (r as Record<string, unknown>).mobileNumber as string ?? "",
      (r as Record<string, unknown>).nationality as string ?? "",
      (r as Record<string, unknown>).gender as string ?? "",
      (r as Record<string, unknown>).dateOfBirth as string ?? "",
      computeAge((r as Record<string, unknown>).dateOfBirth as string),
      (r as Record<string, unknown>).isMmaMember === true ? "Yes" : (r as Record<string, unknown>).isMmaMember === false ? "No" : "",
      (r as Record<string, unknown>).mmcNumber as string ?? "",
      r.institution ?? "",
      r.country ?? "",
      r.category ?? "",
      r.paymentStatus,
      r.paymentAmount != null ? String(r.paymentAmount) : "",
      new Date(r.createdAt).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveEdit = (id: number) => {
    updateMutation.mutate(
      {
        id,
        data: {
          paymentStatus: editStatus as "pending" | "paid" | "overdue" | "waived",
          paymentAmount: editAmount ? parseFloat(editAmount) : undefined,
        },
      },
      {
        onSuccess: () => {
          refetch();
          setEditingId(null);
          toast({ title: "Registration updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const handleAddSuccess = (code: string) => {
    setShowAddModal(false);
    refetch();
    toast({
      title: "Delegate registered",
      description: `Registration code: ${code}`,
    });
  };

  return (
    <AdminLayout title="Registrations">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-disabled)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, country or code…"
            className={`${INPUT_BASE} pl-9`}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`appearance-none ${SELECT_BASE}`}
            style={inputBorder()}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Register Delegate
        </button>
        <button
          onClick={exportCSV}
          className="btn btn-outline flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>
        {filtered.length} of {registrations?.length ?? 0} registrations
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {["Code", "Delegate", "Mobile", "Nationality", "Gender", "MMA", "Institution", "Category", "Payment", "Amount (MYR)", "Date", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-10 text-[13px]" style={{ color: "var(--text-disabled)" }}>
                      No registrations found
                    </td>
                  </tr>
                ) : filtered.map((r) => {
                  const ps = PAYMENT_STYLES[r.paymentStatus] ?? PAYMENT_STYLES.pending;
                  const isEditing = editingId === r.id;
                  const reg = r as Record<string, unknown>;
                  const displayName = (reg.fullName as string) || `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || "—";
                  const salutation = reg.salutation as string | null;
                  const salutationOther = reg.salutationOther as string | null;
                  const salutationDisplay = salutation === "Other" ? (salutationOther ?? "") : (salutation ?? "");
                  return (
                    <tr key={r.id}>
                      <td>
                        <code className="cell-mono" style={{ background: "var(--bg-surface-secondary)", padding: "2px 6px", borderRadius: 4 }}>
                          {r.registrationCode}
                        </code>
                      </td>
                      <td>
                        <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>
                          {salutationDisplay ? `${salutationDisplay} ` : ""}{displayName}
                        </div>
                        <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{r.email}</div>
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {reg.mobileCountryCode && reg.mobileNumber ? `${reg.mobileCountryCode} ${reg.mobileNumber}` : "—"}
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{(reg.nationality as string) ?? "—"}</td>
                      <td className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{(reg.gender as string) ?? "—"}</td>
                      <td className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                        {reg.isMmaMember === true ? <span style={{ color: "var(--green, #16a34a)", fontWeight: 600 }}>Yes</span> : reg.isMmaMember === false ? "No" : "—"}
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{r.institution ?? "—"}</td>
                      <td className="text-[13px]" style={{ color: "var(--text-secondary)" }}>{r.country ?? "—"}</td>
                      <td className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>
                        {r.category?.replace(/_/g, " ")}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="text-[13px] px-2.5 py-2 rounded-lg outline-none"
                            style={{ border: "1px solid var(--border-color)", background: "var(--bg-surface)" }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="waived">Waived</option>
                          </select>
                        ) : (
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: ps.bg, color: ps.color }}
                          >
                            {r.paymentStatus}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-28 text-[13px] px-2.5 py-2 rounded-lg outline-none"
                            style={{ border: "1px solid var(--border-color)" }}
                          />
                        ) : (
                          <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                            {r.paymentAmount != null
                              ? Number(r.paymentAmount).toLocaleString("en-MY", { minimumFractionDigits: 2 })
                              : "—"}
                          </span>
                        )}
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-disabled)" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => saveEdit(r.id)}
                              className="btn btn-primary btn-sm px-3 py-2 text-[12px]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="btn btn-outline btn-sm px-3 py-2 text-[12px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(r.id);
                              setEditStatus(r.paymentStatus);
                              setEditAmount(r.paymentAmount != null ? String(r.paymentAmount) : "");
                            }}
                            className="btn btn-outline btn-sm flex items-center gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddRegistrationModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </AdminLayout>
  );
}

import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations, useUpdateRegistration, useAdminCreateRegistration } from "@workspace/api-client-react";
import { Search, Download, ChevronDown, Pencil, UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModalShell, FormField, INPUT_BASE, SELECT_BASE, TEXTAREA_BASE, inputBorder } from "@/components/ui/form-primitives";

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived: { bg: "#e6f4f5", color: "#0E6E74" },
};

const CATEGORY_LABELS: Record<string, string> = {
  healthcare_professional: "Healthcare Professional",
  researcher: "Researcher / Scientist",
  educator: "Educator",
  student: "Student",
  industry: "Industry Professional",
};

const CATEGORY_FEES: Record<string, { early: number; regular: number }> = {
  healthcare_professional: { early: 800, regular: 1000 },
  researcher: { early: 800, regular: 1000 },
  educator: { early: 600, regular: 800 },
  student: { early: 400, regular: 500 },
  industry: { early: 1200, regular: 1500 },
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

  const set = (field: keyof AddRegistrationForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-fill payment amount when category changes
      if (field === "category" && value && CATEGORY_FEES[value]) {
        if (!prev.paymentAmount) {
          next.paymentAmount = String(CATEGORY_FEES[value].early);
        }
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      category: cat,
      paymentAmount: prev.paymentAmount || (CATEGORY_FEES[cat] ? String(CATEGORY_FEES[cat].early) : ""),
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
            className="px-5 py-2.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-gray-50"
            style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-registration-form"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ background: "#C89B3C" }}
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
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#6c757d" }}>
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
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#6c757d" }}>
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
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#6c757d" }}>
            Delegate Category
          </h3>
          {errors.category && (
            <p className="text-[12px] mb-2" style={{ color: "#dc3545" }}>{errors.category}</p>
          )}
          <div className="space-y-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const fees = CATEGORY_FEES[key];
              const selected = form.category === key;
              return (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: selected ? "2px solid #0E6E74" : errors.category ? "1px solid #dc3545" : "1px solid #e9ecef",
                    background: selected ? "#e6f4f5" : "#fff",
                  }}
                >
                  <input
                    type="radio"
                    name="modal-category"
                    value={key}
                    checked={selected}
                    onChange={() => setCategory(key)}
                    className="w-4 h-4 flex-shrink-0"
                    style={{ accentColor: "#0E6E74" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: selected ? "#0E6E74" : "#212529" }}>
                      {label}
                    </div>
                    {fees && (
                      <div className="text-[11px] mt-0.5" style={{ color: "#6c757d" }}>
                        Early bird: MYR {fees.early.toLocaleString()} · Regular: MYR {fees.regular.toLocaleString()}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section: Payment */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#6c757d" }}>
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
                  style={{ color: "#6c757d" }}
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
    const headers = ["Code", "First Name", "Last Name", "Email", "Country", "Category", "Payment Status", "Amount", "Registered"];
    const rows = filtered.map((r) => [
      r.registrationCode ?? "",
      r.firstName ?? "",
      r.lastName ?? "",
      r.email ?? "",
      r.country ?? "",
      r.category ?? "",
      r.paymentStatus,
      r.paymentAmount != null ? String(r.paymentAmount) : "",
      new Date(r.createdAt).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#adb5bd" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, country or code…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74] transition-colors"
            style={{ border: "1px solid #dee2e6" }}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74] transition-colors"
            style={{ border: "1px solid #dee2e6", background: "#fff" }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "#6c757d" }} />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
          style={{ background: "#0B2744", color: "#fff" }}
        >
          <UserPlus className="w-4 h-4" />
          Register Delegate
        </button>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium"
          style={{ background: "#0E6E74", color: "#fff" }}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "#6c757d" }}>
        {filtered.length} of {registrations?.length ?? 0} registrations
      </div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["Code", "Delegate", "Country", "Category", "Payment", "Amount (MYR)", "Date", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>
                    No registrations found
                  </td>
                </tr>
              ) : filtered.map((r) => {
                const ps = PAYMENT_STYLES[r.paymentStatus] ?? PAYMENT_STYLES.pending;
                const isEditing = editingId === r.id;
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                    <td className="px-4 py-3">
                      <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded" style={{ color: "#495057" }}>
                        {r.registrationCode}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{r.firstName} {r.lastName}</div>
                      <div className="text-[11px]" style={{ color: "#adb5bd" }}>{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{r.country ?? "—"}</td>
                    <td className="px-4 py-3 text-[12px] capitalize" style={{ color: "#495057" }}>
                      {r.category?.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="text-[13px] px-2.5 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74] transition-colors"
                          style={{ border: "1px solid #dee2e6", background: "#fff" }}
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
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-28 text-[13px] px-2.5 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[rgba(14,110,116,0.2)] focus:border-[#0E6E74] transition-colors"
                          style={{ border: "1px solid #dee2e6" }}
                        />
                      ) : (
                        <span className="text-[13px]" style={{ color: "#495057" }}>
                          {r.paymentAmount != null
                            ? Number(r.paymentAmount).toLocaleString("en-MY", { minimumFractionDigits: 2 })
                            : "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: "#adb5bd" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => saveEdit(r.id)}
                            className="px-3 py-2 rounded-lg text-[12px] font-semibold text-white"
                            style={{ background: "#0E6E74" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 rounded-lg text-[12px] font-medium"
                            style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
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
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors hover:bg-gray-50"
                          style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
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

      {showAddModal && (
        <AddRegistrationModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </AdminLayout>
  );
}

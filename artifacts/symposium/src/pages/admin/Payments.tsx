import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations, useUpdateRegistration, useSendPaymentReminder, useGetRegistrationCategories } from "@workspace/api-client-react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { INPUT_BASE } from "@/components/ui/form-primitives";

const PAYMENT_STYLES: Record<string, { bg: string; color: string; border?: string }> = {
  paid:    { bg: "var(--status-success-bg)", color: "var(--status-success-text)", border: "var(--status-success-text)" },
  pending: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)", border: "var(--status-warning-text)" },
  overdue: { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",  border: "var(--status-danger-border)" },
  waived:  { bg: "var(--primary-lt)",        color: "var(--primary)",             border: "var(--primary)" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  online_banking: "Online Banking (FPX)",
  credit_card: "Credit / Debit Card",
  e_perolehan: "ePerolehan",
};

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "— Not specified —" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online_banking", label: "Online Banking (FPX)" },
  { value: "credit_card", label: "Credit / Debit Card" },
  { value: "e_perolehan", label: "ePerolehan" },
];

interface RegistrationWithMethod {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  category: string;
  paymentStatus: string;
  paymentAmount?: number | null;
  paymentMethod?: string | null;
  registrationCode?: string;
}

export default function AdminPayments() {
  const { data: rawRegistrations, refetch } = useGetRegistrations();
  const registrations = rawRegistrations as RegistrationWithMethod[] | undefined;
  const { data: categories = [] } = useGetRegistrationCategories();
  const updateMutation = useUpdateRegistration();
  const reminderMutation = useSendPaymentReminder();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [editingMethodId, setEditingMethodId] = React.useState<number | null>(null);
  const [methodDraft, setMethodDraft] = React.useState<string>("");

  const filtered = (registrations ?? []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q) || (r.registrationCode ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = {
    total: registrations?.length ?? 0,
    paid: (registrations ?? []).filter((r) => r.paymentStatus === "paid").length,
    pending: (registrations ?? []).filter((r) => r.paymentStatus === "pending").length,
    overdue: (registrations ?? []).filter((r) => r.paymentStatus === "overdue").length,
    revenue: (registrations ?? []).filter((r) => r.paymentStatus === "paid").reduce((sum, r) => sum + (r.paymentAmount ?? 0), 0),
  };

  const updateStatus = (id: number, paymentStatus: "pending" | "paid" | "overdue" | "waived", category: string) => {
    const cat = categories.find(c => c.slug === category);
    const paymentAmount = paymentStatus === "paid" ? (cat?.priceMyr ?? undefined) : undefined;
    updateMutation.mutate(
      { id, data: { paymentStatus, paymentAmount } },
      {
        onSuccess: () => { refetch(); toast({ title: `Payment marked as ${paymentStatus}` }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const startEditMethod = (r: RegistrationWithMethod) => {
    setEditingMethodId(r.id);
    setMethodDraft(r.paymentMethod ?? "");
  };

  const saveMethod = (id: number) => {
    updateMutation.mutate(
      { id, data: { paymentMethod: methodDraft } as Parameters<typeof updateMutation.mutate>[0]["data"] },
      {
        onSuccess: () => {
          refetch();
          setEditingMethodId(null);
          toast({ title: "Payment method updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const sendReminder = (r: RegistrationWithMethod) => {
    reminderMutation.mutate(
      { id: r.id },
      {
        onSuccess: (data) => {
          toast({
            title: `Reminder logged for ${r.firstName} ${r.lastName}`,
            description: `Sent at ${new Date((data as { sentAt: string }).sentAt).toLocaleString("en-GB")} · reminder #${(data as { reminderId: number }).reminderId}`,
          });
        },
        onError: () => toast({ title: "Reminder failed", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Payments">
      {/* Summary chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Registrations", value: summary.total, color: "var(--text)", bg: "var(--border-color)" },
          { label: "Paid", value: summary.paid, color: "var(--status-success-text)", bg: "var(--status-success-bg)" },
          { label: "Pending", value: summary.pending, color: "var(--status-warning-text)", bg: "var(--status-warning-bg)" },
          { label: "Revenue Collected", value: `MYR ${summary.revenue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, color: "var(--status-success-text)", bg: "var(--status-success-bg)" },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body">
              <div className="text-[22px] font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-disabled)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or code…"
            className={`${INPUT_BASE} pl-9`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "paid", "overdue", "waived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm capitalize ${statusFilter === s ? "btn-primary" : "btn-outline"}`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>{filtered.length} of {registrations?.length ?? 0} registrations</div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {["Delegate", "Code", "Category", "Payment Method", "Amount (MYR)", "Status", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-[13px]" style={{ color: "var(--text-disabled)" }}>No payments found</td></tr>
                ) : filtered.map((r) => {
                  const ps = PAYMENT_STYLES[r.paymentStatus] ?? PAYMENT_STYLES.pending;
                  const isEditingMethod = editingMethodId === r.id;
                  const methodLabel = r.paymentMethod ? (PAYMENT_METHOD_LABELS[r.paymentMethod] ?? r.paymentMethod) : null;

                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="cell-strong">{r.firstName} {r.lastName}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{r.email}</div>
                      </td>
                      <td>
                        <code className="cell-mono" style={{ background: "var(--bg-surface-secondary)", padding: "2px 6px", borderRadius: 4 }}>
                          {r.registrationCode}
                        </code>
                      </td>
                      <td className="capitalize" style={{ color: "var(--text-secondary)", fontSize: 12 }}>{r.category?.replace(/_/g, " ")}</td>

                      {/* Payment Method — click to edit */}
                      <td>
                        {isEditingMethod ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={methodDraft}
                              onChange={e => setMethodDraft(e.target.value)}
                              className="text-[12px] px-2 py-1 rounded border"
                              style={{ borderColor: "var(--border-color)", background: "var(--bg-surface)", color: "var(--text)", minWidth: 160 }}
                              autoFocus
                            >
                              {PAYMENT_METHOD_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => saveMethod(r.id)}
                              disabled={updateMutation.isPending}
                              className="btn btn-sm btn-primary disabled:opacity-60"
                            >Save</button>
                            <button
                              onClick={() => setEditingMethodId(null)}
                              className="btn btn-sm btn-outline"
                            >✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditMethod(r)}
                            className="flex items-center gap-1 text-[12px] group"
                            style={{ color: methodLabel ? "var(--text-secondary)" : "var(--text-disabled)" }}
                            title="Click to change payment method"
                          >
                            <span>{methodLabel ?? "—"}</span>
                            <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </button>
                        )}
                      </td>

                      <td>
                        <span className="text-[13px] font-medium" style={{ color: r.paymentAmount ? "var(--text)" : "var(--text-disabled)" }}>
                          {r.paymentAmount != null
                            ? Number(r.paymentAmount).toLocaleString("en-MY", { minimumFractionDigits: 2 })
                            : (categories.find(c => c.slug === r.category)?.priceMyr?.toLocaleString("en-MY", { minimumFractionDigits: 2 }) ?? "—")}
                        </span>
                        {r.paymentAmount == null && <span className="text-[11px] ml-1" style={{ color: "var(--text-disabled)" }}>(suggested)</span>}
                      </td>
                      <td>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize" style={{ background: ps.bg, color: ps.color }}>{r.paymentStatus}</span>
                      </td>
                      <td>
                        <div className="flex gap-1.5 flex-wrap">
                          {r.paymentStatus !== "paid" && (
                            <button
                              onClick={() => updateStatus(r.id, "paid", r.category)}
                              className="btn btn-sm"
                              style={{ background: "var(--status-success-bg)", color: "var(--status-success-text)", borderColor: "var(--status-success-text)" }}
                            >
                              Mark Paid
                            </button>
                          )}
                          {r.paymentStatus !== "overdue" && r.paymentStatus !== "paid" && r.paymentStatus !== "waived" && (
                            <button
                              onClick={() => updateStatus(r.id, "overdue", r.category)}
                              className="btn btn-sm"
                              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-text)", borderColor: "var(--status-danger-border)" }}
                            >
                              Overdue
                            </button>
                          )}
                          {(r.paymentStatus === "pending" || r.paymentStatus === "overdue") ? (
                            <button
                              onClick={() => sendReminder(r)}
                              disabled={reminderMutation.isPending}
                              className="btn btn-sm disabled:opacity-60"
                              style={{ background: "var(--status-warning-bg)", color: "var(--status-warning-text)", borderColor: "var(--status-warning-text)" }}
                            >
                              <Bell className="w-3 h-3" /> Remind
                            </button>
                          ) : null}
                          {r.paymentStatus !== "waived" && (
                            <button
                              onClick={() => updateStatus(r.id, "waived", r.category)}
                              className="btn btn-sm btn-outline"
                            >
                              Waive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

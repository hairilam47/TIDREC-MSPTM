import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations, useUpdateRegistration, useSendPaymentReminder, useGetRegistrationCategories } from "@workspace/api-client-react";
import { Search, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived: { bg: "var(--primary-lt)", color: "var(--primary)" },
};

export default function AdminPayments() {
  const { data: registrations, refetch } = useGetRegistrations();
  const { data: categories = [] } = useGetRegistrationCategories();
  const updateMutation = useUpdateRegistration();
  const reminderMutation = useSendPaymentReminder();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

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

  const sendReminder = (r: { id: number; firstName?: string; lastName?: string; email?: string }) => {
    reminderMutation.mutate(
      { id: r.id },
      {
        onSuccess: (data) => {
          toast({
            title: `Reminder logged for ${r.firstName} ${r.lastName}`,
            description: `Sent at ${new Date(data.sentAt).toLocaleString("en-GB")} · reminder #${data.reminderId}`,
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
          { label: "Paid", value: summary.paid, color: "#0a5c39", bg: "#d1e7dd" },
          { label: "Pending", value: summary.pending, color: "#856404", bg: "#fff3cd" },
          { label: "Revenue Collected", value: `MYR ${summary.revenue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, color: "#0a5c39", bg: "#d1e7dd" },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or code…" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid var(--border-color)" }} />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "paid", "overdue", "waived"].map((s) => {
            const ps = PAYMENT_STYLES[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-2.5 rounded-lg text-[12px] font-medium capitalize" style={statusFilter === s ? (ps ? { background: ps.bg, color: ps.color } : { background: "var(--text)", color: "#fff" }) : { background: "var(--border-color)", color: "var(--text-secondary)" }}>
                {s === "all" ? "All" : s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>{filtered.length} of {registrations?.length ?? 0} registrations</div>

      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  {["Delegate", "Registration Code", "Category", "Amount (MYR)", "Status", "Actions"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-[13px]" style={{ color: "var(--text-disabled)" }}>No payments found</td></tr>
                ) : filtered.map((r) => {
                  const ps = PAYMENT_STYLES[r.paymentStatus] ?? PAYMENT_STYLES.pending;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{r.firstName} {r.lastName}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{r.email}</div>
                      </td>
                      <td>
                        <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded" style={{ color: "var(--text-secondary)" }}>{r.registrationCode}</code>
                      </td>
                      <td className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>{r.category?.replace(/_/g, " ")}</td>
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
                            <button onClick={() => updateStatus(r.id, "paid", r.category)} className="px-2.5 py-1.5 rounded text-[11px] font-semibold" style={{ background: "#d1e7dd", color: "#0a5c39" }}>Mark Paid</button>
                          )}
                          {r.paymentStatus !== "overdue" && r.paymentStatus !== "paid" && r.paymentStatus !== "waived" && (
                            <button onClick={() => updateStatus(r.id, "overdue", r.category)} className="px-2.5 py-1.5 rounded text-[11px] font-semibold" style={{ background: "#f8d7da", color: "#842029" }}>Overdue</button>
                          )}
                          {(r.paymentStatus === "pending" || r.paymentStatus === "overdue") ? (
                            <button onClick={() => sendReminder(r)} disabled={reminderMutation.isPending} className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold" style={{ background: "#fff3cd", color: "#856404" }}>
                              <Bell className="w-3 h-3" /> Remind
                            </button>
                          ) : null}
                          {r.paymentStatus !== "waived" && (
                            <button onClick={() => updateStatus(r.id, "waived", r.category)} className="px-2.5 py-1.5 rounded text-[11px]" style={{ background: "var(--primary-lt)", color: "var(--primary)" }}>Waive</button>
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

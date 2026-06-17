import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations, useUpdateRegistration } from "@workspace/api-client-react";
import { Search, Download, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived: { bg: "#e6f4f5", color: "#0E6E74" },
};

export default function AdminRegistrations() {
  const { data: registrations, refetch } = useGetRegistrations();
  const updateMutation = useUpdateRegistration();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editStatus, setEditStatus] = React.useState<string>("");
  const [editAmount, setEditAmount] = React.useState<string>("");

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
                          className="px-3 py-2 rounded-lg text-[12px] font-medium transition-colors hover:bg-gray-50"
                          style={{ border: "1px solid #e9ecef", color: "#6c757d" }}
                        >
                          Edit
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
    </AdminLayout>
  );
}

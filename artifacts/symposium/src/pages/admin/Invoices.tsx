import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations } from "@workspace/api-client-react";
import { Search, Download, FileText } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived: { bg: "#e6f4f5", color: "#0E6E74" },
};

function toInvoiceNumber(code: string) {
  return "INV-" + code.replace("REG-", "");
}

export default function AdminInvoices() {
  const { data: registrations } = useGetRegistrations();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filtered = (registrations ?? []).filter((r) => {
    const q = search.toLowerCase();
    const inv = toInvoiceNumber(r.registrationCode ?? "");
    const matchSearch = !q || `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q) || inv.toLowerCase().includes(q) || (r.registrationCode ?? "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = (registrations ?? []).filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + (r.paymentAmount ?? 0), 0);
  const outstandingCount = (registrations ?? []).filter((r) => r.paymentStatus === "pending" || r.paymentStatus === "overdue").length;

  const exportCSV = () => {
    const headers = ["Invoice No.", "Reg. Code", "Delegate", "Email", "Category", "Amount (MYR)", "Status", "Issued"];
    const rows = filtered.map((r) => [
      toInvoiceNumber(r.registrationCode ?? ""),
      r.registrationCode ?? "",
      `${r.firstName} ${r.lastName}`,
      r.email ?? "",
      r.category ?? "",
      r.paymentAmount != null ? String(Number(r.paymentAmount).toFixed(2)) : "0.00",
      r.paymentStatus,
      new Date(r.createdAt).toLocaleDateString("en-GB"),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Invoices">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Invoices", value: registrations?.length ?? 0, color: "#0B2744" },
          { label: "Revenue Collected", value: `MYR ${totalRevenue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, color: "#0a5c39" },
          { label: "Outstanding", value: outstandingCount, color: "#856404" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <div className="text-[22px] font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6c757d" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#adb5bd" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, invoice or reg code…" className="w-full pl-9 pr-3 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6" }} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2.5 rounded-lg text-[13px] outline-none" style={{ border: "1px solid #dee2e6", background: "#fff" }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none hidden" style={{ color: "#6c757d" }} />
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white" style={{ background: "#0E6E74" }}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "#6c757d" }}>{filtered.length} invoices</div>

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                {["Invoice", "Delegate", "Category", "Amount (MYR)", "Status", "Date Issued"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10" style={{ color: "#adb5bd" }}>
                  <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#dee2e6" }} />
                  <div className="text-[13px]">No invoices found</div>
                </td></tr>
              ) : filtered.map((r) => {
                const ps = STATUS_STYLES[r.paymentStatus] ?? STATUS_STYLES.pending;
                const invoiceNo = toInvoiceNumber(r.registrationCode ?? "");
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-mono font-medium" style={{ color: "#0B2744" }}>{invoiceNo}</div>
                      <div className="text-[11px]" style={{ color: "#adb5bd" }}>{r.registrationCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{r.firstName} {r.lastName}</div>
                      <div className="text-[11px]" style={{ color: "#adb5bd" }}>{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[12px] capitalize" style={{ color: "#495057" }}>{r.category?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-semibold" style={{ color: r.paymentAmount ? "#212529" : "#adb5bd" }}>
                        {r.paymentAmount != null ? Number(r.paymentAmount).toLocaleString("en-MY", { minimumFractionDigits: 2 }) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize" style={{ background: ps.bg, color: ps.color }}>{r.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: "#6c757d" }}>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
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

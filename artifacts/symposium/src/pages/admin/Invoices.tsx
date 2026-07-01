import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetRegistrations } from "@workspace/api-client-react";
import { Search, Download, FileText, ChevronDown, Loader2 } from "lucide-react";
import { INPUT_BASE, SELECT_BASE, inputBorder } from "@/components/ui/form-primitives";
import { useToast } from "@/hooks/use-toast";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid:    { bg: "var(--status-success-bg)", color: "var(--status-success-text)" },
  pending: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)" },
  overdue: { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)" },
  waived:  { bg: "var(--primary-lt)",        color: "var(--primary)" },
};

function toInvoiceNumber(code: string) {
  return "INV-" + code.replace("REG-", "");
}

async function downloadInvoicePdf(id: number, invoiceNo: string) {
  const token = localStorage.getItem("satbds_token");
  const res = await fetch(`/api/registrations/${id}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNo}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminInvoices() {
  const { data: registrations } = useGetRegistrations();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [downloadingId, setDownloadingId] = React.useState<number | null>(null);

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
          { label: "Total Invoices", value: registrations?.length ?? 0, color: "var(--text)" },
          { label: "Revenue Collected", value: `MYR ${totalRevenue.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, color: "var(--status-success-text)" },
          { label: "Outstanding", value: outstandingCount, color: "var(--status-warning-text)" },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body">
              <div className="text-[22px] font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + export */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-disabled)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, invoice or reg code…" className={`${INPUT_BASE} pl-9`} style={inputBorder()} />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`appearance-none ${SELECT_BASE}`} style={inputBorder()}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        </div>
        <button onClick={exportCSV} className="btn btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="text-[12px] mb-3" style={{ color: "var(--text-muted)" }}>{filtered.length} invoices</div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {["Invoice", "Delegate", "Category", "Amount (MYR)", "Status", "Date Issued", ""].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10" style={{ color: "var(--text-disabled)" }}>
                    <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--border-color)" }} />
                    <div className="text-[13px]">No invoices found</div>
                  </td></tr>
                ) : filtered.map((r) => {
                  const ps = STATUS_STYLES[r.paymentStatus] ?? STATUS_STYLES.pending;
                  const invoiceNo = toInvoiceNumber(r.registrationCode ?? "");
                  const isDownloading = downloadingId === r.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="text-[13px] font-mono font-medium" style={{ color: "var(--text)" }}>{invoiceNo}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{r.registrationCode}</div>
                      </td>
                      <td>
                        <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{r.firstName} {r.lastName}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-disabled)" }}>{r.email}</div>
                      </td>
                      <td className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>{r.category?.replace(/_/g, " ")}</td>
                      <td>
                        <span className="text-[13px] font-semibold" style={{ color: r.paymentAmount ? "var(--text)" : "var(--text-disabled)" }}>
                          {r.paymentAmount != null ? Number(r.paymentAmount).toLocaleString("en-MY", { minimumFractionDigits: 2 }) : "—"}
                        </span>
                      </td>
                      <td>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize" style={{ background: ps.bg, color: ps.color }}>{r.paymentStatus}</span>
                      </td>
                      <td className="text-[12px]" style={{ color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm flex items-center gap-1.5 text-[12px]"
                          disabled={isDownloading}
                          style={{ opacity: isDownloading ? 0.6 : 1 }}
                          title="Download PDF invoice"
                          onClick={async () => {
                            setDownloadingId(r.id);
                            try {
                              await downloadInvoicePdf(r.id, invoiceNo);
                            } catch {
                              toast({ title: "PDF download failed", variant: "destructive" });
                            } finally {
                              setDownloadingId(null);
                            }
                          }}
                        >
                          {isDownloading
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Download className="w-3.5 h-3.5" />}
                          PDF
                        </button>
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

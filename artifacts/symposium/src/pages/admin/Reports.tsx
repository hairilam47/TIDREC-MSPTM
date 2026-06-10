import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetStatsSummary, useGetRegistrations } from "@workspace/api-client-react";
import { Download } from "lucide-react";

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, background: "#e9ecef" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 0.4s ease" }} />
      </div>
      <span className="text-[12px] font-semibold w-10 text-right" style={{ color: "#212529" }}>{value}</span>
    </div>
  );
}

export default function AdminReports() {
  const { data: stats } = useGetStatsSummary();
  const { data: registrations } = useGetRegistrations();

  const catMax = Math.max(...(stats?.registrationsByCategory ?? []).map((c) => c.count), 1);
  const ctryMax = Math.max(...(stats?.registrationsByCountry ?? []).map((c) => c.count), 1);

  const topCountries = [...(stats?.registrationsByCountry ?? [])].sort((a, b) => b.count - a.count).slice(0, 10);

  const exportPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const topCountriesHtml = topCountries.map((c) => `<tr><td>${c.country}</td><td>${c.count}</td></tr>`).join("");
    const catHtml = (stats?.registrationsByCategory ?? []).sort((a, b) => b.count - a.count).map((c) => `<tr><td class="cap">${c.category.replace(/_/g, " ")}</td><td>${c.count}</td></tr>`).join("");
    const abstractTotal = stats?.totalAbstracts ?? 0;
    const acceptRate = abstractTotal > 0 ? Math.round(((stats?.acceptedAbstracts ?? 0) / abstractTotal) * 100) : 0;
    const html = `<!DOCTYPE html><html><head><title>SATBDS 2027 Event Report</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      :root{--report-font:'Inter',sans-serif}
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:var(--report-font);font-size:12px;color:#333;padding:20mm}
      h1{font-size:20px;color:#0B2744;margin-bottom:4px}
      .meta{color:#6c757d;font-size:11px;margin-bottom:20px}
      h2{font-size:13px;font-weight:bold;color:#0E6E74;margin:20px 0 8px;border-bottom:2px solid #0E6E74;padding-bottom:4px;text-transform:uppercase;letter-spacing:.05em}
      .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
      .kpi{border:1px solid #dee2e6;padding:10px;border-radius:6px}
      .kpi-value{font-size:18px;font-weight:bold;color:#0E6E74}
      .kpi-label{font-size:10px;color:#6c757d;text-transform:uppercase;margin-top:2px}
      table{width:100%;border-collapse:collapse;margin-bottom:16px}
      th{background:#f8f9fa;text-align:left;padding:6px 10px;font-size:11px;text-transform:uppercase;border-bottom:2px solid #dee2e6;color:#6c757d}
      td{padding:6px 10px;border-bottom:1px solid #f1f3f5;font-size:12px}
      tr:last-child td{border-bottom:none}
      .cap{text-transform:capitalize}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .footer{margin-top:30px;text-align:center;font-size:10px;color:#adb5bd;border-top:1px solid #dee2e6;padding-top:10px}
      @media print{@page{margin:15mm}body{padding:0}}
    </style></head><body>
      <h1>SATBDS 2027 — Event Report</h1>
      <p class="meta">Generated: ${new Date().toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} · 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium · 22–23 March 2027</p>
      <h2>Summary Statistics</h2>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-value">${stats?.totalRegistrations ?? 0}</div><div class="kpi-label">Registrations</div></div>
        <div class="kpi"><div class="kpi-value">MYR ${(stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}</div><div class="kpi-label">Revenue</div></div>
        <div class="kpi"><div class="kpi-value">${stats?.totalAbstracts ?? 0}</div><div class="kpi-label">Abstracts</div></div>
        <div class="kpi"><div class="kpi-value">${acceptRate}%</div><div class="kpi-label">Acceptance Rate</div></div>
      </div>
      <div class="grid2">
        <div>
          <h2>Registrations by Category</h2>
          <table><thead><tr><th>Category</th><th>Count</th></tr></thead><tbody>${catHtml || "<tr><td colspan=2>No data</td></tr>"}</tbody></table>
        </div>
        <div>
          <h2>Top Countries</h2>
          <table><thead><tr><th>Country</th><th>Count</th></tr></thead><tbody>${topCountriesHtml || "<tr><td colspan=2>No data</td></tr>"}</tbody></table>
        </div>
      </div>
      <h2>Abstract Review Status</h2>
      <table><thead><tr><th>Status</th><th>Count</th><th>% of Total</th></tr></thead><tbody>
        <tr><td>Pending Review</td><td>${stats?.pendingAbstracts ?? 0}</td><td>${abstractTotal > 0 ? Math.round(((stats?.pendingAbstracts ?? 0) / abstractTotal) * 100) : 0}%</td></tr>
        <tr><td>Accepted</td><td>${stats?.acceptedAbstracts ?? 0}</td><td>${acceptRate}%</td></tr>
        <tr><td>Rejected</td><td>${stats?.rejectedAbstracts ?? 0}</td><td>${abstractTotal > 0 ? Math.round(((stats?.rejectedAbstracts ?? 0) / abstractTotal) * 100) : 0}%</td></tr>
      </tbody></table>
      <h2>Payment Status</h2>
      <table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>
        <tr><td>Paid</td><td>${(registrations ?? []).filter((r) => r.paymentStatus === "paid").length}</td></tr>
        <tr><td>Pending</td><td>${(registrations ?? []).filter((r) => r.paymentStatus === "pending").length}</td></tr>
        <tr><td>Overdue</td><td>${(registrations ?? []).filter((r) => r.paymentStatus === "overdue").length}</td></tr>
        <tr><td>Waived</td><td>${(registrations ?? []).filter((r) => r.paymentStatus === "waived").length}</td></tr>
      </tbody></table>
      <div class="footer">SATBDS 2027 · Malaysian Society for Parasitology and Tropical Medicine (MSPTM) · TIDREC@UM</div>
    </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const exportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Registrations", stats?.totalRegistrations ?? 0],
      ["Total Abstracts", stats?.totalAbstracts ?? 0],
      ["Total Speakers", stats?.totalSpeakers ?? 0],
      ["Total Sessions", stats?.totalSessions ?? 0],
      ["Pending Payments", stats?.pendingPayments ?? 0],
      ["Total Revenue (MYR)", stats?.totalRevenue ?? 0],
      ["Accepted Abstracts", stats?.acceptedAbstracts ?? 0],
      ["Rejected Abstracts", stats?.rejectedAbstracts ?? 0],
      ["Pending Review", stats?.pendingAbstracts ?? 0],
      [],
      ["Category", "Count"],
      ...(stats?.registrationsByCategory ?? []).map((c) => [c.category, c.count]),
      [],
      ["Country", "Count"],
      ...(stats?.registrationsByCountry ?? []).map((c) => [c.country, c.count]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "satbds2027-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const paid = (registrations ?? []).filter((r) => r.paymentStatus === "paid").length;
  const pending = (registrations ?? []).filter((r) => r.paymentStatus === "pending").length;
  const overdue = (registrations ?? []).filter((r) => r.paymentStatus === "overdue").length;
  const waived = (registrations ?? []).filter((r) => r.paymentStatus === "waived").length;
  const total = stats?.totalRegistrations ?? 0;
  const abstractTotal = stats?.totalAbstracts ?? 0;

  return (
    <AdminLayout title="Reports">
      <div className="flex justify-end gap-2 mb-5">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium" style={{ background: "#e6f4f5", color: "#0E6E74", border: "1px solid #b2d8db" }}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={exportPdf} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium text-white" style={{ background: "#0B2744" }}>
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Registrations", value: stats?.totalRegistrations ?? 0, sub: "delegates registered", color: "#0E6E74" },
          { label: "Total Revenue", value: `MYR ${(stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, sub: "from paid registrations", color: "#0a5c39" },
          { label: "Abstracts Submitted", value: stats?.totalAbstracts ?? 0, sub: `${stats?.acceptedAbstracts ?? 0} accepted`, color: "#C89B3C" },
          { label: "Acceptance Rate", value: abstractTotal > 0 ? `${Math.round(((stats?.acceptedAbstracts ?? 0) / abstractTotal) * 100)}%` : "—", sub: `${stats?.rejectedAbstracts ?? 0} rejected`, color: "#0B2744" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: "#6c757d" }}>{k.label}</div>
            <div className="text-[24px] font-bold mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-[12px]" style={{ color: "#adb5bd" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment breakdown */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>Payment Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Paid", count: paid, color: "#198754" },
              { label: "Pending", count: pending, color: "#ffc107" },
              { label: "Overdue", count: overdue, color: "#dc3545" },
              { label: "Waived", count: waived, color: "#0E6E74" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span style={{ color: "#495057" }}>{s.label}</span>
                  <span style={{ color: "#6c757d" }}>{total > 0 ? Math.round((s.count / total) * 100) : 0}%</span>
                </div>
                <Bar value={s.count} max={total} color={s.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Abstract status breakdown */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>Abstract Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Pending Review", count: stats?.pendingAbstracts ?? 0, color: "#ffc107" },
              { label: "Accepted", count: stats?.acceptedAbstracts ?? 0, color: "#198754" },
              { label: "Rejected", count: stats?.rejectedAbstracts ?? 0, color: "#dc3545" },
              { label: "Under Review", count: abstractTotal - (stats?.pendingAbstracts ?? 0) - (stats?.acceptedAbstracts ?? 0) - (stats?.rejectedAbstracts ?? 0), color: "#0E6E74" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span style={{ color: "#495057" }}>{s.label}</span>
                  <span style={{ color: "#6c757d" }}>{abstractTotal > 0 ? Math.round((s.count / abstractTotal) * 100) : 0}%</span>
                </div>
                <Bar value={Math.max(s.count, 0)} max={abstractTotal} color={s.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>Registrations by Category</h3>
          {(stats?.registrationsByCategory ?? []).length === 0 ? (
            <div className="text-center py-6 text-[13px]" style={{ color: "#adb5bd" }}>No data</div>
          ) : (
            <div className="space-y-3">
              {(stats?.registrationsByCategory ?? []).sort((a, b) => b.count - a.count).map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="capitalize" style={{ color: "#495057" }}>{c.category.replace(/_/g, " ")}</span>
                    <span style={{ color: "#6c757d" }}>{c.count}</span>
                  </div>
                  <Bar value={c.count} max={catMax} color="#0E6E74" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Country */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>Top Countries</h3>
          {topCountries.length === 0 ? (
            <div className="text-center py-6 text-[13px]" style={{ color: "#adb5bd" }}>No data</div>
          ) : (
            <div className="space-y-3">
              {topCountries.map((c) => (
                <div key={c.country}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span style={{ color: "#495057" }}>{c.country}</span>
                    <span style={{ color: "#6c757d" }}>{c.count}</span>
                  </div>
                  <Bar value={c.count} max={ctryMax} color="#C89B3C" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

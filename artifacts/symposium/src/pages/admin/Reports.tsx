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
      <div className="flex justify-end mb-5">
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium" style={{ background: "#0E6E74", color: "#fff" }}>
          <Download className="w-4 h-4" /> Export CSV
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

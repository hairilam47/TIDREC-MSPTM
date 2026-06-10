import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetStatsSummary, useGetRegistrations, useGetAbstracts } from "@workspace/api-client-react";
import { TrendingUp, Users, FileText, DollarSign, Award } from "lucide-react";

function ProgressBar({ value, max, color, label, count }: { value: number; max: number; color: string; label: string; count: number }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[12px] mb-1.5">
        <span style={{ color: "#495057" }}>{label}</span>
        <span className="font-semibold" style={{ color: "#212529" }}>{count} <span style={{ color: "#adb5bd" }}>({pct}%)</span></span>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#e9ecef" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { data: stats } = useGetStatsSummary();
  const { data: registrations } = useGetRegistrations();
  const { data: abstracts } = useGetAbstracts();

  const regTotal = stats?.totalRegistrations ?? 0;
  const absTotal = stats?.totalAbstracts ?? 0;

  const paid = (registrations ?? []).filter((r) => r.paymentStatus === "paid").length;
  const pending = (registrations ?? []).filter((r) => r.paymentStatus === "pending").length;
  const overdue = (registrations ?? []).filter((r) => r.paymentStatus === "overdue").length;
  const waived = (registrations ?? []).filter((r) => r.paymentStatus === "waived").length;

  const oral = (abstracts ?? []).filter((a) => a.abstractType === "oral").length;
  const poster = (abstracts ?? []).filter((a) => a.abstractType === "poster").length;
  const accepted = stats?.acceptedAbstracts ?? 0;
  const rejected = stats?.rejectedAbstracts ?? 0;
  const underReview = (abstracts ?? []).filter((a) => a.status === "under_review").length;
  const revisionReq = (abstracts ?? []).filter((a) => a.status === "revision_requested").length;

  const acceptRate = absTotal > 0 ? Math.round((accepted / absTotal) * 100) : 0;
  const payRate = regTotal > 0 ? Math.round((paid / regTotal) * 100) : 0;
  const targetPct = Math.min(Math.round((regTotal / 300) * 100), 100);

  const kpis = [
    { label: "Total Registrations", value: regTotal, icon: Users, color: "#0E6E74", bg: "#e6f4f5", trend: `${targetPct}% of 300 target` },
    { label: "Total Abstracts", value: absTotal, icon: FileText, color: "#C89B3C", bg: "#FDF6E8", trend: `${acceptRate}% acceptance rate` },
    { label: "Revenue Collected", value: `MYR ${(stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#0a5c39", bg: "#d1e7dd", trend: `${payRate}% payment rate` },
    { label: "Pending Actions", value: (pending + (stats?.pendingAbstracts ?? 0)), icon: TrendingUp, color: "#856404", bg: "#fff3cd", trend: `${pending} payments + ${stats?.pendingAbstracts ?? 0} abstracts` },
  ];

  return (
    <AdminLayout title="Analytics">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
                  <Icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
              </div>
              <div className="text-[22px] font-bold leading-none mb-1" style={{ color: "#212529" }}>{k.value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6c757d" }}>{k.label}</div>
              <div className="text-[12px]" style={{ color: "#adb5bd" }}>{k.trend}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Registration Target */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold" style={{ color: "#212529" }}>Registration Progress</h3>
            <span className="text-[13px] font-bold" style={{ color: "#0E6E74" }}>{regTotal} / 300</span>
          </div>
          <div className="relative rounded-full overflow-hidden mb-3" style={{ height: 16, background: "#e9ecef" }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${targetPct}%`, background: "linear-gradient(90deg, #0E6E74, #0B2744)" }} />
          </div>
          <div className="text-center text-[12px] mb-5" style={{ color: "#6c757d" }}>{targetPct}% of target reached</div>
          <div className="space-y-0">
            <ProgressBar value={paid} max={regTotal} color="#198754" label="Paid" count={paid} />
            <ProgressBar value={pending} max={regTotal} color="#ffc107" label="Pending Payment" count={pending} />
            <ProgressBar value={overdue} max={regTotal} color="#dc3545" label="Overdue" count={overdue} />
            <ProgressBar value={waived} max={regTotal} color="#0E6E74" label="Waived" count={waived} />
          </div>
        </div>

        {/* Abstract Review Funnel */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold" style={{ color: "#212529" }}>Abstract Review Funnel</h3>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#d1e7dd", color: "#0a5c39" }}>
              <Award className="w-3.5 h-3.5" /> {acceptRate}% accepted
            </span>
          </div>
          <div className="space-y-0">
            <ProgressBar value={absTotal} max={absTotal} color="#0B2744" label="Total Submitted" count={absTotal} />
            <ProgressBar value={stats?.pendingAbstracts ?? 0} max={absTotal} color="#ffc107" label="Awaiting Review" count={stats?.pendingAbstracts ?? 0} />
            <ProgressBar value={underReview} max={absTotal} color="#0E6E74" label="Under Review" count={underReview} />
            <ProgressBar value={revisionReq} max={absTotal} color="#e67e22" label="Revision Requested" count={revisionReq} />
            <ProgressBar value={accepted} max={absTotal} color="#198754" label="Accepted" count={accepted} />
            <ProgressBar value={rejected} max={absTotal} color="#dc3545" label="Rejected" count={rejected} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Category */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>By Category</h3>
          {(stats?.registrationsByCategory ?? []).length === 0 ? (
            <div className="text-center py-6 text-[12px]" style={{ color: "#adb5bd" }}>No data yet</div>
          ) : [...(stats?.registrationsByCategory ?? [])].sort((a, b) => b.count - a.count).map((c) => (
            <ProgressBar key={c.category} value={c.count} max={regTotal} color="#0E6E74" label={c.category.replace(/_/g, " ")} count={c.count} />
          ))}
        </div>

        {/* Abstract Types */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>Abstract Types</h3>
          <ProgressBar value={oral} max={absTotal} color="#0B2744" label="Oral presentations" count={oral} />
          <ProgressBar value={poster} max={absTotal} color="#C89B3C" label="Poster presentations" count={poster} />

          <div className="mt-5 pt-4" style={{ borderTop: "1px solid #f1f3f5" }}>
            <div className="text-[12px] font-semibold mb-3" style={{ color: "#6c757d" }}>PROGRAMME OVERVIEW</div>
            {[
              { label: "Total Speakers", value: stats?.totalSpeakers ?? 0 },
              { label: "Total Sessions", value: stats?.totalSessions ?? 0 },
            ].map((s) => (
              <div key={s.label} className="flex justify-between py-2" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <span className="text-[13px]" style={{ color: "#495057" }}>{s.label}</span>
                <span className="text-[13px] font-semibold" style={{ color: "#212529" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: "#212529" }}>Top Countries</h3>
          {(stats?.registrationsByCountry ?? []).length === 0 ? (
            <div className="text-center py-6 text-[12px]" style={{ color: "#adb5bd" }}>No data yet</div>
          ) : [...(stats?.registrationsByCountry ?? [])].sort((a, b) => b.count - a.count).slice(0, 8).map((c) => {
            const max = Math.max(...(stats?.registrationsByCountry ?? []).map((x) => x.count), 1);
            return <ProgressBar key={c.country} value={c.count} max={max} color="#C89B3C" label={c.country} count={c.count} />;
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetStatsSummary, useGetRegistrations, useGetAbstracts, useUpdateAbstract } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, FileText, DollarSign, Clock, TrendingUp, CheckCircle, XCircle, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  paid: { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived: { bg: "#e6f4f5", color: "#0E6E74" },
};

const ABSTRACT_STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: "#e6f4f5", color: "#0E6E74", label: "Submitted" },
  under_review: { bg: "#fff3cd", color: "#856404", label: "Under Review" },
  accepted: { bg: "#d1e7dd", color: "#0a5c39", label: "Accepted" },
  rejected: { bg: "#f8d7da", color: "#842029", label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404", label: "Revision" },
};

export default function AdminDashboard() {
  const { data: stats } = useGetStatsSummary();
  const { data: registrations } = useGetRegistrations();
  const { data: abstracts, refetch: refetchAbstracts } = useGetAbstracts();
  const updateAbstractMutation = useUpdateAbstract();
  const { toast } = useToast();
  const [reviewNote, setReviewNote] = React.useState<Record<number, string>>({});

  const recentRegs = (registrations ?? []).slice(-10).reverse();
  const pendingAbstracts = (abstracts ?? []).filter((a) => a.status === "submitted" || a.status === "under_review").slice(0, 5);

  const kpis = [
    {
      label: "Total Registrations",
      value: stats?.totalRegistrations ?? 0,
      sub: `${stats?.pendingPayments ?? 0} pending payment`,
      icon: Users,
      iconBg: "#e6f4f5",
      iconColor: "#0E6E74",
    },
    {
      label: "Abstracts Submitted",
      value: stats?.totalAbstracts ?? 0,
      sub: `${stats?.pendingAbstracts ?? 0} awaiting review`,
      icon: FileText,
      iconBg: "#FDF6E8",
      iconColor: "#C89B3C",
    },
    {
      label: "Revenue (MYR)",
      value: `${(stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
      sub: `${stats?.pendingPayments ?? 0} pending payments`,
      icon: DollarSign,
      iconBg: "#d1e7dd",
      iconColor: "#0a5c39",
    },
    {
      label: "Abstract Acceptance",
      value: stats?.totalAbstracts
        ? `${Math.round(((stats.acceptedAbstracts ?? 0) / stats.totalAbstracts) * 100)}%`
        : "—",
      sub: `${stats?.acceptedAbstracts ?? 0} accepted · ${stats?.rejectedAbstracts ?? 0} rejected`,
      icon: TrendingUp,
      iconBg: "#f8d7da",
      iconColor: "#842029",
    },
  ];

  const handleReview = (id: number, status: "accepted" | "rejected" | "revision_requested" | "under_review") => {
    updateAbstractMutation.mutate(
      { id, data: { status, reviewNotes: reviewNote[id] || undefined } },
      {
        onSuccess: () => {
          refetchAbstracts();
          setReviewNote((prev) => { const n = { ...prev }; delete n[id]; return n; });
          toast({ title: "Status updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: k.iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: k.iconColor }} />
                </div>
              </div>
              <div className="text-[26px] font-bold leading-none mb-1" style={{ color: "#212529" }}>{k.value}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "#6c757d" }}>{k.label}</div>
              <div className="text-[12px]" style={{ color: "#adb5bd" }}>{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent Registrations */}
        <div className="xl:col-span-3 bg-white rounded-xl" style={{ border: "1px solid #e9ecef" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f1f3f5" }}>
            <h2 className="text-[15px] font-semibold" style={{ color: "#212529" }}>Recent Registrations</h2>
            <Link href="/admin/registrations" className="text-[12px] font-medium no-underline" style={{ color: "#0E6E74" }}>View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#f8f9fa" }}>
                <tr>
                  {["Delegate", "Category", "Country", "Payment", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRegs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-[13px]" style={{ color: "#adb5bd" }}>No registrations yet</td></tr>
                ) : recentRegs.map((r) => {
                  const ps = PAYMENT_STYLES[r.paymentStatus] ?? PAYMENT_STYLES.pending;
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{r.firstName} {r.lastName}</div>
                        <div className="text-[11px]" style={{ color: "#adb5bd" }}>{r.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{r.category?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{r.country ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: ps.bg, color: ps.color }}>{r.paymentStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px]" style={{ color: "#adb5bd" }}>{new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abstract Review Queue */}
        <div className="xl:col-span-2 bg-white rounded-xl" style={{ border: "1px solid #e9ecef" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #f1f3f5" }}>
            <h2 className="text-[15px] font-semibold" style={{ color: "#212529" }}>Abstract Queue</h2>
            <Link href="/admin/abstracts" className="text-[12px] font-medium no-underline" style={{ color: "#0E6E74" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "#f1f3f5" }}>
            {pendingAbstracts.length === 0 ? (
              <div className="text-center py-8 text-[13px]" style={{ color: "#adb5bd" }}>No abstracts pending review</div>
            ) : pendingAbstracts.map((a) => {
              const sc = ABSTRACT_STATUS_STYLES[a.status];
              return (
                <div key={a.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-[13px] font-medium leading-snug line-clamp-2" style={{ color: "#212529" }}>{a.title}</div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div className="text-[11px] mb-3" style={{ color: "#adb5bd" }}>
                    {a.submitterName} · {a.abstractType} · {a.abstractCode}
                  </div>
                  <input
                    type="text"
                    placeholder="Review note (optional)"
                    value={reviewNote[a.id] ?? ""}
                    onChange={(e) => setReviewNote((p) => ({ ...p, [a.id]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[12px] mb-2 outline-none"
                    style={{ border: "1px solid #e9ecef" }}
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleReview(a.id, "accepted")}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: "#d1e7dd", color: "#0a5c39" }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleReview(a.id, "revision_requested")}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: "#fff3cd", color: "#856404" }}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Revise
                    </button>
                    <button
                      onClick={() => handleReview(a.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold"
                      style={{ background: "#f8d7da", color: "#842029" }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registration progress bar */}
      <div className="mt-6 bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>Registration Target</div>
            <div className="text-[12px]" style={{ color: "#6c757d" }}>{stats?.totalRegistrations ?? 0} of 300 target delegates registered</div>
          </div>
          <div className="text-[22px] font-bold" style={{ color: "#0E6E74" }}>
            {stats?.totalRegistrations ? Math.min(Math.round((stats.totalRegistrations / 300) * 100), 100) : 0}%
          </div>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#e9ecef" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${stats?.totalRegistrations ? Math.min((stats.totalRegistrations / 300) * 100, 100) : 0}%`,
              background: "#0E6E74",
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

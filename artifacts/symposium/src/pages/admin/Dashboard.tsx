import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { useGetStatsSummary, useGetRegistrations, useGetAbstracts, useUpdateAbstract } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, FileText, DollarSign, TrendingUp, CheckCircle, XCircle, Edit3, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CARD_STYLE = { border: "1px solid #e9ecef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };

const PAYMENT_BADGE: Record<string, { bg: string; color: string }> = {
  paid:    { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived:  { bg: "#e6f4f5", color: "#0E6E74" },
};

const ABSTRACT_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  submitted:          { bg: "#e6f4f5", color: "#0E6E74",  label: "Submitted" },
  under_review:       { bg: "#fff3cd", color: "#856404",  label: "Under Review" },
  accepted:           { bg: "#d1e7dd", color: "#0a5c39",  label: "Accepted" },
  rejected:           { bg: "#f8d7da", color: "#842029",  label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404",  label: "Revision Needed" },
};

const KPI_CONFIG = [
  { key: "registrations", label: "Registrations",       icon: Users,       iconBg: "#e6f4f5", iconColor: "#0E6E74", accent: "#0E6E74" },
  { key: "abstracts",     label: "Abstracts Submitted",  icon: FileText,    iconBg: "#FDF6E8", iconColor: "#C89B3C", accent: "#C89B3C" },
  { key: "revenue",       label: "Revenue (MYR)",        icon: DollarSign,  iconBg: "#d1e7dd", iconColor: "#0a5c39", accent: "#0a5c39" },
  { key: "acceptance",    label: "Acceptance Rate",       icon: TrendingUp,  iconBg: "#f8d7da", iconColor: "#842029", accent: "#842029" },
];

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize leading-none" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

function SectionHeader({ title, href, linkLabel = "View all" }: { title: string; href: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
      <h2 className="text-[14px] font-semibold" style={{ color: "#212529" }}>{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-[12px] font-medium no-underline" style={{ color: "#0E6E74" }}>
        {linkLabel} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useGetStatsSummary();
  const { data: registrations } = useGetRegistrations();
  const { data: abstracts, refetch: refetchAbstracts } = useGetAbstracts();
  const updateAbstractMutation = useUpdateAbstract();
  const { toast } = useToast();
  const [reviewNote, setReviewNote] = React.useState<Record<number, string>>({});

  const recentRegs = (registrations ?? []).slice(-8).reverse();
  const pendingAbstracts = (abstracts ?? [])
    .filter((a) => a.status === "submitted" || a.status === "under_review")
    .slice(0, 5);

  const kpiValues: Record<string, { value: string | number; sub: string }> = {
    registrations: {
      value: stats?.totalRegistrations ?? 0,
      sub: `${stats?.pendingPayments ?? 0} pending payment`,
    },
    abstracts: {
      value: stats?.totalAbstracts ?? 0,
      sub: `${stats?.pendingAbstracts ?? 0} awaiting review`,
    },
    revenue: {
      value: (stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2 }),
      sub: `${stats?.pendingPayments ?? 0} pending`,
    },
    acceptance: {
      value: stats?.totalAbstracts
        ? `${Math.round(((stats.acceptedAbstracts ?? 0) / stats.totalAbstracts) * 100)}%`
        : "—",
      sub: `${stats?.acceptedAbstracts ?? 0} accepted · ${stats?.rejectedAbstracts ?? 0} rejected`,
    },
  };

  const handleReview = (id: number, status: "accepted" | "rejected" | "revision_requested" | "under_review") => {
    updateAbstractMutation.mutate(
      { id, data: { status, reviewNotes: reviewNote[id] || undefined } },
      {
        onSuccess: () => {
          refetchAbstracts();
          setReviewNote((prev) => { const n = { ...prev }; delete n[id]; return n; });
          toast({ title: "Abstract updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {KPI_CONFIG.map((k) => {
          const { value, sub } = kpiValues[k.key];
          const Icon = k.icon;
          return (
            <div key={k.key} className="bg-white rounded-xl overflow-hidden" style={CARD_STYLE}>
              {/* Colour accent strip */}
              <div style={{ height: 3, background: k.accent }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: k.iconBg }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: k.iconColor }} />
                  </div>
                </div>
                <div className="text-[28px] font-bold leading-none mb-1" style={{ color: "#212529" }}>{value}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6c757d" }}>{k.label}</div>
                <div className="text-[12px]" style={{ color: "#adb5bd" }}>{sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-5">
        {/* Recent Registrations */}
        <div className="xl:col-span-3 bg-white rounded-xl overflow-hidden" style={CARD_STYLE}>
          <SectionHeader title="Recent Registrations" href="/admin/registrations" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Delegate", "Category", "Country", "Payment", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRegs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>No registrations yet</td>
                  </tr>
                ) : recentRegs.map((r) => {
                  const ps = PAYMENT_BADGE[r.paymentStatus] ?? PAYMENT_BADGE.pending;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f1f3f5" }}>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{r.firstName} {r.lastName}</div>
                        <div className="text-[11px]" style={{ color: "#adb5bd" }}>{r.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] capitalize" style={{ color: "#495057" }}>{r.category?.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{r.country ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge bg={ps.bg} color={ps.color}>{r.paymentStatus}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[12px]" style={{ color: "#adb5bd" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Abstract Review Queue */}
        <div className="xl:col-span-2 bg-white rounded-xl overflow-hidden" style={CARD_STYLE}>
          <SectionHeader title="Abstract Queue" href="/admin/abstracts" />
          <div>
            {pendingAbstracts.length === 0 ? (
              <div className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#dee2e6" }} />
                All abstracts reviewed
              </div>
            ) : pendingAbstracts.map((a, idx) => {
              const sc = ABSTRACT_BADGE[a.status];
              return (
                <div key={a.id} className="px-5 py-4" style={{ borderBottom: idx < pendingAbstracts.length - 1 ? "1px solid #f1f3f5" : "none" }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="text-[13px] font-medium leading-snug line-clamp-2" style={{ color: "#212529" }}>{a.title}</div>
                    <Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge>
                  </div>
                  <div className="text-[11px] mb-3" style={{ color: "#adb5bd" }}>
                    {a.submitterName} · {a.abstractType} · {a.abstractCode}
                  </div>
                  <input
                    type="text"
                    placeholder="Review note (optional)"
                    value={reviewNote[a.id] ?? ""}
                    onChange={(e) => setReviewNote((p) => ({ ...p, [a.id]: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[12px] mb-2 outline-none focus:ring-1"
                    style={{ border: "1px solid #e9ecef", background: "#f8f9fa" }}
                  />
                  <div className="flex gap-1.5">
                    <button onClick={() => handleReview(a.id, "accepted")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80" style={{ background: "#d1e7dd", color: "#0a5c39" }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button onClick={() => handleReview(a.id, "revision_requested")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80" style={{ background: "#fff3cd", color: "#856404" }}>
                      <Edit3 className="w-3.5 h-3.5" /> Revise
                    </button>
                    <button onClick={() => handleReview(a.id, "rejected")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80" style={{ background: "#f8d7da", color: "#842029" }}>
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registration target progress */}
      <div className="bg-white rounded-xl p-5" style={CARD_STYLE}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[14px] font-semibold mb-0.5" style={{ color: "#212529" }}>Registration Target</div>
            <div className="text-[12px]" style={{ color: "#6c757d" }}>
              {stats?.totalRegistrations ?? 0} of 300 target delegates registered
            </div>
          </div>
          <div className="text-right">
            <div className="text-[26px] font-bold leading-none" style={{ color: "#0E6E74" }}>
              {stats?.totalRegistrations ? Math.min(Math.round((stats.totalRegistrations / 300) * 100), 100) : 0}%
            </div>
            <div className="text-[11px]" style={{ color: "#adb5bd" }}>of target</div>
          </div>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#e9ecef" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${stats?.totalRegistrations ? Math.min((stats.totalRegistrations / 300) * 100, 100) : 0}%`,
              background: "linear-gradient(90deg, #0E6E74 0%, #0a5c39 100%)",
            }}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

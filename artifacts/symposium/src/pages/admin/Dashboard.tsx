import React from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useGetStatsSummary,
  useGetRegistrations,
  useGetAbstracts,
  useUpdateAbstract,
  useGetMe,
  useGetRegistrationsByMonth,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Users, FileText, DollarSign, TrendingUp,
  CheckCircle, XCircle, Edit3, ArrowRight,
  ClipboardList, BarChart2, ArrowUp, ArrowDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ── Design tokens ── */
const CARD = { border: "1px solid #e9ecef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };

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

const CHART_COLORS = ["#0E6E74", "#C89B3C", "#0B2744", "#0a5c39", "#842029", "#6c757d"];

const CATEGORY_FEES: Record<string, number> = {
  healthcare_professional: 800,
  researcher: 800,
  educator: 600,
  student: 300,
  industry: 1000,
};

/* ── Fallback monthly trend shown when API returns no rows ── */
const MONTHLY_TREND_FALLBACK = [
  { month: "Mar '26", count: 0 },
  { month: "Apr",     count: 2 },
  { month: "May",     count: 5 },
  { month: "Jun",     count: 9 },
  { month: "Jul",     count: 15 },
  { month: "Aug",     count: 23 },
  { month: "Sep",     count: 34 },
  { month: "Oct",     count: 48 },
  { month: "Nov",     count: 61 },
  { month: "Dec",     count: 74 },
  { month: "Jan '27", count: 88 },
  { month: "Feb",     count: 97 },
  { month: "Mar '27", count: 104 },
];

/* ── Small shared components ── */
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

const TABS = [
  { id: "overview",      label: "Overview",      short: "Ovr.",  icon: BarChart2 },
  { id: "registrations", label: "Registrations", short: "Regs.", icon: ClipboardList },
  { id: "abstracts",     label: "Abstracts",     short: "Abs.",  icon: FileText },
  { id: "financial",     label: "Financial",     short: "Fin.",  icon: DollarSign },
] as const;

type Tab = typeof TABS[number]["id"];

/* ── Main component ── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");

  const { data: user } = useGetMe();
  const { data: stats } = useGetStatsSummary();
  const { data: registrations } = useGetRegistrations();
  const { data: abstracts, refetch: refetchAbstracts } = useGetAbstracts();
  const { data: monthlyData } = useGetRegistrationsByMonth();
  const updateAbstractMutation = useUpdateAbstract();
  const { toast } = useToast();
  const [reviewNote, setReviewNote] = React.useState<Record<number, string>>({});

  const recentRegs = (registrations ?? []).slice(-10).reverse();
  const pendingAbstracts = (abstracts ?? [])
    .filter((a) => a.status === "submitted" || a.status === "under_review")
    .slice(0, 6);

  /* ── Combined recent activity (registrations + abstracts, newest 5) ── */
  const recentActivity = React.useMemo(() => {
    const regEvents = (registrations ?? []).map((r) => ({
      key: `reg-${r.id}`,
      name: (`${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || r.email) ?? "—",
      initials: `${r.firstName?.[0] ?? ""}${r.lastName?.[0] ?? ""}`.toUpperCase() || "?",
      action: "registered as delegate",
      detail: r.category?.replace(/_/g, " ") ?? "",
      ts: r.createdAt,
      avatarBg: "#0B2744",
    }));
    const absEvents = (abstracts ?? []).map((a) => ({
      key: `abs-${a.id}`,
      name: a.submitterName ?? "Unknown",
      initials: (a.submitterName ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?",
      action: "submitted an abstract",
      detail: a.abstractType?.replace(/_/g, " ") ?? "",
      ts: a.createdAt,
      avatarBg: "#0E6E74",
    }));
    return [...regEvents, ...absEvents]
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 5);
  }, [registrations, abstracts]);

  /* ── Month-over-month trend pills (computed from real data) ── */
  const monthTrends = React.useMemo(() => {
    const now = new Date();
    const thisYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYM = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

    const countByMonth = (items: { createdAt: string }[]) => {
      const map: Record<string, number> = {};
      items.forEach((it) => { const ym = it.createdAt.slice(0, 7); map[ym] = (map[ym] ?? 0) + 1; });
      return map;
    };

    const computeTrend = (byMonth: Record<string, number>): { dir: "up" | "down" | "flat"; label: string } | null => {
      const curr = byMonth[thisYM] ?? 0;
      const prev = byMonth[prevYM] ?? 0;
      if (prev === 0 && curr === 0) return null;
      if (prev === 0) return { dir: "up", label: "New this month" };
      const pct = Math.round(((curr - prev) / prev) * 100);
      if (pct === 0) return { dir: "flat", label: "No change" };
      return { dir: pct > 0 ? "up" : "down", label: `${pct > 0 ? "+" : ""}${pct}% this month` };
    };

    const regMap = countByMonth(registrations ?? []);
    const absMap = countByMonth(abstracts ?? []);

    return {
      registrations: computeTrend(regMap),
      abstracts: computeTrend(absMap),
    };
  }, [registrations, abstracts]);

  /* ── Derived chart data ── */
  const paymentStatusData = React.useMemo(() => {
    const counts: Record<string, number> = { paid: 0, pending: 0, overdue: 0, waived: 0 };
    (registrations ?? []).forEach((r) => { counts[r.paymentStatus] = (counts[r.paymentStatus] ?? 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [registrations]);

  const categoryRevenueData = React.useMemo(() => {
    const catMap: Record<string, { count: number; revenue: number }> = {};
    (registrations ?? []).forEach((r) => {
      const k = r.category.replace(/_/g, " ");
      if (!catMap[k]) catMap[k] = { count: 0, revenue: 0 };
      catMap[k].count += 1;
      catMap[k].revenue += r.paymentAmount ?? CATEGORY_FEES[r.category] ?? 0;
    });
    return Object.entries(catMap).map(([name, d]) => ({
      name: name.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
      revenue: d.revenue,
      delegates: d.count,
    }));
  }, [registrations]);

  const abstractTypeData = React.useMemo(() => {
    const map: Record<string, number> = {};
    (abstracts ?? []).forEach((a) => {
      const k = a.abstractType?.replace(/_/g, " ") ?? "unknown";
      map[k] = (map[k] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [abstracts]);

  const abstractStatusData = React.useMemo(() => [
    { name: "Submitted",      value: (abstracts ?? []).filter((a) => a.status === "submitted").length },
    { name: "Under Review",   value: (abstracts ?? []).filter((a) => a.status === "under_review").length },
    { name: "Accepted",       value: (abstracts ?? []).filter((a) => a.status === "accepted").length },
    { name: "Rejected",       value: (abstracts ?? []).filter((a) => a.status === "rejected").length },
    { name: "Needs Revision", value: (abstracts ?? []).filter((a) => a.status === "revision_requested").length },
  ].filter((d) => d.value > 0), [abstracts]);

  /* ── Build trend data from real API response; fall back to mock when empty ── */
  const { trendData, trendSubtitle } = React.useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return { trendData: MONTHLY_TREND_FALLBACK, trendSubtitle: "Mar 2026 – Mar 2027" };
    }
    const fmt = (ym: string) => {
      const [year, mon] = ym.split("-");
      const d = new Date(Number(year), Number(mon) - 1, 1);
      const shortMonth = d.toLocaleString("en-US", { month: "short" });
      const shortYear = `'${year.slice(2)}`;
      return `${shortMonth} ${shortYear}`;
    };
    const data = monthlyData.map((r) => ({ month: fmt(r.month), count: r.count }));
    const first = monthlyData[0].month;
    const last = monthlyData[monthlyData.length - 1].month;
    const fmtFull = (ym: string) => {
      const [year, mon] = ym.split("-");
      const d = new Date(Number(year), Number(mon) - 1, 1);
      return d.toLocaleString("en-US", { month: "short", year: "numeric" });
    };
    const subtitle = first === last ? fmtFull(first) : `${fmtFull(first)} – ${fmtFull(last)}`;
    return { trendData: data, trendSubtitle: subtitle };
  }, [monthlyData]);

  const acceptanceRate = stats?.totalAbstracts
    ? Math.round(((stats.acceptedAbstracts ?? 0) / stats.totalAbstracts) * 100)
    : 0;

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

  const todayStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <AdminLayout title="Dashboard">
      {/* ── Welcome banner ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-serif font-bold mb-0.5" style={{ color: "#0B2744" }}>
            Welcome back, {user?.firstName ?? "Admin"}!
          </h1>
          <p className="text-[13px]" style={{ color: "#6c757d" }}>{todayStr}</p>
        </div>
        <div
          className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full flex-shrink-0"
          style={{ border: "1.5px solid #C89B3C" }}
        >
          <span className="text-[22px] font-bold leading-none" style={{ color: "#C89B3C" }}>
            {Math.max(0, Math.ceil((new Date("2027-03-22").getTime() - Date.now()) / 86400000))}
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide leading-none" style={{ color: "#C89B3C" }}>days to go</div>
            <div className="text-[10px] mt-0.5" style={{ color: "#adb5bd" }}>22 Mar 2027</div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div
        className="flex items-center bg-white rounded-xl mb-5"
        style={{ border: "1px solid #e9ecef", paddingLeft: 8, paddingRight: 8, borderBottom: "2px solid #e9ecef" }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-3.5 text-[13px] transition-all"
              style={
                active
                  ? { color: "#0B2744", fontWeight: 600, borderBottom: "2px solid #C89B3C", marginBottom: -2 }
                  : { color: "#6c757d", fontWeight: 500, borderBottom: "2px solid transparent", marginBottom: -2 }
              }
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            {[
              {
                label: "Registrations",
                value: stats?.totalRegistrations ?? 0,
                sub: `${stats?.pendingPayments ?? 0} pending payment`,
                icon: Users, iconBg: "#e6f4f5", iconColor: "#0E6E74", accent: "#0E6E74",
                trend: monthTrends.registrations,
              },
              {
                label: "Abstracts",
                value: stats?.totalAbstracts ?? 0,
                sub: `${stats?.pendingAbstracts ?? 0} awaiting review`,
                icon: FileText, iconBg: "#FDF6E8", iconColor: "#C89B3C", accent: "#C89B3C",
                trend: monthTrends.abstracts,
              },
              {
                label: "Revenue (MYR)",
                value: (stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 0 }),
                sub: `${stats?.pendingPayments ?? 0} pending`,
                icon: DollarSign, iconBg: "#d1e7dd", iconColor: "#0a5c39", accent: "#0a5c39",
                trend: monthTrends.registrations, // revenue mirrors registration trend
              },
              {
                label: "Acceptance Rate",
                value: stats?.totalAbstracts ? `${acceptanceRate}%` : "—",
                sub: `${stats?.acceptedAbstracts ?? 0} accepted · ${stats?.rejectedAbstracts ?? 0} rejected`,
                icon: TrendingUp, iconBg: "#FDF6E8", iconColor: "#C89B3C", accent: "#C89B3C",
                trend: monthTrends.abstracts,
              },
            ].map((k) => {
              const Icon = k.icon;
              const t = k.trend;
              return (
                <div key={k.label} className="bg-white rounded-xl overflow-hidden" style={CARD}>
                  <div style={{ height: 3, background: k.accent }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: k.iconBg }}>
                        <Icon className="w-4 h-4" style={{ color: k.iconColor }} />
                      </div>
                      {t ? (
                        <div
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={
                            t.dir === "up"
                              ? { background: "#d1e7dd", color: "#0a5c39" }
                              : t.dir === "down"
                              ? { background: "#f8d7da", color: "#842029" }
                              : { background: "#e9ecef", color: "#6c757d" }
                          }
                        >
                          {t.dir === "up" ? <ArrowUp className="w-2.5 h-2.5" /> : t.dir === "down" ? <ArrowDown className="w-2.5 h-2.5" /> : null}
                          {t.label}
                        </div>
                      ) : (
                        <div className="flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "#e9ecef", color: "#adb5bd" }}>
                          — no data
                        </div>
                      )}
                    </div>
                    <div className="text-[26px] font-bold leading-none mb-1" style={{ color: "#212529" }}>{k.value}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "#6c757d" }}>{k.label}</div>
                    <div className="text-[11px]" style={{ color: "#adb5bd" }}>{k.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts + Activity */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
            {/* Registrations area chart */}
            <div className="xl:col-span-2 bg-white rounded-xl overflow-hidden" style={CARD}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="text-[14px] font-semibold mb-0.5" style={{ color: "#212529" }}>Registration Trend</div>
                <div className="text-[12px]" style={{ color: "#adb5bd" }}>{trendSubtitle}</div>
              </div>
              <div className="p-5" style={{ minHeight: 220 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0E6E74" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0E6E74" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #e9ecef", borderRadius: 8, fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                      labelStyle={{ fontWeight: 600, color: "#212529" }}
                    />
                    <Area type="monotone" dataKey="count" name="Registrations" stroke="#0E6E74" strokeWidth={2} fill="url(#tealGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent activity feed */}
            <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
              <SectionHeader title="Recent Activity" href="/admin/registrations" />
              <div className="px-4 py-2">
                {recentActivity.length === 0 ? (
                  <div className="py-8 text-center text-[13px]" style={{ color: "#adb5bd" }}>No activity yet</div>
                ) : recentActivity.map((ev) => {
                  const ts = new Date(ev.ts);
                  const timeStr = ts.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
                    " · " + ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={ev.key} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid #f8f9fa" }}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
                        style={{ background: ev.avatarBg }}
                      >
                        {ev.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate" style={{ color: "#212529" }}>{ev.name}</div>
                        <div className="text-[11px] capitalize" style={{ color: "#6c757d" }}>
                          {ev.action}{ev.detail ? ` · ${ev.detail}` : ""}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "#adb5bd" }}>{timeStr}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Registration target progress */}
          <div className="bg-white rounded-xl p-5" style={CARD}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[14px] font-semibold mb-0.5" style={{ color: "#212529" }}>Registration Target</div>
                <div className="text-[12px]" style={{ color: "#6c757d" }}>
                  {stats?.totalRegistrations ?? 0} of 300 target delegates
                </div>
              </div>
              <div className="text-right">
                <div className="text-[24px] font-bold leading-none" style={{ color: "#C89B3C" }}>
                  {stats?.totalRegistrations ? Math.min(Math.round((stats.totalRegistrations / 300) * 100), 100) : 0}%
                </div>
                <div className="text-[11px]" style={{ color: "#adb5bd" }}>of target</div>
              </div>
            </div>
            <div className="rounded-full overflow-hidden" style={{ height: 8, background: "#e9ecef" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${stats?.totalRegistrations ? Math.min((stats.totalRegistrations / 300) * 100, 100) : 0}%`,
                  background: "linear-gradient(90deg, #0E6E74 0%, #0B2744 100%)",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════
          REGISTRATIONS TAB
      ════════════════════════════════════ */}
      {activeTab === "registrations" && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
            {/* Payment status bar chart */}
            <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>Payment Status</div>
              </div>
              <div className="p-5" style={{ minHeight: 220 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={paymentStatusData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f3f5" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#adb5bd" }} width={60} />
                    <Tooltip contentStyle={{ border: "1px solid #e9ecef", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" name="Delegates" radius={[0, 4, 4, 0]}>
                      {paymentStatusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary KPIs */}
            <div className="xl:col-span-2 grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: stats?.totalRegistrations ?? 0, accent: "#0E6E74", bg: "#e6f4f5" },
                { label: "Paid", value: (registrations ?? []).filter((r) => r.paymentStatus === "paid").length, accent: "#0a5c39", bg: "#d1e7dd" },
                { label: "Pending", value: stats?.pendingPayments ?? 0, accent: "#856404", bg: "#fff3cd" },
              ].map((k) => (
                <div key={k.label} className="bg-white rounded-xl p-4 overflow-hidden" style={CARD}>
                  <div style={{ height: 3, background: k.accent, marginBottom: 12 }} className="-mx-4 -mt-4 rounded-t-xl" />
                  <div className="text-[24px] font-bold" style={{ color: "#212529" }}>{k.value}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#6c757d" }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Registrations table */}
          <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
            <SectionHeader title="All Registrations" href="/admin/registrations" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    {["Delegate", "Category", "Institution", "Country", "Payment", "Date"].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRegs.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>No registrations yet</td></tr>
                  ) : recentRegs.map((r) => {
                    const ps = PAYMENT_BADGE[r.paymentStatus] ?? PAYMENT_BADGE.pending;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f1f3f5" }}>
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium" style={{ color: "#212529" }}>{r.firstName} {r.lastName}</div>
                          <div className="text-[11px]" style={{ color: "#adb5bd" }}>{r.email}</div>
                        </td>
                        <td className="px-4 py-3 text-[13px] capitalize" style={{ color: "#495057" }}>{r.category?.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{r.institution ?? "—"}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: "#495057" }}>{r.country ?? "—"}</td>
                        <td className="px-4 py-3"><Badge bg={ps.bg} color={ps.color}>{r.paymentStatus}</Badge></td>
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
        </>
      )}

      {/* ════════════════════════════════════
          ABSTRACTS TAB
      ════════════════════════════════════ */}
      {activeTab === "abstracts" && (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>Abstracts by Type</div>
              </div>
              <div className="p-5" style={{ minHeight: 220 }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={abstractTypeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <Tooltip contentStyle={{ border: "1px solid #e9ecef", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" name="Abstracts" radius={[4, 4, 0, 0]}>
                      {abstractTypeData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>Abstract Status Distribution</div>
              </div>
              <div className="p-5 flex items-center justify-center" style={{ minHeight: 220 }}>
                {abstractStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={abstractStatusData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {abstractStatusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ border: "1px solid #e9ecef", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-8 text-[13px]" style={{ color: "#adb5bd" }}>No abstracts yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Abstract review queue */}
          <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
            <SectionHeader title="Abstract Review Queue" href="/admin/abstracts" />
            {pendingAbstracts.length === 0 ? (
              <div className="text-center py-10 text-[13px]" style={{ color: "#adb5bd" }}>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#dee2e6" }} />
                All abstracts reviewed
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-0">
                {pendingAbstracts.map((a, idx) => {
                  const sc = ABSTRACT_BADGE[a.status] ?? ABSTRACT_BADGE.submitted;
                  return (
                    <div key={a.id} className="px-5 py-4" style={{ borderBottom: "1px solid #f1f3f5", borderRight: idx % 2 === 0 ? "1px solid #f1f3f5" : "none" }}>
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
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════
          FINANCIAL TAB
      ════════════════════════════════════ */}
      {activeTab === "financial" && (
        <>
          {/* Revenue KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              {
                label: "Total Revenue",
                value: `MYR ${(stats?.totalRevenue ?? 0).toLocaleString("en-MY", { minimumFractionDigits: 2 })}`,
                sub: "collected to date",
                accent: "#C89B3C",
              },
              {
                label: "Avg. per Delegate",
                value: stats?.totalRegistrations
                  ? `MYR ${Math.round((stats.totalRevenue ?? 0) / stats.totalRegistrations).toLocaleString()}`
                  : "MYR —",
                sub: "mean registration fee",
                accent: "#0E6E74",
              },
              {
                label: "Pending",
                value: `${stats?.pendingPayments ?? 0}`,
                sub: "awaiting payment",
                accent: "#856404",
              },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl overflow-hidden" style={CARD}>
                <div style={{ height: 3, background: k.accent }} />
                <div className="p-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6c757d" }}>{k.label}</div>
                  <div className="text-[22px] font-bold leading-tight mb-0.5" style={{ color: "#212529" }}>{k.value}</div>
                  <div className="text-[12px]" style={{ color: "#adb5bd" }}>{k.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>Revenue by Category</div>
              </div>
              <div className="p-5" style={{ minHeight: 220 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryRevenueData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#adb5bd" }} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #e9ecef", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`MYR ${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                      {categoryRevenueData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3.5" style={{ borderBottom: "1px solid #f1f3f5" }}>
                <div className="text-[14px] font-semibold" style={{ color: "#212529" }}>Payment Status Breakdown</div>
              </div>
              <div className="p-5" style={{ minHeight: 220 }}>
                {paymentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="40%"
                        cy="50%"
                        outerRadius={75}
                        dataKey="value"
                      >
                        {paymentStatusData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ border: "1px solid #e9ecef", borderRadius: 8, fontSize: 12 }} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="py-8 text-center text-[13px]" style={{ color: "#adb5bd" }}>
                    No payment data yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

import React from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  useGetStatsSummary,
  useGetRegistrations,
  useGetAbstracts,
  useUpdateAbstract,
  useGetMe,
  useGetRegistrationsByMonth,
  useGetSpeakers,
  useGetRegistrationCategories,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Users, FileText, DollarSign, Mic,
  ArrowUp, ArrowDown, BarChart2, ClipboardList, Edit3, CheckCircle, XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ── Status badge maps ── */
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
const MONTHLY_TREND_FALLBACK = [
  { month: "Mar '26", count: 0 }, { month: "Apr", count: 2 },
  { month: "May", count: 5 },     { month: "Jun", count: 9 },
  { month: "Jul", count: 15 },    { month: "Aug", count: 23 },
  { month: "Sep", count: 34 },    { month: "Oct", count: 48 },
  { month: "Nov", count: 61 },    { month: "Dec", count: 74 },
  { month: "Jan '27", count: 88 },{ month: "Feb", count: 97 },
  { month: "Mar '27", count: 104 },
];

/* ── Tiny spark bar widget ── */
function StatSpark({ heights }: { heights: number[] }) {
  return (
    <div className="stat-spark">
      {heights.map((h, i) => (
        <div key={i} className="bar" style={{ height: h }} />
      ))}
    </div>
  );
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, display: "inline-block" }}>
      {children}
    </span>
  );
}

const TABS = [
  { id: "overview",      label: "Overview",      short: "Ovr.",  icon: BarChart2 },
  { id: "registrations", label: "Registrations", short: "Regs.", icon: ClipboardList },
  { id: "abstracts",     label: "Abstracts",     short: "Abs.",  icon: FileText },
  { id: "financial",     label: "Financial",     short: "Fin.",  icon: DollarSign },
] as const;
type Tab = typeof TABS[number]["id"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");

  const { data: user }          = useGetMe();
  const { data: stats }         = useGetStatsSummary();
  const { data: registrations } = useGetRegistrations();
  const { data: abstracts, refetch: refetchAbstracts } = useGetAbstracts();
  const { data: monthlyData }   = useGetRegistrationsByMonth();
  const { data: speakers }      = useGetSpeakers();
  const { data: categories = [] } = useGetRegistrationCategories();
  const updateAbstractMutation  = useUpdateAbstract();
  const { toast }               = useToast();
  const [reviewNote, setReviewNote] = React.useState<Record<number, string>>({});

  const recentRegs = (registrations ?? []).slice(-10).reverse();
  const pendingAbstracts = (abstracts ?? [])
    .filter((a) => a.status === "submitted" || a.status === "under_review")
    .slice(0, 6);

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
    const computeTrend = (byMonth: Record<string, number>) => {
      const curr = byMonth[thisYM] ?? 0, prev = byMonth[prevYM] ?? 0;
      if (prev === 0 && curr === 0) return null;
      if (prev === 0) return { dir: "up" as const, label: "New this month" };
      const pct = Math.round(((curr - prev) / prev) * 100);
      if (pct === 0) return { dir: "flat" as const, label: "No change" };
      return { dir: pct > 0 ? "up" as const : "down" as const, label: `${pct > 0 ? "+" : ""}${pct}% vs last month` };
    };
    return { registrations: computeTrend(countByMonth(registrations ?? [])), abstracts: computeTrend(countByMonth(abstracts ?? [])) };
  }, [registrations, abstracts]);

  const paymentStatusData = React.useMemo(() => {
    const counts: Record<string, number> = { paid: 0, pending: 0, overdue: 0, waived: 0 };
    (registrations ?? []).forEach((r) => { counts[r.paymentStatus] = (counts[r.paymentStatus] ?? 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [registrations]);

  const categoryRevenueData = React.useMemo(() => {
    const catMap: Record<string, { slug: string; count: number; revenue: number }> = {};
    (registrations ?? []).forEach((r) => {
      const k = r.category ?? "unknown";
      if (!catMap[k]) catMap[k] = { slug: k, count: 0, revenue: 0 };
      catMap[k].count += 1;
      const catPrice = categories.find(c => c.slug === r.category)?.priceMyr ?? 0;
      catMap[k].revenue += r.paymentAmount ?? catPrice;
    });
    return Object.entries(catMap).map(([slug, d]) => {
      const label = categories.find(c => c.slug === slug)?.label ?? slug.replace(/_/g, " ");
      return { name: label, revenue: d.revenue, delegates: d.count };
    });
  }, [registrations, categories]);

  /* ── Abstract status donut data ── */
  const abstractStatusData = React.useMemo(() => [
    { name: "Submitted",      value: (abstracts ?? []).filter((a) => a.status === "submitted").length },
    { name: "Under Review",   value: (abstracts ?? []).filter((a) => a.status === "under_review").length },
    { name: "Accepted",       value: (abstracts ?? []).filter((a) => a.status === "accepted").length },
    { name: "Rejected",       value: (abstracts ?? []).filter((a) => a.status === "rejected").length },
    { name: "Needs Revision", value: (abstracts ?? []).filter((a) => a.status === "revision_requested").length },
  ].filter((d) => d.value > 0), [abstracts]);

  /* ── Abstract type data ── */
  const abstractTypeData = React.useMemo(() => {
    const map: Record<string, number> = {};
    (abstracts ?? []).forEach((a) => { const k = a.abstractType?.replace(/_/g, " ") ?? "unknown"; map[k] = (map[k] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [abstracts]);

  const { trendData, trendSubtitle } = React.useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return { trendData: MONTHLY_TREND_FALLBACK, trendSubtitle: "Mar 2026 – Mar 2027" };
    const fmt = (ym: string) => {
      const [year, mon] = ym.split("-");
      const d = new Date(Number(year), Number(mon) - 1, 1);
      return `${d.toLocaleString("en-US", { month: "short" })} '${year.slice(2)}`;
    };
    const data = monthlyData.map((r) => ({ month: fmt(r.month), count: r.count }));
    const fmtFull = (ym: string) => {
      const [year, mon] = ym.split("-");
      return new Date(Number(year), Number(mon) - 1, 1).toLocaleString("en-US", { month: "short", year: "numeric" });
    };
    const subtitle = monthlyData[0].month === monthlyData[monthlyData.length - 1].month
      ? fmtFull(monthlyData[0].month)
      : `${fmtFull(monthlyData[0].month)} – ${fmtFull(monthlyData[monthlyData.length - 1].month)}`;
    return { trendData: data, trendSubtitle: subtitle };
  }, [monthlyData]);

  /* ── Spark bar heights derived from monthly trend ── */
  const sparkHeights = React.useMemo(() => {
    const counts = trendData.map((d) => d.count);
    const max = Math.max(...counts, 1);
    const last7 = counts.slice(-7);
    return last7.map((c) => Math.max(4, Math.round((c / max) * 24)));
  }, [trendData]);

  /* ── Accepted speakers count ── */
  const acceptedSpeakers = speakers?.length ?? 0;

  const handleReview = (id: number, status: "accepted" | "rejected" | "revision_requested" | "under_review") => {
    updateAbstractMutation.mutate(
      { id, data: { status, reviewNotes: reviewNote[id] || undefined } },
      {
        onSuccess: () => { refetchAbstracts(); setReviewNote((prev) => { const n = { ...prev }; delete n[id]; return n; }); toast({ title: "Abstract updated" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const todayStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const daysToGo = Math.max(0, Math.ceil((new Date("2027-03-22").getTime() - Date.now()) / 86400000));

  /* ── KPI tiles — Required: Registrations, Revenue, Pending Abstracts, Accepted Speakers ── */
  const KPI_TILES = [
    {
      label: "Total Registrations", icon: Users, iconClass: "teal",
      value: stats?.totalRegistrations ?? 0,
      sub: `${stats?.pendingPayments ?? 0} pending payment`,
      trend: monthTrends.registrations,
      spark: sparkHeights,
    },
    {
      label: "Revenue (MYR)", icon: DollarSign, iconClass: "green",
      value: `MYR ${(stats?.totalRevenue ?? 0).toLocaleString("en-MY")}`,
      sub: `${stats?.pendingPayments ?? 0} payments pending`,
      trend: monthTrends.registrations,
      spark: sparkHeights,
    },
    {
      label: "Pending Abstracts", icon: FileText, iconClass: "gold",
      value: stats?.pendingAbstracts ?? 0,
      sub: `${stats?.totalAbstracts ?? 0} total submitted`,
      trend: monthTrends.abstracts,
      spark: sparkHeights.map((h, i) => i % 2 === 0 ? h : Math.max(4, h - 4)),
    },
    {
      label: "Accepted Speakers", icon: Mic, iconClass: "primary",
      value: acceptedSpeakers,
      sub: "Confirmed for SATBDS 2027",
      trend: null,
      spark: [8, 12, 8, 16, 10, 18, 22],
    },
  ];

  return (
    <AdminLayout title="Dashboard">

      {/* ── Welcome row ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
            Welcome back, {user?.firstName ?? "Admin"}!
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{todayStr}</p>
        </div>
        <div className="hidden sm:flex flex-col items-center justify-center rounded-lg px-5 py-3 flex-shrink-0"
          style={{ border: "1.5px solid var(--primary)", background: "var(--primary-lt)" }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>{daysToGo}</span>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginTop: 2 }}>days to go</span>
          <span style={{ fontSize: 10, color: "var(--text-disabled)", marginTop: 2 }}>22 Mar 2027</span>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="card mb-5" style={{ padding: "0 8px", overflow: "visible" }}>
        <div style={{ display: "flex", borderBottom: "2px solid var(--border-color-light)" }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "12px 16px", fontSize: 13, cursor: "pointer",
                  background: "transparent", border: 0,
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 400,
                  borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
                  marginBottom: -2, transition: "all 120ms",
                }}
              >
                <Icon style={{ width: 14, height: 14 }} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {/* KPI stat cards — .card .stat .stat-icon .stat-content .stat-spark */}
          <div className="row col-4" style={{ marginBottom: 16 }}>
            {KPI_TILES.map((k) => {
              const Icon = k.icon;
              const t = k.trend;
              return (
                <div className="card" key={k.label}>
                  <div className="stat">
                    <div className={`stat-icon ${k.iconClass}`}>
                      <Icon style={{ width: 20, height: 20 }} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-label">{k.label}</div>
                      <div className="stat-value-row">
                        <span className="stat-value">{k.value}</span>
                        {t && t.dir !== "flat" && (
                          <span className={`stat-change ${t.dir}`}>
                            {t.dir === "up" ? <ArrowUp style={{ width: 11, height: 11 }} /> : <ArrowDown style={{ width: 11, height: 11 }} />}
                            {t.label}
                          </span>
                        )}
                      </div>
                      <div className="stat-subtext">{k.sub}</div>
                    </div>
                    <StatSpark heights={k.spark} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Registration trend area chart + Recent registrations table */}
          <div className="row col-8-4" style={{ marginBottom: 16 }}>
            {/* Area chart — registrations by month */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Registration Trend</div>
                  <div className="card-subtitle">{trendSubtitle}</div>
                </div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0E6E74" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0E6E74" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <Tooltip
                      contentStyle={{ border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 12, background: "var(--bg-surface)" }}
                      labelStyle={{ fontWeight: 600, color: "var(--text)" }}
                    />
                    <Area type="monotone" dataKey="count" name="Registrations" stroke="#0E6E74" strokeWidth={2} fill="url(#tealGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent registrations table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Registrations</div>
                <Link href="/admin/registrations" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                  View all
                </Link>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegs.length === 0
                        ? <tr><td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 16px" }}>No registrations yet</td></tr>
                        : recentRegs.slice(0, 8).map((r) => {
                            const b = PAYMENT_BADGE[r.paymentStatus] ?? PAYMENT_BADGE.pending;
                            const name = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || r.email;
                            return (
                              <tr key={r.id}>
                                <td><span className="cell-strong" style={{ fontSize: 12 }}>{name}</span></td>
                                <td style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontSize: 11 }}>
                                  {r.category?.replace(/_/g, " ") ?? "—"}
                                </td>
                                <td><Badge bg={b.bg} color={b.color}>{r.paymentStatus}</Badge></td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Abstracts-by-status donut + Registration target */}
          <div className="row col-4-8" style={{ marginBottom: 0 }}>
            {/* Abstracts by status donut */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Abstracts by Status</div>
              </div>
              <div className="card-body">
                {abstractStatusData.length === 0
                  ? <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 0", fontSize: 13 }}>No abstracts yet</div>
                  : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={abstractStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                          {abstractStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )
                }
              </div>
            </div>

            {/* Registration target progress */}
            <div className="card">
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div className="card-title">Registration Target</div>
                    <div className="card-subtitle">{stats?.totalRegistrations ?? 0} of 300 target delegates</div>
                  </div>
                  <span className="stat-value" style={{ color: "var(--primary)", fontSize: 24 }}>
                    {stats?.totalRegistrations ? Math.min(Math.round((stats.totalRegistrations / 300) * 100), 100) : 0}%
                  </span>
                </div>
                <div className="progress-thin">
                  <div
                    className="bar"
                    style={{
                      width: `${stats?.totalRegistrations ? Math.min((stats.totalRegistrations / 300) * 100, 100) : 0}%`,
                      background: "linear-gradient(90deg, #0E6E74 0%, #0B2744 100%)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          REGISTRATIONS TAB
      ══════════════════════════════════════ */}
      {activeTab === "registrations" && (
        <>
          <div className="row col-8-4" style={{ marginBottom: 16 }}>
            {/* Registrations table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">All Recent Registrations</div>
                <Link href="/admin/registrations" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                  View all
                </Link>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegs.length === 0
                        ? <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 16px" }}>No registrations yet</td></tr>
                        : recentRegs.map((r) => {
                            const b = PAYMENT_BADGE[r.paymentStatus] ?? PAYMENT_BADGE.pending;
                            const name = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || r.email;
                            return (
                              <tr key={r.id}>
                                <td><span className="cell-mono">{r.registrationCode ?? "—"}</span></td>
                                <td><span className="cell-strong">{name}</span></td>
                                <td style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontSize: 12 }}>
                                  {r.category?.replace(/_/g, " ") ?? "—"}
                                </td>
                                <td><Badge bg={b.bg} color={b.color}>{r.paymentStatus}</Badge></td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Payment status chart */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Payment Status</div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={paymentStatusData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color-light)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} width={60} />
                    <Tooltip contentStyle={{ border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 12 }} />
                    <Bar dataKey="value" name="Registrations" radius={[0, 3, 3, 0]}>
                      {paymentStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category revenue chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Revenue by Category (MYR)</div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryRevenueData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={{ border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" name="Revenue (MYR)" fill="#0E6E74" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="delegates" name="Delegates" fill="#C89B3C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          ABSTRACTS TAB
      ══════════════════════════════════════ */}
      {activeTab === "abstracts" && (
        <>
          {/* Abstract stat tiles */}
          <div className="row col-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Total Submitted", value: stats?.totalAbstracts ?? 0, iconClass: "teal",    spark: [8,12,10,16,14,18,22] },
              { label: "Pending Review",  value: stats?.pendingAbstracts ?? 0, iconClass: "gold",  spark: [14,10,18,12,16,20,14] },
              { label: "Accepted",        value: stats?.acceptedAbstracts ?? 0, iconClass: "green", spark: [6,10,8,14,12,16,20] },
              { label: "Rejected",        value: stats?.rejectedAbstracts ?? 0, iconClass: "red",  spark: [20,14,18,10,16,12,8] },
            ].map((s) => (
              <div className="card" key={s.label}>
                <div className="stat">
                  <div className={`stat-icon ${s.iconClass}`}>
                    <FileText style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                  <StatSpark heights={s.spark} />
                </div>
              </div>
            ))}
          </div>

          <div className="row col-8-4" style={{ marginBottom: 0 }}>
            {/* Pending abstract review table */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Pending Review</div>
                <Link href="/admin/abstracts" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                  All abstracts
                </Link>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAbstracts.length === 0
                        ? <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px 16px" }}>No abstracts pending review</td></tr>
                        : pendingAbstracts.map((a) => {
                            const sc = ABSTRACT_BADGE[a.status] ?? ABSTRACT_BADGE.submitted;
                            return (
                              <tr key={a.id}>
                                <td><span className="cell-mono">{a.abstractCode ?? "—"}</span></td>
                                <td>
                                  <Link href={`/admin/abstracts/${a.id}`} style={{ color: "var(--primary)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
                                    {a.title.length > 40 ? `${a.title.slice(0, 40)}…` : a.title}
                                  </Link>
                                </td>
                                <td style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontSize: 12 }}>
                                  {a.abstractType?.replace(/_/g, " ")}
                                </td>
                                <td><Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge></td>
                                <td>
                                  <div style={{ display: "flex", gap: 4 }}>
                                    <button
                                      className="btn btn-sm"
                                      style={{ background: "#d1e7dd", color: "#0a5c39", border: "none", height: 26 }}
                                      title="Accept"
                                      onClick={() => handleReview(a.id, "accepted")}
                                    >
                                      <CheckCircle style={{ width: 13, height: 13 }} />
                                    </button>
                                    <button
                                      className="btn btn-sm"
                                      style={{ background: "#f8d7da", color: "#842029", border: "none", height: 26 }}
                                      title="Reject"
                                      onClick={() => handleReview(a.id, "rejected")}
                                    >
                                      <XCircle style={{ width: 13, height: 13 }} />
                                    </button>
                                    <Link href={`/admin/abstracts/${a.id}`}>
                                      <button className="btn btn-outline btn-sm" title="Review">
                                        <Edit3 style={{ width: 13, height: 13 }} />
                                      </button>
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Abstract type donut */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">By Type</div>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={abstractTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                      {abstractTypeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          FINANCIAL TAB
      ══════════════════════════════════════ */}
      {activeTab === "financial" && (
        <>
          <div className="row col-3" style={{ marginBottom: 16 }}>
            {[
              {
                label: "Total Revenue (MYR)",
                value: `MYR ${(stats?.totalRevenue ?? 0).toLocaleString("en-MY")}`,
                sub: "All confirmed payments", iconClass: "green",
                spark: sparkHeights,
              },
              {
                label: "Pending Payments",
                value: stats?.pendingPayments ?? 0,
                sub: "Awaiting collection", iconClass: "gold",
                spark: [14,10,18,12,16,20,14],
              },
              {
                label: "Avg. Fee (MYR)",
                value: stats?.totalRegistrations
                  ? `MYR ${Math.round((stats.totalRevenue ?? 0) / stats.totalRegistrations).toLocaleString("en-MY")}`
                  : "—",
                sub: "Per delegate", iconClass: "teal",
                spark: [10,16,12,18,14,20,24],
              },
            ].map((k) => (
              <div className="card" key={k.label}>
                <div className="stat">
                  <div className={`stat-icon ${k.iconClass}`}>
                    <DollarSign style={{ width: 20, height: 20 }} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">{k.label}</div>
                    <div className="stat-value" style={{ fontSize: 18 }}>{k.value}</div>
                    <div className="stat-subtext">{k.sub}</div>
                  </div>
                  <StatSpark heights={k.spark} />
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Revenue Breakdown by Category</div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryRevenueData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={{ border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" name="Revenue (MYR)" fill="#0E6E74" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="delegates" name="Delegates" fill="#C89B3C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </AdminLayout>
  );
}

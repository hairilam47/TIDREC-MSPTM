import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Link } from "wouter";
import {
  useGetStatsSummary,
  useGetRegistrations,
  useGetAbstracts,
  useGetRegistrationsByMonth,
  useGetSettings,
  useGetMe,
} from "@workspace/api-client-react";
import {
  Users, DollarSign, FileText, TicketCheck,
  CalendarClock, AlertCircle, ArrowUp, ArrowDown,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

/* ─── Colours ─── */
const CHART_COLORS = ["#0E6E74", "#C89B3C", "#0B2744", "#0a5c39", "#842029", "#6c757d"];

const PAYMENT_BADGE: Record<string, { bg: string; color: string }> = {
  paid:    { bg: "#d1e7dd", color: "#0a5c39" },
  pending: { bg: "#fff3cd", color: "#856404" },
  overdue: { bg: "#f8d7da", color: "#842029" },
  waived:  { bg: "#e6f4f5", color: "#0E6E74" },
};

const ABSTRACT_STATUS_COLORS: Record<string, string> = {
  submitted:          "#0E6E74",
  under_review:       "#C89B3C",
  accepted:           "#0a5c39",
  rejected:           "#842029",
  revision_requested: "#856404",
};

/* ─── Helpers ─── */
function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, display: "inline-block" }}>
      {children}
    </span>
  );
}

function StatSpark({ heights }: { heights: number[] }) {
  return (
    <div className="stat-spark">
      {heights.map((h, i) => (
        <div key={i} className="bar" style={{ height: h }} />
      ))}
    </div>
  );
}

/** Parse a loose date string like "01 March 2027" or "22–23 Mar 2027" → Date | null */
function parseSettingDate(s: string | undefined): Date | null {
  if (!s) return null;
  const cleaned = s.replace(/[–—].+/, "").trim();
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

/** Days remaining (positive) or overdue (negative) */
function daysFrom(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default function AdminDashboard() {
  const { data: user }        = useGetMe();
  const { data: stats }       = useGetStatsSummary();
  const { data: regs = [] }   = useGetRegistrations();
  const { data: abstracts = [] } = useGetAbstracts();
  const { data: monthlyData } = useGetRegistrationsByMonth();
  const { data: settings }    = useGetSettings();

  /* ── Derived counts ── */
  const totalRevenue   = stats?.totalRevenue ?? 0;
  const totalRegs      = stats?.totalRegistrations ?? 0;
  const totalAbstracts = stats?.totalAbstracts ?? 0;
  const pendingPay     = stats?.pendingPayments ?? 0;
  const pendingAbs     = stats?.pendingAbstracts ?? 0;
  const regTarget      = parseInt(settings?.registration_target ?? "300", 10) || 300;
  const slotsRemaining = Math.max(0, regTarget - totalRegs);

  /* ── Month-over-month trend for registrations ── */
  const regTrend = React.useMemo(() => {
    const now = new Date();
    const ym  = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const thisYM = ym(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYM = ym(prevDate);
    const map: Record<string, number> = {};
    regs.forEach((r) => { const k = (r.createdAt ?? "").slice(0, 7); map[k] = (map[k] ?? 0) + 1; });
    const curr = map[thisYM] ?? 0, prev = map[prevYM] ?? 0;
    if (prev === 0 && curr === 0) return null;
    if (prev === 0) return { dir: "up" as const, label: "New this month" };
    const pct = Math.round(((curr - prev) / prev) * 100);
    if (pct === 0) return { dir: "flat" as const, label: "No change" };
    return { dir: pct > 0 ? "up" as const : "down" as const, label: `${pct > 0 ? "+" : ""}${pct}% vs last month` };
  }, [regs]);

  /* ── Spark bar heights from monthly trend ── */
  const sparkHeights = React.useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [4, 6, 5, 8, 7, 10, 12];
    const counts = monthlyData.map((d) => d.count);
    const max    = Math.max(...counts, 1);
    return counts.slice(-7).map((c) => Math.max(4, Math.round((c / max) * 24)));
  }, [monthlyData]);

  /* ── Monthly trend chart data ── */
  const trendData = React.useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    return monthlyData.map((r) => {
      const [year, mon] = r.month.split("-");
      const d = new Date(Number(year), Number(mon) - 1, 1);
      return { month: d.toLocaleString("en-US", { month: "short", year: "2-digit" }), count: r.count };
    });
  }, [monthlyData]);

  /* ── Abstract status donut ── */
  const abstractStatusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    abstracts.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({
        name: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
        color: ABSTRACT_STATUS_COLORS[status] ?? "#6c757d",
      }));
  }, [abstracts]);

  /* ── Recent registrations ── */
  const recentRegs = [...regs].reverse().slice(0, 8);

  /* ── Deadlines from settings ── */
  const deadlines = React.useMemo(() => {
    const items = [
      { key: "date_early_bird_closes",           label: "Early Bird Closes",          urgencyDays: 14 },
      { key: "date_abstract_submission_closes",   label: "Abstract Submission Closes", urgencyDays: 21 },
      { key: "date_regular_submission_closes",    label: "Regular Registration Closes",urgencyDays: 14 },
      { key: "date_conference",                   label: "Conference",                 urgencyDays: 60 },
    ];
    return items
      .map(({ key, label, urgencyDays }) => {
        const raw  = settings?.[key];
        const date = parseSettingDate(raw);
        if (!date) return null;
        const days = daysFrom(date);
        return { label, raw: raw!, date, days, urgent: days >= 0 && days <= urgencyDays };
      })
      .filter(Boolean) as { label: string; raw: string; date: Date; days: number; urgent: boolean }[];
  }, [settings]);

  /* ── Days to conference ── */
  const conferenceDate = parseSettingDate(settings?.date_conference);
  const daysToGo = conferenceDate ? Math.max(0, daysFrom(conferenceDate)) : null;

  const todayStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  /* ── KPI tiles ── */
  const KPI_TILES = [
    {
      label: "Total Registrations",
      icon: Users,
      iconClass: "teal",
      value: totalRegs.toLocaleString(),
      sub: `${pendingPay} pending payment`,
      trend: regTrend,
      spark: sparkHeights,
    },
    {
      label: "Revenue Collected",
      icon: DollarSign,
      iconClass: "green",
      value: `MYR ${totalRevenue.toLocaleString("en-MY")}`,
      sub: `${pendingPay} payment${pendingPay === 1 ? "" : "s"} outstanding`,
      trend: regTrend,
      spark: sparkHeights,
    },
    {
      label: "Abstract Submissions",
      icon: FileText,
      iconClass: "gold",
      value: totalAbstracts.toLocaleString(),
      sub: `${pendingAbs} awaiting review`,
      trend: null,
      spark: sparkHeights.map((h, i) => (i % 2 === 0 ? h : Math.max(4, h - 4))),
    },
    {
      label: "Slots Remaining",
      icon: TicketCheck,
      iconClass: slotsRemaining < 20 ? "red" : "primary",
      value: slotsRemaining.toLocaleString(),
      sub: `Target: ${regTarget} delegates`,
      trend: null,
      spark: [24, 22, 20, 18, 16, 14, Math.max(4, Math.round((slotsRemaining / regTarget) * 24))],
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome back, {user?.firstName ?? "Admin"}!
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{todayStr}</p>
          </div>
          {daysToGo !== null && (
            <div className="hidden sm:flex flex-col items-center justify-center rounded-lg px-5 py-3 flex-shrink-0"
              style={{ border: "1.5px solid #0E6E74", background: "#f0fafa" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#0E6E74", lineHeight: 1 }}>{daysToGo}</span>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginTop: 2 }}>days to go</span>
              <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{settings?.date_conference ?? "22–23 Mar 2027"}</span>
            </div>
          )}
        </div>

        {/* ── KPI Cards ── */}
        <div className="row col-4 mb-4">
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
                          {t.dir === "up"
                            ? <ArrowUp style={{ width: 11, height: 11 }} />
                            : <ArrowDown style={{ width: 11, height: 11 }} />}
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

        {/* ── Registration Trend + Recent Registrations ── */}
        <div className="row col-8-4 mb-4">
          {/* Area chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Registration Trend</div>
                <div className="card-subtitle">Cumulative registrations by month</div>
              </div>
              <TrendingUp style={{ width: 16, height: 16, color: "#0E6E74" }} />
            </div>
            <div className="card-body">
              {trendData.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: 13 }}>
                  No data yet — registrations will appear here once submitted.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0E6E74" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0E6E74" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip
                      contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Area type="monotone" dataKey="count" name="Registrations" stroke="#0E6E74" strokeWidth={2} fill="url(#tealGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent registrations */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Registrations</div>
              <Link href="/admin/registrations">
                <a style={{ fontSize: 12, color: "#0E6E74", textDecoration: "none" }}>View all →</a>
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
                      ? <tr><td colSpan={3} style={{ textAlign: "center", color: "#9ca3af", padding: "20px 16px", fontSize: 12 }}>No registrations yet</td></tr>
                      : recentRegs.map((r) => {
                          const b    = PAYMENT_BADGE[r.paymentStatus] ?? PAYMENT_BADGE.pending;
                          const name = `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || r.email;
                          return (
                            <tr key={r.id}>
                              <td><span className="cell-strong" style={{ fontSize: 12 }}>{name}</span></td>
                              <td style={{ color: "#6b7280", textTransform: "capitalize", fontSize: 11 }}>
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

        {/* ── Abstract Status Donut + Deadlines ── */}
        <div className="row col-4-8 mb-0">
          {/* Abstract donut */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Abstracts by Status</div>
              <Link href="/admin/abstracts">
                <a style={{ fontSize: 12, color: "#0E6E74", textDecoration: "none" }}>View all →</a>
              </Link>
            </div>
            <div className="card-body">
              {abstractStatusData.length === 0 ? (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0", fontSize: 13 }}>No abstracts yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={abstractStatusData}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={72}
                      paddingAngle={2} dataKey="value"
                    >
                      {abstractStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Deadlines + Registration target */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Registration progress */}
            <div className="card" style={{ flex: "none" }}>
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div className="card-title">Registration Target</div>
                    <div className="card-subtitle">{totalRegs} of {regTarget} delegates</div>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "#0E6E74" }}>
                    {Math.min(Math.round((totalRegs / regTarget) * 100), 100)}%
                  </span>
                </div>
                <div className="progress-thin">
                  <div
                    className="bar"
                    style={{
                      width: `${Math.min((totalRegs / regTarget) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #0E6E74 0%, #0B2744 100%)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Key deadlines */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <div className="card-title">Upcoming Deadlines</div>
                <CalendarClock style={{ width: 15, height: 15, color: "#9ca3af" }} />
              </div>
              <div className="card-body p-0">
                {deadlines.length === 0 ? (
                  <p style={{ padding: "16px", fontSize: 12, color: "#9ca3af" }}>No deadlines configured.</p>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {deadlines.map((d) => {
                      const isPast   = d.days < 0;
                      const isUrgent = d.urgent && !isPast;
                      const bg       = isPast ? "#f8d7da" : isUrgent ? "#fff3cd" : "#f0fafa";
                      const color    = isPast ? "#842029" : isUrgent ? "#856404" : "#0E6E74";
                      const label    = isPast
                        ? `${Math.abs(d.days)}d ago`
                        : d.days === 0
                        ? "Today"
                        : `${d.days}d`;
                      return (
                        <li key={d.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #f3f4f6" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {(isUrgent || isPast) && <AlertCircle style={{ width: 13, height: 13, color, flexShrink: 0 }} />}
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{d.label}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{d.raw}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 12, background: bg, color }}>
                              {label}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

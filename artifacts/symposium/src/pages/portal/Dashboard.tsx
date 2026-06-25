import React from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  useGetMe,
  useGetAbstracts,
  useGetMyRegistration,
  useGetSavedSessions,
  useGetSessions,
  useGetAnnouncements,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  ClipboardList, FileText, Calendar, Timer,
  CheckCircle, AlertTriangle, Plus, ArrowRight, Clock,
} from "lucide-react";

/* ── Status maps ── */
const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  submitted:          { bg: "var(--primary-lt)",        color: "var(--primary)",              label: "Submitted" },
  under_review:       { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)",  label: "Under Review" },
  accepted:           { bg: "var(--status-success-bg)", color: "var(--status-success-text)",  label: "Accepted" },
  rejected:           { bg: "var(--status-danger-bg)",  color: "var(--status-danger-text)",   label: "Rejected" },
  revision_requested: { bg: "var(--status-warning-bg)", color: "var(--status-warning-text)",  label: "Revision Needed" },
};

const IMPORTANT_DATES = [
  { date: "15 Jan 2027", iso: "2027-01-15", event: "Abstract Submission Deadline" },
  { date: "28 Feb 2027", iso: "2027-02-28", event: "Acceptance Notification" },
  { date: "01 Mar 2027", iso: "2027-03-01", event: "Early Bird Registration Closes" },
  { date: "22 Mar 2027", iso: "2027-03-22", event: "Symposium — Day 1" },
  { date: "23 Mar 2027", iso: "2027-03-23", event: "Symposium — Day 2" },
];

function dateDotColor(iso: string): string {
  const now = Date.now(), ts = new Date(iso).getTime();
  if (ts < now) return "var(--text-disabled)";
  return (ts - now) / 86400000 <= 60 ? "var(--primary)" : "var(--teal)";
}

function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, display: "inline-block" }}>
      {children}
    </span>
  );
}

/* ── Static spark heights for each tile ── */
const SPARKS = {
  registration: [8, 12, 10, 16, 14, 18, 22],
  abstracts:    [10, 14, 12, 18, 16, 20, 14],
  sessions:     [12, 8, 16, 10, 18, 14, 20],
  days:         [22, 20, 18, 16, 14, 12, 10], // counts down
};

function StatSpark({ heights }: { heights: number[] }) {
  return (
    <div className="stat-spark">
      {heights.map((h, i) => (
        <div key={i} className="bar" style={{ height: h }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: user }          = useGetMe();
  const { data: abstracts, isLoading: loadingAbstracts } = useGetAbstracts();
  const { data: registration }  = useGetMyRegistration();
  const { data: savedIds }      = useGetSavedSessions();
  const { data: sessions }      = useGetSessions();
  const { data: announcements } = useGetAnnouncements();

  /* Upcoming sessions — sourced from useGetSessions(), filtered to future or day 1 first */
  const upcomingSessions = React.useMemo(
    () => (sessions ?? []).slice(0, 5),
    [sessions],
  );

  const shownAnnouncements = (announcements ?? []).slice(0, 3);

  const daysToGo = Math.max(0, Math.ceil((new Date("2027-03-22").getTime() - Date.now()) / 86400000));
  const todayStr = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const paymentStatus = registration?.paymentStatus;
  const paymentAmount = registration?.paymentAmount;

  const regValue = registration
    ? paymentStatus === "paid" ? "Paid" : paymentStatus === "waived" ? "Waived" : "Pending"
    : "None";
  const regIconClass =
    paymentStatus === "paid"    ? "green" :
    paymentStatus === "waived"  ? "teal"  :
    paymentStatus === "overdue" ? "red"   : "gold";

  /* ── 4 stat tiles: Registration, My Abstracts, Saved Sessions, Days Until Conference ── */
  const STAT_TILES = [
    {
      icon: ClipboardList, iconClass: regIconClass,
      label: "Registration", value: regValue,
      sub: registration?.registrationCode ?? "Not registered",
      spark: SPARKS.registration,
    },
    {
      icon: FileText, iconClass: "gold",
      label: "My Abstracts", value: abstracts?.length ?? 0,
      sub: `${abstracts?.filter((a) => a.status === "accepted").length ?? 0} accepted`,
      spark: SPARKS.abstracts,
    },
    {
      icon: Calendar, iconClass: "teal",
      label: "Saved Sessions", value: savedIds?.length ?? 0,
      sub: "in my schedule",
      spark: SPARKS.sessions,
    },
    {
      icon: Timer, iconClass: "primary",
      label: "Days Until Conference", value: daysToGo,
      sub: "22–23 March 2027",
      spark: SPARKS.days,
    },
  ];

  return (
    <PortalLayout title="Dashboard">

      {/* ── Welcome row ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="font-sans" style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            Welcome back, {user?.firstName ?? "Delegate"}!
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{todayStr}</p>
          <p style={{ fontSize: 12, color: "var(--text-disabled)", marginTop: 2 }}>
            3rd Southeast Asia Ticks &amp; Tick-borne Diseases Symposium · Sunway Putra Hotel, KL
          </p>
        </div>
      </div>

      {/* ── Payment pending alert ── */}
      {registration && paymentStatus !== "paid" && paymentStatus !== "waived" && (
        <div className="card mb-4" style={{ borderLeft: "4px solid var(--primary)", background: "var(--primary-lt)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <AlertTriangle style={{ width: 18, height: 18, color: "var(--primary)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
                  Payment pending{paymentAmount ? ` — MYR ${paymentAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })} due` : ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                  Complete payment to confirm your delegate spot at SEAT-MSPTM 2027.
                </div>
              </div>
            </div>
            <Link href="/portal/registration">
              <button className="btn btn-primary" style={{ flexShrink: 0 }}>Pay Now</button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Registration confirmed banner ── */}
      {registration && (paymentStatus === "paid" || paymentStatus === "waived") && (
        <div className="card mb-4" style={{ borderLeft: "4px solid var(--green)", background: "var(--green-lt)" }}>
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle style={{ width: 16, height: 16, color: "var(--green)", flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>
              Registration confirmed{registration.registrationCode ? ` — ${registration.registrationCode}` : ""}
            </span>
          </div>
        </div>
      )}

      {/* ── Stat ribbon — 4 tiles with .stat-spark ── */}
      <div className="row col-4" style={{ marginBottom: 20 }}>
        {STAT_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <div className="card" key={tile.label}>
              <div className="stat">
                <div className={`stat-icon ${tile.iconClass}`}>
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{tile.label}</div>
                  <div className="stat-value">{tile.value}</div>
                  {tile.sub && <div className="stat-subtext">{tile.sub}</div>}
                </div>
                <StatSpark heights={tile.spark} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Announcements ── */}
      {shownAnnouncements.length > 0 && (
        <div className="card mb-5">
          <div className="card-header">
            <div className="card-title">Announcements</div>
            <Link href="/portal/notifications" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              View all <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shownAnnouncements.map((a) => (
              <div key={a.id} style={{ borderLeft: "3px solid var(--primary)", paddingLeft: 12 }}>
                {a.createdAt && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {a.important && (
                      <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "var(--primary-lt)", color: "var(--primary)", textTransform: "uppercase" }}>
                        Important
                      </span>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main 2-col: abstracts table + sidebar ── */}
      <div className="row col-8-4">

        {/* Abstracts table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Abstracts</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link href="/portal/abstracts/new">
                <button className="btn btn-primary btn-sm">
                  <Plus style={{ width: 13, height: 13 }} /> Submit
                </button>
              </Link>
              <Link href="/portal/abstracts" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                View all
              </Link>
            </div>
          </div>
          <div className="card-body p-0">
            {loadingAbstracts
              ? <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
              : abstracts && abstracts.length > 0
              ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abstracts.map((a) => {
                        const sc = STATUS_BADGE[a.status] ?? STATUS_BADGE.submitted;
                        return (
                          <tr key={a.id}>
                            <td><span className="cell-mono">{a.abstractCode ?? "—"}</span></td>
                            <td>
                              <Link href={`/portal/abstracts/${a.id}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>
                                {a.title.length > 45 ? `${a.title.slice(0, 45)}…` : a.title}
                              </Link>
                            </td>
                            <td style={{ color: "var(--text-secondary)", textTransform: "capitalize", fontSize: 12 }}>
                              {a.abstractType?.replace(/_/g, " ")}
                            </td>
                            <td><Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
              : (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-surface-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <FileText style={{ width: 22, height: 22, color: "var(--text-disabled)" }} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4 }}>No abstracts submitted yet</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Share your research at SEAT-MSPTM 2027</p>
                  <Link href="/portal/abstracts/new">
                    <button className="btn btn-primary">Submit First Abstract</button>
                  </Link>
                </div>
              )
            }
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Important Dates */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Important Dates</div>
            </div>
            <div className="card-body">
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 1, background: "var(--border-color)" }} />
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {IMPORTANT_DATES.map((d, i) => {
                    const isPast   = new Date(d.iso).getTime() < Date.now();
                    const dotColor = isPast ? "var(--text-disabled)" : dateDotColor(d.iso);
                    return (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{ flexShrink: 0, width: 14, height: 14, borderRadius: "50%", background: dotColor, boxShadow: `0 0 0 2px var(--bg-surface), 0 0 0 4px ${dotColor}22`, marginTop: 2, zIndex: 1 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", marginBottom: 1 }}>{d.date}</div>
                          <div style={{ fontSize: 13, color: isPast ? "var(--text-disabled)" : "var(--text)", textDecoration: isPast ? "line-through" : "none" }}>
                            {d.event}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-color-light)" }}>
                {[{ color: "var(--teal)", label: "Upcoming" }, { color: "var(--primary)", label: "Soon" }, { color: "var(--text-disabled)", label: "Past" }].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Sessions — from useGetSessions() */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Upcoming Sessions</div>
              <Link href="/portal/programme" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                Full programme
              </Link>
            </div>
            {upcomingSessions.length > 0
              ? (
                <div className="card-body p-0">
                  {upcomingSessions.map((s) => (
                    <div key={s.id} style={{ display: "flex", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border-color-light)" }}>
                      <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                        D{s.day}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                          {s.startTime && (
                            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--primary)" }}>
                              <Clock style={{ width: 11, height: 11 }} />
                              {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                            </span>
                          )}
                          {s.room && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {s.room}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: "8px 16px", textAlign: "right" }}>
                    <Link href="/portal/programme" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      View all sessions <ArrowRight style={{ width: 12, height: 12 }} />
                    </Link>
                  </div>
                </div>
              )
              : (
                <div className="card-body" style={{ textAlign: "center" }}>
                  <Calendar style={{ width: 28, height: 28, color: "var(--text-disabled)", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>No sessions published yet</p>
                  <Link href="/portal/programme" style={{ fontSize: 12, fontWeight: 500, color: "var(--primary)", textDecoration: "none" }}>
                    Check the programme →
                  </Link>
                </div>
              )
            }
          </div>

        </div>
      </div>

    </PortalLayout>
  );
}

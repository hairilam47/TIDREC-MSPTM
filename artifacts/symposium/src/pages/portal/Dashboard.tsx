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
  ClipboardList, FileText, Calendar, Bell, CheckCircle,
  AlertTriangle, Plus, ArrowRight, Clock,
} from "lucide-react";

/* ── Design tokens ── */
const CARD: React.CSSProperties = {
  border: "1px solid #e9ecef",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  submitted:          { bg: "#e6f4f5", color: "#0E6E74",  label: "Submitted" },
  under_review:       { bg: "#fff3cd", color: "#856404",  label: "Under Review" },
  accepted:           { bg: "#d1e7dd", color: "#0a5c39",  label: "Accepted" },
  rejected:           { bg: "#f8d7da", color: "#842029",  label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404",  label: "Revision Needed" },
};

const IMPORTANT_DATES = [
  { date: "15 Jan 2027", iso: "2027-01-15", event: "Abstract Submission Deadline" },
  { date: "28 Feb 2027", iso: "2027-02-28", event: "Acceptance Notification" },
  { date: "01 Mar 2027", iso: "2027-03-01", event: "Early Bird Registration Closes" },
  { date: "22 Mar 2027", iso: "2027-03-22", event: "Symposium — Day 1" },
  { date: "23 Mar 2027", iso: "2027-03-23", event: "Symposium — Day 2" },
];

/* ── Shared micro-components ── */
function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize leading-none inline-block"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  title, href, action,
}: {
  title: string; href?: string; action?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5"
      style={{ borderBottom: "1px solid #e9ecef" }}
    >
      <span className="text-[14px] font-semibold" style={{ color: "#212529" }}>{title}</span>
      {href && !action && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[12px] font-medium no-underline"
          style={{ color: "#0E6E74" }}
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
      {action}
    </div>
  );
}

/* ── Compact horizontal stat tile ── */
function StatTile({
  icon, label, value, sub, accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accentColor: string;
}) {
  return (
    <div
      className="bg-white rounded-xl flex items-center gap-4 px-5 py-4 overflow-hidden"
      style={{ ...CARD, borderLeft: `4px solid ${accentColor}` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}18`, color: accentColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider leading-none mb-1" style={{ color: "#6c757d" }}>
          {label}
        </div>
        <div className="text-[20px] font-bold leading-tight" style={{ color: "#212529" }}>{value}</div>
        {sub && <div className="text-[11px] mt-0.5 truncate" style={{ color: "#adb5bd" }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Urgency colour for important dates ── */
function dateDotColor(iso: string): string {
  const now = Date.now();
  const ts = new Date(iso).getTime();
  if (ts < now) return "#adb5bd"; // past
  const daysAway = (ts - now) / 86400000;
  if (daysAway <= 60) return "#C89B3C"; // soon — gold
  return "#0E6E74"; // upcoming — teal
}

/* ── Main dashboard ── */
export default function Dashboard() {
  const { data: user }           = useGetMe();
  const { data: abstracts, isLoading: loadingAbstracts } = useGetAbstracts();
  const { data: registration }   = useGetMyRegistration();
  const { data: savedIds }       = useGetSavedSessions();
  const { data: sessions }       = useGetSessions();
  const { data: announcements }  = useGetAnnouncements();

  const savedSessions = React.useMemo(
    () => sessions?.filter((s) => (savedIds ?? []).includes(s.id)).slice(0, 4) ?? [],
    [sessions, savedIds],
  );

  const shownAnnouncements = (announcements ?? []).slice(0, 3);

  const daysToGo = Math.max(
    0,
    Math.ceil((new Date("2027-03-22").getTime() - Date.now()) / 86400000),
  );

  const todayStr = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const paymentStatus  = registration?.paymentStatus;
  const paymentAmount  = registration?.paymentAmount;

  /* registration stat label */
  const regValue = registration
    ? paymentStatus === "paid" ? "Paid" : paymentStatus === "waived" ? "Waived" : "Pending"
    : "None";
  const regAccent =
    paymentStatus === "paid"   ? "#0a5c39" :
    paymentStatus === "waived" ? "#0E6E74" :
    paymentStatus === "overdue"? "#842029" :
    "#856404";

  return (
    <PortalLayout title="Dashboard">

      {/* ── Welcome row ── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-[24px] font-serif font-bold leading-tight mb-1"
            style={{ color: "#0B2744" }}
          >
            Welcome back, {user?.firstName ?? "Delegate"}!
          </h1>
          <p className="text-[13px]" style={{ color: "#6c757d" }}>{todayStr}</p>
          <p className="text-[12px] mt-0.5" style={{ color: "#adb5bd" }}>
            3rd Southeast Asia Ticks and Tick-borne Diseases Symposium · Sunway Putra Hotel, KL
          </p>
        </div>
        <div
          className="hidden sm:flex flex-col items-center justify-center rounded-xl px-5 py-3 flex-shrink-0"
          style={{ border: "1.5px solid #C89B3C", background: "#FEFAF3" }}
        >
          <span className="text-[28px] font-bold leading-none" style={{ color: "#C89B3C" }}>
            {daysToGo}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#6c757d" }}>
            days to go
          </span>
          <span className="text-[10px] mt-0.5" style={{ color: "#adb5bd" }}>22 Mar 2027</span>
        </div>
      </div>

      {/* ── Payment pending alert ── */}
      {registration && paymentStatus !== "paid" && paymentStatus !== "waived" && (
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl mb-5"
          style={{
            background: "#FFFBEB",
            border: "1px solid #FCD34D",
            borderLeft: "4px solid #C89B3C",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#C89B3C" }} />
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "#78350F" }}>
                Payment pending
                {paymentAmount ? ` — MYR ${paymentAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })} due` : ""}
              </div>
              <div className="text-[12px]" style={{ color: "#92400E" }}>
                Complete payment to confirm your delegate spot at SATBDS 2027.
              </div>
            </div>
          </div>
          <Link href="/portal/registration">
            <button
              className="flex-shrink-0 px-4 py-2 rounded-lg text-[12px] font-bold text-white whitespace-nowrap"
              style={{ background: "#C89B3C" }}
            >
              Pay Now
            </button>
          </Link>
        </div>
      )}

      {/* ── Payment confirmed banner ── */}
      {registration && (paymentStatus === "paid" || paymentStatus === "waived") && (
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl mb-5"
          style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderLeft: "4px solid #0a5c39" }}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#0a5c39" }} />
          <span className="text-[13px] font-semibold" style={{ color: "#14532D" }}>
            Registration confirmed
            {registration.registrationCode ? ` — ${registration.registrationCode}` : ""}
          </span>
        </div>
      )}

      {/* ── Stat ribbon ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatTile
          icon={<ClipboardList className="w-5 h-5" />}
          label="Registration"
          value={regValue}
          sub={registration?.registrationCode ?? "Not registered"}
          accentColor={regAccent}
        />
        <StatTile
          icon={<FileText className="w-5 h-5" />}
          label="My Abstracts"
          value={abstracts?.length ?? 0}
          sub={`${abstracts?.filter((a) => a.status === "accepted").length ?? 0} accepted`}
          accentColor="#C89B3C"
        />
        <StatTile
          icon={<Calendar className="w-5 h-5" />}
          label="Saved Sessions"
          value={savedIds?.length ?? 0}
          sub="in my schedule"
          accentColor="#0E6E74"
        />
        <StatTile
          icon={<Bell className="w-5 h-5" />}
          label="Notifications"
          value={(announcements ?? []).filter((a) => a.important).length}
          sub="important alerts"
          accentColor="#0B2744"
        />
      </div>

      {/* ── Announcements ── */}
      {shownAnnouncements.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold" style={{ color: "#212529" }}>Announcements</h2>
            <Link href="/portal/notifications" className="flex items-center gap-1 text-[12px] font-medium no-underline" style={{ color: "#0E6E74" }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {shownAnnouncements.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl px-5 py-4"
                style={{ ...CARD, borderLeft: "4px solid #0E6E74" }}
              >
                {a.createdAt && (
                  <div className="text-[11px] mb-1.5" style={{ color: "#adb5bd" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {a.important && (
                      <span
                        className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: "#FDF6E8", color: "#C89B3C" }}
                      >
                        Important
                      </span>
                    )}
                  </div>
                )}
                <div className="text-[13px] font-semibold mb-1" style={{ color: "#0B2744" }}>{a.title}</div>
                <div className="text-[13px] leading-relaxed" style={{ color: "#495057" }}>{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Abstracts table — 3/5 */}
        <div className="lg:col-span-3 bg-white rounded-xl overflow-hidden" style={CARD}>
          <SectionHeader
            title="My Abstracts"
            action={
              <Link href="/portal/abstracts/new">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#0E6E74" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Submit
                </button>
              </Link>
            }
          />
          {loadingAbstracts ? (
            <div className="p-10 text-center text-[13px]" style={{ color: "#adb5bd" }}>Loading…</div>
          ) : abstracts && abstracts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      {["Code", "Title", "Type", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {abstracts.map((a) => {
                      const sc = STATUS_BADGE[a.status] ?? STATUS_BADGE.submitted;
                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-gray-50 transition-colors"
                          style={{ borderBottom: "1px solid #f1f3f5" }}
                        >
                          <td className="px-4 py-3">
                            <code
                              className="text-[11px] font-mono px-1.5 py-0.5 rounded"
                              style={{ background: "#f1f3f5", color: "#495057" }}
                            >
                              {a.abstractCode ?? "—"}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/portal/abstracts/${a.id}`}
                              className="text-[13px] font-medium no-underline hover:underline line-clamp-1"
                              style={{ color: "#0E6E74" }}
                            >
                              {a.title.length > 45 ? `${a.title.slice(0, 45)}…` : a.title}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[13px] capitalize" style={{ color: "#6c757d" }}>
                            {a.abstractType?.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-3">
                            <Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3" style={{ borderTop: "1px solid #f1f3f5" }}>
                <Link
                  href="/portal/abstracts"
                  className="text-[13px] font-medium flex items-center gap-1 no-underline"
                  style={{ color: "#0E6E74" }}
                >
                  View all abstracts <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-10 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "#f1f3f5" }}
              >
                <FileText className="w-7 h-7" style={{ color: "#dee2e6" }} />
              </div>
              <p className="text-[14px] font-medium mb-1" style={{ color: "#495057" }}>
                No abstracts submitted yet
              </p>
              <p className="text-[12px] mb-5" style={{ color: "#adb5bd" }}>
                Share your research at SATBDS 2027
              </p>
              <Link href="/portal/abstracts/new">
                <button
                  className="text-[13px] font-semibold px-5 py-2.5 rounded-lg text-white"
                  style={{ background: "#0E6E74" }}
                >
                  Submit First Abstract
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar — 2/5 */}
        <div className="lg:col-span-2 space-y-5">

          {/* Important Dates */}
          <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
            <SectionHeader title="Important Dates" />
            <div className="px-5 py-4">
              <div className="relative">
                {/* timeline vertical line */}
                <div
                  className="absolute"
                  style={{
                    left: 6, top: 6, bottom: 6, width: 2,
                    background: "#e9ecef",
                  }}
                />
                <ul className="space-y-4">
                  {IMPORTANT_DATES.map((d, i) => {
                    const isPast    = new Date(d.iso).getTime() < Date.now();
                    const dotColor  = isPast ? "#dee2e6" : dateDotColor(d.iso);
                    const textColor = isPast ? "#adb5bd" : "#212529";
                    return (
                      <li key={i} className="flex items-start gap-4">
                        <div
                          className="flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 border-white mt-0.5 z-10"
                          style={{
                            background: dotColor,
                            boxShadow: `0 0 0 2px ${dotColor}`,
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-medium mb-0.5" style={{ color: "#adb5bd" }}>{d.date}</div>
                          <div className="text-[13px]" style={{ color: textColor, textDecoration: isPast ? "line-through" : "none" }}>
                            {d.event}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid #f1f3f5" }}>
                {[
                  { color: "#0E6E74", label: "Upcoming" },
                  { color: "#C89B3C", label: "Soon" },
                  { color: "#dee2e6", label: "Past" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                    <span className="text-[10px]" style={{ color: "#adb5bd" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Schedule */}
          <div className="bg-white rounded-xl overflow-hidden" style={CARD}>
            <SectionHeader title="My Schedule" href="/portal/programme" />
            <div className="divide-y" style={{ borderColor: "#f1f3f5" }}>
              {savedSessions.length > 0 ? (
                savedSessions.map((s) => (
                  <div key={s.id} className="px-5 py-3.5 flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 text-white text-[10px] font-bold"
                      style={{ background: "#0E6E74" }}
                    >
                      D{s.day}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "#212529" }}
                      >
                        {s.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.startTime && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: "#0E6E74" }}>
                            <Clock className="w-3 h-3" />
                            {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                          </span>
                        )}
                        {s.room && (
                          <span className="text-[11px]" style={{ color: "#adb5bd" }}>· {s.room}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: "#dee2e6" }} />
                  <p className="text-[13px] mb-1" style={{ color: "#6c757d" }}>No saved sessions yet</p>
                  <Link
                    href="/portal/programme"
                    className="text-[12px] font-medium no-underline"
                    style={{ color: "#0E6E74" }}
                  >
                    Browse the programme →
                  </Link>
                </div>
              )}
            </div>
            {savedSessions.length > 0 && (
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderTop: "1px solid #f1f3f5" }}
              >
                <span className="text-[12px]" style={{ color: "#adb5bd" }}>
                  {savedIds?.length ?? 0} session{(savedIds?.length ?? 0) !== 1 ? "s" : ""} saved
                </span>
                <Link
                  href="/portal/programme"
                  className="flex items-center gap-1 text-[12px] font-medium no-underline"
                  style={{ color: "#0E6E74" }}
                >
                  Full programme <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}

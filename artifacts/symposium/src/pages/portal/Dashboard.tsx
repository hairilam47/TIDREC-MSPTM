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
import { ClipboardList, FileText, Calendar, Bell, CheckCircle, AlertCircle, Plus, ArrowRight } from "lucide-react";

function StatCard({
  icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: "1px solid #e9ecef", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#6c757d" }}>
        {label}
      </div>
      <div className="text-[26px] font-bold leading-none" style={{ color: "#212529" }}>
        {value}
      </div>
      {sub && <div className="text-[12px] mt-1" style={{ color: "#adb5bd" }}>{sub}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: "#e6f4f5", color: "#0E6E74", label: "Submitted" },
  under_review: { bg: "#fff3cd", color: "#856404", label: "Under Review" },
  accepted: { bg: "#d1e7dd", color: "#0a5c39", label: "Accepted" },
  rejected: { bg: "#f8d7da", color: "#842029", label: "Rejected" },
  revision_requested: { bg: "#fff3cd", color: "#856404", label: "Revision Needed" },
};

const IMPORTANT_DATES = [
  { date: "15 Jan 2027", event: "Abstract Submission Deadline", done: true },
  { date: "28 Feb 2027", event: "Acceptance Notification", done: true },
  { date: "01 Mar 2027", event: "Early Bird Closes", done: false },
  { date: "22 Mar 2027", event: "Symposium Day 1", done: false },
  { date: "23 Mar 2027", event: "Symposium Day 2", done: false },
];

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: abstracts, isLoading: loadingAbstracts } = useGetAbstracts();
  const { data: registration } = useGetMyRegistration();
  const { data: savedIds } = useGetSavedSessions();
  const { data: sessions } = useGetSessions();
  const { data: announcements } = useGetAnnouncements();

  const savedSessions = React.useMemo(
    () => sessions?.filter((s) => (savedIds ?? []).includes(s.id)).slice(0, 3) ?? [],
    [sessions, savedIds],
  );

  const importantAnnouncements = announcements?.filter((a) => a.important).slice(0, 2) ?? [];
  const daysToGo = Math.max(0, Math.ceil((new Date("2027-03-22").getTime() - Date.now()) / 86400000));

  return (
    <PortalLayout title="Dashboard">
      {/* Welcome banner */}
      <div
        className="rounded-xl p-6 mb-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B2744 0%, #0E6E74 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: "#C89B3C" }}>
            SATBDS 2027 · 22–23 March 2027 · Sunway Putra Hotel, KL
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-1">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            {daysToGo} days to go · 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium
          </p>
        </div>
        <div
          className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,155,60,0.25) 0%, transparent 70%)" }}
        />
      </div>

      {/* Important announcements */}
      {importantAnnouncements.map((a) => (
        <div
          key={a.id}
          className="flex items-start gap-3 px-4 py-3 rounded-lg text-sm mb-3"
          style={{ background: "#e6f4f5", borderLeft: "3px solid #0E6E74", color: "#055160" }}
        >
          <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#0E6E74" }} />
          <span>
            <strong>{a.title}: </strong>{a.body}
          </span>
        </div>
      ))}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<ClipboardList className="w-5 h-5" />}
          label="Registration"
          value={registration ? registration.paymentStatus.toUpperCase() : "Not Registered"}
          sub={registration?.registrationCode}
          iconBg="#e6f4f5" iconColor="#0E6E74"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="My Abstracts"
          value={abstracts?.length ?? 0}
          sub={(abstracts?.filter((a) => a.status === "accepted").length ?? 0) + " accepted"}
          iconBg="rgba(200,155,60,0.12)" iconColor="#C89B3C"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Saved Sessions"
          value={savedIds?.length ?? 0}
          sub="in my schedule"
          iconBg="rgba(11,39,68,0.08)" iconColor="#0B2744"
        />
        <StatCard
          icon={<Bell className="w-5 h-5" />}
          label="Notifications"
          value={importantAnnouncements.length}
          sub="important alerts"
          iconBg="#fff3cd" iconColor="#856404"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Abstracts table */}
        <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #e9ecef" }}>
            <span className="text-[15px] font-semibold" style={{ color: "#212529" }}>My Abstracts</span>
            <Link href="/portal/abstracts/new">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-white" style={{ background: "#0E6E74" }}>
                <Plus className="w-3.5 h-3.5" /> Submit New
              </button>
            </Link>
          </div>
          {loadingAbstracts ? (
            <div className="p-8 text-center text-sm" style={{ color: "#adb5bd" }}>Loading…</div>
          ) : abstracts && abstracts.length > 0 ? (
            <>
              <table className="w-full">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    {["Code", "Title", "Type", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6c757d", borderBottom: "1px solid #e9ecef" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abstracts.map((a) => {
                    const sc = STATUS_STYLES[a.status] ?? STATUS_STYLES.submitted;
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3" style={{ borderBottom: "1px solid #f1f3f5" }}>
                          <code className="text-[11px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">{a.abstractCode}</code>
                        </td>
                        <td className="px-4 py-3" style={{ borderBottom: "1px solid #f1f3f5" }}>
                          <Link href={`/portal/abstracts/${a.id}`} className="text-[13px] font-medium" style={{ color: "#0E6E74" }}>
                            {a.title.length > 38 ? a.title.slice(0, 38) + "…" : a.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 capitalize text-[13px]" style={{ color: "#6c757d", borderBottom: "1px solid #f1f3f5" }}>{a.abstractType}</td>
                        <td className="px-4 py-3" style={{ borderBottom: "1px solid #f1f3f5" }}>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3" style={{ borderTop: "1px solid #f1f3f5" }}>
                <Link href="/portal/abstracts" className="text-[13px] font-medium flex items-center gap-1 no-underline" style={{ color: "#0E6E74" }}>
                  View all abstracts <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="p-10 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#dee2e6" }} />
              <p className="text-[14px] mb-4" style={{ color: "#6c757d" }}>No abstracts submitted yet.</p>
              <Link href="/portal/abstracts/new">
                <button className="text-[13px] font-medium px-4 py-2 rounded-lg text-white" style={{ background: "#0E6E74" }}>Submit Your First Abstract</button>
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #e9ecef" }}>
              <span className="text-[15px] font-semibold" style={{ color: "#212529" }}>Important Dates</span>
            </div>
            <div className="px-5 py-4">
              <ul className="relative space-y-4" style={{ paddingLeft: 24 }}>
                <div className="absolute top-1 bottom-1" style={{ left: 6, width: 2, background: "#e9ecef" }} />
                {IMPORTANT_DATES.map((d, i) => (
                  <li key={i} className="relative">
                    <div
                      className="absolute w-3 h-3 rounded-full border-2 border-white"
                      style={{ left: -20, top: 3, background: d.done ? "#0E6E74" : "#dee2e6", boxShadow: `0 0 0 2px ${d.done ? "#0E6E74" : "#dee2e6"}` }}
                    />
                    <div className="text-[11px]" style={{ color: "#adb5bd" }}>{d.date}</div>
                    <div className="text-[13px] font-medium" style={{ color: d.done ? "#6c757d" : "#212529" }}>{d.event}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Saved sessions */}
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #e9ecef" }}>
              <span className="text-[15px] font-semibold" style={{ color: "#212529" }}>My Schedule</span>
              <Link href="/portal/programme" className="text-[12px] font-medium no-underline" style={{ color: "#0E6E74" }}>View all</Link>
            </div>
            <div className="px-4 py-3 space-y-2">
              {savedSessions.length > 0 ? savedSessions.map((s) => (
                <div key={s.id} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: "#f8f9fa" }}>
                  <span className="text-[11px] font-bold px-2 py-1 rounded flex-shrink-0 text-white" style={{ background: "#0E6E74", marginTop: 1 }}>D{s.day}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate" style={{ color: "#212529" }}>{s.title}</div>
                    <div className="text-[11px]" style={{ color: "#6c757d" }}>
                      {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}{s.room ? ` · ${s.room}` : ""}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-5 text-center text-[13px]" style={{ color: "#adb5bd" }}>
                  <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: "#dee2e6" }} />
                  No saved sessions. <Link href="/portal/programme" style={{ color: "#0E6E74" }}>Browse programme</Link>
                </div>
              )}
            </div>
          </div>

          {/* Payment alert */}
          {registration && registration.paymentStatus !== "paid" && (
            <div className="rounded-xl p-4" style={{ background: "#fff3cd", border: "1px solid #ffe69c" }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" style={{ color: "#856404" }} />
                <span className="text-[13px] font-semibold" style={{ color: "#856404" }}>Payment Pending</span>
              </div>
              <p className="text-[12px] mb-2" style={{ color: "#664d03" }}>Please complete payment to confirm your registration.</p>
              <Link href="/portal/registration">
                <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-white" style={{ background: "#856404" }}>View Details</button>
              </Link>
            </div>
          )}
          {registration && registration.paymentStatus === "paid" && (
            <div className="rounded-xl p-4" style={{ background: "#d1e7dd", border: "1px solid #a3cfbb" }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" style={{ color: "#0a5c39" }} />
                <span className="text-[13px] font-semibold" style={{ color: "#0a5c39" }}>Registration Confirmed</span>
              </div>
              <p className="text-[12px] mt-1" style={{ color: "#0a3622" }}>{registration.registrationCode} · Payment complete</p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

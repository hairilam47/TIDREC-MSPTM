import React from "react";
import { SiteHeader } from "@/components/SiteHeader";

type Session = {
  time: string;
  title: string;
  speaker?: string;
  type?: "keynote" | "break" | "plenary" | "session" | "special";
};

type DaySchedule = {
  day: string;
  date: string;
  sessions: Session[];
};

const SCHEDULE: DaySchedule[] = [
  {
    day: "Day 1",
    date: "TBC — March 2027",
    sessions: [
      { time: "08:00 – 09:00", title: "Registration & Welcome Coffee", type: "break" },
      { time: "09:00 – 09:30", title: "Opening Ceremony & Welcome Remarks", type: "plenary" },
      { time: "09:30 – 10:30", title: "Keynote Lecture I: Advancing One Health in Tick Research", speaker: "TBC — Invited Keynote Speaker", type: "keynote" },
      { time: "10:30 – 11:00", title: "Morning Break", type: "break" },
      {
        time: "11:00 – 12:30",
        title: "SEAT Symposium — Oral Sessions I: Tick Biology & Ecology",
        type: "session",
      },
      { time: "12:30 – 14:00", title: "Lunch Break & Poster Viewing", type: "break" },
      {
        time: "14:00 – 15:30",
        title: "SEAT Symposium — Oral Sessions II: Tick-Borne Pathogens & Diseases",
        type: "session",
      },
      {
        time: "14:00 – 15:30",
        title: "MSPTM Scientific Conference — Concurrent Session I: Tropical & Infectious Diseases",
        type: "session",
      },
      { time: "15:30 – 16:00", title: "Afternoon Break", type: "break" },
      {
        time: "16:00 – 17:30",
        title: "SEAT Symposium — Oral Sessions III: Surveillance & Public Health",
        type: "session",
      },
      {
        time: "16:00 – 17:30",
        title: "MSPTM Scientific Conference — Concurrent Session II: Vector Biology & Medical Entomology",
        type: "session",
      },
      { time: "19:00 – 21:30", title: "Welcome Dinner & Networking", type: "special" },
    ],
  },
  {
    day: "Day 2",
    date: "TBC — March 2027",
    sessions: [
      { time: "08:30 – 09:00", title: "Morning Coffee & Poster Viewing", type: "break" },
      { time: "09:00 – 10:00", title: "Keynote Lecture II: Genomics & Emerging Technologies in Vector Control", speaker: "TBC — Invited Keynote Speaker", type: "keynote" },
      { time: "10:00 – 10:30", title: "Morning Break", type: "break" },
      {
        time: "10:30 – 12:00",
        title: "SEAT Symposium — Oral Sessions IV: Genomics, Data Science & Emerging Technologies",
        type: "session",
      },
      {
        time: "10:30 – 12:00",
        title: "MSPTM Scientific Conference — MSPTM Student Rapid Oral Presentation Competition",
        type: "session",
      },
      { time: "12:00 – 13:30", title: "Lunch Break & Poster Viewing", type: "break" },
      {
        time: "13:30 – 15:00",
        title: "SEAT Symposium — Oral Sessions V: Tick Control & Management",
        type: "session",
      },
      {
        time: "13:30 – 15:00",
        title: "MSPTM Scientific Conference — Concurrent Session III: Microbiology & Parasitology",
        type: "session",
      },
      { time: "15:00 – 15:30", title: "Afternoon Break", type: "break" },
      { time: "15:30 – 16:30", title: "Award Ceremony & Student Competition Results", type: "special" },
      { time: "16:30 – 17:00", title: "Closing Ceremony & Remarks", type: "plenary" },
    ],
  },
];

const TYPE_STYLES: Record<NonNullable<Session["type"]>, { dot: string; bg: string; badge?: string; badgeText?: string }> = {
  keynote: {
    dot: "var(--gold, #C89B3C)",
    bg: "rgba(200,155,60,0.07)",
    badge: "rgba(200,155,60,0.15)",
    badgeText: "Keynote",
  },
  plenary: {
    dot: "var(--navy, #0B2744)",
    bg: "rgba(11,39,68,0.04)",
    badge: "rgba(11,39,68,0.10)",
    badgeText: "Plenary",
  },
  session: {
    dot: "var(--teal, #0E6E74)",
    bg: "white",
  },
  break: {
    dot: "#d1d5db",
    bg: "#f7f9fc",
  },
  special: {
    dot: "var(--teal, #0E6E74)",
    bg: "rgba(14,110,116,0.06)",
    badge: "rgba(14,110,116,0.14)",
    badgeText: "Social",
  },
};

function SessionRow({ session }: { session: Session }) {
  const style = TYPE_STYLES[session.type ?? "session"];
  const isBreak = session.type === "break";

  return (
    <div
      className="flex gap-4 items-start rounded-xl px-5 py-4"
      style={{ background: style.bg, border: isBreak ? "none" : "1px solid #e5e9ef" }}
    >
      <div className="flex-shrink-0 w-1.5 mt-1.5 self-stretch flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-0.5">
          <span
            className="text-xs font-semibold tabular-nums flex-shrink-0"
            style={{ color: "var(--text-muted, #6b7a8d)", minWidth: 110 }}
          >
            {session.time}
          </span>
          {style.badge && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: style.badge, color: style.dot }}
            >
              {style.badgeText}
            </span>
          )}
        </div>
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: isBreak ? "var(--text-muted, #6b7a8d)" : "var(--navy, #0B2744)" }}
        >
          {session.title}
        </p>
        {session.speaker && (
          <p className="mt-1 text-xs" style={{ color: "var(--gold, #C89B3C)" }}>
            {session.speaker}
          </p>
        )}
      </div>
    </div>
  );
}

function DayCard({ schedule }: { schedule: DaySchedule }) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div
        className="rounded-t-2xl px-6 py-4 flex items-center gap-3"
        style={{ background: "var(--navy, #0B2744)" }}
      >
        <div>
          <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--gold, #C89B3C)" }}>
            {schedule.day}
          </div>
          <div className="text-white font-semibold text-base leading-tight">{schedule.date}</div>
        </div>
      </div>
      <div
        className="rounded-b-2xl px-4 py-4 space-y-2.5"
        style={{ border: "1px solid #e5e9ef", borderTop: "none" }}
      >
        {schedule.sessions.map((s, i) => (
          <SessionRow key={i} session={s} />
        ))}
      </div>
    </div>
  );
}

export default function ProgrammePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="py-16 px-4" style={{ background: "var(--navy, #0B2744)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--gold, #C89B3C)" }}>
            3rd SEAT-MSPTM 2027
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Programme</h1>
          <div className="mx-auto w-16 h-1 rounded-full" style={{ background: "var(--gold, #C89B3C)" }} />
          <p className="mt-5 text-sm md:text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            Conference schedule for the 3rd SEAT-MSPTM 2027. Sessions are held across two days featuring keynote lectures, oral presentations, poster sessions, and the MSPTM Student Rapid Oral Presentation Competition.
          </p>
        </div>
      </section>

      <main className="flex-1 w-full">

        {/* Legend */}
        <section className="py-8 px-4" style={{ background: "#f7f9fc", borderBottom: "1px solid #e5e9ef" }}>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-5 justify-center">
              {[
                { label: "Keynote", dot: "var(--gold, #C89B3C)" },
                { label: "Plenary / Opening / Closing", dot: "var(--navy, #0B2744)" },
                { label: "Oral / Concurrent Session", dot: "var(--teal, #0E6E74)" },
                { label: "Break / Networking", dot: "#d1d5db" },
              ].map(({ label, dot }) => (
                <div key={label} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-secondary, #4a5568)" }}>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="py-14 px-4" style={{ background: "white" }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold" style={{ color: "var(--navy, #0B2744)" }}>Conference Schedule</h2>
              <div className="mt-2 mx-auto w-12 h-0.5 rounded" style={{ background: "var(--gold, #C89B3C)" }} />
              <p className="mt-3 text-sm max-w-xl mx-auto" style={{ color: "var(--text-muted, #6b7a8d)" }}>
                The full programme is subject to change. Confirmed details will be published closer to the conference date.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {SCHEDULE.map((day) => (
                <DayCard key={day.day} schedule={day} />
              ))}
            </div>
          </div>
        </section>

        {/* Tracks info */}
        <section className="py-14 px-4" style={{ background: "#f7f9fc" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold" style={{ color: "var(--navy, #0B2744)" }}>Concurrent Tracks</h2>
              <div className="mt-2 mx-auto w-12 h-0.5 rounded" style={{ background: "var(--gold, #C89B3C)" }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl p-7" style={{ background: "var(--navy, #0B2744)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,155,60,0.18)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-white">SEAT Symposium</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
                  The Southeast Asian Alliance on Tick Research (SEAT) symposium covers the latest advances across five scientific tracks.
                </p>
                <ul className="space-y-2">
                  {["Tick Biology and Ecology", "Tick-Borne Pathogens and Diseases", "Surveillance and Public Health", "Genomics, Data Science and Emerging Technologies", "Tick Control and Management"].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--gold, #C89B3C)" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl p-7" style={{ background: "var(--teal, #0E6E74)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,155,60,0.18)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C89B3C)" strokeWidth="1.8" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-white leading-snug">
                    MSPTM Scientific Conference<br />
                    <span className="font-normal text-xs opacity-80">(Concurrent Sessions)</span>
                  </h3>
                </div>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.65)" }}>
                  The Malaysian Society of Parasitology and Tropical Medicine (MSPTM) scientific conference runs concurrently with dedicated student competition sessions.
                </p>
                <ul className="space-y-2">
                  {["Tropical and Infectious Diseases", "Vector Biology and Medical Entomology", "Microbiology and Parasitology", "Drug, Insecticide and Antibiotic Resistance", "Other Related Topics"].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--gold, #C89B3C)" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="py-10 px-4" style={{ background: "white", borderTop: "1px solid #e5e9ef" }}>
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-3 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(11,39,68,0.08)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--navy,#0B2744)" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted, #6b7a8d)" }}>
              For programme enquiries, please contact the conference secretariat:
            </p>
            <a
              href="mailto:events@msptm.network"
              className="font-bold text-base hover:underline"
              style={{ color: "var(--navy, #0B2744)" }}
            >
              events@msptm.network
            </a>
          </div>
        </section>

      </main>

      <footer className="py-6 text-center text-xs border-t" style={{ color: "var(--text-muted, #6b7a8d)" }}>
        © 2027 SEAT-MSPTM. All rights reserved.
      </footer>
    </div>
  );
}

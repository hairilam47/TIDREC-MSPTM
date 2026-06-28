import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useListProgrammeSessions } from "@workspace/api-client-react";
import type { ProgrammeSession } from "@workspace/api-client-react";
import { Calendar, MapPin, Coffee, Utensils, Star, Clock } from "lucide-react";

const SESSION_TYPE_CONFIG: Record<string, { dot: string; badge?: string; badgeText?: string; isBreak?: boolean }> = {
  registration: { dot: "#9ca3af", isBreak: true },
  break:        { dot: "#9ca3af", isBreak: true },
  keynote:      { dot: "var(--gold)", badge: "var(--gold-lt)", badgeText: "Keynote" },
  plenary:      { dot: "var(--navy)", badge: "var(--navy-lt)", badgeText: "Plenary" },
  industry:     { dot: "var(--teal)", badge: "var(--teal-lt)", badgeText: "Industry" },
  social:       { dot: "var(--gold)", badge: "var(--gold-lt)", badgeText: "Social" },
  session:      { dot: "var(--teal)" },
};

function getConfig(sessionType: string) {
  return SESSION_TYPE_CONFIG[sessionType] ?? SESSION_TYPE_CONFIG.session;
}

function breakIcon(title: string | null | undefined) {
  const t = (title ?? "").toLowerCase();
  if (t.includes("lunch") || t.includes("dinner") || t.includes("gala") || t.includes("meal")) return <Utensils className="w-3.5 h-3.5 flex-shrink-0" />;
  if (t.includes("social") || t.includes("networking")) return <Star className="w-3.5 h-3.5 flex-shrink-0" />;
  if (t.includes("registration")) return <Clock className="w-3.5 h-3.5 flex-shrink-0" />;
  return <Coffee className="w-3.5 h-3.5 flex-shrink-0" />;
}

function SingleRow({ s }: { s: ProgrammeSession }) {
  const cfg = getConfig(s.sessionType);
  if (cfg.isBreak) {
    return (
      <div className="flex items-center gap-3 py-2.5 px-4 rounded-lg"
        style={{ background: "rgba(200,155,60,0.06)", border: "1px dashed rgba(200,155,60,0.25)" }}>
        <span className="flex items-center gap-1.5 flex-shrink-0" style={{ color: "var(--gold)" }}>
          {breakIcon(s.title)}
        </span>
        <span className="text-xs font-semibold tabular-nums flex-shrink-0 w-28" style={{ color: "#9ca3af" }}>
          {s.timeSlot}
        </span>
        <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--gold)" }}>
          {s.title}
        </span>
        {s.location && (
          <span className="ml-auto flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "var(--gold)", opacity: 0.7 }}>
            <MapPin className="w-3 h-3" /> {s.location}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-xl px-5 py-4"
      style={{ background: "white", border: "1px solid #e5e9ef" }}>
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.dot }} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold tabular-nums flex-shrink-0 w-24" style={{ color: "#6b7a8d" }}>
            {s.timeSlot}
          </span>
          {cfg.badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: cfg.badge, color: cfg.dot }}>
              {cfg.badgeText}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold leading-snug" style={{ color: "var(--navy)" }}>{s.title}</p>
        {s.location && (
          <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" /> {s.location}
          </p>
        )}
      </div>
    </div>
  );
}

function DualRow({ s }: { s: ProgrammeSession }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e9ef" }}>
      <div className="px-5 py-2.5 flex items-center gap-3 border-b" style={{ background: "#f7f9fc", borderColor: "#e5e9ef" }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--teal)" }} />
        <span className="text-xs font-semibold tabular-nums" style={{ color: "#6b7a8d" }}>{s.timeSlot}</span>
        <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded-full"
          style={{ background: "rgba(14,110,116,0.12)", color: "var(--teal)" }}>
          Concurrent
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ divideColor: "#e5e9ef" }}>
        <div className="px-5 py-4 bg-white">
          <p className="text-xs font-bold mb-1" style={{ color: "var(--navy)" }}>Track A</p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--navy)" }}>{s.trackATitle}</p>
          {s.trackALocation && (
            <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
              <MapPin className="w-3 h-3 flex-shrink-0" /> {s.trackALocation}
            </p>
          )}
        </div>
        <div className="px-5 py-4" style={{ background: "rgba(14,110,116,0.03)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "var(--teal)" }}>Track B</p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "var(--navy)" }}>{s.trackBTitle}</p>
          {s.trackBLocation && (
            <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
              <MapPin className="w-3 h-3 flex-shrink-0" /> {s.trackBLocation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DayBand({ label, dayLabel }: { label: string; dayLabel: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-6 py-4 mb-4"
      style={{ background: "var(--navy)" }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(200,155,60,0.18)" }}>
        <Calendar className="w-4 h-4" style={{ color: "var(--gold)" }} />
      </div>
      <div>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--gold)" }}>{label}</p>
        <p className="text-white font-semibold text-base leading-tight">{dayLabel}</p>
      </div>
    </div>
  );
}

export default function ProgrammePage() {
  const { data: sessions = [], isLoading, isError } = useListProgrammeSessions();

  const day1 = sessions.filter((s) => s.day === 1);
  const day2 = sessions.filter((s) => s.day === 2);
  const day1Label = day1[0]?.dayLabel ?? "22 March 2027";
  const day2Label = day2[0]?.dayLabel ?? "23 March 2027";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <section className="py-16 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
            3rd SEAT-MSPTM 2027
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Detailed Programme</h1>
          <div className="mx-auto w-16 h-1 rounded-full" style={{ background: "var(--gold)" }} />
          <p className="mt-5 text-sm md:text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            Conference schedule for the 3rd SEAT-MSPTM 2027 · Sunway Putra Hotel, Kuala Lumpur · 22–23 March 2027.
          </p>
        </div>
      </section>

      <section className="py-5 px-4 border-b" style={{ background: "#f7f9fc", borderColor: "#e5e9ef" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-5 justify-center">
            {[
              { label: "Keynote", dot: "var(--gold)" },
              { label: "Plenary", dot: "var(--navy)" },
              { label: "Session / Concurrent", dot: "var(--teal)" },
              { label: "Break / Registration", dot: "#9ca3af" },
            ].map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-medium" style={{ color: "#4a5568" }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 w-full py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {isLoading && (
            <div className="text-center py-20 text-sm" style={{ color: "#6b7a8d" }}>
              Loading programme…
            </div>
          )}
          {isError && (
            <div className="text-center py-20 text-sm" style={{ color: "#e74c3c" }}>
              Unable to load programme. Please try again later.
            </div>
          )}
          {!isLoading && !isError && (
            <div className="space-y-12">
              {[
                { label: "DAY 1", dayLabel: day1Label, items: day1 },
                { label: "DAY 2", dayLabel: day2Label, items: day2 },
              ].map(({ label, dayLabel, items }) => (
                <div key={label}>
                  <DayBand label={label} dayLabel={dayLabel} />
                  <div className="space-y-2.5">
                    {items.map((s) =>
                      s.kind === "dual"
                        ? <DualRow key={s.id} s={s} />
                        : <SingleRow key={s.id} s={s} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl px-6 py-5 border"
            style={{ background: "rgba(11,39,68,0.03)", borderColor: "rgba(11,39,68,0.12)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--navy)" }}>
              Disclaimer
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5568" }}>
              The programme is subject to change without prior notice. The Organising Committee reserves the right
              to modify session timings, topics, and speakers as necessary.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs border-t" style={{ color: "#6b7a8d", borderColor: "#e5e9ef" }}>
        © 2027 SEAT-MSPTM. All rights reserved.
      </footer>
    </div>
  );
}

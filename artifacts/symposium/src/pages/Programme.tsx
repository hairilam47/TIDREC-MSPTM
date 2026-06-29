import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useGetSessions } from "@workspace/api-client-react";
import type { Session } from "@workspace/api-client-react";
import { Calendar, MapPin, Coffee, Utensils, Star, Clock, User } from "lucide-react";

const TYPE_CONFIG: Record<string, {
  dot: string;
  badge?: string;
  badgeText?: string;
  isBreak?: boolean;
}> = {
  keynote:  { dot: "#C89B3C", badge: "rgba(200,155,60,0.15)",  badgeText: "Keynote" },
  plenary:  { dot: "#0B2744", badge: "rgba(11,39,68,0.10)",    badgeText: "Plenary" },
  panel:    { dot: "#0E6E74", badge: "rgba(14,110,116,0.12)",  badgeText: "Panel" },
  workshop: { dot: "#0B2744", badge: "rgba(11,39,68,0.08)",    badgeText: "Workshop" },
  oral:     { dot: "#0E6E74", badge: "rgba(14,110,116,0.12)",  badgeText: "Oral" },
  poster:   { dot: "#C89B3C", badge: "rgba(200,155,60,0.15)",  badgeText: "Poster" },
  opening:  { dot: "#9ca3af", badge: "rgba(156,163,175,0.15)", badgeText: "Opening" },
  closing:  { dot: "#9ca3af", badge: "rgba(156,163,175,0.15)", badgeText: "Closing" },
  break:    { dot: "#9ca3af", isBreak: true },
  registration: { dot: "#9ca3af", isBreak: true },
};

function getConfig(sessionType: string) {
  return TYPE_CONFIG[sessionType] ?? TYPE_CONFIG.panel;
}

function formatTime(start: string, end: string | null | undefined): string {
  if (!end) return start;
  return `${start} – ${end}`;
}

function breakIcon(title: string | null | undefined) {
  const t = (title ?? "").toLowerCase();
  if (t.includes("lunch") || t.includes("dinner") || t.includes("gala") || t.includes("meal")) return <Utensils className="w-3.5 h-3.5 flex-shrink-0" />;
  if (t.includes("social") || t.includes("networking")) return <Star className="w-3.5 h-3.5 flex-shrink-0" />;
  if (t.includes("registration")) return <Clock className="w-3.5 h-3.5 flex-shrink-0" />;
  return <Coffee className="w-3.5 h-3.5 flex-shrink-0" />;
}

function BreakRow({ s }: { s: Session }) {
  const timeSlot = formatTime(s.startTime, s.endTime);
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-lg"
      style={{ background: "rgba(200,155,60,0.06)", border: "1px dashed rgba(200,155,60,0.25)" }}>
      <span className="flex items-center gap-1.5 flex-shrink-0" style={{ color: "#C89B3C" }}>
        {breakIcon(s.title)}
      </span>
      <span className="text-xs font-semibold tabular-nums flex-shrink-0 w-28" style={{ color: "#9ca3af" }}>
        {timeSlot}
      </span>
      <span className="text-xs font-semibold tracking-wide" style={{ color: "#C89B3C" }}>
        {s.title}
      </span>
      {s.room && (
        <span className="ml-auto flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "#C89B3C", opacity: 0.7 }}>
          <MapPin className="w-3 h-3" /> {s.room}
        </span>
      )}
    </div>
  );
}

function SessionRow({ s }: { s: Session }) {
  const cfg = getConfig(s.sessionType);
  const timeSlot = formatTime(s.startTime, s.endTime);

  if (cfg.isBreak) return <BreakRow s={s} />;

  return (
    <div className="flex items-start gap-4 rounded-xl px-5 py-4"
      style={{ background: "white", border: "1px solid #e5e9ef" }}>
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cfg.dot }} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-semibold tabular-nums flex-shrink-0 w-24" style={{ color: "#6b7a8d" }}>
            {timeSlot}
          </span>
          {cfg.badge && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: cfg.badge, color: cfg.dot }}>
              {cfg.badgeText}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold leading-snug" style={{ color: "#0B2744" }}>{s.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
          {s.room && (
            <p className="flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
              <MapPin className="w-3 h-3 flex-shrink-0" /> {s.room}
            </p>
          )}
          {s.speakerName && (
            <p className="flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
              <User className="w-3 h-3 flex-shrink-0" /> {s.speakerName}
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
      style={{ background: "#0B2744" }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(200,155,60,0.18)" }}>
        <Calendar className="w-4 h-4" style={{ color: "#C89B3C" }} />
      </div>
      <div>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#C89B3C" }}>{label}</p>
        <p className="text-white font-semibold text-base leading-tight">{dayLabel}</p>
      </div>
    </div>
  );
}

const DAY_LABELS: Record<number, string> = {
  1: "22 March 2027",
  2: "23 March 2027",
};

export default function ProgrammePage() {
  const { data: sessions = [], isLoading, isError } = useGetSessions();

  const day1 = sessions.filter((s) => s.day === 1);
  const day2 = sessions.filter((s) => s.day === 2);

  const days = [
    { label: "DAY 1", dayLabel: DAY_LABELS[1], items: day1 },
    { label: "DAY 2", dayLabel: DAY_LABELS[2], items: day2 },
  ].filter(d => d.items.length > 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <section className="py-16 px-4" style={{ background: "#0B2744" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#C89B3C" }}>
            3rd SEAT-MSPTM 2027
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Detailed Programme</h1>
          <div className="mx-auto w-16 h-1 rounded-full" style={{ background: "#C89B3C" }} />
          <p className="mt-5 text-sm md:text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            Conference schedule for the 3rd SEAT-MSPTM 2027 · Sunway Putra Hotel, Kuala Lumpur · 22–23 March 2027.
          </p>
        </div>
      </section>

      <section className="py-5 px-4 border-b" style={{ background: "#f7f9fc", borderColor: "#e5e9ef" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center gap-5 justify-center">
            {[
              { label: "Keynote",        dot: "#C89B3C" },
              { label: "Panel / Oral",   dot: "#0E6E74" },
              { label: "Workshop",       dot: "#0B2744" },
              { label: "Poster",         dot: "#C89B3C" },
              { label: "Break / Admin",  dot: "#9ca3af" },
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
          {!isLoading && !isError && sessions.length === 0 && (
            <div className="text-center py-20 text-sm" style={{ color: "#6b7a8d" }}>
              Programme details will be announced shortly.
            </div>
          )}
          {!isLoading && !isError && sessions.length > 0 && (
            <div className="space-y-12">
              {days.map(({ label, dayLabel, items }) => (
                <div key={label}>
                  <DayBand label={label} dayLabel={dayLabel} />
                  <div className="space-y-2.5">
                    {items.map((s) => (
                      <SessionRow key={s.id} s={s} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-2xl px-6 py-5 border"
            style={{ background: "rgba(11,39,68,0.03)", borderColor: "rgba(11,39,68,0.12)" }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#0B2744" }}>
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

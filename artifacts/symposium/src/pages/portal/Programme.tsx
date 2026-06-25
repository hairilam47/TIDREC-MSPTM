import React from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  useListProgrammeSessions,
  useGetSavedSessions,
  useSaveSession,
  useUnsaveSession,
  getGetSavedSessionsQueryKey,
} from "@workspace/api-client-react";
import type { ProgrammeSession } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Coffee, Utensils, Star, Clock, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

const SESSION_TYPE_CONFIG: Record<string, { dot: string; badge?: string; badgeText?: string; isBreak?: boolean }> = {
  registration: { dot: "#9ca3af", isBreak: true },
  break:        { dot: "#9ca3af", isBreak: true },
  keynote:      { dot: "#C89B3C", badge: "rgba(200,155,60,0.15)", badgeText: "Keynote" },
  plenary:      { dot: "#0B2744", badge: "rgba(11,39,68,0.10)", badgeText: "Plenary" },
  industry:     { dot: "#0E6E74", badge: "rgba(14,110,116,0.12)", badgeText: "Industry" },
  social:       { dot: "#C89B3C", badge: "rgba(200,155,60,0.15)", badgeText: "Social" },
  session:      { dot: "#0E6E74" },
};

function getConfig(sessionType: string) {
  return SESSION_TYPE_CONFIG[sessionType] ?? SESSION_TYPE_CONFIG.session;
}

function breakIcon(title: string | null | undefined) {
  const t = (title ?? "").toLowerCase();
  if (t.includes("lunch") || t.includes("dinner") || t.includes("gala") || t.includes("meal"))
    return <Utensils className="w-3.5 h-3.5 flex-shrink-0" />;
  if (t.includes("social") || t.includes("networking"))
    return <Star className="w-3.5 h-3.5 flex-shrink-0" />;
  if (t.includes("registration"))
    return <Clock className="w-3.5 h-3.5 flex-shrink-0" />;
  return <Coffee className="w-3.5 h-3.5 flex-shrink-0" />;
}

interface BookmarkButtonProps {
  id: number;
  saved: boolean;
  pending: boolean;
  onToggle: (id: number) => void;
}

function BookmarkButton({ id, saved, pending, onToggle }: BookmarkButtonProps) {
  return (
    <button
      onClick={() => onToggle(id)}
      disabled={pending}
      title={saved ? "Remove from schedule" : "Save to schedule"}
      style={{
        flexShrink: 0,
        width: 30,
        height: 30,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${saved ? "#C89B3C" : "#e5e9ef"}`,
        borderRadius: 6,
        background: saved ? "rgba(200,155,60,0.12)" : "#f7f9fc",
        color: saved ? "#C89B3C" : "#9ca3af",
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.6 : 1,
        transition: "all 0.15s",
      }}
    >
      {pending ? (
        <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
      ) : saved ? (
        <BookmarkCheck style={{ width: 14, height: 14 }} />
      ) : (
        <Bookmark style={{ width: 14, height: 14 }} />
      )}
    </button>
  );
}

interface RowProps {
  s: ProgrammeSession;
  saved: boolean;
  pending: boolean;
  onToggle: (id: number) => void;
}

function SingleRow({ s, saved, pending, onToggle }: RowProps) {
  const cfg = getConfig(s.sessionType);
  if (cfg.isBreak) {
    return (
      <div className="flex items-center gap-3 py-2.5 px-4 rounded-lg"
        style={{ background: "rgba(200,155,60,0.06)", border: "1px dashed rgba(200,155,60,0.25)" }}>
        <span className="flex items-center gap-1.5 flex-shrink-0" style={{ color: "#C89B3C" }}>
          {breakIcon(s.title)}
        </span>
        <span className="text-xs font-semibold tabular-nums flex-shrink-0 w-28" style={{ color: "#9ca3af" }}>
          {s.timeSlot}
        </span>
        <span className="text-xs font-semibold tracking-wide" style={{ color: "#C89B3C" }}>
          {s.title}
        </span>
        {s.location && (
          <span className="ml-auto flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "#C89B3C", opacity: 0.7 }}>
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
        <p className="text-sm font-semibold leading-snug" style={{ color: "#0B2744" }}>{s.title}</p>
        {s.location && (
          <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" /> {s.location}
          </p>
        )}
      </div>
      <BookmarkButton id={s.id} saved={saved} pending={pending} onToggle={onToggle} />
    </div>
  );
}

function DualRow({ s, saved, pending, onToggle }: RowProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e9ef" }}>
      <div className="px-5 py-2.5 flex items-center gap-3 border-b" style={{ background: "#f7f9fc", borderColor: "#e5e9ef" }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#0E6E74" }} />
        <span className="text-xs font-semibold tabular-nums" style={{ color: "#6b7a8d" }}>{s.timeSlot}</span>
        <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded-full"
          style={{ background: "rgba(14,110,116,0.12)", color: "#0E6E74" }}>
          Concurrent
        </span>
        <BookmarkButton id={s.id} saved={saved} pending={pending} onToggle={onToggle} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x" style={{ divideColor: "#e5e9ef" }}>
        <div className="px-5 py-4 bg-white">
          <p className="text-xs font-bold mb-1" style={{ color: "#0B2744" }}>Track A</p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "#0B2744" }}>{s.trackATitle}</p>
          {s.trackALocation && (
            <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "#6b7a8d" }}>
              <MapPin className="w-3 h-3 flex-shrink-0" /> {s.trackALocation}
            </p>
          )}
        </div>
        <div className="px-5 py-4" style={{ background: "rgba(14,110,116,0.03)" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#0E6E74" }}>Track B</p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "#0B2744" }}>{s.trackBTitle}</p>
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

export default function Programme() {
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading, isError } = useListProgrammeSessions();
  const { data: savedIds } = useGetSavedSessions();
  const saveMutation = useSaveSession();
  const unsaveMutation = useUnsaveSession();
  const [pendingId, setPendingId] = React.useState<number | null>(null);

  const isSaved = (id: number) => (savedIds ?? []).includes(id);

  const toggleSave = (id: number) => {
    setPendingId(id);
    if (isSaved(id)) {
      unsaveMutation.mutate(
        { id },
        {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetSavedSessionsQueryKey() }),
          onSettled: () => setPendingId(null),
        },
      );
    } else {
      saveMutation.mutate(
        { id },
        {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetSavedSessionsQueryKey() }),
          onSettled: () => setPendingId(null),
        },
      );
    }
  };

  const day1 = sessions.filter((s) => s.day === 1);
  const day2 = sessions.filter((s) => s.day === 2);
  const day1Label = day1[0]?.dayLabel ?? "22 March 2027";
  const day2Label = day2[0]?.dayLabel ?? "23 March 2027";

  return (
    <PortalLayout title="Scientific Programme">
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        22–23 March 2027 · Sunway Putra Hotel, Kuala Lumpur. Bookmark sessions to add them to your personal schedule.
      </p>

      <div className="flex flex-wrap items-center gap-5 mb-8 pb-5 border-b" style={{ borderColor: "#e5e9ef" }}>
        {[
          { label: "Keynote", dot: "#C89B3C" },
          { label: "Plenary", dot: "#0B2744" },
          { label: "Session / Concurrent", dot: "#0E6E74" },
          { label: "Break / Registration", dot: "#9ca3af" },
        ].map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-2 text-xs font-medium" style={{ color: "#4a5568" }}>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
            {label}
          </div>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
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
                  s.kind === "dual" ? (
                    <DualRow
                      key={s.id}
                      s={s}
                      saved={isSaved(s.id)}
                      pending={pendingId === s.id}
                      onToggle={toggleSave}
                    />
                  ) : (
                    <SingleRow
                      key={s.id}
                      s={s}
                      saved={isSaved(s.id)}
                      pending={pendingId === s.id}
                      onToggle={toggleSave}
                    />
                  )
                )}
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
    </PortalLayout>
  );
}

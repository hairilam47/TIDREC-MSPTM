import React from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  useListProgrammeSessions,
  useGetSavedSessions,
  useUnsaveSession,
  getGetSavedSessionsQueryKey,
} from "@workspace/api-client-react";
import type { ProgrammeSession } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Coffee, Utensils, Star, Clock, BookmarkCheck, Loader2, BookmarkX } from "lucide-react";

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

interface RowProps {
  s: ProgrammeSession;
  onRemove: (id: number) => void;
  removing: boolean;
}

function ScheduleRow({ s, onRemove, removing }: RowProps) {
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

  if (s.kind === "dual") {
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e9ef" }}>
        <div className="px-5 py-2.5 flex items-center gap-3 border-b" style={{ background: "#f7f9fc", borderColor: "#e5e9ef" }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--teal)" }} />
          <span className="text-xs font-semibold tabular-nums" style={{ color: "#6b7a8d" }}>{s.timeSlot}</span>
          <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded-full"
            style={{ background: "rgba(14,110,116,0.12)", color: "var(--teal)" }}>
            Concurrent
          </span>
          <RemoveButton id={s.id} onRemove={onRemove} removing={removing} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e5e9ef]">
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
      <RemoveButton id={s.id} onRemove={onRemove} removing={removing} />
    </div>
  );
}

function RemoveButton({ id, onRemove, removing }: { id: number; onRemove: (id: number) => void; removing: boolean }) {
  return (
    <button
      onClick={() => onRemove(id)}
      disabled={removing}
      title="Remove from schedule"
      style={{
        flexShrink: 0,
        width: 30,
        height: 30,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border-color)",
        borderRadius: 6,
        background: "var(--bg-surface-secondary)",
        color: "var(--text-disabled)",
        cursor: removing ? "not-allowed" : "pointer",
        opacity: removing ? 0.6 : 1,
        transition: "all 0.15s",
      }}
    >
      {removing ? (
        <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
      ) : (
        <BookmarkX style={{ width: 14, height: 14 }} />
      )}
    </button>
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

export default function Schedule() {
  const queryClient = useQueryClient();
  const { data: sessions = [], isLoading: sessionsLoading } = useListProgrammeSessions();
  const { data: savedIds = [], isLoading: savedLoading } = useGetSavedSessions();
  const unsaveMutation = useUnsaveSession();
  const [removingId, setRemovingId] = React.useState<number | null>(null);

  const isLoading = sessionsLoading || savedLoading;

  const savedSessions = React.useMemo(
    () => sessions.filter((s) => (savedIds as number[]).includes(s.id)),
    [sessions, savedIds],
  );

  const day1 = savedSessions.filter((s) => s.day === 1);
  const day2 = savedSessions.filter((s) => s.day === 2);
  const day1Label = sessions.find((s) => s.day === 1)?.dayLabel ?? "22 March 2027";
  const day2Label = sessions.find((s) => s.day === 2)?.dayLabel ?? "23 March 2027";

  const handleRemove = (id: number) => {
    setRemovingId(id);
    unsaveMutation.mutate(
      { id },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetSavedSessionsQueryKey() }),
        onSettled: () => setRemovingId(null),
      },
    );
  };

  return (
    <PortalLayout title="My Schedule">
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Sessions you have bookmarked from the Scientific Programme. Click the remove icon to unbookmark a session.
      </p>

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      )}

      {!isLoading && savedSessions.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 16px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-surface-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookmarkCheck style={{ width: 28, height: 28, color: "var(--text-disabled)" }} />
            </div>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No sessions saved yet</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 auto", maxWidth: 300 }}>
            Go to the Programme page and click the bookmark icon on sessions to build your personal schedule.
          </p>
        </div>
      )}

      {!isLoading && savedSessions.length > 0 && (
        <div className="space-y-10">
          {[
            { label: "DAY 1", dayLabel: day1Label, items: day1 },
            { label: "DAY 2", dayLabel: day2Label, items: day2 },
          ]
            .filter(({ items }) => items.length > 0)
            .map(({ label, dayLabel, items }) => (
              <div key={label}>
                <DayBand label={label} dayLabel={dayLabel} />
                <div className="space-y-2.5">
                  {items.map((s) => (
                    <ScheduleRow
                      key={s.id}
                      s={s}
                      onRemove={handleRemove}
                      removing={removingId === s.id}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </PortalLayout>
  );
}

import React from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  useGetSessions,
  useGetSavedSessions,
  useSaveSession,
  useUnsaveSession,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSavedSessionsQueryKey } from "@workspace/api-client-react";
import { Clock, MapPin, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

const SESSION_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  keynote:  { bg: "rgba(200,155,60,0.12)", color: "#8a6a24" },
  panel:    { bg: "var(--primary-lt)",     color: "var(--primary)" },
  workshop: { bg: "rgba(11,39,68,0.08)",  color: "#0B2744" },
  oral:     { bg: "var(--primary-lt)",     color: "var(--primary)" },
  poster:   { bg: "var(--red-lt)",         color: "var(--red)" },
  opening:  { bg: "var(--green-lt)",       color: "var(--green)" },
  closing:  { bg: "var(--green-lt)",       color: "var(--green)" },
};

export default function Programme() {
  const queryClient = useQueryClient();
  const { data: sessions, isLoading } = useGetSessions();
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

  return (
    <PortalLayout title="Scientific Programme">
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        22–23 March 2027 · Sunway Putra Hotel, Kuala Lumpur. Bookmark sessions to add them to your personal schedule.
      </p>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {[1, 2].map((day) => {
            const daySessions =
              sessions
                ?.filter((s) => s.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
            if (daySessions.length === 0) return null;
            return (
              <div key={day}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: "6px 16px", borderRadius: 6, fontWeight: 700, color: "#fff", fontSize: 15, background: "#0B2744" }}>
                    Day {day}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>
                    {day === 1 ? "Sunday, 22 March 2027" : "Monday, 23 March 2027"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {daySessions.map((session) => {
                    const tc = SESSION_TYPE_COLORS[session.sessionType] ?? { bg: "var(--bg-surface-secondary)", color: "var(--text-muted)" };
                    const saved = isSaved(session.id);
                    const pending = pendingId === session.id;
                    return (
                      <div
                        key={session.id}
                        className="card"
                        style={{ display: "flex", overflow: "hidden", borderLeft: "4px solid var(--primary)" }}
                      >
                        {/* Time + room */}
                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "16px", background: "var(--bg-surface-secondary)", borderRight: "1px solid var(--border-color)", minWidth: 130 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
                            <Clock style={{ width: 14, height: 14, color: "var(--text-muted)" }} />
                            {session.startTime}
                            {session.endTime ? ` – ${session.endTime}` : ""}
                          </div>
                          {session.room && (
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
                              <MapPin style={{ width: 12, height: 12 }} />
                              {session.room}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ marginBottom: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", padding: "2px 8px", borderRadius: 20, background: tc.bg, color: tc.color }}>
                                  {session.sessionType}
                                </span>
                              </div>
                              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.35 }}>
                                {session.title}
                              </h3>
                              {session.speakerName && (
                                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--primary)", margin: "0 0 4px" }}>
                                  {session.speakerName}
                                </p>
                              )}
                              {session.description && (
                                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                  {session.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => toggleSave(session.id)}
                              disabled={pending}
                              title={saved ? "Remove from schedule" : "Save to schedule"}
                              style={{
                                flexShrink: 0, width: 32, height: 32, borderRadius: 6,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: `1px solid ${saved ? "rgba(200,155,60,0.3)" : "var(--border-color)"}`,
                                background: saved ? "rgba(200,155,60,0.12)" : "var(--bg-surface-secondary)",
                                color: saved ? "#C89B3C" : "var(--text-disabled)",
                                cursor: "pointer", transition: "all 120ms",
                              }}
                            >
                              {pending ? (
                                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                              ) : saved ? (
                                <BookmarkCheck style={{ width: 16, height: 16 }} />
                              ) : (
                                <Bookmark style={{ width: 16, height: 16 }} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}

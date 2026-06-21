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
  keynote: { bg: "rgba(200,155,60,0.12)", color: "#8a6a24" },
  panel: { bg: "#e6f4f5", color: "#0E6E74" },
  workshop: { bg: "rgba(11,39,68,0.08)", color: "#0B2744" },
  oral: { bg: "#e6f4f5", color: "#0E6E74" },
  poster: { bg: "#f8d7da", color: "#842029" },
  opening: { bg: "#d1e7dd", color: "#0a5c39" },
  closing: { bg: "#d1e7dd", color: "#0a5c39" },
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
      <div className="mb-6">
        <p className="text-sm" style={{ color: "#6c757d" }}>
          22–23 March 2027 · Sunway Putra Hotel, Kuala Lumpur. Bookmark sessions to add them to your personal schedule.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#0E6E74" }} />
        </div>
      ) : (
        <div className="space-y-8">
          {[1, 2].map((day) => {
            const daySessions =
              sessions
                ?.filter((s) => s.day === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
            if (daySessions.length === 0) return null;
            return (
              <div key={day}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="px-4 py-2 rounded-lg font-sans font-bold text-white text-[15px]"
                    style={{ background: "#0B2744" }}
                  >
                    Day {day}
                  </div>
                  <span className="text-[14px] font-medium" style={{ color: "#6c757d" }}>
                    {day === 1 ? "Sunday, 22 March 2027" : "Monday, 23 March 2027"}
                  </span>
                </div>
                <div className="space-y-3">
                  {daySessions.map((session) => {
                    const tc = SESSION_TYPE_COLORS[session.sessionType] ?? { bg: "#f8f9fa", color: "#6c757d" };
                    const saved = isSaved(session.id);
                    const pending = pendingId === session.id;
                    return (
                      <div
                        key={session.id}
                        className="bg-white rounded-xl overflow-hidden flex"
                        style={{ border: "1px solid #e9ecef", borderLeft: "4px solid #0E6E74" }}
                      >
                        {/* Time + room */}
                        <div
                          className="flex-shrink-0 flex flex-col justify-center px-4 py-4"
                          style={{ background: "#f8f9fa", borderRight: "1px solid #e9ecef", minWidth: 130 }}
                        >
                          <div className="flex items-center gap-1.5 font-semibold text-[13px] mb-1" style={{ color: "#212529" }}>
                            <Clock className="w-3.5 h-3.5" style={{ color: "#6c757d" }} />
                            {session.startTime}
                            {session.endTime ? ` – ${session.endTime}` : ""}
                          </div>
                          {session.room && (
                            <div className="flex items-center gap-1 text-[12px]" style={{ color: "#6c757d" }}>
                              <MapPin className="w-3 h-3" />
                              {session.room}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span
                                  className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                  style={{ background: tc.bg, color: tc.color }}
                                >
                                  {session.sessionType}
                                </span>
                              </div>
                              <h3 className="text-[15px] font-sans font-bold mb-1 leading-snug" style={{ color: "#212529" }}>
                                {session.title}
                              </h3>
                              {session.speakerName && (
                                <p className="text-[13px] font-medium" style={{ color: "#0E6E74" }}>
                                  {session.speakerName}
                                </p>
                              )}
                              {session.description && (
                                <p className="text-[13px] mt-1 line-clamp-2" style={{ color: "#6c757d" }}>
                                  {session.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => toggleSave(session.id)}
                              disabled={pending}
                              title={saved ? "Remove from schedule" : "Save to schedule"}
                              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{
                                background: saved ? "rgba(200,155,60,0.12)" : "#f8f9fa",
                                color: saved ? "#C89B3C" : "#adb5bd",
                                border: "1px solid",
                                borderColor: saved ? "rgba(200,155,60,0.3)" : "#e9ecef",
                              }}
                            >
                              {pending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : saved ? (
                                <BookmarkCheck className="w-4 h-4" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
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

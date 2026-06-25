import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetAnnouncements } from "@workspace/api-client-react";
import { Loader2, Bell, AlertCircle, Info } from "lucide-react";

export default function Notifications() {
  const { data: announcements, isLoading } = useGetAnnouncements();

  const sorted = React.useMemo(
    () => [...(announcements ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [announcements],
  );

  return (
    <PortalLayout title="Notifications">
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Official announcements and updates from the SEAT-MSPTM 2027 organising committee.
      </p>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <Bell style={{ width: 40, height: 40, color: "var(--text-disabled)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No announcements yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
          {sorted.map((a) => (
            <div
              key={a.id}
              className="card"
              style={{
                display: "flex", alignItems: "flex-start", gap: 16, padding: 20,
                borderLeft: `4px solid ${a.important ? "var(--primary)" : "var(--border-color)"}`,
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, background: a.important ? "var(--primary-lt)" : "var(--bg-surface-secondary)" }}>
                {a.important ? (
                  <AlertCircle style={{ width: 18, height: 18, color: "var(--primary)" }} />
                ) : (
                  <Info style={{ width: 18, height: 18, color: "var(--text-disabled)" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                    {a.title}
                    {a.important && (
                      <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", padding: "1px 6px", borderRadius: 20, background: "var(--primary)", color: "#fff" }}>
                        Important
                      </span>
                    )}
                  </h3>
                  <div style={{ fontSize: 12, flexShrink: 0, color: "var(--text-disabled)" }}>
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)", margin: 0 }}>
                  {a.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

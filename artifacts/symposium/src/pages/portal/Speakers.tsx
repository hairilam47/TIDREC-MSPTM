import React from "react";
import PortalLayout from "@/components/PortalLayout";
import { useGetSpeakers } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

export default function Speakers() {
  const { data: speakers, isLoading } = useGetSpeakers();

  return (
    <PortalLayout title="Invited Speakers">
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Distinguished experts presenting at SEAT-MSPTM 2027.
      </p>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {speakers?.map((speaker) => (
            <div key={speaker.id} className="card" style={{ overflow: "hidden" }}>
              {/* Photo area */}
              <div
                style={{
                  height: 180, display: "flex", alignItems: "center", justifyContent: "center",
                  background: speaker.photoUrl ? undefined : "linear-gradient(135deg, var(--primary-lt), var(--bg-surface-secondary))",
                }}
              >
                {speaker.photoUrl ? (
                  <img src={speaker.photoUrl} alt={speaker.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary)", color: "#fff", fontSize: 28, fontWeight: 700 }}>
                    {speaker.initials || speaker.name.slice(0, 2)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="card-body">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                  {speaker.name}
                </h3>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                  {speaker.institution && <span>{speaker.institution} · </span>}
                  {speaker.country}
                </div>
                <div style={{ borderRadius: 6, padding: "8px 12px", background: "var(--primary-lt)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--primary)", marginBottom: 4 }}>
                    Topic
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>{speaker.topic}</div>
                </div>
                {speaker.bio && (
                  <p style={{ fontSize: 12, marginTop: 12, color: "var(--text-muted)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", margin: "12px 0 0" }}>
                    {speaker.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}

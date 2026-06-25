import React from "react";
import { useGetSpeakers, useGetSettings } from "@workspace/api-client-react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { SiteHeader } from "@/components/SiteHeader";
import { Loader2 } from "lucide-react";
import type { Speaker } from "@workspace/api-client-react";

const TIERS: { key: string; label: string }[] = [
  { key: "keynote", label: "Keynote Speakers" },
  { key: "plenary", label: "Plenary Speakers" },
  { key: "invited", label: "Invited Speakers" },
];

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: "28px 20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        border: "1px solid var(--border-color)",
        width: 220,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "3px solid var(--gold)",
          overflow: "hidden",
          marginBottom: 16,
          flexShrink: 0,
          background: "var(--bg-surface-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {speaker.photoUrl ? (
          <img
            src={resolveImageUrl(speaker.photoUrl) ?? ""}
            alt={speaker.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          />
        ) : (
          <span
            className="font-sans"
            style={{ fontSize: 36, fontWeight: 700, color: "var(--navy)" }}
          >
            {speaker.initials || speaker.name.substring(0, 2)}
          </span>
        )}
      </div>

      <div
        className="font-sans"
        style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)", marginBottom: 4, lineHeight: 1.3 }}
      >
        {speaker.name}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: speaker.topic ? 8 : 0 }}>
        {speaker.country}
      </div>
      {speaker.institution && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: speaker.topic ? 4 : 0 }}>
          {speaker.institution}
        </div>
      )}
      {speaker.topic && (
        <div style={{ fontSize: 12, color: "var(--teal)", marginTop: 4, lineHeight: 1.4 }}>
          {speaker.topic}
        </div>
      )}
    </div>
  );
}

export default function SpeakersPage() {
  const { data: speakers, isLoading } = useGetSpeakers();
  const { data: cms } = useGetSettings();

  const grouped = React.useMemo(() => {
    if (!speakers) return {};
    const map: Record<string, Speaker[]> = {};
    for (const s of speakers) {
      const tier = s.speakerTier ?? "other";
      if (!map[tier]) map[tier] = [];
      map[tier].push(s);
    }
    return map;
  }, [speakers]);

  const hasOther = (grouped["other"] ?? []).length > 0;

  return (
    <div className="font-sans" style={{ minHeight: "100vh", background: "var(--bg-surface)" }}>
      <SiteHeader />

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--teal) 100%)", padding: "56px 24px 48px", textAlign: "center" }}>
        <h1 className="font-sans" style={{ fontSize: 40, fontWeight: 700, color: "#fff", margin: 0, marginBottom: 12 }}>
          Our Speakers
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, margin: 0 }}>
          Distinguished experts presenting at {cms?.event_short_name ?? "SEAT-MSPTM 2027"} — {cms?.event_dates ?? "22–23 March 2027"}, {cms?.event_city ?? "Kuala Lumpur"}
        </p>
      </div>

      {/* Speaker tiers */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: 36, height: 36, color: "var(--teal)", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {TIERS.map(({ key, label }) => {
              const list = grouped[key] ?? [];
              if (list.length === 0) return null;
              return (
                <section key={key} style={{ marginBottom: 64, textAlign: "center" }}>
                  <h2
                    className="font-sans"
                    style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)", textAlign: "center", marginBottom: 36 }}
                  >
                    {label}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 24,
                    }}
                  >
                    {list.map((s) => (
                      <SpeakerCard key={s.id} speaker={s} />
                    ))}
                  </div>
                </section>
              );
            })}

            {hasOther && (
              <section style={{ marginBottom: 64, textAlign: "center" }}>
                <h2
                  className="font-sans"
                  style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)", textAlign: "center", marginBottom: 36 }}
                >
                  Speakers
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
                  {(grouped["other"] ?? []).map((s) => (
                    <SpeakerCard key={s.id} speaker={s} />
                  ))}
                </div>
              </section>
            )}

            {!speakers?.length && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)", fontSize: 15 }}>
                Speaker announcements coming soon.
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: "var(--navy)", color: "rgba(255,255,255,0.6)", padding: "40px 24px", textAlign: "center", fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          &copy; 2027 SEAT-MSPTM. All rights reserved. |{" "}
          <a href="mailto:events@msptm.network" style={{ color: "var(--gold)", textDecoration: "none" }}>
            events@msptm.network
          </a>
        </p>
      </footer>
    </div>
  );
}

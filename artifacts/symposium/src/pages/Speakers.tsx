import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CountdownBadge } from "@/components/ui/CountdownBadge";
import { useGetSpeakers, useGetSettings } from "@workspace/api-client-react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import type { Speaker } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

const TIERS: { key: string; label: string }[] = [
  { key: "keynote", label: "Keynote Speakers" },
  { key: "plenary", label: "Plenary Speakers" },
  { key: "invited", label: "Invited Speakers" },
];

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: "28px 20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        border: "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "3px solid #C89B3C",
          overflow: "hidden",
          marginBottom: 16,
          flexShrink: 0,
          background: "#f5f5f5",
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
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#0B2744",
            }}
          >
            {speaker.initials || speaker.name.substring(0, 2)}
          </span>
        )}
      </div>

      <div
        className="font-sans"
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#0B2744",
          marginBottom: 4,
          lineHeight: 1.3,
        }}
      >
        {speaker.name}
      </div>
      <div style={{ fontSize: 13, color: "#6c757d", marginBottom: speaker.topic ? 8 : 0 }}>
        {speaker.country}
      </div>
      {speaker.topic && (
        <div style={{ fontSize: 12, color: "#0E6E74", marginTop: 4, lineHeight: 1.4 }}>
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
    <div className="font-sans" style={{ minHeight: "100vh", background: "#fff" }}>
      {/* Nav */}
      <header style={{ background: "#0B2744", borderBottom: "1px solid rgba(255,255,255,0.1)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Home</Link>
            <a href="/#about" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>About</a>
            <a href="/#programme" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Programme</a>
            <Link href="/speakers" style={{ color: "#C89B3C", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Speakers</Link>
            <a href="/#sponsors" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Sponsors</a>
            {cms?.sponsor_prospectus_url && (
              <a href="/api/sponsor-prospectus" download style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Sponsor Prospectus</a>
            )}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <CountdownBadge variant="dark" />
            <Link href="/login" style={{ color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Login</Link>
            <Link
              href="/register"
              style={{ background: "#C89B3C", color: "#fff", padding: "8px 20px", borderRadius: 6, textDecoration: "none", fontSize: 14, fontWeight: 600 }}
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg, #0B2744 0%, #0E6E74 100%)", padding: "56px 24px 48px", textAlign: "center" }}>
        <h1 className="font-sans" style={{ fontSize: 40, fontWeight: 700, color: "#fff", margin: 0, marginBottom: 12 }}>
          Our Speakers
        </h1>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, margin: 0 }}>
          Distinguished experts presenting at SATBDS 2027 — 22–23 March, Kuala Lumpur
        </p>
      </div>

      {/* Speaker tiers */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: 36, height: 36, color: "#0E6E74", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {TIERS.map(({ key, label }) => {
              const list = grouped[key] ?? [];
              if (list.length === 0) return null;
              return (
                <section key={key} style={{ marginBottom: 64 }}>
                  <h2
                    className="font-sans"
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#0B2744",
                      textAlign: "center",
                      marginBottom: 36,
                    }}
                  >
                    {label}
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
              <section style={{ marginBottom: 64 }}>
                <h2
                  className="font-sans"
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0B2744",
                    textAlign: "center",
                    marginBottom: 36,
                  }}
                >
                  Speakers
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 24 }}>
                  {(grouped["other"] ?? []).map((s) => (
                    <SpeakerCard key={s.id} speaker={s} />
                  ))}
                </div>
              </section>
            )}

            {!speakers?.length && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#6c757d", fontSize: 15 }}>
                Speaker announcements coming soon.
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: "#0B2744", color: "rgba(255,255,255,0.6)", padding: "40px 24px", textAlign: "center", fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          &copy; 2027 SATBDS. All rights reserved. |{" "}
          <a href="mailto:events@msptm.network" style={{ color: "#C89B3C", textDecoration: "none" }}>
            events@msptm.network
          </a>
        </p>
      </footer>
    </div>
  );
}

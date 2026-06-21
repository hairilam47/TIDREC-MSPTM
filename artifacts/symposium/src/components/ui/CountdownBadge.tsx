import React from "react";

const EVENT_DATE = new Date("2027-03-22T00:00:00+08:00");

function useCountdown() {
  const calc = () => {
    const diff = EVENT_DATE.getTime() - Date.now();
    if (diff <= 0) return null;
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { d, h, m, s };
  };
  const [time, setTime] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

interface CountdownBadgeProps {
  variant?: "dark" | "light";
}

export function CountdownBadge({ variant = "light" }: CountdownBadgeProps) {
  const t = useCountdown();
  if (!t) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "dark") {
    return (
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(200,155,60,0.15)", border: "1px solid rgba(200,155,60,0.35)",
          borderRadius: 20, padding: "4px 12px",
        }}
        className="justify-start items-center gap-[0px]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C89B3C" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em", color: "#C89B3C", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {t.d}d {pad(t.h)}h {pad(t.m)}m {pad(t.s)}s
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "var(--primary-lt)", border: "1px solid rgba(200,155,60,0.3)",
      borderRadius: 20, padding: "3px 10px",
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {t.d}d {pad(t.h)}h {pad(t.m)}m {pad(t.s)}s
      </span>
    </div>
  );
}

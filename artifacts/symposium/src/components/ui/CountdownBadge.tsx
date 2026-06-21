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

  const segments = [
    { value: String(t.d).padStart(3, "0"), label: "DAYS" },
    { value: pad(t.h),                     label: "HRS"  },
    { value: pad(t.m),                     label: "MINS" },
    { value: pad(t.s),                     label: "SECS" },
  ];

  return (
    <div style={{
      display: "inline-flex",
      flexDirection: "column",
      border: "1px solid #0B2744",
      borderRadius: 6,
      overflow: "hidden",
      fontFamily: "Inter, sans-serif",
      minWidth: 220,
    }}>
      {/* Title row */}
      <div style={{
        background: "#0B2744",
        color: "#ffffff",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "4px 8px",
        whiteSpace: "nowrap",
      }}>
        Countdown to SEAT‑MSPTM 2027
      </div>
      {/* Segments row */}
      <div style={{
        display: "flex",
        background: "#ffffff",
      }}>
        {segments.map(({ value, label }, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <div style={{ width: 1, background: "#0B2744", alignSelf: "stretch", opacity: 0.25 }} />
            )}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "6px 8px 5px",
              gap: 1,
            }}>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "#0B2744",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
                className="text-[#c8993ce6]">
                {value}
              </span>
              <span style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "#0E6E74",
                textTransform: "uppercase",
              }}>
                {label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

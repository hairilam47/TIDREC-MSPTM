import React from "react";
import { useGetSettings } from "@workspace/api-client-react";

const FALLBACK_DATE = new Date("2027-03-22T00:00:00+08:00");

function parseEventDate(settings: Record<string, string> | undefined): Date {
  const raw = settings?.["date_conference_start"];
  if (raw) {
    const d = new Date(raw + "T00:00:00+08:00");
    if (!isNaN(d.getTime())) return d;
  }
  return FALLBACK_DATE;
}

function calcTime(eventDate: Date) {
  const diff = eventDate.getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { d, h, m, s };
}

function useCountdown(eventDate: Date) {
  const [time, setTime] = React.useState(() => calcTime(eventDate));
  React.useEffect(() => {
    setTime(calcTime(eventDate));
    const id = setInterval(() => setTime(calcTime(eventDate)), 1000);
    return () => clearInterval(id);
  }, [eventDate]);
  return time;
}

interface CountdownBadgeProps {
  variant?: "dark" | "light";
}

export function CountdownBadge({ variant = "light" }: CountdownBadgeProps) {
  const { data: settings } = useGetSettings();
  const eventDate = React.useMemo(() => parseEventDate(settings), [settings]);
  const t = useCountdown(eventDate);
  if (!t) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const segments = [
    { value: String(t.d).padStart(3, "0"), label: "DAYS" },
    { value: pad(t.h),                     label: "HRS"  },
    { value: pad(t.m),                     label: "MINS" },
    { value: pad(t.s),                     label: "SECS" },
  ];

  return (
    <div className="inline-flex flex-col min-w-[220px] rounded-md border border-[#0B2744] overflow-hidden font-sans border-t-[color:var(--color-gray-50)] border-r-[color:var(--color-gray-50)] border-b-[color:var(--color-gray-50)] border-l-[color:var(--color-gray-50)]">
      {/* Title row */}
      <div className="tracking-[0.12em] uppercase text-center px-2 py-1 whitespace-nowrap text-[#0b2744] bg-transparent text-[11px] font-extrabold">
        Countdown to SEAT‑MSPTM 2027
      </div>
      {/* Segments row */}
      <div className="flex bg-white">
        {segments.map(({ value, label }, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <div className="w-px self-stretch bg-[#0B2744] opacity-25" />
            )}
            <div className="flex-1 flex flex-col items-center px-2 pt-1.5 pb-1 gap-px">
              <span className="text-[26px] font-extrabold leading-none tabular-nums tracking-[-0.02em] text-[#c8993ce6]">
                {value}
              </span>
              <span className="tracking-[0.14em] uppercase text-[#0b2744] text-[9px] font-extrabold">
                {label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

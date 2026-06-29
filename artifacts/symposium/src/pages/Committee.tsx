import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useGetCommitteeMembers } from "@workspace/api-client-react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import {
  UserRound,
  CalendarDays,
  ClipboardList,
  Handshake,
  UserPlus,
  FlaskConical,
  Megaphone,
  Truck,
  type LucideIcon,
} from "lucide-react";

const SUBCOMMITTEE_ICONS: Record<string, LucideIcon> = {
  "Event Flow Committee": CalendarDays,
  "Programme Planning Committee": ClipboardList,
  "Sponsorship Committee": Handshake,
  "Registration Committee": UserPlus,
  "Scientific Committee": FlaskConical,
  "Publicity & IT Committee": Megaphone,
  "Logistics & Operations Committee": Truck,
};

function PersonAvatar({ photoUrl, name }: { photoUrl?: string | null; name: string }) {
  const src = resolveImageUrl(photoUrl);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
      />
    );
  }
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center border-2"
      style={{ background: "rgba(200,155,60,0.10)", borderColor: "rgba(200,155,60,0.35)" }}>
      <UserRound className="w-8 h-8" style={{ color: "var(--gold)" }} />
    </div>
  );
}

function PersonCard({ member }: {
  member: { id: number; name: string; title: string; photoUrl?: string | null }
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 p-5 bg-white rounded-xl border shadow-sm"
      style={{ borderColor: "#f0f0f0" }}>
      <div>
        <div className="font-semibold text-sm leading-snug" style={{ color: "var(--navy)" }}>{member.name}</div>
        <div className="text-xs mt-1" style={{ color: "var(--teal)" }}>{member.title}</div>
      </div>
    </div>
  );
}

function SubcommitteeCard({ name, leadName }: { name: string; leadName: string }) {
  const Icon = SUBCOMMITTEE_ICONS[name] ?? CalendarDays;
  return (
    <div className="flex flex-col items-center text-center gap-2 px-4 py-5" style={{ minWidth: 160, maxWidth: 200 }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--teal)" }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="font-semibold text-sm leading-snug mt-1" style={{ color: "var(--navy)" }}>{name}</div>
      <div className="text-xs" style={{ color: "#555" }}>
        <span style={{ color: "#888" }}>Lead: </span>{leadName}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px" style={{ background: "var(--gold)" }} />
      <span className="font-bold tracking-widest text-sm uppercase whitespace-nowrap px-2"
        style={{ color: "var(--navy)" }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--gold)" }} />
    </div>
  );
}

export default function CommitteePage() {
  const { data: members } = useGetCommitteeMembers();

  const international = (members ?? []).filter((m) => m.committeeLevel === "international_advisory");
  const local = (members ?? []).filter((m) => m.committeeLevel === "local_organising");
  const subcommittees = (members ?? []).filter((m) => m.committeeLevel === "subcommittee");

  const subcommitteeMap: Record<string, string> = {};
  for (const m of subcommittees) {
    if (m.subcommitteeName) subcommitteeMap[m.subcommitteeName] = m.name;
  }
  const subcommitteeNames = Object.keys(subcommitteeMap);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <section className="py-14 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide uppercase text-white">
            ORGANISING{" "}
            <span style={{ color: "var(--gold)" }}>COMMITTEE</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
            <div className="w-8 h-px" style={{ background: "var(--gold)" }} />
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 pb-16 w-full">

        {international.length > 0 && (
          <section className="mb-8">
            <SectionHeading>International Advisory Committee</SectionHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {international.map((m) => <PersonCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {local.length > 0 && (
          <section className="mb-8">
            <SectionHeading>Local Organising Committee</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {local.map((m) => <PersonCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {subcommitteeNames.length > 0 && (
          <section className="mb-8">
            <SectionHeading>Subcommittees and Responsibilities</SectionHeading>
            <div className="flex flex-wrap justify-center">
              {subcommitteeNames.map((name) => (
                <SubcommitteeCard key={name} name={name} leadName={subcommitteeMap[name]} />
              ))}
            </div>
          </section>
        )}

        {(members ?? []).length === 0 && (
          <div className="text-center py-20 text-sm" style={{ color: "#888" }}>
            Committee members will be announced soon.
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs border-t" style={{ color: "#aaa" }}>
        © 2027 SEAT-MSPTM. All rights reserved.
      </footer>
    </div>
  );
}

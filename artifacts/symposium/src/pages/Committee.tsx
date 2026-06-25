import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useGetCommitteeMembers } from "@workspace/api-client-react";

function Avatar({ initials, photoUrl }: { initials: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return (
      <img
        src={`/api/images/proxy?url=${encodeURIComponent(photoUrl)}`}
        alt={initials}
        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
      />
    );
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold shadow-sm"
      style={{ background: "linear-gradient(135deg, var(--navy), var(--teal))", color: "white" }}
    >
      {initials}
    </div>
  );
}

function MemberCard({ member }: { member: { id: number; name: string; title: string; initials: string; photoUrl?: string | null } }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 p-4">
      <Avatar initials={member.initials} photoUrl={member.photoUrl} />
      <div>
        <div className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{member.name}</div>
        <div className="text-xs mt-0.5" style={{ color: "var(--teal)" }}>{member.title}</div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-base font-bold tracking-widest uppercase" style={{ color: "var(--teal)" }}>
        {children}
      </h2>
      <div className="mt-2 mx-auto w-12 h-0.5 rounded" style={{ background: "var(--gold)" }} />
    </div>
  );
}

export default function CommitteePage() {
  const { data: members } = useGetCommitteeMembers();

  const international = (members ?? []).filter((m) => m.committeeLevel === "international_advisory");
  const local = (members ?? []).filter((m) => m.committeeLevel === "local_organising");
  const subcommittees = (members ?? []).filter((m) => m.committeeLevel === "subcommittee");

  const subcommitteeGroups: Record<string, typeof subcommittees> = {};
  for (const m of subcommittees) {
    const key = m.subcommitteeName || "General";
    if (!subcommitteeGroups[key]) subcommitteeGroups[key] = [];
    subcommitteeGroups[key].push(m);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      <section className="py-14 px-4" style={{ background: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
            3rd SEAT-MSPTM 2027
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Organising Committee</h1>
          <p className="mt-4 text-sm md:text-base max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            The dedicated individuals guiding the scientific and logistical excellence of the symposium.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 w-full">

        {international.length > 0 && (
          <section className="mb-16">
            <SectionHeading>International Advisory Committee</SectionHeading>
            <div className="flex flex-wrap justify-center">
              {international.map((m) => <MemberCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {local.length > 0 && (
          <section className="mb-16">
            <SectionHeading>Local Organising Committee</SectionHeading>
            <div className="flex flex-wrap justify-center">
              {local.map((m) => <MemberCard key={m.id} member={m} />)}
            </div>
          </section>
        )}

        {Object.keys(subcommitteeGroups).length > 0 && (
          <section className="mb-16">
            <SectionHeading>Subcommittees & Responsibilities</SectionHeading>
            {Object.entries(subcommitteeGroups).map(([name, group]) => (
              <div key={name} className="mb-10">
                <h3 className="text-center text-sm font-semibold mb-6 uppercase tracking-wide" style={{ color: "var(--navy)" }}>
                  {name}
                </h3>
                <div className="flex flex-wrap justify-center">
                  {group.map((m) => <MemberCard key={m.id} member={m} />)}
                </div>
              </div>
            ))}
          </section>
        )}

        {(members ?? []).length === 0 && (
          <div className="text-center py-20 text-sm" style={{ color: "var(--text-muted)" }}>
            Committee members will be announced soon.
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs border-t" style={{ color: "var(--text-muted)" }}>
        © 2027 SEAT-MSPTM. All rights reserved.
      </footer>
    </div>
  );
}

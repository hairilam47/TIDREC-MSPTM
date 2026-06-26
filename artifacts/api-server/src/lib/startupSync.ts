import { db, speakersTable, committeeMembersTable, usersTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SPEAKERS = [
  {
    id: 1,
    name: "Prof. Sazaly Abu Bakar",
    institution: "Universiti Malaya",
    country: "Malaysia",
    topic: "Emerging Tick-borne Diseases in Southeast Asia",
    bio: "Professor Sazaly is a leading virologist specializing in emerging infectious diseases and zoonotic pathogens in Southeast Asia.",
    initials: "PS",
    speakerTier: "invited",
  },
  {
    id: 2,
    name: "Dr. Tay Shin Tyen",
    institution: "TIDREC@UM",
    country: "Malaysia",
    topic: "Molecular Epidemiology of Rickettsia in Malaysia",
    bio: "Dr. Tay is a molecular biologist whose research focuses on the genomics of tick-borne rickettsial pathogens.",
    initials: "DT",
    speakerTier: "plenary",
  },
  {
    id: 3,
    name: "Dr Sarah Bonnet",
    institution: "Insitut Pasteur",
    country: "France",
    topic: "Simian Malaria and Tick-borne Transmission Dynamics",
    bio: "Assoc. Prof. Cox-Singh's research spans simian malaria, zoonotic diseases, and vector ecology.",
    initials: "DS",
    speakerTier: "keynote",
  },
  {
    id: 4,
    name: "Dato Dr Mahiran Mustafa",
    institution: "Formet Head of Infectious Disease Ministry of Health Malaysia",
    country: "Malaysia",
    topic: "Climate Change and Vector-borne Disease Emergence",
    bio: "Dato Dr Mahiran Mustafa investigates the impact of climate change on arthropod vector distributions and disease burden.",
    initials: "DD",
    speakerTier: "keynote",
  },
  {
    id: 5,
    name: "Prof. Kwang-Shik Choi",
    institution: "Kyungpook National University",
    country: "South Korea",
    topic: "SFTS Virus: Epidemiology and Clinical Management",
    bio: "Prof. Choi is a leading expert on Severe Fever with Thrombocytopenia Syndrome (SFTS), a deadly tick-borne viral disease.",
    initials: "PK",
    speakerTier: "plenary",
  },
];

const COMMITTEE_MEMBERS = [
  { name: "Dr Benoit Malleret", title: "International Advisory Committee", initials: "BM", committeeLevel: "international_advisory", sortOrder: 1 },
  { name: "Dr Sebastien Boyer", title: "International Advisory Committee", initials: "SB", committeeLevel: "international_advisory", sortOrder: 2 },
  { name: "Dr Kittipong Chaisiri", title: "International Advisory Committee", initials: "KC", committeeLevel: "international_advisory", sortOrder: 3 },
  { name: "Prof Benjamin Makepeace", title: "International Advisory Committee", initials: "BM", committeeLevel: "international_advisory", sortOrder: 4 },
  { name: "Prof Serge Morand", title: "International Advisory Committee", initials: "SM", committeeLevel: "international_advisory", sortOrder: 5 },
  { name: "Prof Ryo Nakao", title: "International Advisory Committee", initials: "RN", committeeLevel: "international_advisory", sortOrder: 6 },
  { name: "Asst. Prof. Tomonori Hoshi", title: "International Advisory Committee", initials: "TH", committeeLevel: "international_advisory", sortOrder: 7 },
  { name: "Dr Janin Nouhin", title: "International Advisory Committee", initials: "JN", committeeLevel: "international_advisory", sortOrder: 8 },
  { name: "Dr Norhidayu Sahimin", title: "Chairperson", initials: "NS", committeeLevel: "local_organising", sortOrder: 1 },
  { name: "Dr Stanley Tan Tiong Kai", title: "Co-Chairperson", initials: "ST", committeeLevel: "local_organising", sortOrder: 2 },
  { name: "Assoc. Prof. Dr. Lucas Low Van Lun", title: "Advisor", initials: "LL", committeeLevel: "local_organising", sortOrder: 3 },
  { name: "Assoc. Prof. Dr. Heo Chong Chin", title: "Advisor", initials: "HC", committeeLevel: "local_organising", sortOrder: 4 },
  { name: "Ms. Adela Ida Jiram", title: "Advisor", initials: "AJ", committeeLevel: "local_organising", sortOrder: 5 },
  { name: "Ms. Nurul Aini Binti Husin", title: "Secretary", initials: "NH", committeeLevel: "local_organising", sortOrder: 6 },
  { name: "Dr Lee Ii Li", title: "Assistant Secretary", initials: "LI", committeeLevel: "local_organising", sortOrder: 7 },
  { name: "Ms. Nurhainis Ogu Salim", title: "Treasurer", initials: "NO", committeeLevel: "local_organising", sortOrder: 8 },
  { name: "Dr. Mehru Nisha A/P Muhammad Haneef", title: "Assistant Treasurer", initials: "MN", committeeLevel: "local_organising", sortOrder: 9 },
  { name: "Assoc. Prof. Dr. Lucas Low Van Lun", title: "Lead", initials: "LL", committeeLevel: "subcommittee", subcommitteeName: "Event Flow Committee", sortOrder: 1 },
  { name: "Dr. Aida Syaffiius Binti Mokhtar", title: "Lead", initials: "AM", committeeLevel: "subcommittee", subcommitteeName: "Programme Planning Committee", sortOrder: 2 },
  { name: "Dr. Chen Chee Dhang", title: "Lead", initials: "CD", committeeLevel: "subcommittee", subcommitteeName: "Sponsorship Committee", sortOrder: 3 },
  { name: "Dr. Lee Ii Li", title: "Lead", initials: "LI", committeeLevel: "subcommittee", subcommitteeName: "Registration Committee", sortOrder: 4 },
  { name: "Assoc. Prof. Dr. Heo Chong Chin", title: "Lead", initials: "HC", committeeLevel: "subcommittee", subcommitteeName: "Scientific Committee", sortOrder: 5 },
  { name: "Ms. Adela Ida Jiram", title: "Lead", initials: "AJ", committeeLevel: "subcommittee", subcommitteeName: "Publicity & IT Committee", sortOrder: 6 },
  { name: "Dr. Farah Haziqah Meer Termizi", title: "Lead", initials: "FM", committeeLevel: "subcommittee", subcommitteeName: "Logistics & Operations Committee", sortOrder: 7 },
];

async function syncSpeakers() {
  try {
    for (const s of SPEAKERS) {
      const { id, ...fields } = s;
      await db
        .insert(speakersTable)
        .values({ id, ...fields })
        .onConflictDoUpdate({
          target: speakersTable.id,
          set: {
            name: fields.name,
            institution: fields.institution,
            country: fields.country,
            topic: fields.topic,
            bio: fields.bio,
            initials: fields.initials,
            speakerTier: fields.speakerTier,
          },
        });
    }
    console.log("[startup-sync] Speakers synced.");
  } catch (err) {
    console.error("[startup-sync] Speaker sync failed:", err);
  }
}

async function seedCommitteeMembers() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(committeeMembersTable);
    if (count === 0) {
      console.log("[startup-sync] Seeding committee members…");
      await db.insert(committeeMembersTable).values(COMMITTEE_MEMBERS);
      console.log("[startup-sync] Committee members seeded.");
    }
  } catch (err) {
    console.error("[startup-sync] Committee member seed failed:", err);
  }
}

async function seedAdminUsers() {
  try {
    const adminHash = await bcrypt.hash("admin123", 10);
    const superAdminHash = await bcrypt.hash("superadmin123", 10);

    const ADMIN_USERS = [
      { email: "admin@seat-msptm2027.org", passwordHash: adminHash, firstName: "Admin", lastName: "User", institution: "SEAT-MSPTM 2027", country: "Malaysia", role: "admin" as const },
      { email: "superadmin@seat-msptm2027.org", passwordHash: superAdminHash, firstName: "Dr. Wan Faiziah", lastName: "Wan Ismail", institution: "TIDREC@UM", country: "Malaysia", role: "super_admin" as const },
      { email: "admin2@seat-msptm2027.org", passwordHash: adminHash, firstName: "Prof. Sazali", lastName: "Hassan", institution: "Universiti Malaya", country: "Malaysia", role: "admin" as const },
      { email: "admin3@seat-msptm2027.org", passwordHash: adminHash, firstName: "Dr. Nurul Ain", lastName: "Mohd Noor", institution: "Universiti Kebangsaan Malaysia", country: "Malaysia", role: "admin" as const },
      { email: "admin4@seat-msptm2027.org", passwordHash: adminHash, firstName: "Dr. Tengku Shahrul", lastName: "Tengku Ahmad", institution: "Universiti Putra Malaysia", country: "Malaysia", role: "admin" as const },
      { email: "admin5@seat-msptm2027.org", passwordHash: adminHash, firstName: "Assoc. Prof. Hamidah", lastName: "Rusli", institution: "Hospital Kuala Lumpur", country: "Malaysia", role: "admin" as const },
    ];

    await db.insert(usersTable).values(ADMIN_USERS).onConflictDoNothing();
    console.log("[startup-sync] Admin users ensured.");
  } catch (err) {
    console.error("[startup-sync] Admin user seed failed:", err);
  }
}

export async function runStartupSync() {
  await Promise.all([
    syncSpeakers(),
    seedCommitteeMembers(),
    seedAdminUsers(),
  ]);
}

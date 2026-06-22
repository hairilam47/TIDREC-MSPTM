import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import {
  usersTable,
  speakersTable,
  sessionsTable,
  sponsorsTable,
  announcementsTable,
  registrationCategoriesTable,
} from "./schema";

const { Pool } = pg;

async function seed() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("demo123", 10);

  await db.insert(usersTable).values([
    {
      email: "admin@seat-msptm2027.org",
      passwordHash: adminHash,
      firstName: "Admin",
      lastName: "User",
      institution: "SEAT-MSPTM 2027",
      country: "Malaysia",
      role: "admin",
    },
    {
      email: "delegate@example.com",
      passwordHash: demoHash,
      firstName: "Ahmad",
      lastName: "Razali",
      institution: "University of Malaya",
      country: "Malaysia",
      category: "researcher",
      role: "attendee",
    },
  ]).onConflictDoNothing();

  const speakers = await db.insert(speakersTable).values([
    {
      name: "Prof. Sazaly Abu Bakar",
      country: "Malaysia",
      institution: "Universiti Malaya",
      topic: "Emerging Tick-borne Diseases in Southeast Asia",
      bio: "Professor Sazaly is a leading virologist specializing in emerging infectious diseases and zoonotic pathogens in Southeast Asia.",
      initials: "SA",
    },
    {
      name: "Dr. Tay Shin Tyen",
      country: "Malaysia",
      institution: "TIDREC@UM",
      topic: "Molecular Epidemiology of Rickettsia in Malaysia",
      bio: "Dr. Tay is a molecular biologist whose research focuses on the genomics of tick-borne rickettsial pathogens.",
      initials: "TS",
    },
    {
      name: "Assoc. Prof. Janet Cox-Singh",
      country: "United Kingdom",
      institution: "University of St Andrews",
      topic: "Simian Malaria and Tick-borne Transmission Dynamics",
      bio: "Assoc. Prof. Cox-Singh's research spans simian malaria, zoonotic diseases, and vector ecology.",
      initials: "JC",
    },
    {
      name: "Dr. Muriel Morissette",
      country: "France",
      institution: "Institut Pasteur",
      topic: "Climate Change and Vector-borne Disease Emergence",
      bio: "Dr. Morissette investigates the impact of climate change on arthropod vector distributions and disease burden.",
      initials: "MM",
    },
    {
      name: "Prof. Kwang-Shik Choi",
      country: "South Korea",
      institution: "Kyungpook National University",
      topic: "SFTS Virus: Epidemiology and Clinical Management",
      bio: "Prof. Choi is a leading expert on Severe Fever with Thrombocytopenia Syndrome (SFTS), a deadly tick-borne viral disease.",
      initials: "KC",
    },
  ]).returning();

  await db.insert(sessionsTable).values([
    {
      title: "Opening Ceremony & Welcome Remarks",
      day: 1,
      startTime: "08:30",
      endTime: "09:15",
      room: "Grand Ballroom A",
      sessionType: "opening",
      description: "Official opening of the 3rd SEAT-MSPTM Symposium. Welcome addresses from MSPTM President and TIDREC@UM Director.",
    },
    {
      title: "Keynote: Emerging Tick-borne Diseases in Southeast Asia",
      day: 1,
      startTime: "09:15",
      endTime: "10:00",
      room: "Grand Ballroom A",
      sessionType: "keynote",
      description: "An overview of the current landscape of tick-borne diseases across Southeast Asia, with a focus on surveillance gaps and emerging threats.",
      speakerId: speakers[0].id,
    },
    {
      title: "Molecular Epidemiology & Genomics",
      day: 1,
      startTime: "10:30",
      endTime: "12:00",
      room: "Grand Ballroom A",
      sessionType: "panel",
      description: "Panel discussion on genomic approaches to understanding pathogen diversity and spread.",
      speakerId: speakers[1].id,
    },
    {
      title: "Workshop: Tick Identification & Field Collection",
      day: 1,
      startTime: "13:00",
      endTime: "15:00",
      room: "Workshop Room B",
      sessionType: "workshop",
      description: "Hands-on workshop covering morphological identification of medically important tick species and best practices for specimen collection.",
    },
    {
      title: "Keynote: Climate Change and Vector-borne Disease Emergence",
      day: 1,
      startTime: "15:30",
      endTime: "16:15",
      room: "Grand Ballroom A",
      sessionType: "keynote",
      description: "Examining how shifting climate patterns are expanding the geographic range of tick vectors and altering disease transmission dynamics.",
      speakerId: speakers[3].id,
    },
    {
      title: "Oral Presentations: Surveillance & Epidemiology",
      day: 1,
      startTime: "16:15",
      endTime: "17:45",
      room: "Grand Ballroom A",
      sessionType: "oral",
      description: "Selected oral presentations on tick and tick-borne disease surveillance from across the region.",
    },
    {
      title: "Keynote: SFTS Virus — Epidemiology and Clinical Management",
      day: 2,
      startTime: "09:00",
      endTime: "09:45",
      room: "Grand Ballroom A",
      sessionType: "keynote",
      description: "A comprehensive review of SFTS virus burden, clinical spectrum, and advances in supportive care.",
      speakerId: speakers[4].id,
    },
    {
      title: "Zoonotic Diseases & One Health",
      day: 2,
      startTime: "10:15",
      endTime: "11:45",
      room: "Grand Ballroom A",
      sessionType: "panel",
      description: "One Health perspectives on the interplay between wildlife, livestock, human populations, and tick-borne pathogens.",
      speakerId: speakers[2].id,
    },
    {
      title: "Workshop: PCR Diagnostics for Tick-borne Pathogens",
      day: 2,
      startTime: "13:00",
      endTime: "15:00",
      room: "Workshop Room B",
      sessionType: "workshop",
      description: "Practical session on molecular diagnostic approaches including conventional and real-time PCR for key tick-borne pathogens.",
    },
    {
      title: "Poster Session & Networking",
      day: 2,
      startTime: "15:00",
      endTime: "16:30",
      room: "Exhibition Hall",
      sessionType: "poster",
      description: "Poster presentations by early-career researchers and networking session with refreshments.",
    },
    {
      title: "Closing Ceremony & Awards",
      day: 2,
      startTime: "16:30",
      endTime: "17:15",
      room: "Grand Ballroom A",
      sessionType: "closing",
      description: "Best oral and poster presentation awards, closing remarks, and announcement of the 4th SEAT-MSPTM host country.",
    },
  ]);

  await db.insert(sponsorsTable).values([
    {
      name: "BioMérieux Malaysia",
      tier: "platinum",
      website: "https://www.biomerieux.com",
    },
    {
      name: "Thermo Fisher Scientific",
      tier: "gold",
      website: "https://www.thermofisher.com",
    },
    {
      name: "Shimadzu Malaysia",
      tier: "gold",
      website: "https://www.shimadzu.com",
    },
    {
      name: "Qiagen",
      tier: "silver",
      website: "https://www.qiagen.com",
    },
    {
      name: "Sunway Putra Hotel",
      tier: "silver",
      website: "https://www.sunwayhotels.com",
    },
    {
      name: "Jabatan Perkhidmatan Veterinar",
      tier: "bronze",
      website: "https://www.dvs.gov.my",
    },
    {
      name: "Malaysian Bioeconomy Development Corporation",
      tier: "bronze",
    },
  ]).onConflictDoNothing();

  await db.insert(announcementsTable).values([
    {
      title: "Early Bird Registration Now Open",
      body: "Early bird registration for SEAT-MSPTM 2027 is now open until 31 December 2026. Take advantage of discounted rates for healthcare professionals, researchers, and students.",
      important: true,
    },
    {
      title: "Abstract Submission Deadline: 31 January 2027",
      body: "Abstracts for oral and poster presentations are due by 31 January 2027. Submissions must be between 250–400 words and follow the standard SEAT-MSPTM format. Notifications will be sent by 28 February 2027.",
      important: true,
    },
    {
      title: "Workshop Registration Now Available",
      body: "Limited seats are available for the two hands-on workshops: Tick Identification & Field Collection and PCR Diagnostics. Workshop registration is separate from the main symposium fee.",
      important: false,
    },
  ]).onConflictDoNothing();

  await db.insert(registrationCategoriesTable).values([
    {
      slug: "msptm_member",
      label: "MSPTM Member / ASIAN Alliance",
      priceMyr: "800",
      description: "For members of MSPTM or ASIAN Alliance",
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: "non_msptm_member",
      label: "Non MSPTM Member",
      priceMyr: "1000",
      description: "For non-members of MSPTM",
      sortOrder: 2,
      isActive: true,
    },
    {
      slug: "student_senior",
      label: "Student / Senior Researcher",
      priceMyr: "400",
      description: "For students and senior researchers",
      sortOrder: 3,
      isActive: true,
    },
    {
      slug: "international",
      label: "International",
      priceMyr: "1200",
      description: "For international participants",
      sortOrder: 4,
      isActive: true,
    },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

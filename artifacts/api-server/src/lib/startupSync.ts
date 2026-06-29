import {
  db,
  speakersTable,
  sessionsTable,
  sponsorsTable,
  announcementsTable,
  registrationCategoriesTable,
  committeeMembersTable,
  usersTable,
  settingsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
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
    institution: "TIDREC",
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

const SESSIONS = [
  { id: 1,  title: "Opening Ceremony & Welcome Remarks",                        day: 1, startTime: "08:30", endTime: "09:15", room: "Grand Ballroom A",  sessionType: "opening",  speakerId: null },
  { id: 2,  title: "Keynote: Emerging Tick-borne Diseases in Southeast Asia",   day: 1, startTime: "09:15", endTime: "10:00", room: "Grand Ballroom A",  sessionType: "keynote",  speakerId: 1 },
  { id: 3,  title: "Molecular Epidemiology & Genomics",                         day: 1, startTime: "10:30", endTime: "12:00", room: "Grand Ballroom A",  sessionType: "panel",    speakerId: 2 },
  { id: 4,  title: "Workshop: Tick Identification & Field Collection",          day: 1, startTime: "13:00", endTime: "15:00", room: "Workshop Room B",   sessionType: "workshop", speakerId: null },
  { id: 5,  title: "Keynote: Climate Change and Vector-borne Disease Emergence",day: 1, startTime: "15:30", endTime: "16:15", room: "Grand Ballroom A",  sessionType: "keynote",  speakerId: 4 },
  { id: 6,  title: "Oral Presentations: Surveillance & Epidemiology",           day: 1, startTime: "16:15", endTime: "17:45", room: "Grand Ballroom A",  sessionType: "oral",     speakerId: null },
  { id: 7,  title: "Keynote: SFTS Virus \u2014 Epidemiology and Clinical Management", day: 2, startTime: "09:00", endTime: "09:45", room: "Grand Ballroom A",  sessionType: "keynote",  speakerId: 5 },
  { id: 8,  title: "Zoonotic Diseases & One Health",                            day: 2, startTime: "10:15", endTime: "11:45", room: "Grand Ballroom A",  sessionType: "panel",    speakerId: 3 },
  { id: 9,  title: "Workshop: PCR Diagnostics for Tick-borne Pathogens",       day: 2, startTime: "13:00", endTime: "15:00", room: "Workshop Room B",   sessionType: "workshop", speakerId: null },
  { id: 10, title: "Poster Session & Networking",                               day: 2, startTime: "15:00", endTime: "16:30", room: "Exhibition Hall",   sessionType: "poster",   speakerId: null },
  { id: 11, title: "Closing Ceremony & Awards",                                 day: 2, startTime: "16:30", endTime: "17:15", room: "Grand Ballroom A",  sessionType: "closing",  speakerId: null },
];

const SPONSORS = [
  { id: 1, name: "BioMérieux Malaysia",                      tier: "platinum", website: "https://www.biomerieux.com" },
  { id: 2, name: "Thermo Fisher Scientific",                 tier: "gold",     website: "https://www.thermofisher.com" },
  { id: 3, name: "Shimadzu Malaysia",                        tier: "gold",     website: "https://www.shimadzu.com" },
  { id: 4, name: "Qiagen",                                   tier: "silver",   website: "https://www.qiagen.com" },
  { id: 5, name: "Sunway Putra Hotel",                       tier: "silver",   website: "https://www.sunwayhotels.com" },
  { id: 6, name: "Jabatan Perkhidmatan Veterinar",           tier: "bronze",   website: "https://www.dvs.gov.my" },
  { id: 7, name: "Malaysian Bioeconomy Development Corporation", tier: "bronze", website: null },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Early Bird Registration Now Open",
    body: "Early bird registration for SEAT-MSPTM 2027 is now open until 31 December 2026. Take advantage of discounted rates for healthcare professionals, researchers, and students.",
    important: true,
  },
  {
    id: 2,
    title: "Abstract Submission Deadline: 31 January 2027",
    body: "Abstracts for oral and poster presentations are due by 31 January 2027. Submissions must be between 250\u2013400 words and follow the standard SEAT-MSPTM format. Notifications will be sent by 28 February 2027.",
    important: true,
  },
  {
    id: 3,
    title: "Workshop Registration Now Available",
    body: "Limited seats are available for the two hands-on workshops: Tick Identification & Field Collection and PCR Diagnostics. Workshop registration is separate from the main symposium fee.",
    important: false,
  },
];

const REGISTRATION_CATEGORIES = [
  { slug: "msptm_member",     label: "MSPTM Member / ASIAN Alliance", priceMyr: "800",  description: "For members of MSPTM or ASIAN Alliance", sortOrder: 1, isActive: true },
  { slug: "non_msptm_member", label: "Non MSPTM Member",              priceMyr: "1000", description: "For non-members of MSPTM",                sortOrder: 2, isActive: true },
  { slug: "student_senior",   label: "Student / Senior Researcher",   priceMyr: "400",  description: "For students and senior researchers",     sortOrder: 3, isActive: true },
  { slug: "international",    label: "International",                  priceMyr: "1200", description: "For international participants",          sortOrder: 4, isActive: true },
];

const COMMITTEE_MEMBERS = [
  { name: "Dr Benoit Malleret",                  title: "International Advisory Committee", initials: "BM", committeeLevel: "international_advisory", sortOrder: 1 },
  { name: "Dr Sebastien Boyer",                  title: "International Advisory Committee", initials: "SB", committeeLevel: "international_advisory", sortOrder: 2 },
  { name: "Dr Kittipong Chaisiri",               title: "International Advisory Committee", initials: "KC", committeeLevel: "international_advisory", sortOrder: 3 },
  { name: "Prof Benjamin Makepeace",             title: "International Advisory Committee", initials: "BM", committeeLevel: "international_advisory", sortOrder: 4 },
  { name: "Prof Serge Morand",                   title: "International Advisory Committee", initials: "SM", committeeLevel: "international_advisory", sortOrder: 5 },
  { name: "Prof Ryo Nakao",                      title: "International Advisory Committee", initials: "RN", committeeLevel: "international_advisory", sortOrder: 6 },
  { name: "Asst. Prof. Tomonori Hoshi",          title: "International Advisory Committee", initials: "TH", committeeLevel: "international_advisory", sortOrder: 7 },
  { name: "Dr Janin Nouhin",                     title: "International Advisory Committee", initials: "JN", committeeLevel: "international_advisory", sortOrder: 8 },
  { name: "Dr Norhidayu Sahimin",                title: "Chairperson",         initials: "NS", committeeLevel: "local_organising", sortOrder: 1 },
  { name: "Dr Stanley Tan Tiong Kai",            title: "Co-Chairperson",      initials: "ST", committeeLevel: "local_organising", sortOrder: 2 },
  { name: "Assoc. Prof. Dr. Lucas Low Van Lun",  title: "Advisor",             initials: "LL", committeeLevel: "local_organising", sortOrder: 3 },
  { name: "Assoc. Prof. Dr. Heo Chong Chin",     title: "Advisor",             initials: "HC", committeeLevel: "local_organising", sortOrder: 4 },
  { name: "Ms. Adela Ida Jiram",                 title: "Advisor",             initials: "AJ", committeeLevel: "local_organising", sortOrder: 5 },
  { name: "Ms. Nurul Aini Binti Husin",          title: "Secretary",           initials: "NH", committeeLevel: "local_organising", sortOrder: 6 },
  { name: "Dr Lee Ii Li",                        title: "Assistant Secretary", initials: "LI", committeeLevel: "local_organising", sortOrder: 7 },
  { name: "Ms. Nurhainis Ogu Salim",             title: "Treasurer",           initials: "NO", committeeLevel: "local_organising", sortOrder: 8 },
  { name: "Dr. Mehru Nisha A/P Muhammad Haneef", title: "Assistant Treasurer", initials: "MN", committeeLevel: "local_organising", sortOrder: 9 },
  { name: "Assoc. Prof. Dr. Lucas Low Van Lun",  title: "Lead", initials: "LL", committeeLevel: "subcommittee", subcommitteeName: "Event Flow Committee",           sortOrder: 1 },
  { name: "Dr. Aida Syaffiius Binti Mokhtar",    title: "Lead", initials: "AM", committeeLevel: "subcommittee", subcommitteeName: "Programme Planning Committee",   sortOrder: 2 },
  { name: "Dr. Chen Chee Dhang",                 title: "Lead", initials: "CD", committeeLevel: "subcommittee", subcommitteeName: "Sponsorship Committee",          sortOrder: 3 },
  { name: "Dr. Lee Ii Li",                       title: "Lead", initials: "LI", committeeLevel: "subcommittee", subcommitteeName: "Registration Committee",         sortOrder: 4 },
  { name: "Assoc. Prof. Dr. Heo Chong Chin",     title: "Lead", initials: "HC", committeeLevel: "subcommittee", subcommitteeName: "Scientific Committee",           sortOrder: 5 },
  { name: "Ms. Adela Ida Jiram",                 title: "Lead", initials: "AJ", committeeLevel: "subcommittee", subcommitteeName: "Publicity & IT Committee",       sortOrder: 6 },
  { name: "Dr. Farah Haziqah Meer Termizi",      title: "Lead", initials: "FM", committeeLevel: "subcommittee", subcommitteeName: "Logistics & Operations Committee", sortOrder: 7 },
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

async function seedSessions() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessionsTable);
    if (count === 0) {
      console.log("[startup-sync] Seeding sessions…");
      for (const s of SESSIONS) {
        const { id, ...fields } = s;
        await db.insert(sessionsTable).values({ id, ...fields }).onConflictDoNothing();
      }
      console.log("[startup-sync] Sessions seeded.");
    }
  } catch (err) {
    console.error("[startup-sync] Sessions seed failed:", err);
  }
}

async function seedSponsors() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sponsorsTable);
    if (count === 0) {
      console.log("[startup-sync] Seeding sponsors…");
      for (const s of SPONSORS) {
        const { id, ...fields } = s;
        await db.insert(sponsorsTable).values({ id, ...fields }).onConflictDoNothing();
      }
      console.log("[startup-sync] Sponsors seeded.");
    }
  } catch (err) {
    console.error("[startup-sync] Sponsors seed failed:", err);
  }
}

async function seedAnnouncements() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(announcementsTable);
    if (count === 0) {
      console.log("[startup-sync] Seeding announcements…");
      for (const a of ANNOUNCEMENTS) {
        const { id, ...fields } = a;
        await db.insert(announcementsTable).values({ id, ...fields }).onConflictDoNothing();
      }
      console.log("[startup-sync] Announcements seeded.");
    }
  } catch (err) {
    console.error("[startup-sync] Announcements seed failed:", err);
  }
}

async function seedRegistrationCategories() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(registrationCategoriesTable);
    if (count === 0) {
      console.log("[startup-sync] Seeding registration categories…");
      await db.insert(registrationCategoriesTable).values(REGISTRATION_CATEGORIES).onConflictDoNothing();
      console.log("[startup-sync] Registration categories seeded.");
    }
  } catch (err) {
    console.error("[startup-sync] Registration categories seed failed:", err);
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

const SETTINGS_SEED: Record<string, string> = {
  event_name: "3rd Southeast Asia Ticks and Tick-borne Diseases Symposium",
  event_short_name: "SEAT-MSPTM 2027",
  event_dates: "22–23 March 2027",
  event_venue: "Sunway Putra Hotel",
  event_city: "Kuala Lumpur, Malaysia",
  hero_subtitle: "The conference provides a multidisciplinary platform to showcase the latest research, innovations, and best practices in parasitology, tropical medicine, and vector-borne diseases, while strengthening scientific collaboration across Southeast Asia and beyond. As a dedicated component of the conference, the Southeast Asia Ticks and Tick-borne Diseases Symposium will feature focused discussions on tick biology, pathogen discovery, diagnostics, epidemiology, surveillance, and control strategies. In line with the conference theme, \u201cUniting the World Against Tropical Diseases in a Changing Climate: Sustainable Strategies and Community Impact,\u201d the programme will explore the impact of climate change on vector ecology and disease transmission while promoting innovative, sustainable, and community-driven approaches to strengthen preparedness and improve tropical disease prevention and control.",
  about_text: "The 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium, held in conjunction with the 63rd Annual Scientific Conference of the Malaysian Society of Parasitology and Tropical Medicine (SEAT-MSPTM 2027), brings together researchers, clinicians, veterinarians, public health professionals, policymakers, industry partners, and students to exchange knowledge and foster collaboration on tropical infectious diseases of regional and global importance.",
  registration_target: "300",
  organiser_primary: "MSPTM",
  organiser_secondary: "TIDREC",
  organiser_full_primary: "Malaysian Society of Parasitology and Tropical Medicine (MSPTM)",
  organiser_full_secondary: "Tropical Infectious Diseases Research & Education Centre (TIDREC)",
  organiser_full_tertiary: "Universiti Teknologi MARA (UiTM)",
  co_organiser_uitm_website_url: "https://www.uitm.edu.my",
  venue_website_url: "https://www.sunwayhotels.com/sunway-putra",
  contact_email: "events@msptm.network",
  contact_maps_url: "https://maps.google.com/?q=Sunway+Putra+Hotel+Kuala+Lumpur",
  abstract_deadline: "15 January 2027",
  early_bird_deadline: "01 March 2027",
  date_registration_opens: "10 Aug 2026",
  date_early_bird_closes: "05 Oct 2026",
  date_abstract_submission_closes: "31 Jan 2027",
  date_regular_submission_closes: "10 Feb 2027",
  date_conference: "22–23 Mar 2027",
  date_call_for_abstract_opens: "1 August 2026",
  date_abstract_submission_deadline: "30 December 2026",
  date_abstract_result_notification: "15 January 2027",
  guideline_submission: "Abstracts must be submitted through the online submission portal. Each abstract should be no more than 300 words (excluding title and authors). The title should be concise and clearly reflect the content of the abstract. All abstracts must be written in English. Presenting authors are required to register for the conference.",
  guideline_mode: "Authors may indicate their preferred mode of presentation (oral or poster) during submission. The Scientific Committee reserves the right to reassign the mode of presentation based on the programme requirements. Notification of acceptance and assigned mode will be communicated via email.",
  guideline_oral: "Oral presentations are allocated 12 minutes for presentation and 3 minutes for Q&A. Slides must be prepared in PowerPoint (.pptx) or PDF format in widescreen (16:9) ratio. Presenters are requested to submit their slides to the audio-visual desk at least 2 hours before their session.",
  guideline_poster: "Posters should be prepared in portrait orientation (A0 size: 841 mm \u00d7 1189 mm). Presenters must be available at their poster during the designated poster viewing sessions. Posters must be mounted and removed within the stipulated times. The organisers will not be responsible for posters left after the event.",
  guideline_competition: "This competition is open to students (undergraduate and postgraduate) presenting under the MSPTM Scientific Conference track. Each participant will have 5 minutes to present followed by 2 minutes of Q&A. Participants must indicate their intention to compete during abstract submission. Judging criteria include scientific content, clarity of presentation, and ability to answer questions.",
  guideline_consent: "By submitting an abstract, authors confirm that the work is original and has not been published or presented elsewhere. Authors grant the organisers permission to publish the accepted abstracts in the conference proceedings and digital platforms. All co-authors have given their consent for the submission. Authors are responsible for obtaining necessary ethics approvals and institutional permissions prior to submission.",
  important_dates_json: JSON.stringify([
    { label: "Registration Opens",              date: "10 Aug 2026" },
    { label: "Early Bird Registration Closes",  date: "05 Oct 2026" },
    { label: "Abstract Submission Closes",       date: "31 Jan 2027" },
    { label: "Regular Submission Closes",        date: "10 Feb 2027" },
    { label: "Conference Dates",                 date: "22–23 Mar 2027" },
  ]),
  sponsor_prospectus_url: "",
  first_announcement_url: "",
  co_organiser_tidrec_logo: "https://tidrec.um.edu.my/images/Beige%20Pastel%20Minimalist%20Thesis%20Defense%20Presentation%20(400%20x%2070%20px)%20(1).png",
  co_organiser_msptm_logo: "https://msptm.org/wp-content/uploads/2024/02/MSPTM-Logo-No-BG-12Mar2022-ver2.png",
  co_organiser_uitm_logo: "",
  venue_logo: "https://image-tc.galaxy.tf/wipng-14z269ss45xgkfia6m5zxupd6/sunway-putra-hotel-kuala-lumpur.png",
};

async function syncSettings() {
  try {
    for (const [key, value] of Object.entries(SETTINGS_SEED)) {
      await db
        .insert(settingsTable)
        .values({ key, value })
        .onConflictDoNothing();
    }
    console.log("[startup-sync] Settings seeded.");
  } catch (err) {
    console.error("[startup-sync] Settings seed failed:", err);
  }
}

async function seedAdminUsers() {
  try {
    const adminHash = await bcrypt.hash("admin123", 10);
    const superAdminHash = await bcrypt.hash("superadmin123", 10);

    const ADMIN_USERS = [
      { email: "admin@seat-msptm2027.org",      passwordHash: adminHash,      firstName: "Admin",                lastName: "User",        institution: "SEAT-MSPTM 2027",               country: "Malaysia", role: "admin"       as const },
      { email: "superadmin@seat-msptm2027.org",  passwordHash: superAdminHash, firstName: "Dr. Wan Faiziah",      lastName: "Wan Ismail",  institution: "TIDREC",                         country: "Malaysia", role: "super_admin" as const },
      { email: "admin2@seat-msptm2027.org",      passwordHash: adminHash,      firstName: "Prof. Sazali",         lastName: "Hassan",      institution: "Universiti Malaya",              country: "Malaysia", role: "admin"       as const },
      { email: "admin3@seat-msptm2027.org",      passwordHash: adminHash,      firstName: "Dr. Nurul Ain",        lastName: "Mohd Noor",   institution: "Universiti Kebangsaan Malaysia", country: "Malaysia", role: "admin"       as const },
      { email: "admin4@seat-msptm2027.org",      passwordHash: adminHash,      firstName: "Dr. Tengku Shahrul",   lastName: "Tengku Ahmad", institution: "Universiti Putra Malaysia",    country: "Malaysia", role: "admin"       as const },
      { email: "admin5@seat-msptm2027.org",      passwordHash: adminHash,      firstName: "Assoc. Prof. Hamidah", lastName: "Rusli",        institution: "Hospital Kuala Lumpur",        country: "Malaysia", role: "admin"       as const },
    ];

    await db.insert(usersTable).values(ADMIN_USERS).onConflictDoNothing();
    console.log("[startup-sync] Admin users ensured.");
  } catch (err) {
    console.error("[startup-sync] Admin user seed failed:", err);
  }
}

export async function runStartupSync() {
  // Speakers must run first — sessions reference speaker IDs
  await syncSpeakers();
  await Promise.all([
    syncSettings(),
    seedSessions(),
    seedSponsors(),
    seedAnnouncements(),
    seedRegistrationCategories(),
    seedCommitteeMembers(),
    seedAdminUsers(),
  ]);
}

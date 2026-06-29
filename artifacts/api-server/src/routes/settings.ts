import { Router } from "express";
import { Readable } from "stream";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
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
  abstract_deadline: "15 January 2027",
  early_bird_deadline: "01 March 2027",
  contact_email: "events@msptm.network",
  contact_maps_url: "https://maps.google.com/?q=Sunway+Putra+Hotel+Kuala+Lumpur",
  organiser_full_primary: "Malaysian Society of Parasitology and Tropical Medicine (MSPTM)",
  organiser_full_secondary: "Tropical Infectious Diseases Research & Education Centre (TIDREC)",
  organiser_full_tertiary: "Universiti Teknologi MARA (UiTM)",
  register_logo_size: "md",
  register_page_hero_heading: "Registration",
  register_page_intro_title: "Register for SEAT-MSPTM 2027",
  register_page_status: "Registration is now open.",
  register_early_bird_label: "Early Bird",
  register_early_bird_deadline: "Until 31 Dec 2026",
  register_regular_label: "Regular",
  register_regular_deadline: "Until 15 Feb 2027",
  register_additional_fees_json: JSON.stringify([{ category: "Gala Dinner", fee: "MYR 200" }]),
  register_fees_notes: "* Students must provide a valid student identification card.\n** Senior Researchers refer to retired academic staff, retired researchers, or retired professionals aged 60 years and above.\n*** ASEAN Alliance members refer to members of recognised partner societies including: TSP (Taiwan), VSD (Vietnam), IPDCA (Indonesia), IAMCP (Indonesia), PTAT (Thailand), PSP (Philippines), IAAVP (India), KSP (Korea).\nProof of membership may be required upon registration.\n\nAll registration fees are inclusive of 8% Sales and Service Tax (SST).",
  register_entitlements_heading: "Conference Delegates Entitlements",
  register_entitlements_json: JSON.stringify(["Admission to all scientific sessions", "Conference materials", "Certificate of attendance (e-certificate)", "Opening Ceremony", "Closing Ceremony", "Coffee Breaks", "Lunches", "Welcome Reception"]),
  register_cancel_heading: "Cancellation and Refund Policy",
  register_cancel_before_label: "Cancellation received ON or BEFORE",
  register_cancel_before_date: "31 December 2026",
  register_cancel_before_policy_json: JSON.stringify(["Refund of 70% of the registration fee after deduction of administrative charges."]),
  register_cancel_after_label: "Cancellation received AFTER",
  register_cancel_after_date: "31 December 2026 or NO SHOW",
  register_cancel_after_policy_json: JSON.stringify(["No refund will be made.", "Delegates may nominate a substitute participant."]),
  register_cancel_notes_json: JSON.stringify(["All cancellation requests must be submitted via email to events@msptm.network", "Refunds for registration fees will be processed after the conclusion of SEAT-MSPTM 2027.", "Confirmed refunds will be issued after the conference, via bank transfer or credit card, according to your initial payment method.", "Participants are responsible for any bank charges associated with the refund process."]),
  register_disclaimer_heading: "Disclaimer",
  register_disclaimer_json: JSON.stringify(["The Organising Committee reserves the right to change programme details, dates, or speakers without prior notice.", "The Committee reserves the right to postpone or cancel the conference if necessary.", "The Organisers shall not be responsible for losses resulting from programme changes, postponement, or cancellation."]),
  register_photo_heading: "Photo Release Policy",
  register_photo_policy: "By registering for SEAT-MSPTM 2027, participants consent to photography, videography, and recording during the conference. Images and recordings may be used in future promotional, educational, and archival materials related to the symposium.",
  sponsor_prospectus_url: "",
  first_announcement_url: "",
  co_organiser_tidrec_logo: "https://tidrec.um.edu.my/images/Beige%20Pastel%20Minimalist%20Thesis%20Defense%20Presentation%20(400%20x%2070%20px)%20(1).png",
  co_organiser_msptm_logo: "https://msptm.org/wp-content/uploads/2024/02/MSPTM-Logo-No-BG-12Mar2022-ver2.png",
  co_organiser_uitm_logo: "",
  co_organiser_uitm_website_url: "https://www.uitm.edu.my",
  venue_logo: "https://image-tc.galaxy.tf/wipng-14z269ss45xgkfia6m5zxupd6/sunway-putra-hotel-kuala-lumpur.png",
  venue_website_url: "https://www.sunwayhotels.com/sunway-putra",
  co_organiser_tidrec_website_url: "https://tidrec.um.edu.my",
  co_organiser_msptm_website_url: "https://msptm.org",
  co_organiser_msptm_footer_logo: "",
  co_organiser_tidrec_footer_logo: "",
  co_organiser_uitm_footer_logo: "",
  co_organisers_cards_json: JSON.stringify([
    { id: "tidrec", name: "TIDREC", role: "Co-Organiser", type: "organiser", logoKey: "co_organiser_tidrec_logo", websiteKey: "co_organiser_tidrec_website_url", custom: false },
    { id: "msptm", name: "MSPTM", role: "Co-Organiser", type: "organiser", logoKey: "co_organiser_msptm_logo", websiteKey: "co_organiser_msptm_website_url", custom: false },
    { id: "uitm", name: "UiTM", role: "Co-Organiser", type: "organiser", logoKey: "co_organiser_uitm_logo", websiteKey: "co_organiser_uitm_website_url", custom: false },
    { id: "venue", name: "Sunway Putra Hotel", role: "Venue", type: "venue", logoKey: "venue_logo", websiteKey: "venue_website_url", custom: false },
    { id: "venue_maps", name: "Venue Location", role: "Google Maps", type: "maps", logoKey: "", websiteKey: "contact_maps_url", custom: false },
  ]),
  co_organisers_section_rows_json: JSON.stringify([
    { label: "", cards: ["tidrec", "msptm", "uitm"] },
    { label: "", cards: ["venue", "venue_maps"] },
  ]),
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
  guideline_poster: "Posters should be prepared in portrait orientation (A0 size: 841 mm × 1189 mm). Presenters must be available at their poster during the designated poster viewing sessions. Posters must be mounted and removed within the stipulated times. The organisers will not be responsible for posters left after the event.",
  guideline_competition: "This competition is open to students (undergraduate and postgraduate) presenting under the MSPTM Scientific Conference track. Each participant will have 5 minutes to present followed by 2 minutes of Q&A. Participants must indicate their intention to compete during abstract submission. Judging criteria include scientific content, clarity of presentation, and ability to answer questions.",
  guideline_consent: "By submitting an abstract, authors confirm that the work is original and has not been published or presented elsewhere. Authors grant the organisers permission to publish the accepted abstracts in the conference proceedings and digital platforms. All co-authors have given their consent for the submission. Authors are responsible for obtaining necessary ethics approvals and institutional permissions prior to submission.",
  important_dates_json: JSON.stringify([
    { label: "Registration Opens", date: "10 Aug 2026" },
    { label: "Early Bird Registration Closes", date: "05 Oct 2026" },
    { label: "Abstract Submission Closes", date: "31 Jan 2027" },
    { label: "Regular Submission Closes", date: "10 Feb 2027" },
    { label: "Conference Dates", date: "22–23 Mar 2027" },
  ]),
};

const objectStorageService = new ObjectStorageService();

const FOOTER_LOGO_KEYS: Record<string, string> = {
  "msptm-footer": "co_organiser_msptm_footer_logo",
  "tidrec-footer": "co_organiser_tidrec_footer_logo",
  "uitm-footer": "co_organiser_uitm_footer_logo",
};

async function serveLogoUrl(url: string, res: import("express").Response): Promise<void> {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    res.redirect(url);
    return;
  }
  const objectFile = await objectStorageService.getObjectEntityFile(url);
  const response = await objectStorageService.downloadObject(objectFile);
  res.status(response.status);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if (response.body) {
    const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
    nodeStream.pipe(res);
  } else {
    res.end();
  }
}

router.get("/co-organiser-logo/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await db.select().from(settingsTable);
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) settings[row.key] = row.value;

    // Parse card registry for dynamic slug→logoKey lookup
    let cardsRegistry: Array<{ id: string; logoKey?: string }> = [];
    try {
      const parsed = JSON.parse(settings.co_organisers_cards_json ?? "");
      if (Array.isArray(parsed)) cardsRegistry = parsed;
    } catch { /* ignore */ }

    // Footer logo slugs (fall back to section slug when footer key is empty)
    if (FOOTER_LOGO_KEYS[slug]) {
      const footerUrl = settings[FOOTER_LOGO_KEYS[slug]] ?? "";
      if (footerUrl) {
        await serveLogoUrl(footerUrl, res);
        return;
      }
      // Fallback: redirect to section slug
      const sectionSlug = slug.replace("-footer", "");
      res.redirect(`/api/co-organiser-logo/${sectionSlug}`);
      return;
    }

    // Look up card by ID in the registry
    const card = cardsRegistry.find((c) => c.id === slug);
    if (!card || !card.logoKey) {
      res.status(404).json({ error: "Unknown co-organiser slug" });
      return;
    }
    const url = settings[card.logoKey] ?? "";
    if (!url) {
      res.status(404).json({ error: "Logo not available" });
      return;
    }
    await serveLogoUrl(url, res);
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Logo file not found" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/first-announcement", async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) settings[row.key] = row.value;
    const url = settings.first_announcement_url;
    if (!url) {
      res.status(404).json({ error: "First announcement not available" });
      return;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      res.redirect(url);
      return;
    }
    const objectFile = await objectStorageService.getObjectEntityFile(url);
    const response = await objectStorageService.downloadObject(objectFile);
    res.setHeader("Content-Disposition", 'inline; filename="SEAT-MSPTM2027-First-Announcement.pdf"');
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "First announcement file not found" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sponsor-prospectus", async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) settings[row.key] = row.value;
    const url = settings.sponsor_prospectus_url;
    if (!url) {
      res.status(404).json({ error: "Sponsor prospectus not available" });
      return;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      res.redirect(url);
      return;
    }
    const objectFile = await objectStorageService.getObjectEntityFile(url);
    const response = await objectStorageService.downloadObject(objectFile);
    res.setHeader("Content-Disposition", 'attachment; filename="SEAT-MSPTM2027-Sponsor-Prospectus.pdf"');
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    if (err instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Sponsor prospectus file not found" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/settings", async (_req, res) => {
  try {
    const rows = await db.select().from(settingsTable);
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(settingsTable).set({ value, updatedAt: new Date() }).where(eq(settingsTable.key, key));
      } else {
        await db.insert(settingsTable).values({ key, value });
      }
    }
    const rows = await db.select().from(settingsTable);
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      result[row.key] = row.value;
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

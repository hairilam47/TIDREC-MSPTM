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
  hero_subtitle: "The symposium provides a platform for sharing knowledge on tick biology, ecology, pathogen discovery, diagnostics, epidemiology, surveillance, and control strategies, while fostering regional collaboration and promoting a One Health approach to addressing tick-borne diseases in Southeast Asia.",
  about_text: "The 3rd Southeast Asia Ticks and Tick-borne Diseases Symposium (SEA TTBD 2027), held in conjunction with the 63rd Annual Scientific Conference of the Malaysian Society of Parasitology and Tropical Medicine (MSPTM), brings together researchers, veterinarians, healthcare professionals, and students to discuss the latest advances in tick and tick-borne disease research.",
  registration_target: "300",
  organiser_primary: "MSPTM",
  organiser_secondary: "TIDREC@UM",
  abstract_deadline: "15 January 2027",
  early_bird_deadline: "01 March 2027",
  sponsor_prospectus_url: "",
  first_announcement_url: "",
  co_organiser_tidrec_logo: "",
  co_organiser_msptm_logo: "",
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
};

const objectStorageService = new ObjectStorageService();

router.get("/co-organiser-logo/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    if (slug !== "tidrec" && slug !== "msptm") {
      res.status(404).json({ error: "Unknown co-organiser slug" });
      return;
    }
    const key = slug === "tidrec" ? "co_organiser_tidrec_logo" : "co_organiser_msptm_logo";
    const rows = await db.select().from(settingsTable);
    const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) settings[row.key] = row.value;
    const url = settings[key];
    if (!url) {
      res.status(404).json({ error: "Logo not available" });
      return;
    }
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

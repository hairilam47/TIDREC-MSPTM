import { Router } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  event_name: "3rd Southeast Asia Ticks and Tick-borne Diseases Symposium",
  event_short_name: "SATBDS 2027",
  event_dates: "22–23 March 2027",
  event_venue: "Sunway Putra Hotel",
  event_city: "Kuala Lumpur, Malaysia",
  hero_subtitle: "Advancing knowledge on tick biology, tick-borne pathogens, and integrated management strategies across Southeast Asia.",
  about_text: "The SATBDS symposium brings together researchers, clinicians, veterinarians, and public health professionals from across Southeast Asia to share the latest advances in tick biology and tick-borne disease research.",
  registration_target: "300",
  organiser_primary: "MSPTM",
  organiser_secondary: "TIDREC@UM",
  abstract_deadline: "15 January 2027",
  early_bird_deadline: "01 March 2027",
};

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

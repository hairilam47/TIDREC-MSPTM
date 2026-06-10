import { Router } from "express";
import { db, announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function formatAnnouncement(a: typeof announcementsTable.$inferSelect) {
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    important: a.important,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/announcements", async (_req, res) => {
  try {
    const announcements = await db.select().from(announcementsTable).orderBy(announcementsTable.createdAt);
    res.json(announcements.map(formatAnnouncement));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/announcements", requireAdmin, async (req, res) => {
  try {
    const { title, body, important } = req.body;
    if (!title || !body) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [announcement] = await db.insert(announcementsTable).values({
      title,
      body,
      important: important || false,
    }).returning();
    res.status(201).json(formatAnnouncement(announcement));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import { db, speakersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatSpeaker(s: typeof speakersTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    country: s.country,
    institution: s.institution,
    topic: s.topic,
    bio: s.bio,
    photoUrl: s.photoUrl,
    initials: s.initials,
    speakerTier: s.speakerTier,
  };
}

router.get("/speakers", async (_req, res) => {
  try {
    const speakers = await db.select().from(speakersTable).orderBy(speakersTable.name);
    res.json(speakers.map(formatSpeaker));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/speakers", requireAdmin, async (req, res) => {
  try {
    const { name, country, institution, topic, bio, photoUrl, speakerTier } = req.body;
    if (!name || !country || !topic) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [speaker] = await db.insert(speakersTable).values({
      name,
      country,
      institution: institution || null,
      topic,
      bio: bio || null,
      photoUrl: photoUrl || null,
      initials: getInitials(name),
      speakerTier: speakerTier || null,
    }).returning();
    res.status(201).json(formatSpeaker(speaker));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/speakers/:id", async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [speaker] = await db.select().from(speakersTable).where(eq(speakersTable.id, id)).limit(1);
    if (!speaker) {
      res.status(404).json({ error: "Speaker not found" });
      return;
    }
    res.json(formatSpeaker(speaker));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/speakers/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { name, country, institution, topic, bio, photoUrl, speakerTier } = req.body;
    const [speaker] = await db.update(speakersTable)
      .set({
        name,
        country,
        institution: institution || null,
        topic,
        bio: bio || null,
        photoUrl: photoUrl || null,
        initials: name ? getInitials(name) : undefined,
        speakerTier: speakerTier || null,
        updatedAt: new Date(),
      })
      .where(eq(speakersTable.id, id))
      .returning();
    if (!speaker) {
      res.status(404).json({ error: "Speaker not found" });
      return;
    }
    res.json(formatSpeaker(speaker));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/speakers/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(speakersTable).where(eq(speakersTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

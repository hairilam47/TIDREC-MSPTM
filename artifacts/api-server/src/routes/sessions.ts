import { Router } from "express";
import { db, sessionsTable, speakersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

async function formatSession(s: typeof sessionsTable.$inferSelect) {
  let speakerName: string | null = null;
  if (s.speakerId) {
    const [speaker] = await db.select().from(speakersTable).where(eq(speakersTable.id, s.speakerId)).limit(1);
    speakerName = speaker?.name || null;
  }
  return {
    id: s.id,
    title: s.title,
    day: s.day,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    sessionType: s.sessionType,
    description: s.description,
    speakerId: s.speakerId,
    speakerName,
  };
}

router.get("/sessions", async (_req, res) => {
  try {
    const sessions = await db.select().from(sessionsTable).orderBy(sessionsTable.day, sessionsTable.startTime);
    const formatted = await Promise.all(sessions.map(formatSession));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions", requireAdmin, async (req, res) => {
  try {
    const { title, day, startTime, endTime, room, sessionType, description, speakerId } = req.body;
    if (!title || !day || !startTime || !sessionType) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [session] = await db.insert(sessionsTable).values({
      title,
      day: parseInt(day),
      startTime,
      endTime: endTime || null,
      room: room || null,
      sessionType,
      description: description || null,
      speakerId: speakerId ? parseInt(speakerId) : null,
    }).returning();
    res.status(201).json(await formatSession(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sessions/:id", async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [session] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(await formatSession(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/sessions/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { title, day, startTime, endTime, room, sessionType, description, speakerId } = req.body;
    const [session] = await db.update(sessionsTable)
      .set({
        title,
        day: day ? parseInt(day) : undefined,
        startTime,
        endTime: endTime || null,
        room: room || null,
        sessionType,
        description: description || null,
        speakerId: speakerId ? parseInt(speakerId) : null,
        updatedAt: new Date(),
      })
      .where(eq(sessionsTable.id, id))
      .returning();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(await formatSession(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sessions/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(sessionsTable).where(eq(sessionsTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

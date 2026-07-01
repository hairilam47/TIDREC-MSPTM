import { Router } from "express";
import { db, programmeSessionsTable } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

const SEED_DATA: Array<Omit<typeof programmeSessionsTable.$inferInsert, "id" | "createdAt" | "updatedAt">> = [
  { day: 1, dayLabel: "22 March 2027", timeSlot: "08:00 – 09:00", kind: "single", sessionType: "registration", title: "Registration", location: "Registration Area", sortOrder: 1 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "09:00 – 09:30", kind: "single", sessionType: "keynote", title: "Keynote Lecture", location: "Main Ballroom", sortOrder: 2 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "09:30 – 10:20", kind: "single", sessionType: "plenary", title: "Opening Ceremony", location: "Main Ballroom", sortOrder: 3 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "10:20 – 10:30", kind: "single", sessionType: "break", title: "Morning Tea Break", location: "Foyer", sortOrder: 4 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "10:30 – 11:00", kind: "single", sessionType: "plenary", title: "Plenary Lecture", location: "Main Ballroom", sortOrder: 5 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "11:00 – 12:30", kind: "dual", sessionType: "session", trackATitle: "Symposium Session", trackALocation: "Main Ballroom", trackBTitle: "Concurrent Scientific Session", trackBLocation: "Breakout Room 1", sortOrder: 6 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "12:30 – 13:30", kind: "single", sessionType: "break", title: "Lunch", location: "Dining Area", sortOrder: 7 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "13:30 – 14:00", kind: "single", sessionType: "plenary", title: "Plenary Lecture", location: "Main Ballroom", sortOrder: 8 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "14:00 – 15:30", kind: "dual", sessionType: "session", trackATitle: "Symposium Session", trackALocation: "Main Ballroom", trackBTitle: "Concurrent Scientific Session", trackBLocation: "Breakout Room 1", sortOrder: 9 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "15:30 – 15:45", kind: "single", sessionType: "industry", title: "Industry Symposium", location: "Main Ballroom", sortOrder: 10 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "15:45 – 16:00", kind: "single", sessionType: "break", title: "Afternoon Tea Break & Poster Viewing", location: "Foyer", sortOrder: 11 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "16:00 – 16:30", kind: "single", sessionType: "plenary", title: "Plenary Lecture", location: "Main Ballroom", sortOrder: 12 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "16:30 – 17:30", kind: "dual", sessionType: "session", trackATitle: "Scientific Session", trackALocation: "Main Ballroom", trackBTitle: "Student Rapid Oral Competition", trackBLocation: "Breakout Room 1", sortOrder: 13 },
  { day: 1, dayLabel: "22 March 2027", timeSlot: "19:00 – 22:00", kind: "single", sessionType: "social", title: "Gala Dinner", location: "Gala Dinner Venue", sortOrder: 14 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "08:00 – 09:00", kind: "single", sessionType: "registration", title: "Registration", location: "Registration Area", sortOrder: 1 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "09:00 – 09:30", kind: "single", sessionType: "keynote", title: "Keynote Lecture", location: "Main Ballroom", sortOrder: 2 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "09:30 – 10:00", kind: "single", sessionType: "plenary", title: "Plenary Lecture", location: "Main Ballroom", sortOrder: 3 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "10:00 – 10:15", kind: "single", sessionType: "industry", title: "Breakfast Symposium", location: "Main Ballroom", sortOrder: 4 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "10:15 – 10:30", kind: "single", sessionType: "break", title: "Morning Tea Break & Poster Viewing", location: "Foyer", sortOrder: 5 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "10:30 – 11:00", kind: "single", sessionType: "plenary", title: "Plenary Lecture", location: "Main Ballroom", sortOrder: 6 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "11:00 – 12:30", kind: "dual", sessionType: "session", trackATitle: "Scientific Session", trackALocation: "Main Ballroom", trackBTitle: "Symposium Session", trackBLocation: "Breakout Room 1", sortOrder: 7 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "12:30 – 13:30", kind: "single", sessionType: "break", title: "Lunch", location: "Dining Area", sortOrder: 8 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "13:30 – 14:00", kind: "single", sessionType: "plenary", title: "Plenary Lecture", location: "Main Ballroom", sortOrder: 9 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "14:00 – 15:30", kind: "dual", sessionType: "session", trackATitle: "Scientific Session", trackALocation: "Main Ballroom", trackBTitle: "Symposium Session", trackBLocation: "Breakout Room 1", sortOrder: 10 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "15:30 – 15:45", kind: "single", sessionType: "industry", title: "Industry Symposium", location: "Main Ballroom", sortOrder: 11 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "15:45 – 16:00", kind: "single", sessionType: "break", title: "Afternoon Tea Break & Poster Viewing", location: "Foyer", sortOrder: 12 },
  { day: 2, dayLabel: "23 March 2027", timeSlot: "16:00 – 17:30", kind: "dual", sessionType: "session", trackATitle: "Scientific Session", trackALocation: "Main Ballroom", trackBTitle: "Symposium Session", trackBLocation: "Breakout Room 1", sortOrder: 13 },
];

async function seedIfEmpty() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(programmeSessionsTable);
    if (count === 0) {
      console.log("[programme-sessions] Seeding 27 default sessions…");
      await db.insert(programmeSessionsTable).values(SEED_DATA);
      console.log("[programme-sessions] Seed complete.");
    }
  } catch (err) {
    console.error("[programme-sessions] Seed/bootstrap failed — ensure the programme_sessions table exists (run lib/db/src/migrations/002_programme_sessions.sql):", err);
  }
}

seedIfEmpty();

function formatSession(s: typeof programmeSessionsTable.$inferSelect) {
  return {
    id: s.id,
    day: s.day,
    dayLabel: s.dayLabel,
    timeSlot: s.timeSlot,
    kind: s.kind,
    sessionType: s.sessionType,
    title: s.title,
    location: s.location,
    trackATitle: s.trackATitle,
    trackALocation: s.trackALocation,
    trackBTitle: s.trackBTitle,
    trackBLocation: s.trackBLocation,
    speakerId: s.speakerId ?? null,
    sortOrder: s.sortOrder,
  };
}

router.get("/programme-sessions", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(programmeSessionsTable)
      .orderBy(asc(programmeSessionsTable.day), asc(programmeSessionsTable.sortOrder));
    res.json(rows.map(formatSession));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/programme-sessions", requireAdmin, async (req, res) => {
  try {
    const { day, dayLabel, timeSlot, kind, sessionType, title, location, trackATitle, trackALocation, trackBTitle, trackBLocation, speakerId, sortOrder } = req.body;
    if (!day || !dayLabel || !timeSlot || !kind || !sessionType) {
      res.status(400).json({ error: "Missing required fields: day, dayLabel, timeSlot, kind, sessionType" });
      return;
    }
    const [session] = await db.insert(programmeSessionsTable).values({
      day: Number(day),
      dayLabel,
      timeSlot,
      kind,
      sessionType,
      title: title || null,
      location: location || null,
      trackATitle: trackATitle || null,
      trackALocation: trackALocation || null,
      trackBTitle: trackBTitle || null,
      trackBLocation: trackBLocation || null,
      speakerId: speakerId ? Number(speakerId) : null,
      sortOrder: sortOrder ?? 0,
    }).returning();
    res.status(201).json(formatSession(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/programme-sessions/reorder", requireAdmin, async (req, res) => {
  try {
    const updates: Array<{ id: number; sortOrder: number }> = req.body;
    if (!Array.isArray(updates)) {
      res.status(400).json({ error: "Body must be an array of {id, sortOrder}" });
      return;
    }
    await Promise.all(
      updates.map(({ id, sortOrder }) =>
        db.update(programmeSessionsTable)
          .set({ sortOrder, updatedAt: new Date() })
          .where(eq(programmeSessionsTable.id, id))
      )
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/programme-sessions/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { day, dayLabel, timeSlot, kind, sessionType, title, location, trackATitle, trackALocation, trackBTitle, trackBLocation, speakerId, sortOrder } = req.body;
    const [session] = await db.update(programmeSessionsTable)
      .set({
        day: day !== undefined ? Number(day) : undefined,
        dayLabel,
        timeSlot,
        kind,
        sessionType,
        title: title ?? null,
        location: location ?? null,
        trackATitle: trackATitle ?? null,
        trackALocation: trackALocation ?? null,
        trackBTitle: trackBTitle ?? null,
        trackBLocation: trackBLocation ?? null,
        speakerId: speakerId !== undefined ? (speakerId ? Number(speakerId) : null) : undefined,
        sortOrder: sortOrder ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(programmeSessionsTable.id, id))
      .returning();
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(formatSession(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/programme-sessions/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(programmeSessionsTable).where(eq(programmeSessionsTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

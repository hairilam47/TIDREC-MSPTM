import { Router } from "express";
import { db, savedSessionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/sessions/saved", requireAuth, async (req: AuthRequest, res) => {
  try {
    const saved = await db
      .select()
      .from(savedSessionsTable)
      .where(eq(savedSessionsTable.userId, req.user!.userId));
    res.json(saved.map((s) => s.sessionId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sessions/:id/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessionId = parseInt(String(req.params.id));
    await db
      .insert(savedSessionsTable)
      .values({ userId: req.user!.userId, sessionId })
      .onConflictDoNothing();
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sessions/:id/save", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessionId = parseInt(String(req.params.id));
    await db
      .delete(savedSessionsTable)
      .where(
        and(
          eq(savedSessionsTable.userId, req.user!.userId),
          eq(savedSessionsTable.sessionId, sessionId),
        ),
      );
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

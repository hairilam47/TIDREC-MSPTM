import { Router } from "express";
import { db, committeeMembersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

const VALID_LEVELS = ["international_advisory", "local_organising", "subcommittee"] as const;

function isValidLevel(level: string): level is typeof VALID_LEVELS[number] {
  return (VALID_LEVELS as readonly string[]).includes(level);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMember(m: typeof committeeMembersTable.$inferSelect) {
  return {
    id: m.id,
    name: m.name,
    title: m.title,
    photoUrl: m.photoUrl,
    initials: m.initials,
    committeeLevel: m.committeeLevel,
    subcommitteeName: m.subcommitteeName,
    sortOrder: m.sortOrder,
  };
}

router.get("/committee-members", async (_req, res) => {
  try {
    const members = await db
      .select()
      .from(committeeMembersTable)
      .orderBy(asc(committeeMembersTable.sortOrder), asc(committeeMembersTable.name));
    res.json(members.map(formatMember));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/committee-members", requireAdmin, async (req, res) => {
  try {
    const { name, title, photoUrl, committeeLevel, subcommitteeName, sortOrder } = req.body;
    if (!name || !title || !committeeLevel) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (!isValidLevel(committeeLevel)) {
      res.status(400).json({ error: `Invalid committeeLevel. Must be one of: ${VALID_LEVELS.join(", ")}` });
      return;
    }
    const [member] = await db.insert(committeeMembersTable).values({
      name,
      title,
      photoUrl: photoUrl || null,
      initials: getInitials(name),
      committeeLevel,
      subcommitteeName: subcommitteeName || null,
      sortOrder: sortOrder ?? 0,
    }).returning();
    res.status(201).json(formatMember(member));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/committee-members/reorder", requireAdmin, async (req, res) => {
  try {
    const items: { id: number; sortOrder: number }[] = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ error: "Expected array of { id, sortOrder }" });
      return;
    }
    await Promise.all(
      items.map(({ id, sortOrder }) =>
        db.update(committeeMembersTable)
          .set({ sortOrder, updatedAt: new Date() })
          .where(eq(committeeMembersTable.id, id))
      )
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/committee-members/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { name, title, photoUrl, committeeLevel, subcommitteeName, sortOrder } = req.body;
    if (committeeLevel && !isValidLevel(committeeLevel)) {
      res.status(400).json({ error: `Invalid committeeLevel. Must be one of: ${VALID_LEVELS.join(", ")}` });
      return;
    }
    const [member] = await db.update(committeeMembersTable)
      .set({
        name,
        title,
        photoUrl: photoUrl || null,
        initials: name ? getInitials(name) : undefined,
        committeeLevel,
        subcommitteeName: subcommitteeName || null,
        sortOrder: sortOrder ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(committeeMembersTable.id, id))
      .returning();
    if (!member) {
      res.status(404).json({ error: "Committee member not found" });
      return;
    }
    res.json(formatMember(member));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/committee-members/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(committeeMembersTable).where(eq(committeeMembersTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

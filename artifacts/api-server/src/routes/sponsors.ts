import { Router } from "express";
import { db, sponsorsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function formatSponsor(s: typeof sponsorsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    tier: s.tier,
    logoUrl: s.logoUrl,
    website: s.website,
    sortOrder: s.sortOrder,
  };
}

router.get("/sponsors", async (_req, res) => {
  try {
    const sponsors = await db
      .select()
      .from(sponsorsTable)
      .orderBy(sponsorsTable.tier, asc(sponsorsTable.sortOrder), asc(sponsorsTable.name));
    res.json(sponsors.map(formatSponsor));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sponsors", requireAdmin, async (req, res) => {
  try {
    const { name, tier, logoUrl, website } = req.body;
    if (!name || !tier) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [sponsor] = await db.insert(sponsorsTable).values({
      name,
      tier,
      logoUrl: logoUrl || null,
      website: website || null,
    }).returning();
    res.status(201).json(formatSponsor(sponsor));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/sponsors/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { name, tier, logoUrl, website } = req.body;
    const [sponsor] = await db.update(sponsorsTable)
      .set({ name, tier, logoUrl: logoUrl || null, website: website || null, updatedAt: new Date() })
      .where(eq(sponsorsTable.id, id))
      .returning();
    if (!sponsor) {
      res.status(404).json({ error: "Sponsor not found" });
      return;
    }
    res.json(formatSponsor(sponsor));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/sponsors/reorder", requireAdmin, async (req, res) => {
  try {
    const updates: Array<{ id: number; sortOrder: number }> = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ error: "Body must be an array of {id, sortOrder}" });
      return;
    }
    await Promise.all(
      updates.map(({ id, sortOrder }) =>
        db.update(sponsorsTable)
          .set({ sortOrder, updatedAt: new Date() })
          .where(eq(sponsorsTable.id, id))
      )
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sponsors/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(sponsorsTable).where(eq(sponsorsTable.id, id));
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

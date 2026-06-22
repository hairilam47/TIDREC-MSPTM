import { Router } from "express";
import { db, sponsorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function formatSponsor(s: typeof sponsorsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    tier: s.tier,
    logoUrl: s.logoUrl,
    website: s.website,
  };
}

router.get("/sponsors", async (_req, res) => {
  try {
    const sponsors = await db.select().from(sponsorsTable).orderBy(sponsorsTable.tier, sponsorsTable.name);
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

import { Router } from "express";
import { db, registrationCategoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

function fmt(c: typeof registrationCategoriesTable.$inferSelect) {
  return {
    id: c.id,
    slug: c.slug,
    label: c.label,
    priceMyr: c.priceMyr ? parseFloat(c.priceMyr) : 0,
    earlyBirdPriceMyr: c.earlyBirdPriceMyr != null ? parseFloat(c.earlyBirdPriceMyr) : null,
    description: c.description ?? null,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  };
}

router.get("/registration-categories", async (_req, res) => {
  try {
    const cats = await db
      .select()
      .from(registrationCategoriesTable)
      .where(eq(registrationCategoriesTable.isActive, true))
      .orderBy(asc(registrationCategoriesTable.sortOrder));
    res.json(cats.map(fmt));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/registration-categories", requireAdmin, async (_req, res) => {
  try {
    const cats = await db
      .select()
      .from(registrationCategoriesTable)
      .orderBy(asc(registrationCategoriesTable.sortOrder));
    res.json(cats.map(fmt));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/registration-categories", requireAdmin, async (req, res) => {
  try {
    const { slug, label, priceMyr, description, sortOrder, isActive } = req.body;
    if (!slug || !label) {
      res.status(400).json({ error: "slug and label are required" });
      return;
    }
    const [cat] = await db
      .insert(registrationCategoriesTable)
      .values({
        slug: slug.trim(),
        label: label.trim(),
        priceMyr: String(priceMyr ?? 0),
        description: description?.trim() || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== false,
      })
      .returning();
    res.status(201).json(fmt(cat));
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      res.status(409).json({ error: "A category with this slug already exists" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/registration-categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { slug, label, priceMyr, description, sortOrder, isActive } = req.body;
    const updates: Partial<typeof registrationCategoriesTable.$inferInsert> = { updatedAt: new Date() };
    if (slug !== undefined) updates.slug = slug.trim();
    if (label !== undefined) updates.label = label.trim();
    if (priceMyr !== undefined) updates.priceMyr = String(priceMyr);
    const { earlyBirdPriceMyr } = req.body;
    if (earlyBirdPriceMyr !== undefined) updates.earlyBirdPriceMyr = earlyBirdPriceMyr != null && earlyBirdPriceMyr !== "" ? String(earlyBirdPriceMyr) : null;
    if (description !== undefined) updates.description = description?.trim() || null;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;
    const [cat] = await db
      .update(registrationCategoriesTable)
      .set(updates)
      .where(eq(registrationCategoriesTable.id, id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(fmt(cat));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/registration-categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [cat] = await db
      .update(registrationCategoriesTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(registrationCategoriesTable.id, id))
      .returning();
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

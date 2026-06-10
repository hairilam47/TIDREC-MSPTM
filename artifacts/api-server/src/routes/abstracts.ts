import { Router } from "express";
import { db, abstractsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import crypto from "node:crypto";

const router = Router();

function generateAbstractCode(): string {
  return "ABS-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function formatAbstract(a: typeof abstractsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, a.userId)).limit(1);
  return {
    id: a.id,
    userId: a.userId,
    submitterName: user ? `${user.firstName} ${user.lastName}` : null,
    title: a.title,
    body: a.body,
    abstractType: a.abstractType,
    keywords: a.keywords,
    coAuthors: a.coAuthors,
    fileUrl: a.fileUrl ?? null,
    status: a.status,
    reviewNotes: a.reviewNotes,
    reviewedBy: a.reviewedBy ?? null,
    abstractCode: a.abstractCode,
    createdAt: a.createdAt.toISOString(),
  };
}

router.get("/abstracts", requireAuth, async (req: AuthRequest, res) => {
  try {
    let abstracts;
    if (req.user!.role === "admin") {
      abstracts = await db.select().from(abstractsTable).orderBy(abstractsTable.createdAt);
    } else {
      abstracts = await db.select().from(abstractsTable).where(eq(abstractsTable.userId, req.user!.userId)).orderBy(abstractsTable.createdAt);
    }
    const formatted = await Promise.all(abstracts.map(formatAbstract));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/abstracts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, body, abstractType, keywords, coAuthors, fileUrl } = req.body;
    if (!title || !body || !abstractType) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [abstract] = await db.insert(abstractsTable).values({
      userId: req.user!.userId,
      title,
      body,
      abstractType,
      keywords: keywords || null,
      coAuthors: coAuthors || null,
      fileUrl: fileUrl || null,
      status: "submitted",
      abstractCode: generateAbstractCode(),
    }).returning();
    res.status(201).json(await formatAbstract(abstract));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/abstracts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [abstract] = await db.select().from(abstractsTable).where(eq(abstractsTable.id, id)).limit(1);
    if (!abstract) {
      res.status(404).json({ error: "Abstract not found" });
      return;
    }
    if (req.user!.role !== "admin" && abstract.userId !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(await formatAbstract(abstract));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/abstracts/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [existing] = await db.select().from(abstractsTable).where(eq(abstractsTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Abstract not found" });
      return;
    }
    const isAdmin = req.user!.role === "admin";
    const isOwner = existing.userId === req.user!.userId;
    if (!isAdmin && !isOwner) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { status, reviewNotes, reviewedBy, title, body } = req.body;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (isAdmin && status) updateData.status = status;
    if (isAdmin && reviewNotes !== undefined) updateData.reviewNotes = reviewNotes;
    if (isAdmin && reviewedBy !== undefined) updateData.reviewedBy = reviewedBy;
    if (isOwner && title) updateData.title = title;
    if (isOwner && body) updateData.body = body;
    const [updated] = await db.update(abstractsTable).set(updateData).where(eq(abstractsTable.id, id)).returning();
    res.json(await formatAbstract(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

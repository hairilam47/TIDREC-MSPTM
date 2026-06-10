import { Router } from "express";
import { db, registrationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import crypto from "node:crypto";

const router = Router();

function generateRegistrationCode(): string {
  return "REG-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function formatRegistration(r: typeof registrationsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId)).limit(1);
  return {
    id: r.id,
    userId: r.userId,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    institution: user?.institution,
    country: user?.country,
    category: r.category,
    paymentStatus: r.paymentStatus,
    paymentAmount: r.paymentAmount ? parseFloat(r.paymentAmount) : null,
    registrationCode: r.registrationCode,
    createdAt: r.createdAt.toISOString(),
  };
}

router.post("/registrations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category, dietaryRequirements, specialNeeds } = req.body;
    const userId = req.user!.userId;
    const existing = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, userId)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Already registered" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [registration] = await db.insert(registrationsTable).values({
      userId,
      category: category || user?.category || "attendee",
      paymentStatus: "pending",
      registrationCode: generateRegistrationCode(),
      dietaryRequirements: dietaryRequirements || null,
      specialNeeds: specialNeeds || null,
    }).returning();
    res.status(201).json(await formatRegistration(registration));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/registrations", requireAdmin, async (_req, res) => {
  try {
    const regs = await db.select().from(registrationsTable).orderBy(registrationsTable.createdAt);
    const formatted = await Promise.all(regs.map(formatRegistration));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/registrations/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, userId)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "No registration found" });
      return;
    }
    res.json(await formatRegistration(reg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/registrations/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }
    res.json(await formatRegistration(reg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/registrations/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { paymentStatus, paymentAmount } = req.body;
    const [reg] = await db.update(registrationsTable)
      .set({
        paymentStatus: paymentStatus || undefined,
        paymentAmount: paymentAmount !== undefined ? String(paymentAmount) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(registrationsTable.id, id))
      .returning();
    if (!reg) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }
    res.json(await formatRegistration(reg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import { db, registrationsTable, usersTable, paymentRemindersTable, registrationCategoriesTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../lib/auth";
import crypto from "node:crypto";

const router = Router();

function generateRegistrationCode(): string {
  return "REG-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function getEarlyBirdDeadlineStr(): Promise<string | null> {
  try {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "date_early_bird_closes")).limit(1);
    return row?.value ?? null;
  } catch { return null; }
}

function isEarlyBirdActive(deadlineStr: string | null): boolean {
  if (!deadlineStr) return false;
  const d = new Date(deadlineStr);
  if (isNaN(d.getTime())) return false;
  return new Date() <= d;
}

function resolveBasePrice(catRow: { priceMyr: string; earlyBirdPriceMyr: string | null }, earlyBird: boolean): number {
  if (earlyBird && catRow.earlyBirdPriceMyr != null) {
    return parseFloat(catRow.earlyBirdPriceMyr);
  }
  return parseFloat(catRow.priceMyr);
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
    paymentMethod: r.paymentMethod ?? null,
    registrationCode: r.registrationCode,
    createdAt: r.createdAt.toISOString(),
  };
}

router.post("/admin/registrations", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      firstName, lastName, email, institution, country, category,
      paymentStatus, paymentAmount, dietaryRequirements, specialNeeds,
    } = req.body;

    if (!firstName || !lastName || !email || !category) {
      res.status(400).json({ error: "firstName, lastName, email and category are required" });
      return;
    }

    // Find or create user by email
    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (user) {
      // Check not already registered
      const [existing] = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, user.id)).limit(1);
      if (existing) {
        res.status(409).json({ error: "A registration already exists for this email" });
        return;
      }
    } else {
      // Create a user account with a temporary random password
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const passwordHash = await import("bcryptjs").then((m) => m.default.hash(tempPassword, 10));
      [user] = await db.insert(usersTable).values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        institution: institution || null,
        country: country || null,
        category: category || null,
        role: "attendee",
      }).returning();
    }

    let finalPaymentAmount: string | null = paymentAmount != null ? String(paymentAmount) : null;
    if (finalPaymentAmount === null) {
      const [catRow] = await db
        .select()
        .from(registrationCategoriesTable)
        .where(eq(registrationCategoriesTable.slug, category))
        .limit(1);
      if (catRow) finalPaymentAmount = catRow.priceMyr;
    }
    const [registration] = await db.insert(registrationsTable).values({
      userId: user.id,
      category,
      paymentStatus: (paymentStatus as "pending" | "paid" | "overdue" | "waived") || "pending",
      paymentAmount: finalPaymentAmount,
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

router.post("/registrations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { category, dietaryRequirements, specialNeeds, addonsTotal, paymentMethod } = req.body;
    const userId = req.user!.userId;
    const existing = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, userId)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Already registered" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const finalCategory = category || user?.category || "";
    const safeAddonsTotal = typeof addonsTotal === "number" && addonsTotal >= 0 ? addonsTotal : 0;

    let autoPaymentAmount: string | null = null;
    if (finalCategory) {
      const [catRow] = await db
        .select()
        .from(registrationCategoriesTable)
        .where(eq(registrationCategoriesTable.slug, finalCategory))
        .limit(1);
      if (catRow) {
        const deadlineStr = await getEarlyBirdDeadlineStr();
        const earlyBird = isEarlyBirdActive(deadlineStr);
        const base = resolveBasePrice(catRow, earlyBird);
        autoPaymentAmount = String(base + safeAddonsTotal);
      }
    }
    const [registration] = await db.insert(registrationsTable).values({
      userId,
      category: finalCategory,
      paymentStatus: "pending",
      paymentAmount: autoPaymentAmount,
      paymentMethod: paymentMethod || null,
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

router.get("/registrations/me/invoice", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, userId)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "No registration found" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const invoiceNumber = "INV-" + reg.registrationCode.replace("REG-", "");
    let invoiceAmount = reg.paymentAmount ? parseFloat(reg.paymentAmount) : 0;
    if (!reg.paymentAmount && reg.category) {
      const [catRow] = await db
        .select()
        .from(registrationCategoriesTable)
        .where(eq(registrationCategoriesTable.slug, reg.category))
        .limit(1);
      if (catRow) invoiceAmount = parseFloat(catRow.priceMyr);
    }
    res.json({
      invoiceNumber,
      registrationCode: reg.registrationCode,
      category: reg.category,
      amount: invoiceAmount,
      currency: "MYR",
      status: reg.paymentStatus,
      issuedAt: reg.createdAt.toISOString(),
      paidAt: null,
      delegate: {
        name: user ? `${user.firstName} ${user.lastName}` : "",
        email: user?.email || "",
        institution: user?.institution || null,
        country: user?.country || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/registrations/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
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
    const id = parseInt(String(req.params.id));
    const { paymentStatus, paymentAmount, paymentMethod } = req.body;
    const [reg] = await db.update(registrationsTable)
      .set({
        paymentStatus: paymentStatus || undefined,
        paymentAmount: paymentAmount !== undefined ? String(paymentAmount) : undefined,
        paymentMethod: paymentMethod !== undefined ? (paymentMethod || null) : undefined,
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

router.post("/registrations/:id/remind", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }
    const [reminder] = await db.insert(paymentRemindersTable).values({
      registrationId: id,
      sentBy: req.user?.email || "admin",
    }).returning();
    res.json({ success: true, reminderId: reminder.id, sentAt: reminder.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

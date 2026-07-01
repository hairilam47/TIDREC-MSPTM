import { Router } from "express";
import { db, registrationsTable, usersTable, paymentRemindersTable, registrationCategoriesTable, settingsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
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

function computeAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

async function formatRegistration(r: typeof registrationsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId)).limit(1);
  return {
    id: r.id,
    userId: r.userId,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    fullName: user?.fullName || null,
    salutation: user?.salutation || null,
    salutationOther: user?.salutationOther || null,
    email: user?.email || "",
    institution: user?.institution || null,
    country: user?.country || null,
    mobileCountryCode: user?.mobileCountryCode || null,
    mobileNumber: user?.mobileNumber || null,
    nationality: user?.nationality || null,
    gender: user?.gender || null,
    dateOfBirth: user?.dateOfBirth || null,
    age: computeAge(user?.dateOfBirth),
    isMmaMember: user?.isMmaMember ?? null,
    mmcNumber: user?.mmcNumber || null,
    category: r.category,
    paymentStatus: r.paymentStatus,
    paymentAmount: r.paymentAmount ? parseFloat(r.paymentAmount) : null,
    paymentMethod: r.paymentMethod ?? null,
    receiptUrl: r.receiptUrl ?? null,
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

    let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

    if (user) {
      const [existing] = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, user.id)).limit(1);
      if (existing) {
        res.status(409).json({ error: "A registration already exists for this email" });
        return;
      }
    } else {
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

router.post("/registrations/me/receipt", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { receiptUrl } = req.body;
    if (!receiptUrl) {
      res.status(400).json({ error: "receiptUrl is required" });
      return;
    }
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, userId)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "No registration found" });
      return;
    }
    if (reg.paymentStatus === "paid" || reg.paymentStatus === "waived") {
      res.status(400).json({ error: "Payment already confirmed" });
      return;
    }
    const [updated] = await db.update(registrationsTable)
      .set({
        receiptUrl,
        paymentStatus: "pending_confirmation",
        updatedAt: new Date(),
      })
      .where(eq(registrationsTable.userId, userId))
      .returning();
    res.json(await formatRegistration(updated));
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
        receiptUrl: req.body.receiptUrl !== undefined ? (req.body.receiptUrl || null) : undefined,
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

router.delete("/registrations/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }
    await db.delete(registrationsTable).where(eq(registrationsTable.id, id));
    res.status(204).end();
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

router.post("/registrations/bulk-remind", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: "ids array is required" });
      return;
    }
    const regs = await db.select().from(registrationsTable).where(inArray(registrationsTable.id, ids));
    let sent = 0;
    let failed = 0;
    await Promise.all(
      regs.map(async (reg) => {
        try {
          await db.insert(paymentRemindersTable).values({
            registrationId: reg.id,
            sentBy: req.user?.email || "admin",
          });
          sent++;
        } catch {
          failed++;
        }
      })
    );
    res.json({ sent, failed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/registrations/:id/invoice", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const [reg] = await db.select().from(registrationsTable).where(eq(registrationsTable.id, id)).limit(1);
    if (!reg) {
      res.status(404).json({ error: "Registration not found" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, reg.userId)).limit(1);

    let invoiceAmount = reg.paymentAmount ? parseFloat(reg.paymentAmount) : 0;
    let categoryLabel = reg.category ?? "";
    if (reg.category) {
      const [catRow] = await db
        .select()
        .from(registrationCategoriesTable)
        .where(eq(registrationCategoriesTable.slug, reg.category))
        .limit(1);
      if (catRow) {
        if (!reg.paymentAmount) invoiceAmount = parseFloat(catRow.priceMyr);
        categoryLabel = catRow.label;
      }
    }

    const [eventNameRow] = await db.select().from(settingsTable).where(eq(settingsTable.key, "event_name")).limit(1);
    const [eventDateRow] = await db.select().from(settingsTable).where(eq(settingsTable.key, "event_dates")).limit(1);
    const [eventVenueRow] = await db.select().from(settingsTable).where(eq(settingsTable.key, "event_venue")).limit(1);
    const [orgNameRow] = await db.select().from(settingsTable).where(eq(settingsTable.key, "org_name")).limit(1);

    const eventName = eventNameRow?.value ?? "3rd SEAT-MSPTM 2027";
    const eventDate = eventDateRow?.value ?? "22–23 March 2027";
    const eventVenue = eventVenueRow?.value ?? "Sunway Putra Hotel, Kuala Lumpur";
    const orgName = orgNameRow?.value ?? "MSPTM / SEAT Organising Committee";
    const invoiceNumber = "INV-" + reg.registrationCode.replace("REG-", "");
    const issuedDate = new Date(reg.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const delegateName = user ? `${user.firstName} ${user.lastName}` : "—";

    const PDFDocument = (await import("pdfkit")).default;
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoiceNumber}.pdf"`);
    doc.pipe(res);

    // Header band
    doc.rect(0, 0, doc.page.width, 80).fill("#0B2744");
    doc.fillColor("white").fontSize(18).font("Helvetica-Bold")
      .text(eventName, 50, 20, { width: doc.page.width - 100 });
    doc.fillColor("#C89B3C").fontSize(10).font("Helvetica")
      .text(`${eventDate} · ${eventVenue}`, 50, 46);

    doc.fillColor("#0B2744");

    // TAX INVOICE title
    doc.moveDown(3);
    doc.fontSize(22).font("Helvetica-Bold").fillColor("#0B2744").text("TAX INVOICE", { align: "right" });

    // Invoice meta block (right side)
    const metaY = 110;
    doc.fontSize(9).font("Helvetica").fillColor("#6b7a8d");
    doc.text(`Invoice No:`, doc.page.width - 220, metaY, { width: 80 });
    doc.text(`Date Issued:`, doc.page.width - 220, metaY + 16, { width: 80 });
    doc.text(`Status:`, doc.page.width - 220, metaY + 32, { width: 80 });

    doc.font("Helvetica-Bold").fillColor("#0B2744");
    doc.text(invoiceNumber, doc.page.width - 140, metaY, { width: 140 });
    doc.text(issuedDate, doc.page.width - 140, metaY + 16, { width: 140 });
    const statusText = (reg.paymentStatus ?? "pending").toUpperCase();
    const statusColor = reg.paymentStatus === "paid" ? "#16a34a" : reg.paymentStatus === "waived" ? "#0B2744" : "#d97706";
    doc.fillColor(statusColor).text(statusText, doc.page.width - 140, metaY + 32, { width: 140 });

    // Bill To section
    doc.fillColor("#6b7a8d").fontSize(8).font("Helvetica-Bold")
      .text("BILL TO", 50, metaY, { width: 300 });
    doc.fillColor("#0B2744").fontSize(11).font("Helvetica-Bold")
      .text(delegateName, 50, metaY + 14, { width: 300 });
    doc.fillColor("#4a5568").fontSize(9).font("Helvetica");
    if (user?.email) doc.text(user.email, 50, { width: 300 });
    if (user?.institution) doc.text(user.institution, 50, { width: 300 });
    if (user?.country) doc.text(user.country, 50, { width: 300 });

    // Divider
    const dividerY = 220;
    doc.moveTo(50, dividerY).lineTo(doc.page.width - 50, dividerY).strokeColor("#e5e9ef").lineWidth(1).stroke();

    // Table header
    const tableTop = dividerY + 15;
    doc.rect(50, tableTop, doc.page.width - 100, 22).fill("#f7f9fc");
    doc.fillColor("#6b7a8d").fontSize(8).font("Helvetica-Bold");
    doc.text("DESCRIPTION", 60, tableTop + 7, { width: 280 });
    doc.text("QTY", 340, tableTop + 7, { width: 60, align: "center" });
    doc.text("UNIT PRICE (MYR)", 400, tableTop + 7, { width: 100, align: "right" });
    doc.text("TOTAL (MYR)", 500, tableTop + 7, { width: 90, align: "right" });

    // Table row
    const rowY = tableTop + 28;
    doc.fillColor("#0B2744").fontSize(10).font("Helvetica");
    doc.text(`Registration Fee — ${categoryLabel}`, 60, rowY, { width: 280 });
    doc.text("1", 340, rowY, { width: 60, align: "center" });
    const amtStr = invoiceAmount.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    doc.text(amtStr, 400, rowY, { width: 100, align: "right" });
    doc.text(amtStr, 500, rowY, { width: 90, align: "right" });

    // Row divider
    doc.moveTo(50, rowY + 20).lineTo(doc.page.width - 50, rowY + 20).strokeColor("#e5e9ef").lineWidth(0.5).stroke();

    // Total block
    const totalY = rowY + 32;
    doc.fillColor("#6b7a8d").fontSize(9).font("Helvetica").text("Subtotal:", 400, totalY, { width: 100, align: "right" });
    doc.fillColor("#0B2744").text(amtStr, 500, totalY, { width: 90, align: "right" });

    doc.moveTo(400, totalY + 16).lineTo(doc.page.width - 50, totalY + 16).strokeColor("#0B2744").lineWidth(1).stroke();

    doc.fillColor("#0B2744").fontSize(12).font("Helvetica-Bold")
      .text("TOTAL DUE:", 400, totalY + 22, { width: 100, align: "right" });
    doc.fillColor("#C89B3C").fontSize(13).font("Helvetica-Bold")
      .text(`MYR ${amtStr}`, 500, totalY + 20, { width: 90, align: "right" });

    // Registration code
    doc.fillColor("#6b7a8d").fontSize(8).font("Helvetica")
      .text(`Registration Code: ${reg.registrationCode}`, 50, totalY + 26);

    // Footer
    const footerY = doc.page.height - 80;
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor("#e5e9ef").lineWidth(0.5).stroke();
    doc.fillColor("#6b7a8d").fontSize(8).font("Helvetica")
      .text(orgName, 50, footerY + 10, { align: "center", width: doc.page.width - 100 });
    doc.text("This is a computer-generated document. No signature is required.", 50, footerY + 24, { align: "center", width: doc.page.width - 100 });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

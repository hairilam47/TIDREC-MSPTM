import { Router } from "express";
import { db, registrationsTable, abstractsTable, speakersTable, sessionsTable, usersTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/stats/summary", requireAdmin, async (_req, res) => {
  try {
    const [totalRegsResult] = await db.select({ count: count() }).from(registrationsTable);
    const [totalAbstractsResult] = await db.select({ count: count() }).from(abstractsTable);
    const [totalSpeakersResult] = await db.select({ count: count() }).from(speakersTable);
    const [totalSessionsResult] = await db.select({ count: count() }).from(sessionsTable);
    const [pendingPaymentsResult] = await db.select({ count: count() }).from(registrationsTable).where(eq(registrationsTable.paymentStatus, "pending"));
    const [pendingAbstractsResult] = await db.select({ count: count() }).from(abstractsTable).where(eq(abstractsTable.status, "submitted"));
    const [acceptedAbstractsResult] = await db.select({ count: count() }).from(abstractsTable).where(eq(abstractsTable.status, "accepted"));
    const [rejectedAbstractsResult] = await db.select({ count: count() }).from(abstractsTable).where(eq(abstractsTable.status, "rejected"));
    const [revenueResult] = await db.select({ total: sum(registrationsTable.paymentAmount) }).from(registrationsTable).where(eq(registrationsTable.paymentStatus, "paid"));

    const regsByCategory = await db
      .select({ category: registrationsTable.category, count: count() })
      .from(registrationsTable)
      .groupBy(registrationsTable.category);

    const regsByCountryRaw = await db
      .select({ country: usersTable.country, count: count() })
      .from(registrationsTable)
      .innerJoin(usersTable, eq(registrationsTable.userId, usersTable.id))
      .groupBy(usersTable.country);

    res.json({
      totalRegistrations: Number(totalRegsResult.count),
      totalAbstracts: Number(totalAbstractsResult.count),
      totalSpeakers: Number(totalSpeakersResult.count),
      totalSessions: Number(totalSessionsResult.count),
      pendingPayments: Number(pendingPaymentsResult.count),
      pendingAbstracts: Number(pendingAbstractsResult.count),
      acceptedAbstracts: Number(acceptedAbstractsResult.count),
      rejectedAbstracts: Number(rejectedAbstractsResult.count),
      totalRevenue: parseFloat(revenueResult.total ?? "0"),
      registrationsByCategory: regsByCategory.map((r) => ({
        category: r.category,
        count: Number(r.count),
      })),
      registrationsByCountry: regsByCountryRaw
        .filter((r) => r.country)
        .map((r) => ({ country: r.country!, count: Number(r.count) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/registrations-by-month", requireAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select({
        month: sql<string>`to_char(${registrationsTable.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(registrationsTable)
      .groupBy(sql`to_char(${registrationsTable.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${registrationsTable.createdAt}, 'YYYY-MM')`);

    res.json(rows.map((r) => ({ month: r.month, count: Number(r.count) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { Router } from "express";
import { db, registrationsTable, abstractsTable, speakersTable, sessionsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/stats/summary", async (_req, res) => {
  try {
    const [totalRegsResult] = await db.select({ count: count() }).from(registrationsTable);
    const [totalAbstractsResult] = await db.select({ count: count() }).from(abstractsTable);
    const [totalSpeakersResult] = await db.select({ count: count() }).from(speakersTable);
    const [totalSessionsResult] = await db.select({ count: count() }).from(sessionsTable);
    const [pendingPaymentsResult] = await db.select({ count: count() }).from(registrationsTable).where(eq(registrationsTable.paymentStatus, "pending"));
    const [pendingAbstractsResult] = await db.select({ count: count() }).from(abstractsTable).where(eq(abstractsTable.status, "submitted"));

    const regsByCategory = await db
      .select({ category: registrationsTable.category, count: count() })
      .from(registrationsTable)
      .groupBy(registrationsTable.category);

    res.json({
      totalRegistrations: Number(totalRegsResult.count),
      totalAbstracts: Number(totalAbstractsResult.count),
      totalSpeakers: Number(totalSpeakersResult.count),
      totalSessions: Number(totalSessionsResult.count),
      pendingPayments: Number(pendingPaymentsResult.count),
      pendingAbstracts: Number(pendingAbstractsResult.count),
      registrationsByCategory: regsByCategory.map((r) => ({
        category: r.category,
        count: Number(r.count),
      })),
      registrationsByCountry: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

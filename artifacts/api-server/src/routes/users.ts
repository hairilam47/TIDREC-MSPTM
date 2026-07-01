import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "../lib/auth";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    fullName: u.fullName ?? null,
    salutation: u.salutation ?? null,
    salutationOther: u.salutationOther ?? null,
    institution: u.institution ?? null,
    country: u.country ?? null,
    nationality: u.nationality ?? null,
    category: u.category ?? null,
    role: u.role,
    mobileCountryCode: u.mobileCountryCode ?? null,
    mobileNumber: u.mobileNumber ?? null,
    gender: u.gender ?? null,
    dateOfBirth: u.dateOfBirth ?? null,
    isMmaMember: u.isMmaMember ?? null,
    mmcNumber: u.mmcNumber ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", requireSuperAdmin, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users.map(formatUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const body = req.body as Record<string, unknown>;

    const updates: Partial<typeof usersTable.$inferInsert> = {};

    if (body.firstName !== undefined) updates.firstName = String(body.firstName ?? "").trim() || undefined;
    if (body.lastName !== undefined) updates.lastName = String(body.lastName ?? "").trim() || undefined;
    if (body.email !== undefined) {
      const e = String(body.email ?? "").trim().toLowerCase();
      if (e) updates.email = e;
    }
    if (body.institution !== undefined) updates.institution = String(body.institution ?? "").trim() || null;
    if (body.country !== undefined) updates.country = String(body.country ?? "").trim() || null;
    if (body.nationality !== undefined) updates.nationality = String(body.nationality ?? "").trim() || null;
    if (body.category !== undefined) updates.category = String(body.category ?? "").trim() || null;
    if (body.role !== undefined && ["attendee", "admin", "super_admin"].includes(String(body.role))) {
      updates.role = String(body.role) as "attendee" | "admin" | "super_admin";
    }
    if (body.mobileCountryCode !== undefined) updates.mobileCountryCode = String(body.mobileCountryCode ?? "").trim() || null;
    if (body.mobileNumber !== undefined) updates.mobileNumber = String(body.mobileNumber ?? "").trim() || null;
    if (body.gender !== undefined) updates.gender = String(body.gender ?? "").trim() || null;
    if (body.dateOfBirth !== undefined) updates.dateOfBirth = String(body.dateOfBirth ?? "").trim() || null;
    if (body.isMmaMember !== undefined) {
      updates.isMmaMember =
        body.isMmaMember === true || body.isMmaMember === "true" ? true
        : body.isMmaMember === false || body.isMmaMember === "false" ? false
        : null;
    }
    if (body.mmcNumber !== undefined) updates.mmcNumber = String(body.mmcNumber ?? "").trim() || null;
    if (body.salutation !== undefined) updates.salutation = String(body.salutation ?? "").trim() || null;
    if (body.salutationOther !== undefined) updates.salutationOther = String(body.salutationOther ?? "").trim() || null;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }
    updates.updatedAt = new Date();

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

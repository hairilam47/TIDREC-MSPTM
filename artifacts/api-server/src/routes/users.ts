import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { requireSuperAdmin } from "../lib/auth";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    institution: u.institution ?? null,
    country: u.country ?? null,
    category: u.category ?? null,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", requireSuperAdmin, async (_req, res) => {
  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.role, ["admin", "super_admin"]))
      .orderBy(usersTable.createdAt);
    res.json(users.map(formatUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id/name", requireSuperAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { firstName, lastName } = req.body as { firstName?: string; lastName?: string };
    if (!firstName?.trim() && !lastName?.trim()) {
      res.status(400).json({ error: "firstName or lastName required" });
      return;
    }
    const updates: Partial<typeof usersTable.$inferInsert> = {};
    if (firstName?.trim()) updates.firstName = firstName.trim();
    if (lastName?.trim()) updates.lastName = lastName.trim();
    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();
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

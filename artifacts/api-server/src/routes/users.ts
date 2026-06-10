import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

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

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json(users.map(formatUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id));
    const { role } = req.body;
    if (!role || !["attendee", "admin"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set({ role })
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

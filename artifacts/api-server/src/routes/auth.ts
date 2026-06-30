import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

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

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    salutation: user.salutation,
    salutationOther: user.salutationOther,
    mobileCountryCode: user.mobileCountryCode,
    mobileNumber: user.mobileNumber,
    nationality: user.nationality,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    age: computeAge(user.dateOfBirth),
    isMmaMember: user.isMmaMember,
    mmcNumber: user.mmcNumber,
    institution: user.institution,
    country: user.country,
    category: user.category,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res) => {
  try {
    const {
      email, password,
      fullName, salutation, salutationOther,
      mobileCountryCode, mobileNumber,
      nationality, gender, dateOfBirth,
      isMmaMember, mmcNumber,
      institution, country, category,
    } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nameParts = (fullName as string).trim().split(/\s+/);
    const derivedFirstName = nameParts[0] ?? "";
    const derivedLastName = nameParts.slice(1).join(" ") || derivedFirstName;

    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash,
      firstName: derivedFirstName,
      lastName: derivedLastName,
      fullName: fullName || null,
      salutation: salutation || null,
      salutationOther: salutationOther || null,
      mobileCountryCode: mobileCountryCode || null,
      mobileNumber: mobileNumber || null,
      nationality: nationality || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      isMmaMember: isMmaMember ?? null,
      mmcNumber: mmcNumber || null,
      institution: institution || null,
      country: country || null,
      category: category || null,
      role: "attendee",
    }).returning();

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.patch("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      fullName, salutation, salutationOther,
      mobileCountryCode, mobileNumber,
      nationality, gender, dateOfBirth,
      isMmaMember, mmcNumber,
      institution, country,
    } = req.body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (fullName !== undefined) {
      updateData.fullName = fullName || null;
      if (fullName) {
        const parts = (fullName as string).trim().split(/\s+/);
        updateData.firstName = parts[0] ?? "";
        updateData.lastName = (parts.slice(1).join(" ") || parts[0]) ?? "";
      }
    }
    if (salutation !== undefined) updateData.salutation = salutation || null;
    if (salutationOther !== undefined) updateData.salutationOther = salutationOther || null;
    if (mobileCountryCode !== undefined) updateData.mobileCountryCode = mobileCountryCode || null;
    if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber || null;
    if (nationality !== undefined) updateData.nationality = nationality || null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth || null;
    if (isMmaMember !== undefined) updateData.isMmaMember = isMmaMember ?? null;
    if (mmcNumber !== undefined) updateData.mmcNumber = mmcNumber || null;
    if (institution !== undefined) updateData.institution = institution || null;
    if (country !== undefined) updateData.country = country || null;

    const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, req.user!.userId)).returning();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { pgTable, serial, text, timestamp, pgEnum, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["attendee", "admin", "super_admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  institution: text("institution"),
  country: text("country"),
  category: text("category"),
  role: userRoleEnum("role").notNull().default("attendee"),
  salutation: text("salutation"),
  salutationOther: text("salutation_other"),
  fullName: text("full_name"),
  mobileCountryCode: text("mobile_country_code"),
  mobileNumber: text("mobile_number"),
  nationality: text("nationality"),
  gender: text("gender"),
  dateOfBirth: date("date_of_birth"),
  isMmaMember: boolean("is_mma_member"),
  mmcNumber: text("mmc_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

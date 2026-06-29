import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "overdue",
  "waived",
]);

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  category: text("category").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentAmount: numeric("payment_amount", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method"),
  registrationCode: text("registration_code").notNull().unique(),
  dietaryRequirements: text("dietary_requirements"),
  specialNeeds: text("special_needs"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  registrationCode: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;

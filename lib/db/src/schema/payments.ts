import { pgTable, serial, integer, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { registrationsTable } from "./registrations";
import { usersTable } from "./users";

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "credit_card",
  "online_banking",
  "waiver",
]);

export const paymentTransactionStatusEnum = pgEnum("payment_transaction_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull().references(() => registrationsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MYR"),
  paymentMethod: paymentMethodEnum("payment_method"),
  transactionStatus: paymentTransactionStatusEnum("transaction_status").notNull().default("pending"),
  transactionReference: text("transaction_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;

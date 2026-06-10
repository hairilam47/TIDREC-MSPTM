import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { registrationsTable } from "./registrations";

export const paymentRemindersTable = pgTable("payment_reminders", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull().references(() => registrationsTable.id, { onDelete: "cascade" }),
  sentBy: text("sent_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PaymentReminder = typeof paymentRemindersTable.$inferSelect;

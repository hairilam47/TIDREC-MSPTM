import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { abstractsTable } from "./abstracts";

export const abstractHistoryTable = pgTable("abstract_history", {
  id: serial("id").primaryKey(),
  abstractId: integer("abstract_id").notNull().references(() => abstractsTable.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: text("changed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AbstractHistory = typeof abstractHistoryTable.$inferSelect;

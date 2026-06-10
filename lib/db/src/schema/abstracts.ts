import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const abstractTypeEnum = pgEnum("abstract_type", ["oral", "poster"]);
export const abstractStatusEnum = pgEnum("abstract_status", [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
  "revision_requested",
]);

export const abstractsTable = pgTable("abstracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  abstractType: abstractTypeEnum("abstract_type").notNull(),
  keywords: text("keywords"),
  coAuthors: text("co_authors"),
  status: abstractStatusEnum("status").notNull().default("submitted"),
  reviewNotes: text("review_notes"),
  abstractCode: text("abstract_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAbstractSchema = createInsertSchema(abstractsTable).omit({
  id: true,
  abstractCode: true,
  status: true,
  reviewNotes: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAbstract = z.infer<typeof insertAbstractSchema>;
export type Abstract = typeof abstractsTable.$inferSelect;

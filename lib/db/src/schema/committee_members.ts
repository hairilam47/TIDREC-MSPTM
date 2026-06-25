import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const committeeMembersTable = pgTable("committee_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  photoUrl: text("photo_url"),
  initials: text("initials").notNull(),
  committeeLevel: text("committee_level").notNull(),
  subcommitteeName: text("subcommittee_name"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCommitteeMemberSchema = createInsertSchema(committeeMembersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCommitteeMember = z.infer<typeof insertCommitteeMemberSchema>;
export type CommitteeMember = typeof committeeMembersTable.$inferSelect;

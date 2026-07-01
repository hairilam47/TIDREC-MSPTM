import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { speakersTable } from "./speakers";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const programmeSessionsTable = pgTable("programme_sessions", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  dayLabel: text("day_label").notNull(),
  timeSlot: text("time_slot").notNull(),
  kind: text("kind").notNull(),
  sessionType: text("session_type").notNull(),
  title: text("title"),
  location: text("location"),
  trackATitle: text("track_a_title"),
  trackALocation: text("track_a_location"),
  trackBTitle: text("track_b_title"),
  trackBLocation: text("track_b_location"),
  speakerId: integer("speaker_id").references(() => speakersTable.id),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProgrammeSessionSchema = createInsertSchema(programmeSessionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProgrammeSession = z.infer<typeof insertProgrammeSessionSchema>;
export type ProgrammeSessionRow = typeof programmeSessionsTable.$inferSelect;

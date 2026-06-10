import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const speakersTable = pgTable("speakers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  institution: text("institution"),
  topic: text("topic").notNull(),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  initials: text("initials").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSpeakerSchema = createInsertSchema(speakersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSpeaker = z.infer<typeof insertSpeakerSchema>;
export type Speaker = typeof speakersTable.$inferSelect;

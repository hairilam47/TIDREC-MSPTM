import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sponsorTierEnum = pgEnum("sponsor_tier", [
  "platinum",
  "gold",
  "silver",
  "bronze",
]);

export const sponsorsTable = pgTable("sponsors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tier: sponsorTierEnum("tier").notNull(),
  logoUrl: text("logo_url"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSponsorSchema = createInsertSchema(sponsorsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type Sponsor = typeof sponsorsTable.$inferSelect;

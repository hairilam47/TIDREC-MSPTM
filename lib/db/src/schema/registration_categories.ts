import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const registrationCategoriesTable = pgTable("registration_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  priceMyr: numeric("price_myr", { precision: 10, scale: 2 }).notNull().default("0"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RegistrationCategoryRow = typeof registrationCategoriesTable.$inferSelect;
export type InsertRegistrationCategory = typeof registrationCategoriesTable.$inferInsert;

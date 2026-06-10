import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { sessionsTable } from "./sessions";

export const savedSessionsTable = pgTable("saved_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  unique("saved_sessions_user_session_unique").on(t.userId, t.sessionId),
]);

export type SavedSession = typeof savedSessionsTable.$inferSelect;

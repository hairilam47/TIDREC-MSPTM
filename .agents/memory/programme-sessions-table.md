---
name: Programme sessions table
description: Notes on the programme_sessions DB table and how it was migrated.
---

## Rule
Do NOT use `drizzle-kit push` for schema migrations in this project's CI/shell — it blocks on an interactive TTY prompt even with `--force`. Use raw SQL via `executeSql` (code_execution sandbox) instead.

**Why:** drizzle-kit 0.31.x's `push` command prompts the user for confirmation when there are potential data-loss changes (e.g. adding a unique constraint to a non-empty table), and it cannot be suppressed in a non-TTY shell.

**How to apply:** When adding a new table or column, write the `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ADD COLUMN IF NOT EXISTS` SQL and run it via `executeSql`. Keep the drizzle schema file in sync (source of truth for TypeScript types), but don't rely on push for actual migration.

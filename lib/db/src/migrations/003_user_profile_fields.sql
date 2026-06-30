-- Migration: Expand users table with full profile fields
-- Run against the database before deploying Task #145 (Expand Registration Profile).
-- All new columns are nullable for backward compatibility with existing rows.
-- NOTE: This migration was already applied to the development database via raw SQL
--       (drizzle-kit push is blocked on TTY prompts in the Replit environment).

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS salutation       TEXT,
  ADD COLUMN IF NOT EXISTS salutation_other TEXT,
  ADD COLUMN IF NOT EXISTS full_name        TEXT,
  ADD COLUMN IF NOT EXISTS mobile_country_code TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number    TEXT,
  ADD COLUMN IF NOT EXISTS nationality      TEXT,
  ADD COLUMN IF NOT EXISTS gender           TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
  ADD COLUMN IF NOT EXISTS is_mma_member    BOOLEAN,
  ADD COLUMN IF NOT EXISTS mmc_number       TEXT;

-- Make legacy first_name / last_name nullable (were previously NOT NULL).
ALTER TABLE users
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name  DROP NOT NULL;

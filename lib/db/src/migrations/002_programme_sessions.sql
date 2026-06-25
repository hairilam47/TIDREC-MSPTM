-- Migration: create programme_sessions table
-- Run this SQL against the database before deploying the programme CMS.

CREATE TABLE IF NOT EXISTS programme_sessions (
  id          SERIAL PRIMARY KEY,
  day         INTEGER NOT NULL,
  day_label   TEXT NOT NULL,
  time_slot   TEXT NOT NULL,
  kind        TEXT NOT NULL,
  session_type TEXT NOT NULL,
  title       TEXT,
  location    TEXT,
  track_a_title     TEXT,
  track_a_location  TEXT,
  track_b_title     TEXT,
  track_b_location  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

import Database from "better-sqlite3";

/**
 * Database §5, §9, §10 — exact schema, constraints, and indexes for the
 * `tickets` table. Idempotent: safe to run on every application startup
 * (Database §15).
 */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL
    CHECK (priority IN ('low', 'medium', 'high')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON tickets (priority);
`;

export function initializeSchema(db: Database.Database): void {
  db.exec(SCHEMA_SQL);
}

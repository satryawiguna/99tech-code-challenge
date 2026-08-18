import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Opens (creating if needed) the SQLite database file at `databaseUrl`.
 * `:memory:` is supported for isolated test databases (Implementation Decision #9).
 */
export function createConnection(databaseUrl: string): Database.Database {
  if (databaseUrl !== ":memory:") {
    const dir = path.dirname(databaseUrl);
    if (dir && dir !== "." && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(databaseUrl);
  if (databaseUrl !== ":memory:") {
    db.pragma("journal_mode = WAL");
  }
  db.pragma("foreign_keys = ON");
  return db;
}

import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dataDir, dbPath } from "./paths.js";

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

export function migrateDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      summary TEXT NOT NULL,
      dealbreakers TEXT NOT NULL,
      preferences TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      religion TEXT NOT NULL,
      caste TEXT NOT NULL,
      sect TEXT NOT NULL,
      religiosity TEXT NOT NULL,
      food TEXT NOT NULL,
      alcohol TEXT NOT NULL,
      smoking TEXT NOT NULL,
      family TEXT NOT NULL,
      marriage_horizon TEXT NOT NULL,
      psychometric TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS decisions (
      profile_id TEXT PRIMARY KEY,
      action TEXT NOT NULL CHECK(action IN ('approve', 'remove')),
      override_reason TEXT DEFAULT '',
      updated_at TEXT NOT NULL,
      FOREIGN KEY(profile_id) REFERENCES profiles(id)
    );
  `);

  const profileColumns = db.prepare("PRAGMA table_info(profiles)").all();
  const hasCreatedAt = profileColumns.some((column) => column.name === "created_at");

  if (!hasCreatedAt) {
    db.exec("ALTER TABLE profiles ADD COLUMN created_at TEXT");
    db.prepare("UPDATE profiles SET created_at = ? WHERE created_at IS NULL").run(new Date().toISOString());
  }
}

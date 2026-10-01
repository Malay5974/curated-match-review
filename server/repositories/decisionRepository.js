import { db } from "../config/database.js";

export function getAllDecisions() {
  return db.prepare("SELECT * FROM decisions").all();
}

export function upsertDecision({ profileId, action, overrideReason }) {
  db.prepare(`
    INSERT INTO decisions (profile_id, action, override_reason, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(profile_id) DO UPDATE SET
      action = excluded.action,
      override_reason = excluded.override_reason,
      updated_at = excluded.updated_at
  `).run(profileId, action, overrideReason);
}

export function deleteAllDecisions() {
  db.prepare("DELETE FROM decisions").run();
}

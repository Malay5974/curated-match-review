import { db } from "../config/database.js";

export function countProfiles() {
  return db.prepare("SELECT COUNT(*) AS count FROM profiles").get().count;
}

export function insertSeedProfile(profile) {
  db.prepare(`
    INSERT INTO profiles (
      id, name, title, city, country, religion, caste, sect, religiosity,
      food, alcohol, smoking, family, marriage_horizon, psychometric, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(...profile);
}

export function insertProfile(profile) {
  db.prepare(`
    INSERT INTO profiles (
      id, name, title, city, country, religion, caste, sect, religiosity,
      food, alcohol, smoking, family, marriage_horizon, psychometric, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profile.id,
    profile.name,
    profile.title,
    profile.city,
    profile.country,
    profile.religion,
    profile.caste,
    profile.sect,
    profile.religiosity,
    profile.food,
    profile.alcohol,
    profile.smoking,
    profile.family,
    profile.marriageHorizon,
    profile.psychometric,
    profile.createdAt
  );
}

export function getAllProfiles() {
  return db.prepare("SELECT * FROM profiles ORDER BY id").all();
}

export function getProfileById(profileId) {
  return db.prepare("SELECT id FROM profiles WHERE id = ?").get(profileId);
}

export function deleteAllProfiles() {
  db.prepare("DELETE FROM profiles").run();
}

export function serializeProfile(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    city: row.city,
    country: row.country,
    religion: row.religion,
    caste: row.caste,
    sect: row.sect,
    religiosity: row.religiosity,
    food: row.food,
    alcohol: row.alcohol,
    smoking: row.smoking,
    family: row.family,
    marriageHorizon: row.marriage_horizon,
    psychometric: row.psychometric,
    createdAt: row.created_at
  };
}

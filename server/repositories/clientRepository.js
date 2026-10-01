import { db } from "../config/database.js";

export function countClients() {
  return db.prepare("SELECT COUNT(*) AS count FROM clients").get().count;
}

export function insertClient(client) {
  db.prepare("INSERT INTO clients VALUES (?, ?, ?, ?, ?)").run(
    client.id,
    client.name,
    client.summary,
    JSON.stringify(client.dealbreakers),
    JSON.stringify(client.preferences)
  );
}

export function getFirstClient() {
  return db.prepare("SELECT * FROM clients LIMIT 1").get();
}

export function deleteAllClients() {
  db.prepare("DELETE FROM clients").run();
}

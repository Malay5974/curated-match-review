import { createApp } from "./app.js";
import { migrateDatabase } from "./config/database.js";
import { seedDemoData } from "./use-cases/seedDemoData.js";

const port = process.env.PORT || 5184;

migrateDatabase();
seedDemoData();

const app = createApp();

const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Match review API running on http://127.0.0.1:${port}`);
});

server.on("error", (error) => {
  console.error("Failed to start Match review API:", error.message);
  process.exit(1);
});

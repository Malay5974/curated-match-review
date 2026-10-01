import { createApp } from "../server/app.js";
import { migrateDatabase } from "../server/config/database.js";
import { seedDemoData } from "../server/use-cases/seedDemoData.js";

migrateDatabase();
seedDemoData();

export default createApp();

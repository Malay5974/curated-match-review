import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const serverDir = dirname(fileURLToPath(import.meta.url));
export const rootDir = join(serverDir, "..", "..");
export const dataDir = join(rootDir, "data");
export const dbPath = join(dataDir, "match-review.sqlite");

import express from "express";
import { join } from "node:path";
import { rootDir } from "./config/paths.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use("/api", reviewRoutes);

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(join(rootDir, "dist")));
    app.get("*splat", (_req, res) => {
      res.sendFile(join(rootDir, "dist", "index.html"));
    });
  }

  return app;
}

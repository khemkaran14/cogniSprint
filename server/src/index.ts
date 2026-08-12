import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./lib/db.js";
import mongoose from "mongoose";
import { validateEnvironment } from "./lib/env.js";
const PORT = Number(process.env.PORT) || 4000;

async function start() {
  validateEnvironment();
  await connectDB();
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.info(`[server] listening on http://localhost:${PORT}`);
  });
  const shutdown = (signal: string) => {
    console.info(`[server] ${signal} received; shutting down`);
    server.close(() => void mongoose.disconnect().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./lib/db.js";
import mongoose from "mongoose";
import { validateEnvironment } from "./lib/env.js";
import { flushLogs, logger } from "./lib/logger.js";
const PORT = Number(process.env.PORT) || 4000;

async function start() {
  validateEnvironment();
  await connectDB();
  const app = createApp();
  const server = app.listen(PORT, () => {
    logger.info("server_started", { port: PORT });
  });
  const shutdown = (signal: string) => {
    logger.info("server_shutdown_started", { signal });
    server.close(() => void mongoose.disconnect().then(() => flushLogs()).finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (error) => logger.error("unhandled_rejection", { error }));
process.on("uncaughtException", (error) => { logger.error("uncaught_exception", { error }); void flushLogs().finally(() => process.exit(1)); });
start().catch((error) => { logger.error("server_start_failed", { error }); void flushLogs().finally(() => process.exit(1)); });

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { validateEnvironment } from "../lib/env.js";
import { migrations } from "./index.js";
import { mongooseMigrationStore, runMigrations } from "./runner.js";

async function main() {
  const command = process.argv[2] ?? "up";
  if (!["up", "status"].includes(command)) throw new Error("Usage: npm run migrate -- [up|status]");
  validateEnvironment();
  await connectDB();
  try {
    const result = await runMigrations({
      migrations,
      store: mongooseMigrationStore(),
      dryRun: command === "status",
      log: (message) => console.info(`[migrate] ${message}`),
    });
    if (command === "status") {
      console.info(result.pending.length ? `[migrate] pending:\n${result.pending.join("\n")}` : "[migrate] database is current");
    } else if (!result.applied.length) {
      console.info("[migrate] database is current");
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("[migrate] failed:", error);
  process.exit(1);
});

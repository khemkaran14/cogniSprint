import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./lib/db.js";
import { validateEnvironment } from "./lib/env.js";
const PORT = Number(process.env.PORT) || 4000;

async function start() {
  validateEnvironment();
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.info(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

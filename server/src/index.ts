import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./lib/db.js";
import { validateEnvironment } from "./lib/env.js";
import { catalogueRouter } from "./routes/catalogue.js";
import { newsletterRouter } from "./routes/newsletter.js";
import { contactRouter } from "./routes/contact.js";
import { challengeRouter } from "./routes/challenge.js";
import { checkoutRouter } from "./routes/checkout.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { authRouter } from "./routes/auth.js";
import { publicFormLimiter, checkoutLimiter, authLimiter } from "./middleware/rateLimit.js";

const app = express();
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

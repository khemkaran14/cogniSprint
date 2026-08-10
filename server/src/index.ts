import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./lib/db.js";
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
const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(
  helmet({
    contentSecurityPolicy: false, // the client app (served separately) owns its own CSP
  })
);
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Razorpay webhooks need the raw request body to verify the HMAC signature,
// so that route is mounted with express.raw() before the JSON body parser
// would otherwise consume the stream.
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", catalogueRouter);
app.use("/api/newsletter", publicFormLimiter, newsletterRouter);
app.use("/api/contact", publicFormLimiter, contactRouter);
app.use("/api/challenge", publicFormLimiter, challengeRouter);
app.use("/api/checkout", checkoutLimiter, checkoutRouter);
app.use("/api/auth", authLimiter, authRouter);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.info(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

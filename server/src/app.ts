import express from "express";
import cors from "cors";
import helmet from "helmet";
import { catalogueRouter } from "./routes/catalogue.js";
import { newsletterRouter } from "./routes/newsletter.js";
import { contactRouter } from "./routes/contact.js";
import { challengeRouter } from "./routes/challenge.js";
import { checkoutRouter } from "./routes/checkout.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { authRouter } from "./routes/auth.js";
import { entitlementsRouter } from "./routes/entitlements.js";
import { learningRouter } from "./routes/learning.js";
import { certificatesRouter } from "./routes/certificates.js";
import { assessmentsRouter } from "./routes/assessments.js";
import { publicFormLimiter, checkoutLimiter, authLimiter } from "./middleware/rateLimit.js";
import { requestContext } from "./middleware/requestContext.js";
import { isDBConnected } from "./lib/db.js";
import { allowedOrigins, requireTrustedOrigin } from "./lib/security.js";

export function createApp() {
  const app = express();
  const origins = allowedOrigins();

  app.use(
    helmet({
      contentSecurityPolicy: false, // the client app (served separately) owns its own CSP
    })
  );
  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
      callback(new Error("CORS origin is not allowed"));
    },
    credentials: true,
  }));

  // Razorpay webhooks need the raw request body to verify the HMAC signature,
  // so that route is mounted with express.raw() before the JSON body parser.
  app.use("/api/webhooks", express.raw({ type: "application/json" }), webhooksRouter);
  app.use(express.json({ limit: "100kb" }));
  app.use(requireTrustedOrigin);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/ready", (_req, res) => {
    const ready = isDBConnected();
    res.status(ready ? 200 : 503).json({ status: ready ? "ready" : "not_ready", database: ready ? "connected" : "disconnected" });
  });

  app.use("/api", catalogueRouter);
  app.use("/api/newsletter", publicFormLimiter, newsletterRouter);
  app.use("/api/contact", publicFormLimiter, contactRouter);
  app.use("/api/challenge", publicFormLimiter, challengeRouter);
  app.use("/api/checkout", checkoutLimiter, checkoutRouter);
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/entitlements", entitlementsRouter);
  app.use("/api/learning", learningRouter);
  app.use("/api/certificates", certificatesRouter);
  app.use("/api/assessments", assessmentsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(JSON.stringify({ type: "request_error", requestId: res.locals.requestId, message: err.message }));
    res.status(500).json({ error: "Internal server error.", requestId: res.locals.requestId });
  });

  return app;
}

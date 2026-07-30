import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { startPlanExpiryJob } from "./jobs/planExpiry.js";
import { sitemapRouter } from "./routes/sitemapRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// CSP is left off because it would need to be hand-tuned for the Razorpay
// checkout script and the React app's inline bundle; the other protections
// (frameguard, noSniff, HSTS, etc.) stay on.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use("/api", apiLimiter);

// The Razorpay webhook needs the exact raw request body to verify its
// signature, so capture it here before express.json() parses everything else.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(sitemapRouter);

// In production, serve the built React app from the same process so the whole
// site runs behind a single Node process (simple to host on a Hostinger VPS
// with PM2 + Nginx as a reverse proxy).
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`AI Career Shield API listening on port ${PORT}`));
    startPlanExpiryJob();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

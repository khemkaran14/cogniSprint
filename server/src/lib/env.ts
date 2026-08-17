const PLACEHOLDER_MARKERS = ["<db_password>", "<password>", "replace-with-"];

function containsPlaceholder(value: string): boolean {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

function requireHttpUrl(name: string, value: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a plain URL, for example http://localhost:5173.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${name} must use http:// or https://.`);
  }
}

/** Fail early with actionable messages for common .env copy/paste mistakes. */
export function validateEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  const mongoUri = env.MONGODB_URI?.trim();
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set. Copy server/.env.example to server/.env and configure it.");
  }
  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
  }
  if (containsPlaceholder(mongoUri)) {
    throw new Error("MONGODB_URI still contains a placeholder. Replace <db_password> with the database user's URL-encoded password.");
  }

  if (env.CLIENT_URL) {
    for (const value of env.CLIENT_URL.split(",").map((item) => item.trim())) requireHttpUrl("CLIENT_URL", value);
  }
  if (env.LOG_DRAIN_URL) requireHttpUrl("LOG_DRAIN_URL", env.LOG_DRAIN_URL);
  if (env.NODE_ENV === "production" && env.LOG_DRAIN_URL?.startsWith("http://")) throw new Error("LOG_DRAIN_URL must use https:// in production.");

  if (env.COOKIE_SAME_SITE && !["lax", "none"].includes(env.COOKIE_SAME_SITE.toLowerCase())) {
    throw new Error("COOKIE_SAME_SITE must be lax or none.");
  }
  if (env.COOKIE_DOMAIN && !env.COOKIE_DOMAIN.startsWith(".")) {
    throw new Error("COOKIE_DOMAIN must start with a dot, for example .cognisprint.com.");
  }

  const razorpayKeyId = env.RAZORPAY_KEY_ID?.trim();
  const razorpayKeySecret = env.RAZORPAY_KEY_SECRET?.trim();
  if (Boolean(razorpayKeyId) !== Boolean(razorpayKeySecret)) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must either both be set or both be empty.");
  }
  if (razorpayKeyId && !/^rzp_(test|live)_/.test(razorpayKeyId)) {
    throw new Error("RAZORPAY_KEY_ID must be a Razorpay test or live key ID.");
  }
  if (env.NODE_ENV === "production" && razorpayKeyId && !env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is required when Razorpay is enabled in production.");
  }
}

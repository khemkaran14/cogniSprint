import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  return (env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function sessionCookieAttributes(env: NodeJS.ProcessEnv = process.env): string {
  const production = env.NODE_ENV === "production";
  const sameSite = env.COOKIE_SAME_SITE?.toLowerCase() === "none" ? "None" : "Lax";
  const parts = ["HttpOnly", "Path=/", `SameSite=${sameSite}`];
  if (production || sameSite === "None") parts.push("Secure");
  if (env.COOKIE_DOMAIN) parts.push(`Domain=${env.COOKIE_DOMAIN}`);
  return parts.join("; ");
}

/** Reject browser state-changing requests from origins outside the configured client allowlist. */
export function requireTrustedOrigin(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.header("origin");
  if (!origin) return next(); // non-browser clients and signed provider webhooks
  if (!allowedOrigins().includes(origin.replace(/\/$/, ""))) {
    return res.status(403).json({ error: "Request origin is not allowed." });
  }
  next();
}

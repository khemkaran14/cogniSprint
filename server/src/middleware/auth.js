import { verifyToken, AUTH_COOKIE_NAME } from "../utils/token.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user || user.status === "banned") {
      return res.status(401).json({ message: "Not authenticated" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Not authenticated" });
  }
}

// Attaches req.user if a valid session cookie is present, but never blocks the request.
// Used on public content routes so answer visibility can vary by plan.
export async function attachUserIfPresent(req, _res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (user && user.status !== "banned") req.user = user;
    next();
  } catch {
    next();
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

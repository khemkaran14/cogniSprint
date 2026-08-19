import type { Request, Response, NextFunction } from "express";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "../lib/auth.js";
import { User } from "../models/User.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

/** Reads the session cookie and attaches userId/userRole if valid. Never rejects the request itself. */
export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) return next();

  const payload = verifyAuthToken(token);
  if (!payload) return next();

  req.userId = payload.sub;
  req.userRole = payload.role;
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId || !req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }
    next();
  };
}

/** Re-derives the current role from the database rather than trusting the JWT claim, for privilege-sensitive routes. */
export function requireFreshRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: "Please log in to continue." });
    const user = await User.findById(req.userId).select("role").lean();
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }
    next();
  };
}

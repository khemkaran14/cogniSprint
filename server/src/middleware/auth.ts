import type { NextFunction, Request, Response } from "express";
import { hashToken } from "../lib/auth.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";

export const SESSION_COOKIE = "cognisprint_session";

function cookieValue(header: string | undefined, name: string): string | undefined {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function currentUser(req: Request) {
  const token = cookieValue(req.headers.cookie, SESSION_COOKIE);
  if (!token) return null;
  const session = await Session.findOne({ tokenHash: hashToken(decodeURIComponent(token)), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  if (!session.lastSeenAt || Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) void session.updateOne({ lastSeenAt: new Date() });
  (req as Request & { sessionId?: string }).sessionId = String(session._id);
  return User.findOne({ _id: session.userId, status: "active" }).select("+adminPermissions");
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await currentUser(req);
    if (!user) return res.status(401).json({ error: "Please sign in to continue." });
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

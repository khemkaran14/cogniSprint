import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "./auth.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (error?: unknown) => {
    if (error) return next(error);
    if (res.headersSent) return;
    if (res.locals.user.role !== "admin") return res.status(403).json({ error: "Administrator access is required." });
    next();
  });
}

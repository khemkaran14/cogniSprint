import type { NextFunction, Request, Response } from "express";
import { requireAuth } from "./auth.js";

export const adminPermissions = ["dashboard:view", "users:manage", "payments:manage", "content:manage", "resources:manage", "email:manage", "alerts:manage", "privacy:manage", "certificates:manage"] as const;
export type AdminPermission = typeof adminPermissions[number];

export function permissionForAdminRequest(method: string, path: string): AdminPermission {
  if (path.startsWith("/users")) return "users:manage";
  if (path.startsWith("/orders") || path.startsWith("/disputes") || path.startsWith("/reconciliation")) return "payments:manage";
  if (path.startsWith("/content")) return "content:manage";
  if (path.startsWith("/resources")) return "resources:manage";
  if (path.startsWith("/email-deliveries")) return "email:manage";
  if (path.startsWith("/alerts")) return "alerts:manage";
  if (path.startsWith("/privacy-requests")) return "privacy:manage";
  if (path.startsWith("/certificates")) return "certificates:manage";
  return "dashboard:view";
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (error?: unknown) => {
    if (error) return next(error);
    if (res.headersSent) return;
    if (res.locals.user.role !== "admin") return res.status(403).json({ error: "Administrator access is required." });
    const required = permissionForAdminRequest(req.method, req.path);
    const permissions = res.locals.user.adminPermissions as string[] | undefined;
    if (!permissions?.includes("*") && !permissions?.includes(required)) return res.status(403).json({ error: `Administrator permission ${required} is required.` });
    next();
  });
}

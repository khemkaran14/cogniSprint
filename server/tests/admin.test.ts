import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { requireAdmin } from "../src/middleware/admin.js";
import { AuditEvent } from "../src/models/AuditEvent.js";

vi.mock("../src/middleware/auth.js", () => ({ requireAuth: (_req: Request, res: Response, next: (error?: unknown) => void) => { res.locals.user = res.locals.testUser; next(); } }));

describe("admin authorization", () => {
  it("rejects an authenticated learner", () => {
    const status = vi.fn().mockReturnThis(); const json = vi.fn();
    const res = { locals: { testUser: { role: "learner" } }, headersSent: false, status, json } as unknown as Response;
    requireAdmin({} as Request, res, vi.fn());
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: "Administrator access is required." });
  });

  it("allows an authenticated administrator", () => {
    const next = vi.fn();
    requireAdmin({} as Request, { locals: { testUser: { role: "admin" } }, headersSent: false } as unknown as Response, next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("AuditEvent", () => {
  it("indexes target history and recent activity", () => {
    const indexes = AuditEvent.schema.indexes();
    expect(indexes.some(([keys]) => keys.createdAt === -1)).toBe(true);
    expect(indexes.some(([keys]) => keys.targetType === 1 && keys.targetId === 1 && keys.createdAt === -1)).toBe(true);
  });
});

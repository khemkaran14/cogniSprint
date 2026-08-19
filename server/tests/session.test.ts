import { describe, expect, it } from "vitest";
import { Session } from "../src/models/Session.js";

describe("Session", () => {
  it("stores device activity without storing a raw session token", () => {
    expect(Session.schema.path("tokenHash")).toBeDefined();
    expect(Session.schema.path("userAgent")).toBeDefined();
    expect(Session.schema.path("ipAddress")).toBeDefined();
    expect(Session.schema.path("lastSeenAt")).toBeDefined();
    expect(Session.schema.path("token")).toBeUndefined();
  });

  it("indexes owner session activity", () => {
    expect(Session.schema.indexes().some(([keys]) => keys.userId === 1 && keys.lastSeenAt === -1)).toBe(true);
  });
});

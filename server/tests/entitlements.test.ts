import { describe, it, expect } from "vitest";
import { computeExpiresAt } from "../src/lib/entitlements.js";

describe("computeExpiresAt", () => {
  it("returns undefined (no expiry) for lifetime access", () => {
    expect(computeExpiresAt("lifetime", undefined)).toBeUndefined();
  });

  it("returns undefined for subscription access (renewal not modelled yet)", () => {
    expect(computeExpiresAt("subscription", undefined)).toBeUndefined();
  });

  it("returns a date roughly 365 days out for one_year access", () => {
    const before = Date.now();
    const expiresAt = computeExpiresAt("one_year", undefined);
    expect(expiresAt).toBeDefined();
    const daysOut = (expiresAt!.getTime() - before) / (24 * 60 * 60 * 1000);
    expect(daysOut).toBeGreaterThan(364.9);
    expect(daysOut).toBeLessThan(365.1);
  });

  it("returns a date offset by accessDurationDays for fixed_days access", () => {
    const before = Date.now();
    const expiresAt = computeExpiresAt("fixed_days", 30);
    expect(expiresAt).toBeDefined();
    const daysOut = (expiresAt!.getTime() - before) / (24 * 60 * 60 * 1000);
    expect(daysOut).toBeGreaterThan(29.9);
    expect(daysOut).toBeLessThan(30.1);
  });

  it("falls back to no expiry for fixed_days without a day count", () => {
    expect(computeExpiresAt("fixed_days", undefined)).toBeUndefined();
  });
});

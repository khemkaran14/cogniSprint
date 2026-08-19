import { describe, expect, it } from "vitest";
import { OperationalAlert } from "../src/models/OperationalAlert.js";
describe("OperationalAlert", () => {
  it("enforces operational categories and lifecycle states", () => { expect((OperationalAlert.schema.path("category") as unknown as { enumValues: string[] }).enumValues).toContain("entitlement_mismatch"); expect((OperationalAlert.schema.path("status") as unknown as { enumValues: string[] }).enumValues).toEqual(["open", "acknowledged", "resolved"]); });
  it("indexes fingerprints and the operations queue", () => { expect(OperationalAlert.schema.path("fingerprint").options.unique).toBe(true); expect(OperationalAlert.schema.indexes().some(([keys]) => keys.status === 1 && keys.severity === 1 && keys.lastSeenAt === -1)).toBe(true); });
});

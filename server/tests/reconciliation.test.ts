import { describe, expect, it } from "vitest";
import { reconcileOrderState } from "../src/lib/reconciliation.js";
import { ReconciliationRun } from "../src/models/ReconciliationRun.js";
describe("payment reconciliation", () => {
  it("repairs provider-paid local pending orders", () => { expect(reconcileOrderState({ status: "pending", amount: 99900 }, { status: "paid", amount: 99900 }).action).toBe("mark_paid"); });
  it("requires review on amount mismatch or provider outage", () => { expect(reconcileOrderState({ status: "pending", amount: 99900 }, { status: "paid", amount: 100 }).action).toBe("review"); expect(reconcileOrderState({ status: "pending", amount: 99900 }, null).action).toBe("review"); });
  it("leaves matching paid state unchanged", () => { expect(reconcileOrderState({ status: "paid", amount: 99900 }, { status: "paid", amount: 99900 }).action).toBe("none"); });
  it("indexes reconciliation history", () => { expect(ReconciliationRun.schema.indexes().some(([keys]) => keys.createdAt === -1)).toBe(true); });
});

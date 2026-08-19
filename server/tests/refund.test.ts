import { describe, expect, it } from "vitest";
import { Refund } from "../src/models/Refund.js";
import { Order } from "../src/models/Order.js";
import { canRestoreEntitlementFromOrder } from "../src/lib/entitlements.js";

describe("Refund records", () => {
  it("requires positive amounts and bounded lifecycle state", () => {
    const refund = new Refund({ amount: 0, currency: "INR", reason: "Customer request", status: "unknown" });
    const error = refund.validateSync();
    expect(error?.errors.amount).toBeDefined();
    expect(error?.errors.status).toBeDefined();
  });
  it("supports partial refund order state and totals", () => {
    expect((Order.schema.path("status") as unknown as { enumValues: string[] }).enumValues).toContain("partially_refunded");
    expect(Order.schema.path("refundedAmount")).toBeDefined();
  });
  it("indexes provider IDs and order history", () => {
    expect(Refund.schema.path("providerRefundId").options.unique).toBe(true);
    expect(Refund.schema.indexes().some(([keys]) => keys.orderId === 1 && keys.createdAt === -1)).toBe(true);
  });
  it("only restores access for qualifying paid order states", () => {
    expect(canRestoreEntitlementFromOrder({ status: "paid" })).toBe(true);
    expect(canRestoreEntitlementFromOrder({ status: "partially_refunded" })).toBe(true);
    expect(canRestoreEntitlementFromOrder({ status: "refunded" })).toBe(false);
    expect(canRestoreEntitlementFromOrder({ status: "chargeback" })).toBe(false);
  });
});

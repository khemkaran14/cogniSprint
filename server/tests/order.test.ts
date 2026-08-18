import { describe, expect, it } from "vitest";
import { Order } from "../src/models/Order.js";

describe("Order history", () => {
  it("tracks payment and refund lifecycle timestamps", () => {
    expect(Order.schema.path("paidAt")).toBeDefined();
    expect(Order.schema.path("refundedAt")).toBeDefined();
  });

  it("indexes owner-scoped newest-first history", () => {
    expect(Order.schema.indexes().some(([keys]) => keys.userId === 1 && keys.createdAt === -1)).toBe(true);
  });
});

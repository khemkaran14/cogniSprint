import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { Entitlement } from "../src/models/Entitlement.js";
import { Order } from "../src/models/Order.js";

describe("payment ownership and entitlement schemas", () => {
  it("requires every new order to belong to a user", () => {
    const order = new Order({
      customerName: "Ada Lovelace",
      customerEmail: "ada@example.com",
      customerPhone: "+91 9999999999",
      productId: new Types.ObjectId(),
      amount: 199900,
      currency: "INR",
    });

    expect(order.validateSync()?.errors.userId).toBeDefined();
    order.userId = new Types.ObjectId();
    expect(order.validateSync()?.errors.userId).toBeUndefined();
  });

  it("enforces one entitlement per user and product at the schema level", () => {
    const uniqueIndex = Entitlement.schema.indexes().find(
      ([fields]) => fields.userId === 1 && fields.productId === 1
    );

    expect(uniqueIndex?.[1]).toMatchObject({ unique: true });
  });

  it("defaults newly granted access to active", () => {
    const entitlement = new Entitlement({
      userId: new Types.ObjectId(),
      productId: new Types.ObjectId(),
      sourceOrderId: new Types.ObjectId(),
    });

    expect(entitlement.status).toBe("active");
    expect(entitlement.validateSync()).toBeUndefined();
  });
});

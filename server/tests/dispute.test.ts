import { describe, expect, it } from "vitest";
import { Dispute } from "../src/models/Dispute.js";
import { Order } from "../src/models/Order.js";
import { EmailDelivery } from "../src/models/EmailDelivery.js";
import { OperationalAlert } from "../src/models/OperationalAlert.js";
import { disputeStatusForEvent } from "../src/lib/disputes.js";

describe("payment dispute schemas", () => {
  it("supports dispute and chargeback order states", () => expect(Order.schema.path("status").options.enum).toEqual(expect.arrayContaining(["disputed", "chargeback"])));
  it("constrains dispute lifecycle and provider identity", () => {
    expect(Dispute.schema.path("status").options.enum).toEqual(["open", "won", "lost", "closed"]);
    expect(Dispute.schema.indexes()).toEqual(expect.arrayContaining([[{ providerDisputeId: 1 }, expect.objectContaining({ unique: true })], [{ status: 1, updatedAt: -1 }, expect.any(Object)]]));
  });
  it("supports dispute notifications and critical alerts", () => {
    expect(EmailDelivery.schema.path("category").options.enum).toContain("dispute");
    expect(OperationalAlert.schema.path("category").options.enum).toContain("payment_dispute");
  });
  it("maps only recognized Razorpay dispute events", () => {
    expect(disputeStatusForEvent("payment.dispute.created")).toBe("open");
    expect(disputeStatusForEvent("payment.dispute.won")).toBe("won");
    expect(disputeStatusForEvent("payment.dispute.lost")).toBe("lost");
    expect(disputeStatusForEvent("payment.dispute.closed")).toBe("closed");
    expect(disputeStatusForEvent("payment.dispute.unknown")).toBeNull();
  });
});

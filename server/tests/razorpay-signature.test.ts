import crypto from "node:crypto";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyPaymentSignature, verifyWebhookSignature } from "../src/lib/razorpay.js";

const KEY_SECRET = "test_key_secret";
const WEBHOOK_SECRET = "test_webhook_secret";

beforeEach(() => {
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

afterEach(() => {
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

function signPayment(orderId: string, paymentId: string, secret = KEY_SECRET) {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

describe("verifyPaymentSignature", () => {
  it("accepts a correctly signed order/payment pair", () => {
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    expect(verifyPaymentSignature({ orderId, paymentId, signature: signPayment(orderId, paymentId) })).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const orderId = "order_ABC123";
    const signature = signPayment(orderId, "pay_XYZ789");
    expect(verifyPaymentSignature({ orderId, paymentId: "pay_DIFFERENT", signature })).toBe(false);
  });

  it("rejects a signature produced with the wrong secret", () => {
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    const signature = signPayment(orderId, paymentId, "wrong_secret");
    expect(verifyPaymentSignature({ orderId, paymentId, signature })).toBe(false);
  });

  it("fails closed when RAZORPAY_KEY_SECRET is not configured", () => {
    delete process.env.RAZORPAY_KEY_SECRET;
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    expect(verifyPaymentSignature({ orderId, paymentId, signature: signPayment(orderId, paymentId) })).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts a body signed with the webhook secret", () => {
    const rawBody = JSON.stringify({ event: "payment.captured" });
    const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
    expect(verifyWebhookSignature(rawBody, signature)).toBe(true);
  });

  it("rejects a body that doesn't match the signature", () => {
    const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update("original").digest("hex");
    expect(verifyWebhookSignature("tampered", signature)).toBe(false);
  });

  it("rejects when no signature header is present", () => {
    expect(verifyWebhookSignature("{}", null)).toBe(false);
  });
});

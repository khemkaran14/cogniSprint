import crypto from "node:crypto";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/**
 * Creates a real Razorpay order via the Orders API. Amount is in the
 * smallest currency unit (paise for INR) and must always be computed
 * server-side from the Price/Coupon documents — never trust a
 * client-supplied amount.
 */
export async function createRazorpayOrder(options: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured");
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Razorpay order creation failed: ${response.status} ${errorBody}`);
  }

  return (await response.json()) as RazorpayOrder;
}

export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder | null> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) return null;
  return (await response.json()) as RazorpayOrder;
}

/**
 * Verifies the signature Razorpay Checkout returns to the client after a
 * successful payment: hmac_sha256(order_id + "|" + payment_id, key_secret).
 */
export function verifyPaymentSignature(options: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${options.orderId}|${options.paymentId}`)
    .digest("hex");

  return timingSafeEqualHex(expected, options.signature);
}

/** Verifies an inbound webhook payload against RAZORPAY_WEBHOOK_SECRET. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined | null): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signatureHeader);
}

function timingSafeEqualHex(expectedHex: string, actualHex: string): boolean {
  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const actualBuffer = Buffer.from(actualHex, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

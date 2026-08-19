import { Router } from "express";
import { verifyWebhookSignature } from "../lib/razorpay.js";
import { Order } from "../models/Order.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import { grantEntitlementForOrder } from "../lib/entitlements.js";

export const webhooksRouter = Router();

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        order_id?: string;
        id?: string;
      };
    };
  };
};

// Mounted with express.raw() in index.ts so req.body is the raw Buffer the
// signature was computed over.
webhooksRouter.post("/razorpay", async (req, res) => {
  const rawBody = (req.body as Buffer).toString("utf8");
  const signature = req.header("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return res.status(501).json({ error: "Webhook secret not configured." });
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("Rejected Razorpay webhook: invalid signature");
    return res.status(400).json({ error: "Invalid signature." });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid payload." });
  }

  const eventType = event.event ?? "unknown";
  const paymentId = event.payload?.payment?.entity?.id;
  const orderId = event.payload?.payment?.entity?.order_id;

  // Razorpay retries webhook deliveries on timeout, so the same event can
  // arrive more than once. Record (event type, payment id) before doing
  // anything with side effects; if we've already recorded it, this is a
  // redelivery and there's nothing further to do.
  if (paymentId) {
    try {
      await WebhookEvent.create({ provider: "razorpay", eventType, externalId: paymentId });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        console.info(`[razorpay-webhook] duplicate delivery of ${eventType} for ${paymentId}, skipping`);
        return res.json({ received: true, duplicate: true });
      }
      throw error;
    }
  }

  console.info("[razorpay-webhook] verified event:", eventType);

  if (eventType === "payment.captured" && orderId) {
    const order = await Order.findOneAndUpdate(
      { providerOrderId: orderId },
      { status: "paid", providerPaymentId: paymentId },
      { new: true }
    );
    if (order) {
      await grantEntitlementForOrder(order).catch((error) =>
        console.error(`[razorpay-webhook] failed to grant entitlement for order ${order._id}`, error)
      );
    }
  } else if (eventType === "payment.failed" && orderId) {
    await Order.updateOne({ providerOrderId: orderId, status: { $ne: "paid" } }, { status: "failed" });
  }

  res.json({ received: true });
});

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === 11000;
}

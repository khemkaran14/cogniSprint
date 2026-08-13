import { Router } from "express";
import { verifyWebhookSignature } from "../lib/razorpay.js";
import { Order } from "../models/Order.js";
import { grantPaidOrderEntitlement, revokeOrderEntitlement } from "../lib/entitlements.js";
import { WebhookEvent } from "../models/WebhookEvent.js";

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

  console.info("[razorpay-webhook] verified event:", event.event);

  const eventId = req.header("x-razorpay-event-id");
  if (!eventId || !event.event) return res.status(400).json({ error: "Webhook event ID and type are required." });
  try {
    await WebhookEvent.create({ provider: "razorpay", eventId, eventType: event.event, status: "processing" });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const existing = await WebhookEvent.findOne({ provider: "razorpay", eventId });
    const stale = existing?.status === "processing" && existing.updatedAt < new Date(Date.now() - 5 * 60_000);
    if (existing?.status === "processed" || (existing?.status === "processing" && !stale)) {
      return res.json({ received: true, duplicate: true });
    }
    await WebhookEvent.updateOne(
      { provider: "razorpay", eventId },
      { status: "processing", failureReason: null }
    );
  }

  const orderId = event.payload?.payment?.entity?.order_id;
  const paymentId = event.payload?.payment?.entity?.id;

  try {
    if (event.event === "payment.captured" && orderId) {
      // Idempotent: re-delivering the same event just re-applies the same state.
      const order = await Order.findOneAndUpdate(
        { providerOrderId: orderId },
        { status: "paid", providerPaymentId: paymentId },
        { new: true }
      );
      await grantPaidOrderEntitlement(order);
    } else if (event.event === "payment.failed" && orderId) {
      await Order.updateOne({ providerOrderId: orderId, status: { $ne: "paid" } }, { status: "failed" });
    } else if (event.event === "payment.refunded" && orderId) {
      const order = await Order.findOneAndUpdate(
        { providerOrderId: orderId },
        { status: "refunded" },
        { new: true }
      );
      await revokeOrderEntitlement(order);
    }

    await WebhookEvent.updateOne({ provider: "razorpay", eventId }, { status: "processed", processedAt: new Date() });
  } catch (error) {
    await WebhookEvent.updateOne(
      { provider: "razorpay", eventId },
      { status: "failed", failureReason: error instanceof Error ? error.message.slice(0, 500) : "Unknown error" }
    );
    throw error;
  }

  res.json({ received: true });
});

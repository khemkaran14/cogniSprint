import { Router } from "express";
import { verifyWebhookSignature } from "../lib/razorpay.js";
import { Order } from "../models/Order.js";
import { grantPaidOrderEntitlement, revokeOrderEntitlement } from "../lib/entitlements.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import { enqueueEmail } from "../lib/emailQueue.js";
import { Dispute } from "../models/Dispute.js";
import { recordAlert } from "../lib/operationalAlerts.js";
import { disputeStatusForEvent } from "../lib/disputes.js";

export const webhooksRouter = Router();

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        order_id?: string;
        id?: string;
        amount?: number;
        amount_refunded?: number;
      };
    };
    refund?: { entity?: { id?: string; payment_id?: string; amount?: number } };
    dispute?: { entity?: { id?: string; payment_id?: string; amount?: number; currency?: string; reason?: string; phase?: string; status?: string; created_at?: number; respond_by?: number } };
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
        [{ $set: { status: "paid", providerPaymentId: paymentId, paidAt: { $ifNull: ["$paidAt", "$$NOW"] } } }],
        { new: true }
      );
      await grantPaidOrderEntitlement(order);
      if (order) await enqueueEmail({ idempotencyKey: `purchase:${order._id}`, category: "purchase", userId: order.userId, to: order.customerEmail, subject: "Your CogniSprint purchase is confirmed", text: `Hello ${order.customerName},\n\nYour payment of ${order.currency} ${(order.amount / 100).toFixed(2)} was confirmed. Open ${process.env.CLIENT_URL ?? "http://localhost:5173"}/learn to begin.\n\nOrder reference: ${order.providerOrderId}` });
    } else if (event.event === "payment.failed" && orderId) {
      const order = await Order.findOneAndUpdate({ providerOrderId: orderId, status: { $ne: "paid" } }, { status: "failed" }, { new: true });
      if (order) await enqueueEmail({ idempotencyKey: `payment-failed:${order._id}`, category: "payment_failed", userId: order.userId, to: order.customerEmail, subject: "Your CogniSprint payment was not completed", text: `Hello ${order.customerName},\n\nYour payment was not completed and no course access was granted. You can safely retry from ${process.env.CLIENT_URL ?? "http://localhost:5173"}/checkout.\n\nOrder reference: ${order.providerOrderId}` });
    } else if (event.event === "payment.refunded" && orderId) {
      const refundedAmount = event.payload?.payment?.entity?.amount_refunded ?? event.payload?.payment?.entity?.amount;
      const order = await Order.findOneAndUpdate(
        { providerOrderId: orderId },
        [{ $set: { refundedAmount: refundedAmount ?? "$amount", status: { $cond: [{ $gte: [refundedAmount ?? "$amount", "$amount"] }, "refunded", "partially_refunded"] }, refundedAt: { $cond: [{ $gte: [refundedAmount ?? "$amount", "$amount"] }, "$$NOW", "$refundedAt"] } } }],
        { new: true }
      );
      if (order?.status === "refunded") await revokeOrderEntitlement(order);
      if (order) await enqueueEmail({ idempotencyKey: `refund-state:${order._id}:${order.refundedAmount}`, category: "refund", userId: order.userId, to: order.customerEmail, subject: "Your CogniSprint refund was updated", text: `Hello ${order.customerName},\n\nA refund total of ${order.currency} ${(order.refundedAmount / 100).toFixed(2)} is recorded for your order. Current status: ${order.status.replaceAll("_", " ")}.\n\nOrder reference: ${order.providerOrderId}` });
    } else if (disputeStatusForEvent(event.event)) {
      const entity = event.payload?.dispute?.entity;
      if (!entity?.id || !entity.payment_id) throw new Error("Dispute webhook is missing its dispute or payment ID.");
      const order = await Order.findOne({ providerPaymentId: entity.payment_id });
      if (!order) throw new Error(`No CogniSprint order matches disputed payment ${entity.payment_id}.`);
      const status = disputeStatusForEvent(event.event)!;
      await Dispute.findOneAndUpdate({ providerDisputeId: entity.id }, { provider: "razorpay", providerDisputeId: entity.id, providerPaymentId: entity.payment_id, orderId: order._id, userId: order.userId, amount: entity.amount ?? order.amount, currency: entity.currency ?? order.currency, status, reason: entity.reason, phase: entity.phase, evidenceDueAt: entity.respond_by ? new Date(entity.respond_by * 1000) : null, providerCreatedAt: entity.created_at ? new Date(entity.created_at * 1000) : null, lastEventId: eventId }, { upsert: true, new: true });
      if (status === "open") {
        order.status = "disputed"; await order.save();
        await recordAlert({ fingerprint: `payment-dispute:${entity.id}`, category: "payment_dispute", severity: "critical", title: "Razorpay payment dispute requires review", details: { disputeId: entity.id, orderId: String(order._id), amount: entity.amount ?? order.amount, currency: entity.currency ?? order.currency, reason: entity.reason, evidenceDueAt: entity.respond_by ? new Date(entity.respond_by * 1000).toISOString() : null } });
      } else if (status === "won") {
        order.status = "paid"; await order.save(); await grantPaidOrderEntitlement(order);
      } else if (status === "lost") {
        order.status = "chargeback"; await order.save(); await revokeOrderEntitlement(order);
      }
      await enqueueEmail({ idempotencyKey: `dispute:${entity.id}:${status}`, category: "dispute", userId: order.userId, to: order.customerEmail, subject: `Your CogniSprint payment dispute is ${status}`, text: `Hello ${order.customerName},\n\nRazorpay reported your payment dispute as ${status}. Course access may change according to the final provider outcome. Contact support and reference dispute ${entity.id} if you need help.\n\nOrder reference: ${order.providerOrderId}` });
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

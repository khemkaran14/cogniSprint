import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { recordAlert, type AlertFinding } from "../lib/operationalAlerts.js";
import { EmailDelivery } from "../models/EmailDelivery.js";
import { Entitlement } from "../models/Entitlement.js";
import { Order } from "../models/Order.js";
import { ReconciliationRun } from "../models/ReconciliationRun.js";
import { WebhookEvent } from "../models/WebhookEvent.js";

await connectDB();
const now = new Date(); const findings: AlertFinding[] = [];
const staleCutoff = new Date(now.getTime() - 60 * 60_000);
const recentCutoff = new Date(now.getTime() - 24 * 60 * 60_000);
const [staleOrders, failedOrders, failedWebhooks, exhaustedEmails, reviewRuns, paidOrders] = await Promise.all([
  Order.find({ status: "pending", createdAt: { $lt: staleCutoff } }).select("_id providerOrderId createdAt").lean(),
  Order.find({ status: "failed", updatedAt: { $gte: recentCutoff } }).select("_id providerOrderId updatedAt").lean(),
  WebhookEvent.find({ status: "failed", updatedAt: { $gte: recentCutoff } }).select("_id eventId eventType failureReason").lean(),
  EmailDelivery.find({ status: "failed", attempts: { $gte: 8 } }).select("_id category to lastError").lean(),
  ReconciliationRun.find({ $or: [{ status: "failed" }, { needsReview: { $gt: 0 } }], createdAt: { $gte: recentCutoff } }).lean(),
  Order.find({ status: "paid" }).select("_id userId productId").lean(),
]);
for (const item of staleOrders) findings.push({ fingerprint: `stale-order:${item._id}`, category: "stale_order", severity: "warning", title: "Order remains pending for more than one hour", details: { orderId: String(item._id), providerOrderId: item.providerOrderId } });
for (const item of failedOrders) findings.push({ fingerprint: `payment-failure:${item._id}`, category: "payment_failure", severity: "warning", title: "Payment order failed", details: { orderId: String(item._id), providerOrderId: item.providerOrderId } });
for (const item of failedWebhooks) findings.push({ fingerprint: `webhook-failure:${item._id}`, category: "webhook_failure", severity: "critical", title: "Webhook processing failed", details: { eventId: item.eventId, eventType: item.eventType, failureReason: item.failureReason } });
for (const item of exhaustedEmails) findings.push({ fingerprint: `email-failure:${item._id}`, category: "email_failure", severity: "warning", title: "Transactional email exhausted automatic retries", details: { deliveryId: String(item._id), category: item.category, to: item.to, error: item.lastError } });
for (const item of reviewRuns) findings.push({ fingerprint: `reconciliation-review:${item._id}`, category: "reconciliation_review", severity: item.status === "failed" ? "critical" : "warning", title: "Payment reconciliation requires review", details: { runId: String(item._id), status: item.status, needsReview: item.needsReview } });
for (const order of paidOrders) if (!await Entitlement.exists({ userId: order.userId, productId: order.productId, status: "active" })) findings.push({ fingerprint: `entitlement-mismatch:${order._id}`, category: "entitlement_mismatch", severity: "critical", title: "Paid order has no active entitlement", details: { orderId: String(order._id) } });
for (const finding of findings) await recordAlert(finding, now);
console.info(JSON.stringify({ type: "operational_alert_scan", findings: findings.length }));
await mongoose.disconnect();

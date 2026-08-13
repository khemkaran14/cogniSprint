import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import { fetchRazorpayOrder } from "../lib/razorpay.js";
import { reconcileOrderState } from "../lib/reconciliation.js";
import { grantPaidOrderEntitlement } from "../lib/entitlements.js";
import { Entitlement } from "../models/Entitlement.js";
import { Order } from "../models/Order.js";
import { ReconciliationRun } from "../models/ReconciliationRun.js";

const apply = process.argv.includes("--apply");
await connectDB();
const run = await ReconciliationRun.create({ mode: apply ? "apply" : "dry-run", status: "running" });
try {
  const cutoff = new Date(Date.now() - 30 * 60_000);
  const orders = await Order.find({ providerOrderId: { $exists: true }, $or: [{ status: "pending", createdAt: { $lt: cutoff } }, { status: "paid" }] });
  const findings: Array<Record<string, unknown>> = [];
  let repaired = 0; let needsReview = 0;
  for (const order of orders) {
    const provider = await fetchRazorpayOrder(order.providerOrderId!);
    const decision = reconcileOrderState(order, provider);
    const entitlement = order.status === "paid" ? await Entitlement.findOne({ userId: order.userId, productId: order.productId, status: "active" }) : null;
    const entitlementMissing = order.status === "paid" && !entitlement;
    if (decision.action === "review") needsReview += 1;
    if (apply && decision.action === "mark_paid") { order.status = "paid"; order.paidAt ??= new Date(); await order.save(); await grantPaidOrderEntitlement(order); repaired += 1; }
    if (apply && decision.action === "mark_failed") { order.status = "failed"; await order.save(); repaired += 1; }
    if (apply && entitlementMissing) { await grantPaidOrderEntitlement(order); repaired += 1; }
    findings.push({ orderId: String(order._id), providerOrderId: order.providerOrderId, localStatus: order.status, providerStatus: provider?.status ?? null, decision: decision.action, reason: decision.reason, entitlementMissing });
  }
  Object.assign(run, { status: "completed", inspected: orders.length, repaired, needsReview, findings: findings.slice(0, 500), completedAt: new Date() });
  await run.save();
  console.info(JSON.stringify({ runId: String(run._id), mode: run.mode, inspected: orders.length, repaired, needsReview }));
} catch (error) {
  run.status = "failed"; run.failureReason = error instanceof Error ? error.message.slice(0, 500) : "Unknown error"; run.completedAt = new Date(); await run.save(); throw error;
} finally { await mongoose.disconnect(); }

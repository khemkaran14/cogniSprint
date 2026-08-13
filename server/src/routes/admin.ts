import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/admin.js";
import { AuditEvent } from "../models/AuditEvent.js";
import { Certificate } from "../models/Certificate.js";
import { Entitlement } from "../models/Entitlement.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { WebhookEvent } from "../models/WebhookEvent.js";
import { Refund } from "../models/Refund.js";
import { createRazorpayRefund } from "../lib/razorpay.js";
import { revokeOrderEntitlement } from "../lib/entitlements.js";
import { ReconciliationRun } from "../models/ReconciliationRun.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [users, activeEntitlements, pendingOrders, failedWebhooks, failedCertificateEmails, recentOrders, recentAudits] = await Promise.all([
      User.countDocuments(), Entitlement.countDocuments({ status: "active" }), Order.countDocuments({ status: "pending" }),
      WebhookEvent.countDocuments({ status: "failed" }), Certificate.countDocuments({ emailDeliveryStatus: "failed", revokedAt: null }),
      Order.find().select("customerName customerEmail amount currency status createdAt").sort({ createdAt: -1 }).limit(10).lean(),
      AuditEvent.find().populate("actorUserId", "name email").sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    res.json({ summary: { users, activeEntitlements, pendingOrders, failedWebhooks, failedCertificateEmails }, recentOrders, recentAudits });
  } catch (error) { next(error); }
});

adminRouter.get("/certificates", async (_req, res, next) => {
  try {
    const certificates = await Certificate.find().populate("userId", "name email").sort({ issuedAt: -1 }).limit(100).lean();
    res.json({ certificates });
  } catch (error) { next(error); }
});

adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const orders = await Order.find().populate("productId", "name").select("customerName customerEmail productId amount currency status refundedAmount providerOrderId providerPaymentId paidAt createdAt").sort({ createdAt: -1 }).limit(100).lean();
    const refunds = await Refund.find({ orderId: { $in: orders.map((order) => order._id) } }).sort({ createdAt: -1 }).lean();
    res.json({ orders: orders.map((order) => ({ ...order, refunds: refunds.filter((refund) => String(refund.orderId) === String(order._id)) })) });
  } catch (error) { next(error); }
});
adminRouter.get("/reconciliation", async (_req, res, next) => {
  try { res.json({ runs: await ReconciliationRun.find().sort({ createdAt: -1 }).limit(20).lean() }); } catch (error) { next(error); }
});

const refundSchema = z.object({ amount: z.number().int().positive(), reason: z.string().trim().min(10).max(500) });
adminRouter.post("/orders/:id/refunds", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Order not found." });
    const parsed = refundSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Provide a valid amount and reason of at least 10 characters." });
    const order = await Order.findOne({ _id: req.params.id, status: { $in: ["paid", "partially_refunded"] } });
    if (!order?.providerPaymentId) return res.status(404).json({ error: "A refundable paid order was not found." });
    const remaining = order.amount - order.refundedAmount;
    if (parsed.data.amount > remaining) return res.status(422).json({ error: `Refund cannot exceed the remaining ${remaining} ${order.currency} minor units.` });
    const refund = await Refund.create({ orderId: order._id, userId: order.userId, amount: parsed.data.amount, currency: order.currency, reason: parsed.data.reason, requestedBy: res.locals.user._id });
    const reserved = await Order.findOneAndUpdate(
      { _id: order._id, status: { $in: ["paid", "partially_refunded"] }, refundedAmount: { $lte: order.amount - refund.amount } },
      { $inc: { refundedAmount: refund.amount } }, { new: true }
    );
    if (!reserved) { refund.status = "failed"; refund.failureReason = "Refund amount was concurrently reserved or the order changed."; await refund.save(); return res.status(409).json({ error: "The refundable balance changed. Refresh and try again." }); }
    try {
      const provider = await createRazorpayRefund(order.providerPaymentId, refund.amount, { orderId: String(order._id), refundId: String(refund._id), reason: refund.reason });
      refund.providerRefundId = provider.id; refund.status = "processed"; refund.processedAt = new Date(); await refund.save();
      const full = reserved.refundedAmount >= reserved.amount;
      reserved.status = full ? "refunded" : "partially_refunded";
      if (full) { reserved.refundedAt = new Date(); await revokeOrderEntitlement(reserved); }
      await reserved.save();
      await AuditEvent.create({ actorUserId: res.locals.user._id, action: "order.refund", targetType: "Order", targetId: String(reserved._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { amount: refund.amount, reason: refund.reason, providerRefundId: refund.providerRefundId, full } });
      res.status(201).json({ refund, order: { status: reserved.status, refundedAmount: reserved.refundedAmount }, entitlementRevoked: full });
    } catch (error) {
      refund.status = "failed"; refund.failureReason = error instanceof Error ? error.message.slice(0, 500) : "Unknown provider error"; await refund.save();
      await Order.updateOne({ _id: order._id }, { $inc: { refundedAmount: -refund.amount } });
      throw error;
    }
  } catch (error) { next(error); }
});

const revokeSchema = z.object({ reason: z.string().trim().min(10).max(500) });
adminRouter.post("/certificates/:id/revoke", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Certificate not found." });
    const parsed = revokeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Provide a revocation reason of at least 10 characters." });
    const certificate = await Certificate.findOneAndUpdate({ _id: req.params.id, revokedAt: null }, { revokedAt: new Date(), revocationReason: parsed.data.reason }, { new: true });
    if (!certificate) return res.status(404).json({ error: "Certificate not found or already revoked." });
    await AuditEvent.create({ actorUserId: res.locals.user._id, action: "certificate.revoke", targetType: "Certificate", targetId: String(certificate._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { reason: parsed.data.reason, verificationCode: certificate.verificationCode } });
    res.json({ certificate });
  } catch (error) { next(error); }
});

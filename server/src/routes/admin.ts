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
import { EmailDelivery } from "../models/EmailDelivery.js";
import { enqueueEmail } from "../lib/emailQueue.js";
import { OperationalAlert } from "../models/OperationalAlert.js";
import { PrivacyRequest } from "../models/PrivacyRequest.js";
import { Dispute } from "../models/Dispute.js";
import { Lesson } from "../models/Lesson.js";
import { Assessment } from "../models/Assessment.js";
import { canTransitionContent, contentStatuses, contentTransitionDates, type ContentStatus } from "../lib/contentWorkflow.js";
import { LearningResource } from "../models/LearningResource.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [users, activeEntitlements, pendingOrders, failedWebhooks, openDisputes, failedCertificateEmails, recentOrders, recentAudits] = await Promise.all([
      User.countDocuments(), Entitlement.countDocuments({ status: "active" }), Order.countDocuments({ status: "pending" }),
      WebhookEvent.countDocuments({ status: "failed" }), Dispute.countDocuments({ status: "open" }), Certificate.countDocuments({ emailDeliveryStatus: "failed", revokedAt: null }),
      Order.find().select("customerName customerEmail amount currency status createdAt").sort({ createdAt: -1 }).limit(10).lean(),
      AuditEvent.find().populate("actorUserId", "name email").sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    res.json({ summary: { users, activeEntitlements, pendingOrders, failedWebhooks, openDisputes, failedCertificateEmails }, recentOrders, recentAudits });
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
adminRouter.get("/disputes", async (_req, res, next) => {
  try { res.json({ disputes: await Dispute.find().populate("orderId", "customerName customerEmail providerOrderId status").populate("userId", "name email").sort({ status: 1, updatedAt: -1 }).limit(200).lean() }); } catch (error) { next(error); }
});
adminRouter.get("/content", async (_req, res, next) => {
  try {
    const [lessons, assessments] = await Promise.all([
      Lesson.find().populate("moduleId", "title slug").populate("reviewedBy", "name email").sort({ status: 1, sequenceNumber: 1 }).lean(),
      Assessment.find().populate("reviewedBy", "name email").sort({ status: 1, month: 1 }).lean(),
    ]);
    res.json({ lessons, assessments });
  } catch (error) { next(error); }
});
adminRouter.get("/resources", async (_req, res, next) => {
  try { res.json({ resources: await LearningResource.find().populate("productId", "name slug").populate("releasedBy", "name email").sort({ status: 1, kind: 1, title: 1 }).lean() }); } catch (error) { next(error); }
});
const resourceStatusSchema = z.object({ status: z.enum(["draft", "published", "archived"]), note: z.string().trim().min(5).max(2000) });
adminRouter.patch("/resources/:id/status", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Resource not found." });
    const parsed = resourceStatusSchema.safeParse(req.body); if (!parsed.success) return res.status(422).json({ error: "Choose a valid state and provide a release note." });
    const resource = await LearningResource.findById(req.params.id); if (!resource) return res.status(404).json({ error: "Resource not found." });
    const allowed = resource.status === "draft" ? ["published"] : resource.status === "published" ? ["archived"] : ["draft"];
    if (!allowed.includes(parsed.data.status)) return res.status(409).json({ error: `Resource cannot move from ${resource.status} to ${parsed.data.status}.` });
    const previousStatus = resource.status; const now = new Date(); resource.set({ status: parsed.data.status, releaseNote: parsed.data.note, releasedBy: res.locals.user._id, publishedAt: parsed.data.status === "published" ? now : resource.publishedAt, archivedAt: parsed.data.status === "archived" ? now : null }); await resource.save();
    await AuditEvent.create({ actorUserId: res.locals.user._id, action: `resource.${parsed.data.status}`, targetType: "LearningResource", targetId: String(resource._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { previousStatus, status: parsed.data.status, note: parsed.data.note, version: resource.version } });
    res.json({ resource });
  } catch (error) { next(error); }
});
const contentTransitionSchema = z.object({ status: z.enum(contentStatuses), note: z.string().trim().min(5).max(2000) });
adminRouter.patch("/content/:type/:id/status", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success || !["lessons", "assessments"].includes(req.params.type)) return res.status(404).json({ error: "Content not found." });
    const parsed = contentTransitionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Choose a valid content state and provide an operational note." });
    const content = req.params.type === "lessons" ? await Lesson.findById(req.params.id) : await Assessment.findById(req.params.id);
    if (!content) return res.status(404).json({ error: "Content not found." });
    if (!canTransitionContent(content.status as ContentStatus, parsed.data.status)) return res.status(409).json({ error: `Content cannot move from ${content.status} to ${parsed.data.status}.` });
    const previousStatus = content.status; const now = new Date(); content.set({ status: parsed.data.status, reviewNote: parsed.data.note, reviewedBy: res.locals.user._id, ...contentTransitionDates(parsed.data.status, now) }); await content.save();
    await AuditEvent.create({ actorUserId: res.locals.user._id, action: `content.${parsed.data.status}`, targetType: req.params.type === "lessons" ? "Lesson" : "Assessment", targetId: String(content._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { previousStatus, status: parsed.data.status, note: parsed.data.note } });
    res.json({ content });
  } catch (error) { next(error); }
});
adminRouter.get("/reconciliation", async (_req, res, next) => {
  try { res.json({ runs: await ReconciliationRun.find().sort({ createdAt: -1 }).limit(20).lean() }); } catch (error) { next(error); }
});
adminRouter.get("/email-deliveries", async (_req, res, next) => {
  try { res.json({ deliveries: await EmailDelivery.find().sort({ createdAt: -1 }).limit(100).lean() }); } catch (error) { next(error); }
});
adminRouter.post("/email-deliveries/:id/retry", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Email delivery not found." });
    const delivery = await EmailDelivery.findOneAndUpdate({ _id: req.params.id, status: "failed" }, { status: "queued", attempts: 0, nextAttemptAt: new Date(), lastError: null }, { new: true });
    if (!delivery) return res.status(404).json({ error: "Failed email delivery not found." });
    await AuditEvent.create({ actorUserId: res.locals.user._id, action: "email.retry", targetType: "EmailDelivery", targetId: String(delivery._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { category: delivery.category, to: delivery.to } });
    res.json({ delivery });
  } catch (error) { next(error); }
});
adminRouter.get("/alerts", async (_req, res, next) => {
  try { res.json({ alerts: await OperationalAlert.find().sort({ status: 1, severity: 1, lastSeenAt: -1 }).limit(200).lean() }); } catch (error) { next(error); }
});
adminRouter.post("/alerts/:id/:action", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success || !["acknowledge", "resolve"].includes(req.params.action)) return res.status(404).json({ error: "Alert action not found." });
    const update = req.params.action === "resolve" ? { status: "resolved", resolvedAt: new Date() } : { status: "acknowledged", acknowledgedAt: new Date() };
    const alert = await OperationalAlert.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!alert) return res.status(404).json({ error: "Alert not found." });
    await AuditEvent.create({ actorUserId: res.locals.user._id, action: `alert.${req.params.action}`, targetType: "OperationalAlert", targetId: String(alert._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { fingerprint: alert.fingerprint, category: alert.category } });
    res.json({ alert });
  } catch (error) { next(error); }
});
adminRouter.get("/privacy-requests", async (_req, res, next) => {
  try { res.json({ requests: await PrivacyRequest.find().populate("userId", "name email status").populate("resolvedBy", "name email").sort({ status: 1, createdAt: 1 }).limit(200).lean() }); } catch (error) { next(error); }
});
const privacyResolutionSchema = z.object({ status: z.enum(["in_review", "completed", "rejected"]), note: z.string().trim().min(5).max(2000) });
adminRouter.patch("/privacy-requests/:id", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Privacy request not found." });
    const parsed = privacyResolutionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Choose a valid status and provide an operational note." });
    const terminal = ["completed", "rejected"].includes(parsed.data.status);
    const privacyRequest = await PrivacyRequest.findOneAndUpdate({ _id: req.params.id, status: { $in: ["pending", "in_review"] } }, { status: parsed.data.status, resolutionNote: parsed.data.note, resolvedBy: res.locals.user._id, resolvedAt: terminal ? new Date() : null }, { new: true });
    if (!privacyRequest) return res.status(404).json({ error: "An actionable privacy request was not found." });
    await AuditEvent.create({ actorUserId: res.locals.user._id, action: `privacy.${parsed.data.status}`, targetType: "PrivacyRequest", targetId: String(privacyRequest._id), requestId: res.locals.requestId, ipAddress: req.ip || "Unknown", metadata: { note: parsed.data.note, userId: String(privacyRequest.userId) } });
    res.json({ request: privacyRequest });
  } catch (error) { next(error); }
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
      await enqueueEmail({ idempotencyKey: `refund:${refund._id}`, category: "refund", userId: order.userId, to: order.customerEmail, subject: "Your CogniSprint refund was processed", text: `Hello ${order.customerName},\n\nA ${order.currency} ${(refund.amount / 100).toFixed(2)} refund was processed. ${full ? "Your course access has been revoked because this completes a full refund." : "Your course access remains active after this partial refund."}\n\nProvider refund reference: ${refund.providerRefundId}` });
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

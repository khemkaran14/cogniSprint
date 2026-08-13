import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/admin.js";
import { AuditEvent } from "../models/AuditEvent.js";
import { Certificate } from "../models/Certificate.js";
import { Entitlement } from "../models/Entitlement.js";
import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { WebhookEvent } from "../models/WebhookEvent.js";

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

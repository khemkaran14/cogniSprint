import { randomBytes } from "node:crypto";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireActiveEntitlement } from "../middleware/entitlement.js";
import { Certificate } from "../models/Certificate.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { sendEmail } from "../lib/email.js";

export const certificatesRouter = Router();

certificatesRouter.get("/verify/:code", async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ verificationCode: req.params.code.toUpperCase(), revokedAt: null })
      .populate("productId", "name").lean();
    if (!certificate) return res.status(404).json({ valid: false });
    res.json({ valid: true, learnerName: certificate.learnerName, issuedAt: certificate.issuedAt, product: certificate.productId });
  } catch (error) { next(error); }
});

certificatesRouter.use(requireAuth, requireActiveEntitlement);

async function completion(userId: unknown) {
  const [publishedLessons, completedLessons] = await Promise.all([
    Lesson.countDocuments({ status: "published" }),
    LessonProgress.countDocuments({ userId, status: "completed" }),
  ]);
  const requiredLessons = Math.max(365, publishedLessons);
  return { publishedLessons, completedLessons, requiredLessons, eligible: publishedLessons >= 365 && completedLessons >= requiredLessons };
}

certificatesRouter.get("/status", async (_req, res, next) => {
  try {
    const status = await completion(res.locals.user._id);
    const certificate = await Certificate.findOne({ userId: res.locals.user._id, revokedAt: null }).lean();
    res.json({ ...status, certificate });
  } catch (error) { next(error); }
});

certificatesRouter.post("/claim", async (_req, res, next) => {
  try {
    const status = await completion(res.locals.user._id);
    if (!status.eligible) return res.status(422).json({ error: "Complete all 365 published lessons before claiming a certificate.", ...status });
    const identity = { userId: res.locals.user._id, productId: res.locals.entitlement.productId };
    const revoked = await Certificate.findOne({ ...identity, revokedAt: { $ne: null } }).lean();
    if (revoked) return res.status(409).json({ error: "This certificate has been revoked. Contact support for a review." });
    let certificate = await Certificate.findOne({ ...identity, revokedAt: null });
    if (!certificate) {
      try {
        certificate = await Certificate.create({ ...identity, learnerName: res.locals.user.name, verificationCode: randomBytes(12).toString("hex").toUpperCase(), issuedAt: new Date() });
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
        certificate = await Certificate.findOne({ ...identity, revokedAt: null });
      }
    }
    if (!certificate) throw new Error("Certificate could not be loaded after issuance.");
    if (!certificate.emailSentAt) {
      const verificationUrl = `${process.env.CLIENT_URL ?? "http://localhost:5173"}/certificates/verify/${certificate.verificationCode}`;
      const sent = await sendEmail({
        to: res.locals.user.email,
        subject: "Your CogniSprint completion certificate",
        text: `Congratulations ${certificate.learnerName}! Your CogniSprint certificate was issued on ${certificate.issuedAt.toISOString().slice(0, 10)}. Verify it at ${verificationUrl}`,
      });
      certificate.emailDeliveryStatus = sent ? "sent" : "failed";
      if (sent) certificate.emailSentAt = new Date();
      await certificate.save();
    }
    res.status(201).json({ certificate });
  } catch (error) { next(error); }
});

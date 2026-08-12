import { randomBytes } from "node:crypto";
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireActiveEntitlement } from "../middleware/entitlement.js";
import { Certificate } from "../models/Certificate.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";

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
    const certificate = await Certificate.findOneAndUpdate(
      { userId: res.locals.user._id, productId: res.locals.entitlement.productId },
      { $setOnInsert: { learnerName: res.locals.user.name, verificationCode: randomBytes(12).toString("hex").toUpperCase(), issuedAt: new Date() } },
      { upsert: true, new: true }
    );
    res.status(201).json({ certificate });
  } catch (error) { next(error); }
});

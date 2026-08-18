import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { AssessmentAttempt } from "../models/AssessmentAttempt.js";
import { Certificate } from "../models/Certificate.js";
import { Entitlement } from "../models/Entitlement.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { LessonSubmission } from "../models/LessonSubmission.js";
import { Order } from "../models/Order.js";
import { PrivacyRequest } from "../models/PrivacyRequest.js";
import { Refund } from "../models/Refund.js";

export const privacyRouter = Router();
privacyRouter.use(requireAuth);

privacyRouter.get("/export", async (_req, res, next) => {
  try {
    const user = res.locals.user;
    const [entitlements, orders, refunds, progress, submissions, assessments, certificates] = await Promise.all([
      Entitlement.find({ userId: user._id }).lean(), Order.find({ userId: user._id }).lean(), Refund.find({ userId: user._id }).lean(),
      LessonProgress.find({ userId: user._id }).lean(), LessonSubmission.find({ userId: user._id }).lean(), AssessmentAttempt.find({ userId: user._id }).lean(), Certificate.find({ userId: user._id }).lean(),
    ]);
    res.setHeader("Content-Disposition", `attachment; filename="cognisprint-data-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json({ exportedAt: new Date().toISOString(), account: { id: String(user._id), name: user.name, email: user.email, role: user.role, status: user.status, timezone: user.timezone, emailVerifiedAt: user.emailVerifiedAt, createdAt: user.createdAt, updatedAt: user.updatedAt }, entitlements, orders, refunds, learning: { progress, submissions, assessmentAttempts: assessments, certificates } });
  } catch (error) { next(error); }
});

const requestSchema = z.object({ reason: z.string().trim().max(1000).optional() });
privacyRouter.get("/requests", async (_req, res, next) => {
  try { res.json({ requests: await PrivacyRequest.find({ userId: res.locals.user._id }).sort({ createdAt: -1 }).lean() }); } catch (error) { next(error); }
});
privacyRouter.post("/deletion-requests", async (req, res, next) => {
  try {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "The request reason is too long." });
    const existing = await PrivacyRequest.findOne({ userId: res.locals.user._id, type: "deletion", status: { $in: ["pending", "in_review"] } });
    if (existing) return res.status(200).json({ request: existing, duplicate: true });
    const request = await PrivacyRequest.create({ userId: res.locals.user._id, type: "deletion", reason: parsed.data.reason });
    res.status(201).json({ request, duplicate: false });
  } catch (error) { next(error); }
});
privacyRouter.delete("/deletion-requests/:id", async (req, res, next) => {
  try {
    if (!z.string().regex(/^[a-f\d]{24}$/i).safeParse(req.params.id).success) return res.status(404).json({ error: "Privacy request not found." });
    const request = await PrivacyRequest.findOneAndUpdate({ _id: req.params.id, userId: res.locals.user._id, status: "pending" }, { status: "cancelled", resolvedAt: new Date() }, { new: true });
    if (!request) return res.status(404).json({ error: "A pending privacy request was not found." });
    res.json({ request });
  } catch (error) { next(error); }
});

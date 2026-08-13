import { createHash } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireActiveEntitlement } from "../middleware/entitlement.js";
import { Assessment } from "../models/Assessment.js";
import { AssessmentAttempt } from "../models/AssessmentAttempt.js";
import { scoreAssessment } from "../lib/assessmentScoring.js";

export const assessmentsRouter = Router();
assessmentsRouter.use(requireAuth, requireActiveEntitlement);

const publicAssessment = (assessment: { questions: Array<{ prompt: string; skill: string; options: string[] }>; [key: string]: unknown }) => ({
  ...assessment,
  questions: assessment.questions.map(({ prompt, skill, options }) => ({ prompt, skill, options })),
});

assessmentsRouter.get("/", async (_req, res, next) => {
  try {
    const assessments = await Assessment.find({ status: "published" }).sort({ month: 1 }).lean();
    const attempts = await AssessmentAttempt.find({ userId: res.locals.user._id }).sort({ createdAt: -1 }).lean();
    const latest = new Map<string, typeof attempts[number]>();
    attempts.forEach((attempt) => { if (!latest.has(String(attempt.assessmentId))) latest.set(String(attempt.assessmentId), attempt); });
    res.json({ assessments: assessments.map((assessment) => ({ ...publicAssessment(assessment), questions: undefined, questionCount: assessment.questions.length, latestAttempt: latest.get(String(assessment._id)) ?? null })) });
  } catch (error) { next(error); }
});

assessmentsRouter.get("/:slug", async (req, res, next) => {
  try {
    const assessment = await Assessment.findOne({ slug: req.params.slug, status: "published" }).lean();
    if (!assessment) return res.status(404).json({ error: "Assessment not found." });
    const attempts = await AssessmentAttempt.find({ userId: res.locals.user._id, assessmentId: assessment._id }).select("score passed createdAt skillResults").sort({ createdAt: -1 }).lean();
    res.json({ assessment: publicAssessment(assessment), attempts });
  } catch (error) { next(error); }
});

const submissionSchema = z.object({ submissionId: z.string().uuid(), answers: z.array(z.number().int().min(0)).max(100), durationSeconds: z.number().int().min(0).max(10800) });
assessmentsRouter.post("/:slug/submit", async (req, res, next) => {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Submit a valid answer for every question." });
    const assessment = await Assessment.findOne({ slug: req.params.slug, status: "published" });
    if (!assessment) return res.status(404).json({ error: "Assessment not found." });
    if (parsed.data.answers.length !== assessment.questions.length || parsed.data.answers.some((answer, index) => answer >= assessment.questions[index].options.length)) return res.status(422).json({ error: "Submit a valid answer for every question." });
    const answerHash = createHash("sha256").update(JSON.stringify(parsed.data.answers)).digest("hex");
    const existing = await AssessmentAttempt.findOne({ userId: res.locals.user._id, assessmentId: assessment._id, submissionId: parsed.data.submissionId }).lean();
    if (existing) {
      if (existing.answerHash !== answerHash) return res.status(409).json({ error: "This submission ID was already used with different answers." });
      return res.json({ attempt: existing, duplicate: true });
    }
    const result = scoreAssessment(assessment.questions, parsed.data.answers);
    let attempt;
    try {
      attempt = await AssessmentAttempt.create({ userId: res.locals.user._id, assessmentId: assessment._id, submissionId: parsed.data.submissionId, answerHash, ...result, passed: result.score >= assessment.passingScore, durationSeconds: parsed.data.durationSeconds });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
      const concurrent = await AssessmentAttempt.findOne({ userId: res.locals.user._id, assessmentId: assessment._id, submissionId: parsed.data.submissionId }).lean();
      if (!concurrent || concurrent.answerHash !== answerHash) return res.status(409).json({ error: "This submission ID was already used with different answers." });
      return res.json({ attempt: concurrent, duplicate: true });
    }
    res.status(201).json({ attempt, duplicate: false, explanations: assessment.questions.map((question) => question.explanation) });
  } catch (error) { next(error); }
});

import { Router, type Response } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireActiveEntitlement } from "../middleware/entitlement.js";
import { CurriculumModule } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { LessonSubmission } from "../models/LessonSubmission.js";
import { User } from "../models/User.js";
import { learningStats } from "../lib/gamification.js";
import { calendarDayNumber, isValidTimezone, lessonAvailability } from "../lib/learningProgression.js";
import { analyticsCsv, buildLearningAnalytics } from "../lib/learningAnalytics.js";
import { syncAchievements } from "../lib/achievements.js";
import { ReminderPreference } from "../models/ReminderPreference.js";
import { isQuietTime, nextReminderAt } from "../lib/reminders.js";

export const learningRouter = Router();
learningRouter.use(requireAuth, requireActiveEntitlement);

type PublicLessonSource = { exercises: unknown; prerequisiteLessonId?: unknown; [key: string]: unknown };
type SubmissionResult = { answerHash: string; score: number; correct: number; total: number; passed: boolean };

async function learningContext(res: Response) {
  const [lessons, progress] = await Promise.all([
    Lesson.find({ status: "published" }).sort({ sequenceNumber: 1 }).lean(),
    LessonProgress.find({ userId: res.locals.user._id }).lean(),
  ]);
  const timezone = res.locals.user.timezone || "UTC";
  const programDay = calendarDayNumber(res.locals.entitlement.grantedAt, new Date(), timezone);
  const availability = lessonAvailability({
    lessons: lessons.map((lesson) => ({
      id: String(lesson._id),
      sequenceNumber: lesson.sequenceNumber,
      unlockDay: lesson.unlockDay,
      prerequisiteLessonId: lesson.prerequisiteLessonId ? String(lesson.prerequisiteLessonId) : null,
    })),
    progress: progress.map((item) => ({ lessonId: String(item.lessonId), status: item.status })),
    programDay,
  });
  return { lessons, progress, availability, programDay, timezone };
}

function publicLesson(lesson: PublicLessonSource) {
  const details = { ...lesson };
  delete details.exercises;
  delete details.prerequisiteLessonId;
  return details;
}

async function learnerAnalytics(res: Response) {
  const [modules, lessons, progress, submissions] = await Promise.all([
    CurriculumModule.find().sort({ position: 1 }).lean(),
    Lesson.find({ status: "published" }).select("moduleId title").lean(),
    LessonProgress.find({ userId: res.locals.user._id }).select("lessonId status bestScore attempts completedAt").lean(),
    LessonSubmission.find({ userId: res.locals.user._id }).select("lessonId score correct total durationSeconds createdAt").sort({ createdAt: 1 }).lean(),
  ]);
  return buildLearningAnalytics({
    modules: modules.map((module) => ({ id: String(module._id), title: module.title, position: module.position, skills: module.skills })),
    lessons: lessons.map((lesson) => ({ id: String(lesson._id), moduleId: String(lesson.moduleId), title: lesson.title })),
    progress: progress.map((item) => ({ lessonId: String(item.lessonId), status: item.status, bestScore: item.bestScore, attempts: item.attempts, completedAt: item.completedAt })),
    submissions: submissions.map((item) => ({ lessonId: String(item.lessonId), score: item.score, correct: item.correct, total: item.total, durationSeconds: item.durationSeconds, createdAt: item.createdAt })),
    timezone: res.locals.user.timezone || "UTC",
  });
}

learningRouter.get("/analytics", async (_req, res, next) => {
  try { res.json(await learnerAnalytics(res)); } catch (error) { next(error); }
});

learningRouter.get("/analytics.csv", async (_req, res, next) => {
  try {
    const analytics = await learnerAnalytics(res);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="cognisprint-progress-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(analyticsCsv(analytics));
  } catch (error) { next(error); }
});

learningRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [modules, context] = await Promise.all([
      CurriculumModule.find().sort({ position: 1 }).lean(),
      learningContext(res),
    ]);
    const progressByLesson = new Map(context.progress.map((item) => [String(item.lessonId), item]));
    const availabilityByLesson = new Map(context.availability.map((item) => [item.id, item]));
    const lessons = context.lessons.map((lesson) => ({
      ...publicLesson(lesson as unknown as PublicLessonSource),
      progress: progressByLesson.get(String(lesson._id)) ?? null,
      availability: availabilityByLesson.get(String(lesson._id)),
    }));
    const continueLesson = lessons.find((lesson) => lesson.availability?.available && lesson.progress?.status === "started")
      ?? lessons.find((lesson) => lesson.availability?.available && lesson.progress?.status !== "completed")
      ?? null;
    const completedLessons = context.progress.filter((item) => item.status === "completed").length;
    const stats = learningStats(context.progress);
    const achievements = await syncAchievements(res.locals.user._id, context.progress);
    res.json({
      summary: {
        totalLessons: context.lessons.length,
        completedLessons,
        programDay: context.programDay,
        timezone: context.timezone,
        courseComplete: context.lessons.length >= 365 && completedLessons >= context.lessons.length,
        ...stats,
        badges: achievements,
      },
      continueLesson,
      modules: modules.map((module) => {
        const moduleLessons = lessons.filter((lesson) => String((lesson as Record<string, unknown>).moduleId) === String(module._id));
        return {
          ...module,
          completion: {
            totalLessons: moduleLessons.length,
            completedLessons: moduleLessons.filter((lesson) => lesson.progress?.status === "completed").length,
          },
          lessons: moduleLessons,
        };
      }),
    });
  } catch (error) { next(error); }
});

learningRouter.get("/lessons/:slug", async (req, res, next) => {
  try {
    const context = await learningContext(res);
    const lessonIndex = context.lessons.findIndex((item) => item.slug === req.params.slug);
    if (lessonIndex < 0) return res.status(404).json({ error: "Lesson not found." });
    const lesson = context.lessons[lessonIndex];
    const availability = context.availability[lessonIndex];
    if (!availability.available) {
      return res.status(423).json({
        error: availability.lockReason === "scheduled"
          ? `This lesson unlocks on program day ${lesson.unlockDay}.`
          : "Complete the previous lesson first.",
        lockReason: availability.lockReason,
        unlockDay: lesson.unlockDay,
        programDay: context.programDay,
      });
    }
    const progress = await LessonProgress.findOneAndUpdate(
      { userId: res.locals.user._id, lessonId: lesson._id },
      { $setOnInsert: { status: "started", startedAt: new Date(), attempts: 0, bestScore: 0, draftAnswers: [] } },
      { upsert: true, new: true }
    ).lean();
    const navigationLesson = (index: number) => {
      const item = context.lessons[index];
      if (!item) return null;
      const itemAvailability = context.availability[index];
      return { slug: item.slug, title: item.title, available: itemAvailability.available };
    };
    res.json({
      ...publicLesson(lesson as unknown as PublicLessonSource),
      exercises: lesson.exercises.map(({ prompt, options }) => ({ prompt, options })),
      progress,
      navigation: { previous: navigationLesson(lessonIndex - 1), next: navigationLesson(lessonIndex + 1) },
    });
  } catch (error) { next(error); }
});

const draftSchema = z.object({ answers: z.array(z.number().int().min(-1)).max(100) });

learningRouter.patch("/lessons/:slug/draft", async (req, res, next) => {
  try {
    const parsed = draftSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Draft answers are invalid." });
    const lesson = await Lesson.findOne({ slug: req.params.slug, status: "published" });
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });
    if (parsed.data.answers.length > lesson.exercises.length || parsed.data.answers.some((answer, index) => answer >= lesson.exercises[index].options.length)) {
      return res.status(422).json({ error: "Draft answers are invalid." });
    }
    const context = await learningContext(res);
    const index = context.lessons.findIndex((item) => String(item._id) === String(lesson._id));
    if (index < 0 || !context.availability[index].available) return res.status(423).json({ error: "This lesson is locked." });
    const progress = await LessonProgress.findOneAndUpdate(
      { userId: res.locals.user._id, lessonId: lesson._id },
      { $set: { draftAnswers: parsed.data.answers, draftUpdatedAt: new Date() }, $setOnInsert: { status: "started", startedAt: new Date(), attempts: 0, bestScore: 0 } },
      { upsert: true, new: true }
    ).lean();
    res.json({ saved: true, draftUpdatedAt: progress?.draftUpdatedAt });
  } catch (error) { next(error); }
});

const submissionSchema = z.object({
  submissionId: z.string().uuid(),
  answers: z.array(z.number().int().min(0)).max(100),
  durationSeconds: z.number().int().min(0).max(7200),
});

learningRouter.post("/lessons/:slug/complete", async (req, res, next) => {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Submit one valid answer for every exercise." });
    const lesson = await Lesson.findOne({ slug: req.params.slug, status: "published" });
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });
    if (parsed.data.answers.length !== lesson.exercises.length || parsed.data.answers.some((answer, index) => answer >= lesson.exercises[index].options.length)) {
      return res.status(422).json({ error: "Submit one valid answer for every exercise." });
    }
    const context = await learningContext(res);
    const lessonIndex = context.lessons.findIndex((item) => String(item._id) === String(lesson._id));
    if (lessonIndex < 0 || !context.availability[lessonIndex].available) return res.status(423).json({ error: "This lesson is locked." });

    const correct = lesson.exercises.reduce((total, exercise, index) => total + (exercise.correctIndex === parsed.data.answers[index] ? 1 : 0), 0);
    const score = lesson.exercises.length ? Math.round((correct / lesson.exercises.length) * 100) : 100;
    const passed = score >= lesson.passingScore;
    const submissionHash = createHash("sha256").update(JSON.stringify(parsed.data.answers)).digest("hex");
    let submission = await LessonSubmission.findOne({
      userId: res.locals.user._id, lessonId: lesson._id, submissionId: parsed.data.submissionId,
    }).select("answerHash score correct total passed").lean() as SubmissionResult | null;
    let duplicate = Boolean(submission);
    if (submission && submission.answerHash !== submissionHash) {
      return res.status(409).json({ error: "This submission ID was already used with different answers." });
    }
    if (!submission) {
      try {
        const created = await LessonSubmission.create({
          userId: res.locals.user._id,
          lessonId: lesson._id,
          submissionId: parsed.data.submissionId,
          answerHash: submissionHash,
          score,
          correct,
          total: lesson.exercises.length,
          passed,
          durationSeconds: parsed.data.durationSeconds,
        });
        submission = { answerHash: created.answerHash, score: created.score, correct: created.correct, total: created.total, passed: created.passed };
      } catch (error) {
        if ((error as { code?: number }).code !== 11000) throw error;
        duplicate = true;
        submission = await LessonSubmission.findOne({
          userId: res.locals.user._id, lessonId: lesson._id, submissionId: parsed.data.submissionId,
        }).select("answerHash score correct total passed").lean() as SubmissionResult | null;
        if (!submission || submission.answerHash !== submissionHash) {
          return res.status(409).json({ error: "This submission ID was already used with different answers." });
        }
      }
    }
    if (!submission) throw new Error("Lesson submission could not be recorded.");
    const authoritativeScore = submission.score;
    const authoritativePassed = submission.passed;
    await LessonProgress.updateOne(
      { userId: res.locals.user._id, lessonId: lesson._id },
      { $setOnInsert: { status: "started", startedAt: new Date(), attempts: 0, bestScore: 0, draftAnswers: [] } },
      { upsert: true }
    );
    const commonSet = {
      lastSubmissionId: parsed.data.submissionId,
      lastSubmissionHash: submissionHash,
      lastScore: authoritativeScore,
      draftAnswers: [] as number[],
      draftUpdatedAt: null,
    };
    const update = authoritativePassed
      ? { $set: { ...commonSet, status: "completed" as const }, $min: { completedAt: new Date() }, $max: { bestScore: authoritativeScore }, $inc: { attempts: 1 }, $addToSet: { appliedSubmissionIds: parsed.data.submissionId } }
      : { $set: commonSet, $max: { bestScore: authoritativeScore }, $inc: { attempts: 1 }, $addToSet: { appliedSubmissionIds: parsed.data.submissionId } };
    let progress = await LessonProgress.findOneAndUpdate(
      { userId: res.locals.user._id, lessonId: lesson._id, appliedSubmissionIds: { $ne: parsed.data.submissionId } },
      update,
      { new: true }
    ).lean();
    duplicate ||= !progress;
    progress ??= await LessonProgress.findOne({ userId: res.locals.user._id, lessonId: lesson._id }).lean();
    const allProgress = await LessonProgress.find({ userId: res.locals.user._id }).select("status bestScore completedAt").lean();
    const achievements = authoritativePassed ? await syncAchievements(res.locals.user._id, allProgress) : [];
    const nextLesson = context.lessons[lessonIndex + 1];
    const nextAvailable = Boolean(authoritativePassed && nextLesson && nextLesson.unlockDay <= context.programDay);
    res.json({
      score: authoritativeScore, correct: submission.correct, total: submission.total, passed: authoritativePassed, duplicate,
      explanations: lesson.exercises.map((item) => item.explanation),
      progress,
      achievements,
      nextLesson: authoritativePassed && nextLesson ? { slug: nextLesson.slug, title: nextLesson.title, available: nextAvailable } : null,
    });
  } catch (error) { next(error); }
});

const preferenceSchema = z.object({ timezone: z.string().min(1).max(100).refine(isValidTimezone, "Invalid IANA timezone.") });

const reminderSchema = z.object({ enabled: z.boolean(), localTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7), quietStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), quietEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/) }).refine((value) => !value.enabled || !isQuietTime(value.localTime, value.quietStart, value.quietEnd), { message: "Reminder time must be outside quiet hours." });
learningRouter.get("/reminders", async (_req, res, next) => { try { const preference = await ReminderPreference.findOne({ userId: res.locals.user._id }).lean(); res.json({ preference: preference ?? { enabled: false, localTime: "18:00", weekdays: [0,1,2,3,4,5,6], quietStart: "21:00", quietEnd: "08:00" } }); } catch (error) { next(error); } });
learningRouter.patch("/reminders", async (req, res, next) => { try { const parsed = reminderSchema.safeParse(req.body); if (!parsed.success) return res.status(422).json({ error: "Reminder preferences are invalid." }); const nextAt = parsed.data.enabled ? nextReminderAt(res.locals.user.timezone || "UTC", parsed.data.localTime, parsed.data.weekdays) : null; const preference = await ReminderPreference.findOneAndUpdate({ userId: res.locals.user._id }, { ...parsed.data, nextReminderAt: nextAt, unsubscribedAt: parsed.data.enabled ? null : new Date() }, { upsert: true, new: true }); res.json({ preference }); } catch (error) { next(error); } });

learningRouter.patch("/preferences", async (req, res, next) => {
  try {
    const parsed = preferenceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Choose a valid timezone." });
    await User.updateOne({ _id: res.locals.user._id }, { timezone: parsed.data.timezone });
    res.locals.user.timezone = parsed.data.timezone;
    res.json({ timezone: parsed.data.timezone });
  } catch (error) { next(error); }
});

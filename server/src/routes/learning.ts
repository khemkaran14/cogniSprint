import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireActiveEntitlement } from "../middleware/entitlement.js";
import { CurriculumModule } from "../models/Module.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { learningStats } from "../lib/gamification.js";

export const learningRouter = Router();
learningRouter.use(requireAuth, requireActiveEntitlement);

learningRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [modules, lessons, progress] = await Promise.all([
      CurriculumModule.find().sort({ position: 1 }).lean(),
      Lesson.find({ status: "published" }).sort({ position: 1 }).select("-exercises.correctIndex").lean(),
      LessonProgress.find({ userId: res.locals.user._id }).lean(),
    ]);
    const progressByLesson = new Map(progress.map((item) => [String(item.lessonId), item]));
    const publishedLessons = lessons.map((lesson) => ({ ...lesson, progress: progressByLesson.get(String(lesson._id)) ?? null }));
    res.json({
      summary: {
        totalLessons: lessons.length,
        completedLessons: progress.filter((item) => item.status === "completed").length,
        ...learningStats(progress),
      },
      modules: modules.map((module) => ({
        ...module,
        lessons: publishedLessons.filter((lesson) => String(lesson.moduleId) === String(module._id)),
      })),
    });
  } catch (error) { next(error); }
});

learningRouter.get("/lessons/:slug", async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug, status: "published" }).lean();
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });
    await LessonProgress.updateOne(
      { userId: res.locals.user._id, lessonId: lesson._id },
      { $setOnInsert: { status: "started", startedAt: new Date(), attempts: 0, bestScore: 0 } },
      { upsert: true }
    );
    const { exercises, ...details } = lesson;
    res.json({ ...details, exercises: exercises.map(({ prompt, options }) => ({ prompt, options })) });
  } catch (error) { next(error); }
});

const submissionSchema = z.object({ answers: z.array(z.number().int().min(0)).max(100) });

learningRouter.post("/lessons/:slug/complete", async (req, res, next) => {
  try {
    const parsed = submissionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ error: "Submit one answer for every exercise." });
    const lesson = await Lesson.findOne({ slug: req.params.slug, status: "published" });
    if (!lesson) return res.status(404).json({ error: "Lesson not found." });
    if (parsed.data.answers.length !== lesson.exercises.length) return res.status(422).json({ error: "Submit one answer for every exercise." });
    const correct = lesson.exercises.reduce((total, exercise, index) => total + (exercise.correctIndex === parsed.data.answers[index] ? 1 : 0), 0);
    const score = lesson.exercises.length ? Math.round((correct / lesson.exercises.length) * 100) : 100;
    const existing = await LessonProgress.findOne({ userId: res.locals.user._id, lessonId: lesson._id });
    const progress = await LessonProgress.findOneAndUpdate(
      { userId: res.locals.user._id, lessonId: lesson._id },
      { status: "completed", completedAt: new Date(), bestScore: Math.max(existing?.bestScore ?? 0, score), $inc: { attempts: 1 } },
      { upsert: true, new: true }
    );
    res.json({ score, correct, total: lesson.exercises.length, explanations: lesson.exercises.map((item) => item.explanation), progress });
  } catch (error) { next(error); }
});

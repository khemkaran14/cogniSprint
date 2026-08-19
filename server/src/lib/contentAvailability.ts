import { Assessment } from "../models/Assessment.js";
import { LearningResource } from "../models/LearningResource.js";
import { Lesson } from "../models/Lesson.js";

export const contentTargets = { lessons: 365, assessments: 12, workbooks: 1 } as const;
export type PublishedContentCounts = { lessons: number; exercises: number; assessments: number; assessmentQuestions: number; workbooks: number; worksheets: number };

export function evaluateContentAvailability(published: PublishedContentCounts) {
  return { published, targets: contentTargets, launchContentComplete: published.lessons >= contentTargets.lessons && published.assessments >= contentTargets.assessments && published.workbooks >= contentTargets.workbooks };
}

type AggregateTotal = Array<{ _id: null; total: number }>;
export async function loadContentAvailability() {
  const [lessons, exerciseTotals, assessments, questionTotals, workbooks, worksheets] = await Promise.all([
    Lesson.countDocuments({ status: "published" }),
    Lesson.aggregate<AggregateTotal[number]>([{ $match: { status: "published" } }, { $project: { count: { $size: "$exercises" } } }, { $group: { _id: null, total: { $sum: "$count" } } }]),
    Assessment.countDocuments({ status: "published" }),
    Assessment.aggregate<AggregateTotal[number]>([{ $match: { status: "published" } }, { $project: { count: { $size: "$questions" } } }, { $group: { _id: null, total: { $sum: "$count" } } }]),
    LearningResource.countDocuments({ status: "published", kind: "workbook" }),
    LearningResource.countDocuments({ status: "published", kind: "worksheet" }),
  ]);
  return evaluateContentAvailability({ lessons, exercises: exerciseTotals[0]?.total ?? 0, assessments, assessmentQuestions: questionTotals[0]?.total ?? 0, workbooks, worksheets });
}

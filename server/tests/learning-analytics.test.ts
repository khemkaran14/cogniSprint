import { describe, expect, it } from "vitest";
import { analyticsCsv, buildLearningAnalytics } from "../src/lib/learningAnalytics.js";

const analytics = buildLearningAnalytics({
  timezone: "Asia/Kolkata",
  now: new Date("2026-08-12T12:00:00Z"),
  modules: [
    { id: "module-1", title: "Foundations", position: 1, skills: ["focus", "memory"] },
    { id: "module-2", title: "Mental Math", position: 2, skills: ["mental-math"] },
  ],
  lessons: [
    { id: "lesson-1", moduleId: "module-1", title: "Routine" },
    { id: "lesson-2", moduleId: "module-1", title: "Recall" },
    { id: "lesson-3", moduleId: "module-2", title: "Addition" },
  ],
  progress: [
    { lessonId: "lesson-1", status: "completed", bestScore: 90, attempts: 2, completedAt: new Date("2026-08-11T19:00:00Z") },
    { lessonId: "lesson-2", status: "started", bestScore: 50, attempts: 1 },
  ],
  submissions: [
    { lessonId: "lesson-1", score: 70, correct: 7, total: 10, durationSeconds: 300, createdAt: new Date("2026-08-11T18:30:00Z") },
    { lessonId: "lesson-1", score: 90, correct: 9, total: 10, durationSeconds: 240, createdAt: new Date("2026-08-11T19:00:00Z") },
    { lessonId: "lesson-2", score: 50, correct: 5, total: 10, durationSeconds: 180, createdAt: new Date("2026-08-12T02:00:00Z") },
  ],
});

describe("buildLearningAnalytics", () => {
  it("aggregates overall and module completion", () => {
    expect(analytics.summary).toEqual({ totalLessons: 3, completedLessons: 1, completionPercent: 33.3, totalAttempts: 3, totalDurationSeconds: 720, averageScore: 70 });
    expect(analytics.modules[0]).toMatchObject({ title: "Foundations", completedLessons: 1, totalLessons: 2, completionPercent: 50, averageBestScore: 70 });
  });

  it("attributes submissions to every skill on the lesson module", () => {
    expect(analytics.skills.find((skill) => skill.skill === "focus")).toMatchObject({ attempts: 3, averageScore: 70, accuracyPercent: 70, durationSeconds: 720 });
    expect(analytics.skills.find((skill) => skill.skill === "memory")).toMatchObject({ attempts: 3, averageScore: 70 });
    expect(analytics.skills.find((skill) => skill.skill === "mental-math")).toMatchObject({ attempts: 0, averageScore: null });
  });

  it("groups activity using the learner timezone", () => {
    expect(analytics.activity).toEqual([
      { date: "2026-08-12", attempts: 3, completedLessons: 1, durationSeconds: 720, averageScore: 70 },
    ]);
  });
});

describe("analyticsCsv", () => {
  it("exports skills, modules and activity with escaped values", () => {
    const csv = analyticsCsv(analytics);
    expect(csv).toContain('"skill","focus","3","70","70","720"');
    expect(csv).toContain('"module","Foundations"');
    expect(csv).toContain('"activity","2026-08-12"');
    expect(csv.endsWith("\n")).toBe(true);
  });
});

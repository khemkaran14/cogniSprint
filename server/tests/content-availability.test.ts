import { describe, expect, it } from "vitest";
import { assessmentSeed, lessonSeed, productSeed } from "../src/seed/data.js";

describe("public content availability", () => {
  it("ships a complete sequential curriculum without publishing unreviewed drafts", () => {
    expect(productSeed.status).toBe("draft");
    expect(lessonSeed).toHaveLength(365);
    expect(lessonSeed.filter((lesson) => lesson.status === "published")).toHaveLength(3);
    expect(lessonSeed.filter((lesson) => lesson.status === "in_review")).toHaveLength(362);
    expect(lessonSeed.map((lesson) => lesson.sequenceNumber)).toEqual(Array.from({ length: 365 }, (_, index) => index + 1));
    expect(lessonSeed.map((lesson) => lesson.unlockDay)).toEqual(Array.from({ length: 365 }, (_, index) => index + 1));
    expect(new Set(lessonSeed.map((lesson) => lesson.slug)).size).toBe(365);
    expect(new Set(lessonSeed.map((lesson) => `${lesson.moduleSlug}:${lesson.position}`)).size).toBe(365);
    expect(assessmentSeed).toHaveLength(12);
    expect(assessmentSeed.filter((assessment) => assessment.status === "published")).toHaveLength(1);
    expect(assessmentSeed.filter((assessment) => assessment.status === "in_review")).toHaveLength(11);
    expect(new Set(assessmentSeed.map((assessment) => assessment.month))).toEqual(new Set(Array.from({ length: 12 }, (_, index) => index + 1)));
    expect(new Set(assessmentSeed.map((assessment) => assessment.slug)).size).toBe(12);
  });

  it("provides valid, uniquely answerable questions across every monthly assessment", () => {
    const validSkills = new Set(["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"]);
    assessmentSeed.forEach((assessment) => {
      expect(assessment.questions.length).toBeGreaterThanOrEqual(6);
      expect(new Set(assessment.questions.map((question) => question.skill))).toEqual(validSkills);
      for (const question of assessment.questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(3);
        expect(question.correctIndex).toBeGreaterThanOrEqual(0);
        expect(question.correctIndex).toBeLessThan(question.options.length);
        expect(question.explanation.length).toBeGreaterThan(20);
      }
    });
  });

  it("provides complete, valid lesson exercises and an unbroken prerequisite chain", () => {
    lessonSeed.forEach((lesson, index) => {
      expect(lesson.content.length).toBeGreaterThanOrEqual(2);
      expect(lesson.exercises.length).toBeGreaterThanOrEqual(1);
      if (index > 0) expect(lesson.prerequisiteSlug).toBe(lessonSeed[index - 1].slug);
      for (const exercise of lesson.exercises) {
        expect(exercise.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(exercise.options).size).toBe(exercise.options.length);
        expect(exercise.correctIndex).toBeGreaterThanOrEqual(0);
        expect(exercise.correctIndex).toBeLessThan(exercise.options.length);
        expect(exercise.explanation.length).toBeGreaterThan(20);
      }
    });
  });
  it("does not advertise unavailable downloads or completion benefits as included", () => {
    for (const key of ["workbook", "worksheets", "progress_sheets", "certificate", "daily_sessions", "practice_phase"]) expect(productSeed.includes.find((item) => item.key === key)?.enabled).toBe(false);
  });
});

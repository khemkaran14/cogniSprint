import { describe, expect, it } from "vitest";
import { Assessment } from "../src/models/Assessment.js";
import { AssessmentAttempt } from "../src/models/AssessmentAttempt.js";

describe("assessment schemas", () => {
  it("rejects invalid months and skills", () => {
    const assessment = new Assessment({ slug: "bad", title: "Bad", description: "Bad", month: 13, estimatedMinutes: 5, questions: [{ prompt: "?", skill: "unknown", options: ["a"], correctIndex: 0, explanation: "a" }], status: "draft" });
    const error = assessment.validateSync();
    expect(error?.errors.month).toBeDefined();
    expect(error?.errors["questions.0.skill"]).toBeDefined();
  });
  it("has retry-safety and owner-history indexes", () => {
    const indexes = AssessmentAttempt.schema.indexes();
    expect(indexes.some(([keys, options]) => keys.userId === 1 && keys.assessmentId === 1 && keys.submissionId === 1 && options.unique)).toBe(true);
    expect(indexes.some(([keys]) => keys.userId === 1 && keys.createdAt === -1)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { scoreAssessment } from "../src/lib/assessmentScoring.js";

describe("scoreAssessment", () => {
  const questions = [{ skill: "focus", correctIndex: 1 }, { skill: "focus", correctIndex: 0 }, { skill: "logic", correctIndex: 2 }];
  it("scores the whole assessment and each skill", () => {
    expect(scoreAssessment(questions, [1, 2, 2])).toEqual({ correct: 2, total: 3, score: 67, skillResults: [{ skill: "focus", correct: 1, total: 2, score: 50 }, { skill: "logic", correct: 1, total: 1, score: 100 }] });
  });
  it("handles an empty question set deterministically", () => {
    expect(scoreAssessment([], [])).toEqual({ correct: 0, total: 0, score: 100, skillResults: [] });
  });
});

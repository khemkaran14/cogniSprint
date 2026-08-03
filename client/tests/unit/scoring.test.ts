import { describe, it, expect } from "vitest";
import { scoreSkill, buildChallengeResult, feedbackForScore } from "@/lib/challengeScoring";

describe("scoreSkill", () => {
  it("computes a rounded percentage", () => {
    expect(scoreSkill("mental-math", 2, 3)).toEqual({ skill: "mental-math", correct: 2, total: 3, percentage: 67 });
  });
  it("returns 0 for a zero-total skill instead of dividing by zero", () => {
    expect(scoreSkill("memory", 0, 0).percentage).toBe(0);
  });
  it("caps at 100 for a perfect score", () => {
    expect(scoreSkill("logic", 3, 3).percentage).toBe(100);
  });
});

describe("buildChallengeResult", () => {
  it("averages skill percentages into an overall score", () => {
    const scores = [scoreSkill("mental-math", 3, 3), scoreSkill("memory", 4, 8), scoreSkill("logic", 0, 3)];
    const result = buildChallengeResult(scores, 120);
    expect(result.overallScore).toBe(50);
    expect(result.durationSeconds).toBe(120);
  });

  it("identifies the strongest and weakest (focus) skill", () => {
    const scores = [scoreSkill("mental-math", 3, 3), scoreSkill("memory", 1, 8), scoreSkill("logic", 2, 3)];
    const result = buildChallengeResult(scores, 90);
    expect(result.strongestSkill).toBe("mental-math");
    expect(result.focusSkill).toBe("memory");
  });
});

describe("feedbackForScore", () => {
  it("gives encouraging tiers without implying a diagnostic result", () => {
    expect(feedbackForScore(95)).toMatch(/strong performance/i);
    expect(feedbackForScore(70)).toMatch(/solid result/i);
    expect(feedbackForScore(20)).toMatch(/starting point/i);
  });
});

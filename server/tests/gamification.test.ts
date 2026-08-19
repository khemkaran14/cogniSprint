import { describe, expect, it } from "vitest";
import { earnedAchievements, learningStats } from "../src/lib/gamification.js";
import { Achievement } from "../src/models/Achievement.js";

describe("learningStats", () => {
  it("counts a streak ending today", () => {
    const result = learningStats([
      { status: "completed", bestScore: 100, completedAt: new Date("2026-08-11T01:00:00Z") },
      { status: "completed", bestScore: 80, completedAt: new Date("2026-08-10T23:00:00Z") },
    ], new Date("2026-08-11T12:00:00Z"));
    expect(result.streak).toBe(2);
    expect(result.xp).toBe(290);
    expect(result.badges).toContainEqual({ key: "perfect-score", label: "Perfect Score" });
  });

  it("allows a streak to continue when today has no completion yet", () => {
    expect(learningStats([
      { status: "completed", bestScore: 50, completedAt: new Date("2026-08-10T12:00:00Z") },
    ], new Date("2026-08-11T08:00:00Z")).streak).toBe(1);
  });

  it("does not award XP for started lessons", () => {
    expect(learningStats([{ status: "started", bestScore: 100 }]).xp).toBe(0);
  });

  it("derives stable achievement keys for persistence", () => {
    expect(earnedAchievements([{ status: "completed", bestScore: 100, completedAt: new Date("2026-08-11T01:00:00Z") }], new Date("2026-08-11T12:00:00Z")))
      .toEqual([{ key: "first-step", label: "First Step" }, { key: "perfect-score", label: "Perfect Score" }]);
  });

  it("enforces one record per user and achievement key", () => {
    expect(Achievement.schema.indexes().some(([keys, options]) => keys.userId === 1 && keys.key === 1 && options.unique)).toBe(true);
  });
});

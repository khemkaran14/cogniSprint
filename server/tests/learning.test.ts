import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { Lesson } from "../src/models/Lesson.js";
import { LessonProgress } from "../src/models/LessonProgress.js";

describe("learning schemas", () => {
  it("requires published lessons to contain valid exercises", () => {
    const lesson = new Lesson({
      moduleId: new Types.ObjectId(), position: 1, slug: "practice-basics", title: "Practice basics",
      summary: "A useful introduction.", estimatedMinutes: 5, content: ["Read carefully."], status: "published",
      exercises: [{ prompt: "Choose one", options: ["A", "B"], correctIndex: 1, explanation: "B is correct." }],
    });
    expect(lesson.validateSync()).toBeUndefined();
  });

  it("enforces one progress record per learner and lesson", () => {
    const index = LessonProgress.schema.indexes().find(([fields]) => fields.userId === 1 && fields.lessonId === 1);
    expect(index?.[1]).toMatchObject({ unique: true });
  });

  it("bounds persisted scores to a percentage", () => {
    const progress = new LessonProgress({ userId: new Types.ObjectId(), lessonId: new Types.ObjectId(), bestScore: 101 });
    expect(progress.validateSync()?.errors.bestScore).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";
import { contentTargets, evaluateContentAvailability } from "../src/lib/contentAvailability.js";

describe("published content availability audit", () => {
  it("keeps launch incomplete when repository content is below public targets", () => {
    const result = evaluateContentAvailability({ lessons: 3, exercises: 3, assessments: 1, assessmentQuestions: 2, workbooks: 0, worksheets: 0 });
    expect(result.targets).toEqual({ lessons: 365, assessments: 12, workbooks: 1 });
    expect(result.launchContentComplete).toBe(false);
  });
  it("requires every launch-critical content category", () => {
    const complete = { lessons: contentTargets.lessons, exercises: 1000, assessments: contentTargets.assessments, assessmentQuestions: 120, workbooks: contentTargets.workbooks, worksheets: 1 };
    expect(evaluateContentAvailability(complete).launchContentComplete).toBe(true);
    expect(evaluateContentAvailability({ ...complete, assessments: 11 }).launchContentComplete).toBe(false);
    expect(evaluateContentAvailability({ ...complete, workbooks: 0 }).launchContentComplete).toBe(false);
  });
});

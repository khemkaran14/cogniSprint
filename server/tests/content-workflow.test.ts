import { describe, expect, it } from "vitest";
import { canTransitionContent, contentTransitionDates } from "../src/lib/contentWorkflow.js";
import { Lesson } from "../src/models/Lesson.js";
import { Assessment } from "../src/models/Assessment.js";

describe("content review workflow", () => {
  it("allows only reviewed release transitions", () => {
    expect(canTransitionContent("draft", "in_review")).toBe(true);
    expect(canTransitionContent("draft", "published")).toBe(false);
    expect(canTransitionContent("in_review", "approved")).toBe(true);
    expect(canTransitionContent("approved", "published")).toBe(true);
    expect(canTransitionContent("published", "draft")).toBe(false);
    expect(canTransitionContent("published", "archived")).toBe(true);
  });
  it("records milestone timestamps", () => {
    const now = new Date("2026-08-18T12:00:00Z");
    expect(contentTransitionDates("approved", now)).toEqual({ reviewedAt: now, approvedAt: now });
    expect(contentTransitionDates("published", now)).toEqual({ publishedAt: now, archivedAt: null });
  });
  it("applies the same states to lessons and assessments", () => {
    const states = ["draft", "in_review", "changes_requested", "approved", "published", "archived"];
    expect(Lesson.schema.path("status").options.enum).toEqual(states);
    expect(Assessment.schema.path("status").options.enum).toEqual(states);
  });
});

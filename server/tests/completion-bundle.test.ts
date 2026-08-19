import { describe, expect, it } from "vitest";
import { assessmentAuthoringSchema, learnerPreview, lessonAuthoringSchema } from "../src/lib/contentAuthoring.js";
import { isQuietTime, nextReminderAt } from "../src/lib/reminders.js";
import { ContentRevision } from "../src/models/ContentRevision.js";
import { PrivacyErasure } from "../src/models/PrivacyErasure.js";

describe("content authoring", () => {
  it("rejects an answer index outside its options", () => { expect(lessonAuthoringSchema.safeParse({ moduleId: "a".repeat(24), position: 1, sequenceNumber: 1, unlockDay: 1, slug: "test", title: "Test lesson", summary: "A useful lesson summary", estimatedMinutes: 10, passingScore: 60, content: ["Body"], exercises: [{ prompt: "Choose an answer", options: ["A", "B"], correctIndex: 2, explanation: "Because it is correct" }] }).success).toBe(false); });
  it("removes answers and explanations from previews", () => { expect(learnerPreview("assessment", { questions: [{ prompt: "Question", correctIndex: 0, explanation: "Secret", options: ["A"] }] })).toEqual({ questions: [{ prompt: "Question", options: ["A"] }] }); });
  it("constrains revision uniqueness", () => { expect(ContentRevision.schema.indexes().some(([keys, options]) => keys.contentType === 1 && keys.contentId === 1 && keys.version === -1 && options.unique)).toBe(true); expect(assessmentAuthoringSchema).toBeDefined(); });
});
describe("reminders and privacy", () => {
  it("handles overnight quiet hours", () => { expect(isQuietTime("23:00", "21:00", "08:00")).toBe(true); expect(isQuietTime("12:00", "21:00", "08:00")).toBe(false); });
  it("finds a timezone-local reminder", () => { const next = nextReminderAt("UTC", "18:00", [3], new Date("2026-08-19T17:58:00Z")); expect(next.toISOString()).toBe("2026-08-19T18:00:00.000Z"); });
  it("permits only one erasure record per request", () => { expect(PrivacyErasure.schema.path("requestId").options.unique).toBe(true); });
});

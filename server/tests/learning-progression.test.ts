import { describe, expect, it } from "vitest";
import { calendarDayNumber, isValidTimezone, lessonAvailability } from "../src/lib/learningProgression.js";

const lessons = [
  { id: "one", sequenceNumber: 1, unlockDay: 1 },
  { id: "two", sequenceNumber: 2, unlockDay: 2 },
  { id: "three", sequenceNumber: 3, unlockDay: 3, prerequisiteLessonId: "two" },
];

describe("calendarDayNumber", () => {
  it("uses the learner timezone instead of elapsed 24-hour periods", () => {
    const start = new Date("2026-08-11T23:30:00Z");
    const now = new Date("2026-08-12T00:30:00Z");
    expect(calendarDayNumber(start, now, "UTC")).toBe(2);
    expect(calendarDayNumber(start, now, "America/New_York")).toBe(1);
  });

  it("never returns a day below one", () => {
    expect(calendarDayNumber(new Date("2026-08-12T00:00:00Z"), new Date("2026-08-11T00:00:00Z"), "UTC")).toBe(1);
  });
});

describe("lessonAvailability", () => {
  it("requires both schedule and sequential prerequisites", () => {
    const result = lessonAvailability({ lessons, progress: [], programDay: 2 });
    expect(result.map((item) => [item.available, item.lockReason])).toEqual([
      [true, null],
      [false, "prerequisite"],
      [false, "scheduled"],
    ]);
  });

  it("unlocks the next lesson after its prerequisite is complete", () => {
    const result = lessonAvailability({ lessons, progress: [{ lessonId: "one", status: "completed" }], programDay: 2 });
    expect(result[1]).toMatchObject({ available: true, lockReason: null });
    expect(result[2]).toMatchObject({ available: false, lockReason: "scheduled" });
  });
});

describe("isValidTimezone", () => {
  it("accepts IANA timezones and rejects arbitrary strings", () => {
    expect(isValidTimezone("Asia/Kolkata")).toBe(true);
    expect(isValidTimezone("not/a-timezone")).toBe(false);
  });
});

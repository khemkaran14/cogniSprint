import { describe, expect, it } from "vitest";
import { isEnrollmentOpen } from "../src/lib/availability.js";

describe("enrollment availability", () => {
  it("fails closed by default", () => expect(isEnrollmentOpen({})).toBe(false));
  it("opens only with an explicit true value", () => {
    expect(isEnrollmentOpen({ ENROLLMENT_OPEN: "true" })).toBe(true);
    expect(isEnrollmentOpen({ ENROLLMENT_OPEN: "false" })).toBe(false);
    expect(isEnrollmentOpen({ ENROLLMENT_OPEN: "1" })).toBe(false);
  });
});

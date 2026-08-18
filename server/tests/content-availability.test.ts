import { describe, expect, it } from "vitest";
import { assessmentSeed, lessonSeed, productSeed } from "../src/seed/data.js";

describe("public content availability", () => {
  it("keeps enrollment closed while only preview content is published", () => {
    expect(productSeed.status).toBe("draft");
    expect(lessonSeed).toHaveLength(3);
    expect(assessmentSeed).toHaveLength(1);
  });
  it("does not advertise unavailable downloads or completion benefits as included", () => {
    for (const key of ["workbook", "worksheets", "progress_sheets", "certificate", "daily_sessions", "practice_phase"]) expect(productSeed.includes.find((item) => item.key === key)?.enabled).toBe(false);
  });
});

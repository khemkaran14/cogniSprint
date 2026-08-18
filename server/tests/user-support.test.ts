import { describe, expect, it } from "vitest";
import { User } from "../src/models/User.js";

describe("learner support account state", () => {
  it("defaults new learners to active and constrains supported states", () => {
    const status = User.schema.path("status") as unknown as { options: { default: string; enum: string[] } };
    expect(status.options.default).toBe("active");
    expect(status.options.enum).toEqual(["active", "suspended"]);
  });
});

import { describe, expect, it } from "vitest";
import { PrivacyRequest } from "../src/models/PrivacyRequest.js";
describe("privacy request model", () => {
  it("constrains lifecycle states and indexes the operations queue", () => {
    expect(PrivacyRequest.schema.path("status").options.enum).toEqual(["pending", "in_review", "completed", "rejected", "cancelled"]);
    expect(PrivacyRequest.schema.indexes()).toEqual(expect.arrayContaining([[{ status: 1, createdAt: 1 }, expect.any(Object)]]));
  });
});

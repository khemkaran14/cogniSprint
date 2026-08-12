import { describe, expect, it } from "vitest";
import { Certificate } from "../src/models/Certificate.js";

describe("Certificate", () => {
  it("enforces one certificate per learner and product", () => {
    const index = Certificate.schema.indexes().find(([fields]) => fields.userId === 1 && fields.productId === 1);
    expect(index?.[1]).toMatchObject({ unique: true });
  });

  it("uses unique public verification codes", () => {
    expect(Certificate.schema.path("verificationCode").options.unique).toBe(true);
  });
});

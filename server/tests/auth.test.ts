import { describe, expect, it } from "vitest";
import { createOpaqueToken, hashPassword, hashToken, verifyPassword } from "../src/lib/auth.js";
import { loginSchema, registerSchema, resetPasswordSchema } from "../src/lib/validation.js";

describe("authentication primitives", () => {
  it("hashes and verifies passwords without storing plaintext", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(stored).not.toContain("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", stored)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", stored)).resolves.toBe(false);
  });

  it("creates opaque tokens and only persists a deterministic digest", () => {
    const token = createOpaqueToken();
    expect(token.raw).not.toBe(token.hash);
    expect(token.hash).toBe(hashToken(token.raw));
    expect(token.hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("authentication validation", () => {
  it("normalizes email addresses during registration and login", () => {
    expect(registerSchema.parse({ name: "Ada Lovelace", email: " ADA@Example.com ", password: "long-enough", acceptedTerms: true }).email).toBe("ada@example.com");
    expect(loginSchema.parse({ email: " ADA@Example.com ", password: "long-enough" }).email).toBe("ada@example.com");
  });

  it("rejects weak passwords and missing terms consent", () => {
    expect(registerSchema.safeParse({ name: "Ada", email: "ada@example.com", password: "short", acceptedTerms: false }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "x".repeat(32), password: "short" }).success).toBe(false);
  });
});

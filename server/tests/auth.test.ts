import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  verifyAuthToken,
  generateVerificationToken,
  hashToken,
} from "../src/lib/auth.js";

beforeEach(() => {
  process.env.AUTH_SECRET = "test_auth_secret";
});

afterEach(() => {
  delete process.env.AUTH_SECRET;
});

describe("password hashing", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toBe("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces a different hash each time (salted)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });
});

describe("auth tokens", () => {
  it("signs and verifies a token round-trip", () => {
    const token = signAuthToken({ sub: "user123", role: "student" });
    const payload = verifyAuthToken(token);
    expect(payload?.sub).toBe("user123");
    expect(payload?.role).toBe("student");
  });

  it("rejects a tampered token", () => {
    const token = signAuthToken({ sub: "user123", role: "student" });
    const tampered = token.slice(0, -2) + "xx";
    expect(verifyAuthToken(tampered)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const token = signAuthToken({ sub: "user123", role: "student" });
    process.env.AUTH_SECRET = "a_completely_different_secret";
    expect(verifyAuthToken(token)).toBeNull();
  });

  it("throws when AUTH_SECRET is not configured", () => {
    delete process.env.AUTH_SECRET;
    expect(() => signAuthToken({ sub: "user123", role: "student" })).toThrow();
  });
});

describe("verification tokens", () => {
  it("generates a token whose hash matches hashToken() of the raw value", () => {
    const { rawToken, tokenHash } = generateVerificationToken();
    expect(hashToken(rawToken)).toBe(tokenHash);
  });

  it("generates a different token each call", () => {
    const a = generateVerificationToken();
    const b = generateVerificationToken();
    expect(a.rawToken).not.toBe(b.rawToken);
  });
});

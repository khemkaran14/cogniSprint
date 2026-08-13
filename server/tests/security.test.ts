import { describe, expect, it } from "vitest";
import { allowedOrigins, sessionCookieAttributes } from "../src/lib/security.js";

describe("security configuration", () => {
  it("normalizes a comma-separated origin allowlist", () => {
    expect(allowedOrigins({ CLIENT_URL: "https://www.example.com/, https://preview.example.com" })).toEqual([
      "https://www.example.com",
      "https://preview.example.com",
    ]);
  });

  it("uses secure cross-site cookies when explicitly configured", () => {
    expect(sessionCookieAttributes({ NODE_ENV: "production", COOKIE_SAME_SITE: "none", COOKIE_DOMAIN: ".example.com" }))
      .toBe("HttpOnly; Path=/; SameSite=None; Secure; Domain=.example.com");
  });

  it("keeps local development cookies usable without TLS", () => {
    expect(sessionCookieAttributes({ NODE_ENV: "development" })).toBe("HttpOnly; Path=/; SameSite=Lax");
  });
});

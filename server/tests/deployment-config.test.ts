import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const blueprint = readFileSync(new URL("../../render.yaml", import.meta.url), "utf8");
describe("Render staging blueprint", () => {
  it("declares the API, web application, migrations and health check", () => {
    expect(blueprint).toContain("name: cognisprint-staging-api");
    expect(blueprint).toContain("name: cognisprint-staging-web");
    expect(blueprint).toContain("preDeployCommand: npm run migrate:prod");
    expect(blueprint).toContain("healthCheckPath: /api/health");
    expect(blueprint).toContain("destination: /index.html");
  });
  it("keeps credentials dashboard-managed", () => {
    for (const key of ["MONGODB_URI", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "RESEND_API_KEY", "LOG_DRAIN_TOKEN"]) expect(blueprint).toMatch(new RegExp(`key: ${key}\\n\\s+sync: false`));
  });
});

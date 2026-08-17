import { describe, expect, it } from "vitest";
import { deploymentChecks, runDeploymentSmoke } from "../src/lib/deploymentSmoke.js";

describe("deployment smoke checks", () => {
  it("defines liveness, readiness, access guard, and SPA checks", () => {
    expect(deploymentChecks("https://api.example.com", "https://app.example.com").map((check) => check.name)).toEqual(["API liveness", "API readiness", "Authentication guard", "Learning entitlement guard", "SPA login fallback"]);
  });
  it("rejects non-origin configuration", () => {
    expect(() => deploymentChecks("https://api.example.com/api", "https://app.example.com")).toThrow(/origin/);
  });
  it("reports all failures without stopping subsequent checks", async () => {
    const checks = [{ name: "first", url: "https://example.com/one", expectedStatus: 200 }, { name: "second", url: "https://example.com/two", expectedStatus: 200 }];
    const fetcher = async (input: string | URL | Request) => new Response(null, { status: String(input).endsWith("one") ? 503 : 200 });
    const results = await runDeploymentSmoke(checks, fetcher as typeof fetch);
    expect(results.map(({ name, status }) => ({ name, status }))).toEqual([{ name: "first", status: "failed" }, { name: "second", status: "passed" }]);
  });
});

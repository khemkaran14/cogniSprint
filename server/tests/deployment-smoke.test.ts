import { describe, expect, it } from "vitest";
import { deploymentChecks, runDeploymentSmoke } from "../src/lib/deploymentSmoke.js";

describe("deployment smoke checks", () => {
  it("defines liveness, readiness, access guard, CORS, and SPA checks", () => {
    expect(deploymentChecks("https://api.example.com", "https://app.example.com").map((check) => check.name)).toEqual([
      "API liveness", "API readiness", "Content availability", "Authentication guard", "Learning entitlement guard",
      "CORS allows the configured app origin", "CORS rejects an untrusted origin", "SPA login fallback",
    ]);
  });
  it("rejects non-origin configuration", () => {
    expect(() => deploymentChecks("https://api.example.com/api", "https://app.example.com")).toThrow(/origin/);
  });
  it("sends the app origin on the allowed-origin CORS check and validates the response headers", async () => {
    const checks = deploymentChecks("https://api.example.com", "https://app.example.com");
    const check = checks.find((item) => item.name === "CORS allows the configured app origin")!;
    expect(check.headers).toEqual({ origin: "https://app.example.com" });
    await expect(check.validate?.(new Response(null, { headers: { "access-control-allow-origin": "https://app.example.com", "access-control-allow-credentials": "true" } }))).resolves.toBeUndefined();
    await expect(check.validate?.(new Response(null, { headers: { "access-control-allow-origin": "https://wrong-origin.example" } }))).rejects.toThrow(/access-control-allow-origin/);
  });
  it("expects an untrusted origin to be rejected without CORS headers", async () => {
    const checks = deploymentChecks("https://api.example.com", "https://app.example.com");
    const check = checks.find((item) => item.name === "CORS rejects an untrusted origin")!;
    expect(check.expectedStatus).toBe(500);
    expect(check.headers).toEqual({ origin: "https://cors-smoke-check.invalid" });
    await expect(check.validate?.(new Response(JSON.stringify({ error: "Internal server error." }), { headers: { "content-type": "application/json" } }))).resolves.toBeUndefined();
    await expect(check.validate?.(new Response(JSON.stringify({ error: "Internal server error." }), { headers: { "content-type": "application/json", "access-control-allow-origin": "https://cors-smoke-check.invalid" } }))).rejects.toThrow(/must not receive/);
  });
  it("reports all failures without stopping subsequent checks", async () => {
    const checks = [{ name: "first", url: "https://example.com/one", expectedStatus: 200 }, { name: "second", url: "https://example.com/two", expectedStatus: 200 }];
    const fetcher = async (input: string | URL | Request) => new Response(null, { status: String(input).endsWith("one") ? 503 : 200 });
    const results = await runDeploymentSmoke(checks, fetcher as typeof fetch);
    expect(results.map(({ name, status }) => ({ name, status }))).toEqual([{ name: "first", status: "failed" }, { name: "second", status: "passed" }]);
  });
  it("forwards per-check headers to the fetcher", async () => {
    const checks = [{ name: "with-origin", url: "https://example.com/one", expectedStatus: 200, headers: { origin: "https://app.example.com" } }];
    let capturedHeaders: HeadersInit | undefined;
    const fetcher = async (_input: string | URL | Request, init?: RequestInit) => { capturedHeaders = init?.headers; return new Response(null, { status: 200 }); };
    await runDeploymentSmoke(checks, fetcher as typeof fetch);
    expect(capturedHeaders).toMatchObject({ origin: "https://app.example.com" });
  });
});

export type SmokeCheck = { name: string; url: string; expectedStatus: number; headers?: Record<string, string>; validate?: (response: Response) => Promise<void> };
export type SmokeResult = { name: string; status: "passed" | "failed"; durationMs: number; error?: string };

function normalizedOrigin(value: string, label: string) {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error(`${label} must be an absolute HTTP(S) URL.`); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${label} must be an HTTP(S) URL.`);
  if (url.pathname !== "/" || url.search || url.hash) throw new Error(`${label} must be an origin without a path, query, or fragment.`);
  return url.origin;
}

async function jsonField(response: Response, field: string, expected: string) {
  const body = await response.json() as Record<string, unknown>;
  if (body[field] !== expected) throw new Error(`Expected ${field}=${expected}.`);
}

async function stagingContentAvailability(response: Response) {
  const body = await response.json() as { enrollmentOpen?: boolean; published?: { lessons?: number; assessments?: number }; targets?: { lessons?: number; assessments?: number } };
  if (body.enrollmentOpen !== false) throw new Error("Staging enrollment must remain closed.");
  if (!Number.isInteger(body.published?.lessons) || !Number.isInteger(body.published?.assessments) || !body.targets?.lessons || !body.targets?.assessments) throw new Error("Content availability inventory is incomplete.");
}

function trustedOriginCorsHeaders(app: string) {
  return async (response: Response) => {
    if (response.headers.get("access-control-allow-origin") !== app) throw new Error(`Expected access-control-allow-origin=${app}.`);
    if (response.headers.get("access-control-allow-credentials") !== "true") throw new Error("Expected access-control-allow-credentials=true for the configured app origin.");
  };
}

async function untrustedOriginRejected(response: Response) {
  if (response.headers.get("access-control-allow-origin")) throw new Error("An untrusted origin must not receive an access-control-allow-origin header.");
  const body = await response.json() as { error?: string };
  if (!body.error) throw new Error("Expected a JSON error body for a rejected origin.");
}

export function deploymentChecks(apiValue: string, appValue: string): SmokeCheck[] {
  const api = normalizedOrigin(apiValue, "API_URL"); const app = normalizedOrigin(appValue, "APP_URL");
  return [
    { name: "API liveness", url: `${api}/api/health`, expectedStatus: 200, validate: (response) => jsonField(response, "status", "ok") },
    { name: "API readiness", url: `${api}/api/ready`, expectedStatus: 200, validate: (response) => jsonField(response, "database", "connected") },
    { name: "Content availability", url: `${api}/api/content-availability`, expectedStatus: 200, validate: stagingContentAvailability },
    { name: "Authentication guard", url: `${api}/api/auth/sessions`, expectedStatus: 401 },
    { name: "Learning entitlement guard", url: `${api}/api/learning/dashboard`, expectedStatus: 401 },
    { name: "CORS allows the configured app origin", url: `${api}/api/health`, expectedStatus: 200, headers: { origin: app }, validate: trustedOriginCorsHeaders(app) },
    { name: "CORS rejects an untrusted origin", url: `${api}/api/health`, expectedStatus: 500, headers: { origin: "https://cors-smoke-check.invalid" }, validate: untrustedOriginRejected },
    { name: "SPA login fallback", url: `${app}/login`, expectedStatus: 200, validate: async (response) => { if (!response.headers.get("content-type")?.includes("text/html")) throw new Error("Expected an HTML response."); } },
  ];
}

export async function runDeploymentSmoke(checks: SmokeCheck[], fetcher: typeof fetch = fetch): Promise<SmokeResult[]> {
  const results: SmokeResult[] = [];
  for (const check of checks) {
    const started = Date.now();
    try {
      const response = await fetcher(check.url, { redirect: "error", signal: AbortSignal.timeout(10_000), headers: { "user-agent": "cognisprint-deployment-smoke/1.0", ...check.headers } });
      if (response.status !== check.expectedStatus) throw new Error(`Expected HTTP ${check.expectedStatus}, received ${response.status}.`);
      await check.validate?.(response);
      results.push({ name: check.name, status: "passed", durationMs: Date.now() - started });
    } catch (error) { results.push({ name: check.name, status: "failed", durationMs: Date.now() - started, error: error instanceof Error ? error.message : "Unknown smoke-test failure." }); }
  }
  return results;
}

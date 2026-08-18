import { afterEach, describe, expect, it, vi } from "vitest";
import { buildLogRecord, deliverLogRecord, sanitizeLogData } from "../src/lib/logger.js";

afterEach(() => { delete process.env.LOG_DRAIN_URL; delete process.env.LOG_DRAIN_TOKEN; });
describe("structured logger", () => {
  it("redacts sensitive fields and handles circular values", () => {
    const data: Record<string, unknown> = { email: "learner@example.com", password: "unsafe", database: "mongodb+srv://user:unsafe@cluster.example.net/app", nested: { authorization: "Bearer unsafe", value: 3 } }; data.circular = data;
    expect(sanitizeLogData(data)).toEqual({ email: "learner@example.com", password: "[REDACTED]", database: "mongodb+srv://user:[REDACTED]@cluster.example.net/app", nested: { authorization: "[REDACTED]", value: 3 }, circular: "[CIRCULAR]" });
  });
  it("builds consistently structured records", () => {
    expect(buildLogRecord("error", "request_error", { requestId: "req-1" }, new Date("2026-08-16T00:00:00Z"))).toMatchObject({ timestamp: "2026-08-16T00:00:00.000Z", level: "error", service: "cognisprint-api", type: "request_error", requestId: "req-1" });
  });
  it("delivers JSON with an optional bearer credential", async () => {
    process.env.LOG_DRAIN_URL = "https://logs.example.com/ingest"; process.env.LOG_DRAIN_TOKEN = "collector-token";
    const fetcher = vi.fn(async () => new Response(null, { status: 202 })); const record = buildLogRecord("info", "test");
    await deliverLogRecord(record, fetcher as typeof fetch);
    expect(fetcher).toHaveBeenCalledWith(process.env.LOG_DRAIN_URL, expect.objectContaining({ method: "POST", headers: expect.objectContaining({ authorization: "Bearer collector-token" }), body: JSON.stringify(record) }));
  });
});

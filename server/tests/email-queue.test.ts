import { describe, expect, it } from "vitest";
import { nextEmailAttempt } from "../src/lib/emailQueue.js";
import { EmailDelivery } from "../src/models/EmailDelivery.js";

describe("transactional email queue", () => {
  it("uses bounded exponential retry delays", () => {
    const now = Date.parse("2026-08-15T00:00:00Z");
    expect(nextEmailAttempt(1, now).toISOString()).toBe("2026-08-15T00:01:00.000Z");
    expect(nextEmailAttempt(4, now).toISOString()).toBe("2026-08-15T00:08:00.000Z");
    expect(nextEmailAttempt(20, now).toISOString()).toBe("2026-08-16T00:00:00.000Z");
  });
  it("enforces idempotency and queue lookup indexes", () => {
    expect(EmailDelivery.schema.path("idempotencyKey").options.unique).toBe(true);
    expect(EmailDelivery.schema.indexes().some(([keys]) => keys.status === 1 && keys.nextAttemptAt === 1)).toBe(true);
  });
});

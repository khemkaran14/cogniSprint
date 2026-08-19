import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "../src/lib/email.js";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("sendEmail", () => {
  it("reports an honest unsent state without provider credentials", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    await expect(sendEmail({ to: "learner@example.com", subject: "Certificate", text: "Ready" })).resolves.toBe(false);
  });

  it("returns the provider delivery result", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    await expect(sendEmail({ to: "learner@example.com", subject: "Certificate", text: "Ready" })).resolves.toBe(true);
  });
});

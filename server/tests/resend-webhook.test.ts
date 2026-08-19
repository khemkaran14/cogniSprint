import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { resendDeliveryStatus, verifyResendWebhookSignature } from "../src/lib/resendWebhooks.js";
import { EmailDelivery } from "../src/models/EmailDelivery.js";
import { WebhookEvent } from "../src/models/WebhookEvent.js";
import { OperationalAlert } from "../src/models/OperationalAlert.js";

describe("Resend webhook delivery tracking", () => {
  it("verifies a current Svix signature and rejects tampering and stale events", () => {
    const secretBytes = Buffer.from("test webhook secret");
    const secret = `whsec_${secretBytes.toString("base64")}`;
    const now = Date.UTC(2026, 7, 18, 12, 0, 0); const timestamp = String(now / 1000); const id = "msg_test"; const body = '{"type":"email.delivered"}';
    const signature = `v1,${createHmac("sha256", secretBytes).update(`${id}.${timestamp}.${body}`).digest("base64")}`;
    expect(verifyResendWebhookSignature(body, { id, timestamp, signature }, secret, now)).toBe(true);
    expect(verifyResendWebhookSignature(`${body} `, { id, timestamp, signature }, secret, now)).toBe(false);
    expect(verifyResendWebhookSignature(body, { id, timestamp, signature }, secret, now + 301_000)).toBe(false);
  });
  it("maps supported provider events and exposes terminal delivery states", () => {
    expect(resendDeliveryStatus("email.delivered")).toBe("delivered");
    expect(resendDeliveryStatus("email.bounced")).toBe("bounced");
    expect(resendDeliveryStatus("email.complained")).toBe("complained");
    expect(resendDeliveryStatus("domain.created")).toBeNull();
    expect(EmailDelivery.schema.path("status").options.enum).toEqual(expect.arrayContaining(["delivered", "delayed", "bounced", "complained"]));
    expect(WebhookEvent.schema.path("provider").options.enum).toContain("resend");
    expect(OperationalAlert.schema.path("category").options.enum).toContain("email_bounce");
  });
});

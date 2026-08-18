import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;

function secretBytes(secret: string): Buffer {
  const value = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  return Buffer.from(value, "base64");
}

/** Verify Resend's Svix-compatible signature before parsing attacker-controlled JSON. */
export function verifyResendWebhookSignature(rawBody: string, headers: { id?: string; timestamp?: string; signature?: string }, secret = process.env.RESEND_WEBHOOK_SECRET, now = Date.now()): boolean {
  if (!secret || !headers.id || !headers.timestamp || !headers.signature) return false;
  const timestamp = Number(headers.timestamp);
  if (!Number.isFinite(timestamp) || Math.abs(Math.floor(now / 1000) - timestamp) > MAX_WEBHOOK_AGE_SECONDS) return false;
  const expected = createHmac("sha256", secretBytes(secret)).update(`${headers.id}.${headers.timestamp}.${rawBody}`).digest();
  return headers.signature.split(/\s+/).some((candidate) => {
    const [version, encoded] = candidate.split(",", 2);
    if (version !== "v1" || !encoded) return false;
    const received = Buffer.from(encoded, "base64");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

export type ResendDeliveryStatus = "sent" | "delivered" | "delayed" | "bounced" | "complained";
export function resendDeliveryStatus(eventType: string): ResendDeliveryStatus | null {
  return ({ "email.sent": "sent", "email.delivered": "delivered", "email.delivery_delayed": "delayed", "email.bounced": "bounced", "email.complained": "complained" } as Record<string, ResendDeliveryStatus>)[eventType] ?? null;
}

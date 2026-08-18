import { EmailDelivery } from "../models/EmailDelivery.js";

export type TransactionalEmail = { idempotencyKey: string; category: "purchase" | "payment_failed" | "refund" | "dispute" | "certificate" | "ops_alert"; userId?: unknown; to: string; subject: string; text: string };

export async function enqueueEmail(email: TransactionalEmail) {
  return EmailDelivery.findOneAndUpdate(
    { idempotencyKey: email.idempotencyKey },
    { $setOnInsert: { ...email, status: "queued", attempts: 0, nextAttemptAt: new Date() } },
    { upsert: true, new: true }
  );
}

export function nextEmailAttempt(attempts: number, now = Date.now()) {
  return new Date(now + Math.min(24 * 60, 2 ** Math.max(0, attempts - 1)) * 60_000);
}

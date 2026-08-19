import { OperationalAlert } from "../models/OperationalAlert.js";
import { enqueueEmail } from "./emailQueue.js";

export type AlertFinding = { fingerprint: string; category: "payment_failure" | "payment_dispute" | "stale_order" | "webhook_failure" | "entitlement_mismatch" | "email_failure" | "email_bounce" | "reconciliation_review"; severity: "warning" | "critical"; title: string; details?: Record<string, unknown> };

export async function recordAlert(finding: AlertFinding, now = new Date()) {
  const alert = await OperationalAlert.findOneAndUpdate(
    { fingerprint: finding.fingerprint },
    { $set: { category: finding.category, severity: finding.severity, title: finding.title, details: finding.details ?? {}, lastSeenAt: now, status: "open", acknowledgedAt: null, resolvedAt: null }, $setOnInsert: { firstSeenAt: now }, $inc: { occurrences: 1 } },
    { upsert: true, new: true }
  );
  const support = process.env.SUPPORT_EMAIL;
  if (support && alert.occurrences === 1) await enqueueEmail({ idempotencyKey: `ops-alert:${alert.fingerprint}:${alert.firstSeenAt.toISOString()}`, category: "ops_alert", to: support, subject: `[${alert.severity.toUpperCase()}] ${alert.title}`, text: `CogniSprint detected an operational alert.\n\nCategory: ${alert.category}\nFingerprint: ${alert.fingerprint}\nDetails: ${JSON.stringify(alert.details)}\n\nReview the administrator dashboard.` });
  return alert;
}

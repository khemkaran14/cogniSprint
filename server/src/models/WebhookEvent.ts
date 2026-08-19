import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Records every processed Razorpay webhook delivery so retried/duplicate
 * deliveries of the same event are recognised and skipped instead of
 * reapplying side effects (granting a second entitlement, sending a second
 * confirmation email, etc).
 */
const webhookEventSchema = new Schema(
  {
    provider: { type: String, required: true, default: "razorpay" },
    eventType: { type: String, required: true },
    // Razorpay payment id (payload.payment.entity.id) — stable per payment attempt.
    externalId: { type: String, required: true },
  },
  { timestamps: true }
);

webhookEventSchema.index({ provider: 1, eventType: 1, externalId: 1 }, { unique: true });

export type WebhookEventDoc = InferSchemaType<typeof webhookEventSchema>;
export const WebhookEvent = model("WebhookEvent", webhookEventSchema);

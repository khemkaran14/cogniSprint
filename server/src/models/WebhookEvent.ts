import { Schema, model } from "mongoose";

const webhookEventSchema = new Schema(
  {
    provider: { type: String, enum: ["razorpay"], required: true },
    eventId: { type: String, required: true },
    eventType: { type: String, required: true },
    status: { type: String, enum: ["processing", "processed", "failed"], required: true, default: "processing" },
    processedAt: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true }
);

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const WebhookEvent = model("WebhookEvent", webhookEventSchema);

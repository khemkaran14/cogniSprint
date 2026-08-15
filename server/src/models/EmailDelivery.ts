import { Schema, model, Types } from "mongoose";

const emailDeliverySchema = new Schema({
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  category: { type: String, enum: ["purchase", "payment_failed", "refund", "certificate", "ops_alert"], required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", index: true },
  to: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, required: true, maxlength: 200 },
  text: { type: String, required: true, maxlength: 20_000 },
  status: { type: String, enum: ["queued", "sending", "sent", "failed"], required: true, default: "queued", index: true },
  attempts: { type: Number, required: true, default: 0, min: 0 },
  nextAttemptAt: { type: Date, required: true, default: Date.now, index: true },
  providerMessageId: { type: String, sparse: true },
  sentAt: { type: Date },
  lastError: { type: String, maxlength: 500 },
}, { timestamps: true });

emailDeliverySchema.index({ status: 1, nextAttemptAt: 1 });
export const EmailDelivery = model("EmailDelivery", emailDeliverySchema);

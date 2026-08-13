import { Schema, model, Types } from "mongoose";

const refundSchema = new Schema({
  orderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true },
  reason: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ["pending", "processed", "failed"], required: true, default: "pending" },
  providerRefundId: { type: String, unique: true, sparse: true, index: true },
  requestedBy: { type: Types.ObjectId, ref: "User", required: true },
  processedAt: { type: Date },
  failureReason: { type: String, maxlength: 500 },
}, { timestamps: true });

refundSchema.index({ orderId: 1, createdAt: -1 });
export const Refund = model("Refund", refundSchema);

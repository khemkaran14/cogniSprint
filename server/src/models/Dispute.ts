import { Schema, model, Types } from "mongoose";

const disputeSchema = new Schema({
  provider: { type: String, enum: ["razorpay"], required: true, default: "razorpay" },
  providerDisputeId: { type: String, required: true, unique: true, index: true },
  providerPaymentId: { type: String, required: true, index: true },
  orderId: { type: Types.ObjectId, ref: "Order", required: true, index: true },
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: "INR" },
  status: { type: String, enum: ["open", "won", "lost", "closed"], required: true, default: "open", index: true },
  reason: { type: String, maxlength: 1000 },
  phase: { type: String, maxlength: 100 },
  evidenceDueAt: { type: Date },
  providerCreatedAt: { type: Date },
  lastEventId: { type: String, required: true },
}, { timestamps: true });

disputeSchema.index({ status: 1, updatedAt: -1 });
export const Dispute = model("Dispute", disputeSchema);

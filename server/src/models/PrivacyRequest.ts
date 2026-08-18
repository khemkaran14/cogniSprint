import { Schema, model, Types } from "mongoose";

const privacyRequestSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["deletion"], required: true },
  status: { type: String, enum: ["pending", "in_review", "completed", "rejected", "cancelled"], required: true, default: "pending", index: true },
  reason: { type: String, maxlength: 1000 },
  resolutionNote: { type: String, maxlength: 2000 },
  resolvedBy: { type: Types.ObjectId, ref: "User" },
  resolvedAt: { type: Date },
}, { timestamps: true });

privacyRequestSchema.index({ userId: 1, type: 1, status: 1 });
privacyRequestSchema.index({ status: 1, createdAt: 1 });
export const PrivacyRequest = model("PrivacyRequest", privacyRequestSchema);

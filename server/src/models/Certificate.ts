import { Schema, model, Types } from "mongoose";

const certificateSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    verificationCode: { type: String, required: true, unique: true, index: true },
    learnerName: { type: String, required: true },
    issuedAt: { type: Date, required: true, default: Date.now },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1, productId: 1 }, { unique: true });
export const Certificate = model("Certificate", certificateSchema);

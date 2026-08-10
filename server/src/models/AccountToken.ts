import { Schema, model, Types } from "mongoose";

const accountTokenSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    purpose: { type: String, enum: ["verify-email", "reset-password"], required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const AccountToken = model("AccountToken", accountTokenSchema);

import { Schema, model, Types } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    userAgent: { type: String, required: true, default: "Unknown device", maxlength: 500 },
    ipAddress: { type: String, required: true, default: "Unknown", maxlength: 100 },
    lastSeenAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, lastSeenAt: -1 });

export const Session = model("Session", sessionSchema);

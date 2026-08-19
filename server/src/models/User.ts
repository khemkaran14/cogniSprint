import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    emailVerifiedAt: { type: Date },
    role: { type: String, enum: ["learner", "admin"], default: "learner", required: true },
    adminPermissions: { type: [String], default: [], select: false },
    status: { type: String, enum: ["active", "suspended"], default: "active", required: true },
    lastLoginAt: { type: Date },
    timezone: { type: String, required: true, default: "UTC", trim: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);

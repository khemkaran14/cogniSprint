import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String }, // absent until the user sets a password (auto-provisioned-at-checkout users start without one)
    phone: { type: String },
    role: { type: String, required: true, enum: ["student", "admin", "support"], default: "student" },
    emailVerifiedAt: { type: Date },

    emailVerificationTokenHash: { type: String },
    emailVerificationExpiresAt: { type: Date },

    passwordResetTokenHash: { type: String },
    passwordResetExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);

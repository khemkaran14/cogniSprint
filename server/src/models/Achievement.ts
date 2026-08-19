import { Schema, model, Types, type InferSchemaType } from "mongoose";

const achievementSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  key: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  earnedAt: { type: Date, required: true, default: Date.now },
  source: { type: String, enum: ["lesson_progress"], required: true, default: "lesson_progress" },
}, { timestamps: true });

achievementSchema.index({ userId: 1, key: 1 }, { unique: true });
achievementSchema.index({ userId: 1, earnedAt: -1 });

export type AchievementDoc = InferSchemaType<typeof achievementSchema>;
export const Achievement = model("Achievement", achievementSchema);

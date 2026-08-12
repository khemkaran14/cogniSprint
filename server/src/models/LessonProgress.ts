import { Schema, model, Types, type InferSchemaType } from "mongoose";

const lessonProgressSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: Types.ObjectId, ref: "Lesson", required: true, index: true },
    status: { type: String, enum: ["started", "completed"], default: "started", required: true },
    bestScore: { type: Number, min: 0, max: 100, default: 0, required: true },
    attempts: { type: Number, min: 0, default: 0, required: true },
    startedAt: { type: Date, default: Date.now, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export type LessonProgressDoc = InferSchemaType<typeof lessonProgressSchema>;
export const LessonProgress = model("LessonProgress", lessonProgressSchema);

import { Schema, model, Types, type InferSchemaType } from "mongoose";

const exerciseSchema = new Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true, min: 0 },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const lessonSchema = new Schema(
  {
    moduleId: { type: Types.ObjectId, ref: "Module", required: true, index: true },
    position: { type: Number, required: true, min: 1 },
    sequenceNumber: { type: Number, required: true, min: 1 },
    unlockDay: { type: Number, required: true, min: 1 },
    prerequisiteLessonId: { type: Types.ObjectId, ref: "Lesson" },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    estimatedMinutes: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 60 },
    content: { type: [String], required: true },
    exercises: { type: [exerciseSchema], required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft", required: true },
  },
  { timestamps: true }
);

lessonSchema.index({ moduleId: 1, position: 1 }, { unique: true });

export type LessonDoc = InferSchemaType<typeof lessonSchema>;
export const Lesson = model("Lesson", lessonSchema);

import { Schema, model, type InferSchemaType } from "mongoose";

const moduleSchema = new Schema(
  {
    position: { type: Number, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skills: {
      type: [String],
      required: true,
      enum: ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"],
    },
    lessonCount: { type: Number, required: true },
    exerciseCount: { type: Number, required: true },
    difficulty: { type: String, required: true, enum: ["beginner", "intermediate", "advanced"] },
    estimatedMinutes: { type: Number, required: true },
    previewAvailable: { type: Boolean, required: true, default: false },
    phase: { type: String, required: true, enum: ["guided_learning", "structured_practice", "assessment"] },
  },
  { timestamps: true }
);

export type ModuleDoc = InferSchemaType<typeof moduleSchema>;
export const CurriculumModule = model("Module", moduleSchema);

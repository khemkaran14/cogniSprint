import { Schema, model, Types, type InferSchemaType } from "mongoose";

const questionSchema = new Schema({
  prompt: { type: String, required: true },
  skill: { type: String, enum: ["mental-math", "memory", "focus", "logic", "observation", "critical-thinking"], required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true, min: 0 },
  explanation: { type: String, required: true },
}, { _id: false });

const assessmentSchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  month: { type: Number, required: true, min: 1, max: 12, unique: true },
  passingScore: { type: Number, required: true, min: 0, max: 100, default: 60 },
  estimatedMinutes: { type: Number, required: true, min: 1 },
  questions: { type: [questionSchema], required: true },
  status: { type: String, enum: ["draft", "in_review", "changes_requested", "approved", "published", "archived"], default: "draft", required: true, index: true },
  reviewNote: { type: String, maxlength: 2000 },
  reviewedBy: { type: Types.ObjectId, ref: "User" },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  approvedAt: { type: Date },
  publishedAt: { type: Date },
  archivedAt: { type: Date },
}, { timestamps: true });

assessmentSchema.index({ status: 1, updatedAt: -1 });

export type AssessmentDoc = InferSchemaType<typeof assessmentSchema>;
export const Assessment = model("Assessment", assessmentSchema);

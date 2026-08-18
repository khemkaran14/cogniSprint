import { Schema, model, Types } from "mongoose";

const skillResultSchema = new Schema({
  skill: { type: String, required: true },
  correct: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  score: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const assessmentAttemptSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  assessmentId: { type: Types.ObjectId, ref: "Assessment", required: true },
  submissionId: { type: String, required: true },
  answerHash: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  correct: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  passed: { type: Boolean, required: true },
  durationSeconds: { type: Number, required: true, min: 0, max: 10800 },
  skillResults: { type: [skillResultSchema], required: true },
}, { timestamps: true });

assessmentAttemptSchema.index({ userId: 1, assessmentId: 1, submissionId: 1 }, { unique: true });
assessmentAttemptSchema.index({ userId: 1, createdAt: -1 });
export const AssessmentAttempt = model("AssessmentAttempt", assessmentAttemptSchema);

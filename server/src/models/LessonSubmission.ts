import { Schema, model, Types } from "mongoose";

const lessonSubmissionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    lessonId: { type: Types.ObjectId, ref: "Lesson", required: true },
    submissionId: { type: String, required: true },
    answerHash: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    correct: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    passed: { type: Boolean, required: true },
    durationSeconds: { type: Number, required: true, min: 0, max: 7200, default: 0 },
  },
  { timestamps: true }
);

lessonSubmissionSchema.index({ userId: 1, lessonId: 1, submissionId: 1 }, { unique: true });
export const LessonSubmission = model("LessonSubmission", lessonSubmissionSchema);

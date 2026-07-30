import mongoose from "mongoose";

// Tracks a user's personal relationship to a question: saved for later, and/or
// marked as practiced. One document per (user, question) pair.
const userQuestionStateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    bookmarked: { type: Boolean, default: false },
    practiced: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userQuestionStateSchema.index({ user: 1, question: 1 }, { unique: true });

export default mongoose.model("UserQuestionState", userQuestionStateSchema);

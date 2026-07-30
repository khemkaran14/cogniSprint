import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

questionSchema.index({ tool: 1, category: 1, difficulty: 1 });

export default mongoose.model("Question", questionSchema);

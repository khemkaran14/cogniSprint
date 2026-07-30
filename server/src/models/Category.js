import mongoose from "mongoose";

// A feature/category within a tool, e.g. Claude -> "Claude Code", "Projects", "Coding", "Design".
const categorySchema = new mongoose.Schema(
  {
    tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ tool: 1, slug: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);

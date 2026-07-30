import mongoose from "mongoose";

// A top-level AI tool/vendor, e.g. Claude, GitHub Copilot, Cursor, Antigravity.
const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    group: {
      type: String,
      enum: ["assistants", "agentic", "foundation"],
      required: true,
    },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Tool", toolSchema);

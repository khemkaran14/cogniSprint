import { Schema, model, Types } from "mongoose";

const learningResourceSchema = new Schema({
  productId: { type: Types.ObjectId, ref: "Product", required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  kind: { type: String, enum: ["workbook", "worksheet"], required: true, index: true },
  version: { type: Number, required: true, min: 1, default: 1 },
  gridFsFileId: { type: Types.ObjectId, required: true, unique: true },
  filename: { type: String, required: true },
  mimeType: { type: String, enum: ["application/pdf"], required: true, default: "application/pdf" },
  sizeBytes: { type: Number, required: true, min: 1 },
  sha256: { type: String, required: true, match: /^[a-f\d]{64}$/ },
  status: { type: String, enum: ["draft", "published", "archived"], required: true, default: "draft", index: true },
  releaseNote: { type: String, maxlength: 2000 },
  releasedBy: { type: Types.ObjectId, ref: "User" },
  publishedAt: { type: Date },
  archivedAt: { type: Date },
}, { timestamps: true });

learningResourceSchema.index({ productId: 1, status: 1, kind: 1 });
export const LearningResource = model("LearningResource", learningResourceSchema);

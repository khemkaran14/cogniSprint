import { Schema, model } from "mongoose";

const reconciliationRunSchema = new Schema({
  mode: { type: String, enum: ["dry-run", "apply"], required: true },
  status: { type: String, enum: ["running", "completed", "failed"], required: true, default: "running" },
  inspected: { type: Number, required: true, default: 0 },
  repaired: { type: Number, required: true, default: 0 },
  needsReview: { type: Number, required: true, default: 0 },
  findings: { type: [Schema.Types.Mixed], default: [] },
  completedAt: { type: Date },
  failureReason: { type: String, maxlength: 500 },
}, { timestamps: true });

reconciliationRunSchema.index({ createdAt: -1 });
export const ReconciliationRun = model("ReconciliationRun", reconciliationRunSchema);
